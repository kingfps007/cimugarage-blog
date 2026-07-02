# ESA Pages 构建配置

## 模板配置

| 字段 | 值 |
|------|-----|
| **构建命令** | `npm ci && git submodule update --init --recursive && npm run build` |
| **输出目录** | `public` |
| **Node 版本** | 20 |

## 为什么不拆成多步

ESA Pages 容器是**临时**的，跨步骤状态不保留（除非用缓存）。把 npm + git + build 写在一条命令里，**一次跑通**最稳。

## 调试建议

如果构建失败：

1. **先确认 GitHub 仓库可拉**：用 `git clone https://github.com/kingfps007/cimugarage-blog` 在本地试一次
2. **再确认 submodule 可拉**：`git clone --recursive https://github.com/kingfps007/cimugarage-blog` 试一次
3. **再确认 hexo 可 build**：本地 `cd cimugarage-blog && npm ci && npm run build` 看 `public/` 是否有产出

## 预期产出

构建成功后，`public/` 目录应包含：
- `index.html`（中文首页）
- `en/index.html`（英文首页）
- `archives/index.html`（归档）
- `tags/...`、`categories/...`（分类/标签）
- `about/index.html`、`en/about/index.html`（关于页双语）
- `assets/...`（CSS / JS / 字体 / 图片）
- `_redirects`（ESA 静态重定向——**注意**：要放在 public/ 根才会被识别）

## _redirects 位置

`_redirects` 必须放在 `public/_redirects`（即构建产物的根）。两种做法：

1. **手动 cp**：在 build 后用 `cp _redirects public/_redirects` 加到命令
2. **写 hexo 生成器**：写一个 hexo 插件自动把根 `_redirects` 复制到 `public/_redirects`

方案 1 更简单。更新后的完整 build 命令：

```bash
npm ci && git submodule update --init --recursive && npm run build && cp _redirects public/_redirects
```

## _redirects 当前内容

放在仓库根 `cimugarage-blog/_redirects`，已含 Halo 旧 URL → 新站的 301 重定向：

```
/archives/security-of-blog/  /security-of-blog/  301
/archives/blog-security/     /security-of-blog/  301
/archives/linuxru-men/       /linux-intro/       301
/archives/linux-intro/       /linux-intro/       301
/archives/wai-she-equipments/  /peripherals/     301
/archives/about/             /about/             301
/archives                    /archives/          301
/archives/                   /archives/          301
/feed/                       /rss2.xml           301
/feed.xml                    /rss2.xml           301
/atom.xml                    /rss2.xml           301
/admin/comments              /admin/comments.html 200
```

## 预期效果

- 旧 Halo URL 全部 301 跳新站对应路径
- 旧订阅地址 301 跳 `/rss2.xml`
- 管理员入口保留
