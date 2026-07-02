---
title: 博客安全
date: 2026-01-21 14:39:00
updated: 2026-02-19 07:57:00
lang: zh-CN
permalink: /security-of-blog/
layout: post
category: tech-learned
tags: [security, blog, nginx, 1panel, wordpress, edgeone]
license: CC BY 4.0
description: 博客与其他端口服务的安全措施系统研究——从反代防 SSL 泄露、1Panel 加固到 EdgeOne CDN。
---

> 这是第一个技术贴，但已经是第 n 次折腾技术问题了。文章结构：H2 是时间版次，H3 是目录（研究背景、参考资料、技术总结、细节）。

## 2026.1.21-23

### 研究背景

关于博客和其他端口服务的安全问题，最初想着反代就好了，但最近看别的博客说这样有个很大的问题就是会暴露 ip，加上之前也记得看过一些评论说只反代是远远不够的，于是现在开始系统研究一下博客网页和其他服务的安全措施。

### 流程和排版

这是第一个技术贴，但已经是第 n 次折腾技术问题了，为了便于自己和他人今后查阅学习，所以制定规范进行工作流和文章排版的整理。工作流如下：想法经过决定要实现后开始行文；先思考并阐述背景，确定研究折腾范围；然后随着研究深入整合参考资料，用 zotero 等缓存并归档资料，每个时间版本一次完整归档，在文章中贴出链接，方便自己查找和他人申请资料传递；研究过程和写论文差不多，找资料、问 ai，只不过资料不是通过图书馆资料库，而是搜索引擎、B 站知乎、他人博客或专业网站等；组织排版就按照这篇文章的来，H2 是时间版次，H3 是目录包括研究背景、参考资料、技术总结、细节，符合网站总体内容格式化规范。

### 参考资料

