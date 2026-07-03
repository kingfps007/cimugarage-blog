---
title: Blog Security
date: 2026-01-21 14:39:00
updated: 2026-02-19 07:57:00
lang: en
permalink: /en/security-of-blog/
layout: post
category: tech-learned
tags: [security, blog, nginx, 1panel, wordpress, edgeone]
license: CC BY 4.0
description: A systematic study of security measures for blogs and other port services—from reverse proxy SSL leak prevention, 1Panel hardening, to EdgeOne CDN.
---

> This is the first technical post, though it's already the nth time I've tinkered with technical issues. Article structure: H2 headings indicate temporal versions, while H3 headings serve as the table of contents (research background, references, technical summary, details).

## 2026.1.21-23

### Background

Initially, I thought using a reverse proxy would suffice for securing my blog and other port services. However, I recently came across several posts pointing out a major issue—doing so can still expose the IP address. Additionally, I recall reading comments before emphasizing that relying solely on a reverse proxy is far from enough. Therefore, I have now started to systematically study security measures for blogs, web pages, and other services.

### Workflow & Typesetting

This is the first technical post, though it's already the nth time I've tinkered with technical issues. To make it easier for myself and others to review and learn in the future, I've established guidelines for organizing the workflow and article formatting. The workflow is as follows: Once an idea is decided upon and ready to be implemented, I begin drafting. I start by reflecting on and explaining the background, then define the scope of research or experimentation. As the study progresses, I integrate reference materials, using tools like Zotero to cache and archive resources. Each temporal version is fully archived, with links included in the article for easy personal reference and for others to request resource sharing. The research process is similar to writing a paper—gathering materials, consulting AI—except that the sources are not from library databases but from search engines, platforms like Bilibili and Zhihu, other blogs, or professional websites. For organization and formatting, I follow the structure of this article: H2 headings indicate temporal versions, while H3 headings serve as the table of contents, covering the research background, references, technical summary, details—all aligning with the overall content formatting guidelines of the website.

### References