- [防止 SSL 证书泄露源站 IP｜白鱼小栈](https://www.baiyuyu.com/5099.html)
- [记录一次个人站点被 DDoS 攻击的经历 | LiuShen's Blog](https://blog.liushen.fun/posts/d249b963/)
- [【nginx】nginx 配置避免 IP 访问时证书暴露域名 | 慕雪的寒舍](https://blog.musnow.top/posts/3528013149/index.html)
- [NGINX 配置避免 IP 访问时证书暴露域名 - ZingLix Blog](https://zinglix.xyz/2021/10/04/nginx-ssl-reject-handshake/)
- [小白教程 1Panel 设置 nginx 反向代理之前端路径设置（1）_1panel 反向代理-CSDN 博客](https://blog.csdn.net/m0_61938171/article/details/156227219)
- [使用 Nginx 设置反向代理后无法识别 css,js 等等问题解决办法-腾讯云开发者社区-腾讯云](https://cloud.tencent.com/developer/article/2194124)
- [Kimi](https://www.kimi.com/)
- [Nginx 入门必须懂 3 大功能配置 - Web 服务器/反向代理/负载均衡_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1TZ421b7SD/)
- [【GeekHour】30 分钟 Nginx 入门教程_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1mz4y1n7PQ/)

### 技术总结

经过十几小时的折腾和研究，研究好了在没有 CDN 情况下的安全措施，CDN 的完整措施等域名审核后再研究。

1. 服务器层面：设置双因素验证，设置防火墙只开放服务器必要端口，越少越好，网站等服务端口会被 search.censys.io 这样的网站扫到；有较大改动后保存镜像、快照；
2. 1panel 面板方面：设置随机密码妥善保管，更改默认端口，设置安全入口并设置 Let's Encrypt 证书开启 ssl 访问，未认证设置 444 关闭连接隐藏服务；
3. 1panel 网站设置方面：所有网站反代服务设置 HTTPS 访问和 HTTP 自动跳转，限制并发数和流量减少被打损失，适当开启防盗链，其他按照推荐的默认设置；防止 IP 扫描后 ssl 泄露域名和 ip 关系，在 openresty 设置/其他/打开拒绝默认 SSL 握手，在反代配置文件中增加默认服务使 IP 访问直接拒绝握手（见操作细节）；非网站的服务尝试增加前端访问路径（wordpress 增加访问路径后 bug 太多故放弃）减少域名暴露，注意区分服务是否可以设置子域名，无法设置子域名的服务可以参考操作细节配置访问路径反代；
4. Wordpress 方面：用 *WPS 隐藏登录* 插件更改管理员入口，用 *Limit Login Attempts Reloaded* 插件阻止恶意登录，并用 *Easy WP SMTP* 插件配置 SMTP 邮件通知，用 *Disable XML-RPC* 插件禁用不安全功能，用 *WPvivid 备份插件* 设置定期备份并定期下载到本地备份；
5. 应对操作失误和攻击的补救措施：设置面板过载邮箱提醒知道被打，设置 DDNS 方便被打后申请更改 IP；管理好服务器镜像、快照、网站及其他服务 docker 的单独备份；平时顺手更新软件补丁。

### 细节

反向代理配置 IP 访问直接拒绝握手代码，端口改为对应服务的。

```nginx
server {
  listen your_port/你的服务端口 default_server;
  server_name _;
  ssl_reject_handshake on;
}
```

反向代理配置前端访问路径，可以设置子域名的服务配置如下，配置为 AI 生成可能有缺陷或过度配置，访问路径和端口（包括括号）要更改。

```nginx
location ^~ /(your_path/你的服务访问路径)/ {
  # 传递真实 IP 和协议信息
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header Host $http_host;
  proxy_set_header X-Real-IP $remote_addr;

  # 处理 Range 请求（用于下载）
  proxy_set_header Range $http_range;
  proxy_set_header If-Range $http_if_range;

  # 关闭重定向
  proxy_redirect off;

  # 关键：代理到容器的 /(your_path/你的服务访问路径)/ 路径（注意末尾斜杠）
  proxy_pass http://127.0.0.1:(your_port/你的服务端口)/(your_path/你的服务访问路径)/;

  # 上传文件大小限制
  client_max_body_size 20000m;

  # WebSocket 支持（如果需要）
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
}
```

反向代理配置前端访问路径，无法设置子域名的服务配置如下，配置为 AI 生成可能有缺陷或过度配置，访问路径和端口（包含括号）要一起更改。

```nginx
location ^~ /(your_path/你的服务访问路径)/ {
  # 不支持子路径，使用路径重写
  rewrite ^/(your_path/你的服务访问路径)/(.*)$ /$1 break;
  proxy_pass http://127.0.0.1:(your_port/你的服务端口)/;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

  # 关键：重写响应中的路径
  proxy_redirect / /(your_path/你的服务访问路径)/;
  sub_filter 'href="/' 'href="/(your_path/你的服务访问路径)/';
  sub_filter 'src="/' 'src="/(your_path/你的服务访问路径)/';
  sub_filter 'action="/' 'action="/(your_path/你的服务访问路径)/';
  sub_filter_once off;
}
```

## 2026.1.28

### 参考资料

- [EO VS ESA！谁才是最好用的免费 CDN？？_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1Mim2BwEfR/)
- [腾讯云 DNS (TencentCloud DNSPod) 配置指南 | DDNS Documentation](https://ddns.newfuture.cc/providers/tencentcloud)
- [边缘安全加速平台 EO 源站证书校验_腾讯云](https://cloud.tencent.com/document/product/1552/125145)

### 技术总结

域名备案好后，用 edgeone 进行了 cdn，用预设 wordpress 模板，缓存不能配置否则会造成编辑版本混乱除非不用 cdn 域名编辑，但这样也会导致推送延迟，应该有更好的插件来解决这个问题，然后打开了免费版的各种安全设置，配置回源 ip 即可，cdn 访问速度很好，而且最近有活动免费版流量不限量，就是边缘函数没有研究。

1panel 中新建网站直接设置域名就可以，由于 443 作为默认端口，openresty 自带了防止 ssl 泄露源站 ip 的设置，不需要也无法重复设置默认服务。

另外用腾讯云 dns 申请证书时设置的 cam 账户出现了问题无法申请免费证书，文档显示免费版 cdn 和源站之间不需要正确证书就能 https 访问，所以源站直接用其他证书开启 https 访问即可，暂时不研究申请证书 dns 超时问题了，可能是没有解析到服务器 ip 申请不了吧。