- [Prevent SSL Certificate from Leaking Origin IP｜Baiyuyu's Cabin](https://www.baiyuyu.com/5099.html)
- [Record of a DDoS Attack on a Personal Site | LiuShen's Blog](https://blog.liushen.fun/posts/d249b963/)
- [【nginx】nginx configuration to prevent certificate from exposing domain on IP access | Muxue's Blog](https://blog.musnow.top/posts/3528013149/index.html)
- [NGINX Config to Avoid IP Access Leaking Domain via Certificate - ZingLix Blog](https://zinglix.xyz/2021/10/04/nginx-ssl-reject-handshake/)
- [Beginner Tutorial 1Panel nginx Reverse Proxy Front-end Path Setup (1) - CSDN](https://blog.csdn.net/m0_61938171/article/details/156227219)
- [Solutions for CSS/JS Not Recognized After Nginx Reverse Proxy Setup - Tencent Cloud Developer](https://cloud.tencent.com/developer/article/2194124)
- [Kimi](https://www.kimi.com/)
- [Nginx Beginner Must-Know 3 Major Function Configurations - Web Server/Reverse Proxy/Load Balancing (Bilibili)](https://www.bilibili.com/video/BV1TZ421b7SD/)
- [【GeekHour】30-Minute Nginx Beginner Tutorial (Bilibili)](https://www.bilibili.com/video/BV1mz4y1n7PQ/)

### Technical Summary

After over ten hours of tinkering and research, I have figured out the security measures without a CDN. Comprehensive measures involving a CDN will be studied after domain name review.

1. **Server Level:** Enable two-factor authentication. Configure the firewall to only open necessary server ports—the fewer, the better, as service ports for websites can be scanned by sites like `search.censys.io`. Save images/snapshots after making significant changes.
2. **1Panel:** Set a strong random password and store it securely. Change the default port. Set up a secure entry point and configure a Let's Encrypt certificate to enable SSL access. Set unauthorized access to return status code 444 to close connections and hide the service.
3. **1Panel Website Settings:** Configure all website reverse proxy services for HTTPS access with automatic HTTP redirects. Limit concurrent connections and traffic to mitigate potential attack damage. Enable hotlink protection appropriately. Other settings follow recommended defaults. To prevent SSL from revealing the relationship between the domain and IP after IP scanning, go to OpenResty Settings / Others and enable "Reject Default SSL Handshake". Add a default server in the reverse proxy configuration to directly reject handshakes for IP access (see Operational Details). For non-website services, try adding a front-end access path to reduce domain exposure (abandoned for WordPress due to too many bugs after adding a path). Pay attention to whether a service supports subdomains. For services that cannot use subdomains, refer to the operational details for configuring path-based reverse proxy.
4. **WordPress:** Use the **WPS Hide Login** plugin to change the admin entry point. Use the **Limit Login Attempts Reloaded** plugin to block malicious login attempts. Configure SMTP email notifications using the **Easy WP SMTP** plugin. Disable insecure features with the **Disable XML-RPC** plugin. Set up regular backups with the **WPvivid Backup Plugin** and periodically download backups locally.
5. **Remedial Measures for Operational Errors and Attacks:** Set up panel notification for overloaded with SMTP and DDNS to facilitate ip changes if attacked. Properly manage server images, snapshots, and separate backups for websites and other service dockers. Regularly apply software patches when possible.

### Details

Reverse Proxy Configuration: Code to Reject Handshakes for Direct IP Access. Change the port to the corresponding service port.

```nginx
server {
  listen your_port default_server;
  server_name _;
  ssl_reject_handshake on;
}
```

**Reverse Proxy Configuration: Front-end Access Path for Services Supporting Subdomains.** The following configuration is AI-generated and may have flaws or over-configuration. Remember to change the access path and port (including parentheses).

```nginx
location ^~ /(your_path)/ {
  # Pass real IP and protocol info
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header Host $http_host;
  proxy_set_header X-Real-IP $remote_addr;

  # Handle Range requests (for downloads)
  proxy_set_header Range $http_range;
  proxy_set_header If-Range $http_if_range;

  # Disable redirect handling
  proxy_redirect off;

  # Key: Proxy to the container's /your_path/ (mind the trailing slash)
  proxy_pass http://127.0.0.1:(your_port)/(your_path)/;

  # Upload file size limit
  client_max_body_size 20000m;

  # WebSocket support (if needed)
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
}
```

**Reverse Proxy Configuration: Front-end Access Path for Services NOT Supporting Subdomains.** The following configuration is AI-generated and may have flaws or over-configuration. Remember to change the access path and port (including parentheses).

```nginx
location ^~ /(your_path)/ {
  # Service does not support sub-paths, use path rewrite
  rewrite ^/(your_path)/(.*)$ /$1 break;
  proxy_pass http://127.0.0.1:(your_port)/;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

  # Key: Rewrite paths in responses
  proxy_redirect / /(your_path)/;
  sub_filter 'href="/' 'href="/(your_path)/';
  sub_filter 'src="/' 'src="/(your_path)/';
  sub_filter 'action="/' 'action="/(your_path)/';
  sub_filter_once off;
}
```

## 2026.1.28

### References

- [EO VS ESA! Which is the Best Free CDN?? (Bilibili)](https://www.bilibili.com/video/BV1Mim2BwEfR/)
- [Tencent Cloud DNS (TencentCloud DNSPod) Configuration Guide | DDNS Documentation](https://ddns.newfuture.cc/providers/tencentcloud)
- [Edge Security Acceleration Platform EO Origin Certificate Verification - Tencent Cloud](https://cloud.tencent.com/document/product/1552/125145)

### Technical Summary

After the domain name was successfully filed, I configured EdgeOne for CDN using the preset WordPress template. Cache settings cannot be configured, as doing so would cause editing version conflicts unless editing is performed without using the CDN domain. However, this would also lead to content delivery delays. There should be a better plugin to address this issue. I then enabled various security settings available in the free tier. Only the origin server IP needed to be configured. The CDN access speed is excellent, and there is currently an ongoing promotion offering unlimited traffic for the free version. As for edge functions, I have not explored them yet.

In 1Panel, you can simply set the domain name when creating a new website. Since port 443 is the default, OpenResty includes built-in settings to prevent SSL from leaking the origin server IP, making it unnecessary and also impossible to reconfigure the default service.

Additionally, an issue arose with the CAM account set up when applying for a certificate via Tencent Cloud DNS, preventing the application for a free certificate. The documentation indicates that for the free CDN tier, HTTPS access between the CDN and the origin server does not require a valid certificate. Therefore, the origin server can simply enable HTTPS access using another certificate. For now, I will not investigate the DNS timeout issue during certificate application—it might be due to the inability to apply without the server IP being resolved.
