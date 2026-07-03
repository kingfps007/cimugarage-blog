# 博客工作流规则（cimugarage.cn · 静态站）

> **本文件目标**：沉淀 cimugarage.cn 博客站的特有工作流约定。
> 关联：[`project_rules.md`](./project_rules.md) 通用规则 / [`comment_workflow.md`](./comment_workflow.md) 评论 / [`media_workflow.md`](./media_workflow.md) 媒体资源

---

## 〇、为什么需要本文件

cimugarage.cn 是个人博客站（中文 + 英文双语），与 hvac.cimugarage.cn（知识库）共享 cimu-kb 主题，但内容形态、URL 模式、部署目标均不同。本文件记录博客特有的约定，避免每次重复决策。

---

## 一、站点身份

| 维度 | 设定 |
|------|------|
| 域名 | cimugarage.cn |
| 性质 | 个人博客（专题文章、技术折腾、生活记录） |
| 语言 | 中文（默认）+ 英文 |
| 许可 | CC BY 4.0 |
| 部署 | GitHub (kingfps007/cimugarage-blog, **public**) → 阿里云 ESA Pages |
| 主题 | cimu-kb（git submodule → kingfps007/cimu-kb） |

> **仓库可见性：公开**
> - 与博客内容可见性一致（站点公开，源码公开）
> - 利用 GitHub 公开仓库的 Git LFS 免费额度（1GB/月）
> - 敏感信息（admin token、IP salt）走 ESA 环境变量，**不**入仓库
> - 草稿放 `source/_drafts/`，Hexo 不渲染，隐私通过不上线解决

---

## 二、内容结构

### 2.1 文章目录组织

```
source/_posts/
├── <YYYY-MM-DD>-<slug>/
│   ├── index.md      # 中文（默认，lang=zh-CN）
│   └── en.md         # 英文（lang=en）
```

**禁止**：
- ❌ 把中英两版塞进同一个 .md
- ❌ 路径中带 `/zh/` `/en/` 前缀（由 i18n_dir 配置生成）
- ❌ 路径用中文 slug
- ❌ 文章名带日期前缀（front matter 的 date 字段才是唯一时间源）

### 2.2 双语 front matter 规范

**中文版 `index.md`**：

```markdown
---
title: 博客安全 Blog Security
date: 2026-01-21 14:39:00
updated: 2026-02-19 07:57:00
lang: zh-CN
category: tech-learned
tags: [security, blog, nginx]
license: CC BY 4.0
description: 系统研究博客与其他端口服务的安全措施
---

正文...
```

**英文版 `en.md`**：

```markdown
---
title: Blog Security
date: 2026-01-21 14:39:00
updated: 2026-02-19 07:57:00
lang: en
category: tech-learned
tags: [security, blog, nginx]
license: CC BY 4.0
description: Systematic study of security measures for blog and other port services
---

Body...
```

**强制要求**：
- `date`、`updated`、`lang` 三字段必须存在
- `category`、`tags` 双语版必须完全一致
- `license` 默认为 `CC BY 4.0`
- `description` 双语各自写自己语言的摘要

### 2.3 双语一致性检查

发布前必须验证：
- [ ] `category` 双语完全相同
- [ ] `tags` 数组双语完全相同（仅语言相同，标签本身不翻译）
- [ ] `date` 与 `updated` 双语完全相同
- [ ] `title` 双语语义一致（不要求字字对应）
- [ ] URL slug 在 i18n 翻译下保持一致

**快捷检查脚本**（待写）：

```bash
# 伪代码
for post in source/_posts/*/; do
  diff <(grep "^category:" "$post/index.md") <(grep "^category:" "$post/en.md")
  diff <(grep "^tags:" "$post/index.md") <(grep "^tags:" "$post/en.md")
done
```

---

## 三、URL 与路由

### 3.1 URL 模式

| 类型 | 模式 | 示例 |
|------|------|------|
| 中文首页 | `/` | `cimugarage.cn/` |
| 英文首页 | `/en/` | `cimugarage.cn/en/` |
| 中文文章 | `/<slug>/` | `cimugarage.cn/security-of-blog/` |
| 英文文章 | `/en/<slug>/` | `cimugarage.cn/en/security-of-blog/` |
| 归档 | `/archives/` | `cimugarage.cn/archives/` |
| 分类 | `/categories/<cat>/` | `cimugarage.cn/categories/tech-learned/` |
| 标签 | `/tags/<tag>/` | `cimugarage.cn/tags/security/` |
| 关于 | `/about/` | `cimugarage.cn/about/` |

### 3.2 路径格式坑

**坑 1：Hexo page.path 不带前导 `/`**

```
page.path === 'security-of-blog/'  ← 注意结尾斜杠
```

**坑 2：i18n 切换时需要去掉/添加 `/en/` 前缀**

```javascript
// 中文 → 英文
'/security-of-blog/'.replace(/^\//, '/en/')
// → '/en/security-of-blog/'

// 英文 → 中文
'/en/security-of-blog/'.replace(/^\/en/, '')
```

**坑 3：归档页生成的是 `/archives/index.html`**

访问 `/archives/` 不会自动跳转，**必须**用 permalink 配置：

```yaml
# _config.yml
permalink_defaults:
  pretty_urls:
    trailing_index: true
```

### 3.3 旧 Halo URL 重定向

Halo 旧 URL 格式：`/archives/<slug>/`

**静态重定向**（部署于 `public/_redirects`）：

```
/archives/security-of-blog/  /security-of-blog/  301
/archives/linuxru-men/       /linux-intro/       301
/archives/wai-she-equipments/ /peripherals/      301
/archives/about/             /about/             301
/archives                    /archives/          301
```

**重定向表维护**：
- 每次新增文章 → 同步检查旧 URL（如有）
- `_redirects` 文件纳入 git 追踪
- 变更后用 `curl -I` 验证 301 生效

---

## 四、评论系统

### 4.1 API 设计

详见 [`comment_workflow.md`](./comment_workflow.md)。本节约定博客站的具体差异。

**端点**：

| 方法 | 路径 | 用途 |
|------|------|------|
| GET | `/api/comments?post=<path>&lang=<lang>&page=<n>` | 拉取评论列表 |
| POST | `/api/comment` | 提交评论 |
| DELETE | `/api/comment?id=<id>&token=<admin_token>` | 删除评论 |

**请求体（POST）**：

```json
{
  "post": "security-of-blog",
  "lang": "zh-CN",
  "author": {
    "name": "访客昵称",
    "email": "user@example.com",   // 可选
    "website": "https://..."        // 可选
  },
  "content": "评论内容（≤ 2000 字符）"
}
```

### 4.2 数据隔离

评论按 `(post, lang)` 二元组隔离：

```
KV key: comment:<post>:<lang>:<comment-id>
KV key: comment-index:<post>:<lang>  →  ["id1", "id2", ...]
```

中英两版的评论完全独立，互不显示。

### 4.3 旧 Halo 评论迁移

如需保留 Halo 旧评论：
1. Halo 后台 → 评论 → 导出 JSON
2. 转换脚本 → 新格式
3. 批量写入 ESA KV
4. 状态全部置为 `approved`

**决策点**：是导入旧评论还是从零开始（建议：从零开始，避免 spam 历史污染）。

---

## 五、人生倒计时

### 5.1 数据源

```yaml
# source/_data/blog-config.yml
birth:
  date: '1990-01-01'  # ← 修改此处
  show: true
```

### 5.2 展示位置

仅在 about 页（`/about/`）显示。

### 5.3 渲染逻辑

**`partial/life-progress.ejs`**：

```ejs
<% if (config.birth && config.birth.show) { %>
<div class="life-progress" data-birth="<%= config.birth.date %>">
  <div class="lp-item"><span class="lp-label">今日已过</span><span class="lp-value" data-type="day"></span></div>
  <div class="lp-item"><span class="lp-label">本周已过</span><span class="lp-value" data-type="week"></span></div>
  <div class="lp-item"><span class="lp-label">本月已过</span><span class="lp-value" data-type="month"></span></div>
  <div class="lp-item"><span class="lp-label">今年已过</span><span class="lp-value" data-type="year"></span></div>
</div>
<% } %>
```

**`js/life-progress.js`**：纯前端计算，避免 SSR 误差。

### 5.4 隐私考量

出生日期是个人敏感信息，**默认不公开**。在 `blog-config.yml` 设置 `show: false` 即可彻底关闭。

---

## 六、浏览数

### 6.1 方案：自建 ESA 函数 + KV

**前端（透明图打点）**：

```html
<!-- themes/cimu-kb/source/js/view-counter.js -->
(function() {
  const script = document.currentScript;
  const post = script?.getAttribute('data-post');
  if (!post) return;
  
  // 1. 打点（透明图）
  const img = new Image();
  img.src = `/api/view?post=${encodeURIComponent(post)}&t=${Date.now()}`;
  img.style.display = 'none';
  document.body.appendChild(img);
  
  // 2. 拉取并显示计数
  fetch(`/api/view/count?post=${encodeURIComponent(post)}`)
    .then(r => r.ok ? r.json() : null)
    .then(d => {
      if (d?.count) {
        const el = document.getElementById('view-count');
        if (el) el.textContent = d.count;
      }
    })
    .catch(() => {});
})();
```

**ESA 函数**（详见 [设计文档 §8.6](../BLOG_MIGRATION_DESIGN.md#86-浏览数实现详解)）：

```
GET /api/view?post=<path>          → 计数+1，返回 1x1 GIF
GET /api/view/count?post=<path>    → 返回 JSON { count: N }
```

### 6.2 与 project_rules 一致性

**无公共 CDN 例外**：
- ❌ 不使用 busuanzi / 不蒜子 / 任何第三方浏览数
- ✅ 全部走自建 ESA 函数 + KV
- ✅ 透明图打点 + JSON 拉取，极轻量
- ✅ 隐私友好：仅记录 post 路径，不存 IP

### 6.3 替代方案

如未来 ESA 函数成本过高：
- Cloudflare Analytics（隐私友好，但有第三方依赖）
- 完全移除浏览数（极简风格）
- 改用浏览数静态展示（停止计数，仅显示静态数字）

---

## 六点五、网络抗性策略

> **核心原则**：所有用户可见资源走「仓库 + ESA」闭环，**零公共 CDN**。

| 资源类型 | 体积阈值 | 存放位置 |
|---------|---------|---------|
| 主题代码 | < 5MB | themes/cimu-kb/ (submodule) |
| 字体 | < 5MB | themes/.../fonts/ |
| JS 库 | < 500KB | themes/.../lib/ |
| 文章图片 | < 500KB/张 | source/assets/images/（WebP） |
| PDF | < 10MB | source/assets/pdfs/ |
| 视频 | < 10MB | source/assets/videos/ |
| 视频 | 10-50MB | ESA 资源（同 CDN） |
| 视频 | > 50MB | 阿里云 OSS / 外部平台 |

**禁用**（与 project_rules.md 一致）：
- ❌ jsdelivr / unpkg / cdnjs / bootcss
- ❌ Google Fonts（已本地化）
- ❌ Gravatar（评论头像用本地默认占位）

**降级策略**：
- 主题 JS 失败 → 静态内容（无 JS 仍可读）
- 评论 API 失败 → 显示「评论功能维护中」
- 浏览数 API 失败 → 隐藏数字，不阻塞阅读

---

## 七、最后更新提示

### 7.1 触发条件

`updated` 字段距今超过 N 天时，在文章顶部显示警告横幅。

```yaml
# source/_data/blog-config.yml
post:
  last_updated_warning: 90  # 90 天
```

### 7.2 渲染逻辑

```ejs
<%
const now = Date.now();
const updated = new Date(page.updated || page.date).getTime();
const days = Math.floor((now - updated) / (1000 * 60 * 60 * 24));
const warnDays = config.post.last_updated_warning || 90;
%>
<% if (days > warnDays) { %>
<div class="outdated-warning">
  本文最后更新于 <%= date(page.updated, 'YYYY-MM-DD') %>，
  距今已有 <%= days %> 天，若文章内容或图片链接失效，请留言反馈。
</div>
<% } %>
```

### 7.3 关闭方式

```yaml
post:
  last_updated_warning: 0  # 0 = 关闭
```

---

## 四点五、评论管理后台

### 4.5.1 入口

```
/admin/comments?token=<ADMIN_TOKEN>
```

- 不在导航栏展示后台链接
- 所有者书签访问
- token 走 ESA 环境变量 `ADMIN_TOKEN`，**不**入仓库

### 4.5.2 客户端实现

```javascript
// themes/cimu-kb/source/js/admin-comments.js
const url = new URL(location.href);
const token = url.searchParams.get('token');
if (!token) {
  document.body.innerHTML = '<p>需要 token 参数</p>';
  throw new Error('no token');
}

// 拉取待审评论
fetch(`/api/admin/comments?token=${token}&status=pending`)
  .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
  .then(comments => renderList(comments))
  .catch(err => showError(err));

// 删除评论
function deleteComment(id) {
  if (!confirm('确认删除？')) return;
  fetch(`/api/comment?id=${id}&token=${token}`, { method: 'DELETE' })
    .then(() => reloadList());
}

// 审核通过
function approveComment(id) {
  fetch(`/api/comment/approve?id=${id}&token=${token}`, { method: 'POST' })
    .then(() => reloadList());
}
```

### 4.5.3 安全

- ✅ Token 仅在 URL query 中传递（不存 cookie/localStorage，避免 XSS 偷取）
- ✅ 每次操作验证 token
- ✅ HTTPS 强制（ESA 自动）
- ✅ token 源码不可见（仅 ESA 环境变量）

### 4.5.4 高级安全（可选）

- IP 白名单（仅家庭 IP 可访问）
- 操作日志（ESA 函数写 KV 记录每次审核动作）
- Token 定期轮换（每季度更新）

---

## 五点五、关于页完整迁移

### 5.5.1 Halo 现有内容（迁移清单）

抓取 [cimugarage.cn/archives/about](https://cimugarage.cn/archives/about) 确认：

- [x] 标题：About
- [x] 中英双语
- [x] 联系方式：QQ 2479010668@qq.com
- [x] 简介：人生倒计时（today/week/month/year %）
- [x] 许可协议：CC BY 4.0
- [x] 双语编辑说明（中英 AI 翻译 + 人工校核）

### 5.5.2 文件结构

```
source/about/
├── index.md    # 中文（lang: zh-CN）
└── en.md       # 英文（lang: en）
```

### 5.5.3 数据驱动

```yaml
# source/_data/about.yml
contact:
  email: 2479010668@qq.com
  qq: 2479010668
license: CC BY 4.0
editor_note:
  zh: 为方便读者，本站采用双语编辑，所有内容经过AI翻译和笔者校核
  en: For readers' convenience, this site is edited bilingually. All content undergoes AI translation and author review.
```

### 5.5.4 人生倒计时集成

通过 `partial/life-progress.ejs` 渲染（详见 §5），front matter 配置：

```yaml
---
title: 关于 About
lang: zh-CN
type: about
birth_date: '1990-01-01'  # 可选，覆盖 blog-config.yml
---
```

---

## 六点六、浏览排行榜

### 6.6.1 ESA 函数

```
GET /api/top-posts?limit=20
```

实现详见 [设计文档 §12.4.2](../BLOG_MIGRATION_DESIGN.md#1242-浏览排行榜)。

**性能**：
- 限制 limit ≤ 50
- 5 分钟缓存（`max-age=300`）
- ESA KV `list()` 按结果数计费，需关注成本

### 6.6.2 前端页面

`/top/` 路径（`source/top/index.md` + en.md），通过 `layout/top.ejs` 渲染。

### 6.6.3 缓存策略

**升级路径**（如排行榜访问量高）：
1. ESA 定时任务 → 每天构建静态 `top.json`
2. 前端改为 fetch 静态文件（KV 0 读取）
3. 排行榜完全静态化（构建时即确定）

---

## 七点五、文章封面图

### 7.5.1 front matter 字段

```yaml
---
title: 博客安全 Blog Security
cover: /assets/images/security-of-blog/cover.webp
cover_caption: 网络安全架构图
cover_credit: 此木的车间
---
```

### 7.5.2 渲染位置

| 页面 | 用途 | 尺寸 |
|------|------|------|
| 首页文章卡片 | 缩略图 | 400×225（16:9） |
| 文章详情页 | 顶部 hero | 1200×630（OG Image 同款） |
| 归档/分类/标签页 | 列表缩略图 | 400×225 |

### 7.5.3 资源规范

- **格式**：WebP，质量 80
- **单文件**：< 100KB
- **命名**：`<post-slug>-cover.webp`（小写连字符）
- **缺失处理**：回退默认占位图（`/assets/images/common/cover-placeholder.webp`）

### 7.5.4 OG Image 复用

封面图同时作为 Open Graph image（社交分享卡片）：

```html
<meta property="og:image" content="https://cimugarage.cn<%= page.cover %>">
```

详见 [media_workflow.md §7.2](./media_workflow.md)。

---

## 八、媒体资源

### 8.1 资源来源

Halo 迁移期间：
- 优先下载到本地 `source/assets/images/<post-slug>/`
- 转 WebP（质量 80）
- 文件名小写连字符：`security-bg-01.webp`

### 8.2 引用规范

**禁止** Halo attachment URL 残留（迁站后失效）。

**正例**：

```markdown
![网络安全架构](/assets/images/security-of-blog/architecture.webp)
```

**反例**：

```markdown
![网络安全架构](https://cimugarage.cn/attachment/xxx.png)
```

### 8.3 转 WebP 命令

```bash
# 批量转换
for f in source/assets/images/<post>/*.png; do
  cwebp -q 80 "$f" -o "${f%.png}.webp"
done
```

详见 [`media_workflow.md`](./media_workflow.md)。

---

## 九、SEO

### 9.1 hreflang

每篇文章页必须声明双语 hreflang：

```html
<link rel="alternate" hreflang="zh-CN" href="https://cimugarage.cn/<%= page.path %>">
<link rel="alternate" hreflang="en" href="https://cimugarage.cn/en/<%= en_path %>">
<link rel="alternate" hreflang="x-default" href="https://cimugarage.cn/<%= page.path %>">
```

### 9.2 Open Graph

```html
<meta property="og:title" content="<%= page.title %>">
<meta property="og:description" content="<%= page.description || excerpt(page) %>">
<meta property="og:url" content="https://cimugarage.cn/<%= page.path %>">
<meta property="og:locale" content="<%= page.lang === 'en' ? 'en_US' : 'zh_CN' %>">
<meta property="og:locale:alternate" content="<%= page.lang === 'en' ? 'zh_CN' : 'en_US' %>">
```

### 9.3 Sitemap

启用 `hexo-generator-sitemap`：

```yaml
sitemap:
  path: sitemap.xml
  rel: false
```

提交到：
- 百度搜索资源平台
- Google Search Console

### 9.4 RSS / Atom

启用 `hexo-generator-feed`：

```yaml
feed:
  type: rss2
  path: rss2.xml
  limit: 20
  content: false
  content_limit: 140
  content_limit_delim: ' [...]'
```

**输出策略**（与设计文档 §8.5 一致）：
- 主订阅 `/rss2.xml`（全量 20 条）
- 分类订阅按需启用（需额外插件）
- 摘要模式（不输出全文）减少体积

**禁用**：
- ❌ 全文 RSS（防内容被爬取聚合）
- ❌ 大量条目（影响阅读器加载）

---

## 十、部署与回滚

### 10.1 部署命令

```bash
git push origin main
# ESA Pages 自动构建，1-2 分钟生效
```

### 10.2 回滚

ESA Pages 控制台 → 历史部署 → 一键回滚到指定版本。

本地回滚：

```bash
git revert HEAD
git push origin main
```

### 10.3 灰度上线策略

**新站首次上线**：

1. 新站先部署到 `staging.cimugarage.cn`（ESA Pages 子域名）
2. 验证所有功能 1-2 周
3. 切主域 cimugarage.cn
4. 保留 Halo 容器 1 个月（只读）
5. 1 个月后停 Halo

---

## 十一、检查清单

**每次发布新文章**：

- [ ] front matter 完整（date、updated、lang、category、tags、license）
- [ ] 双语版 front matter 一致性
- [ ] 双语版正文内容完整
- [ ] 媒体资源本地化 + WebP
- [ ] 旧 URL 重定向表更新（如有）
- [ ] 本地 `npm run server` 预览
- [ ] 提交推送 → 等 1-2 分钟 → 线上验证
- [ ] 检查双链接工作（语言切换器）
- [ ] 提交 sitemap（如有 hexo-plugin-sitemap 自动）

**每月**：

- [ ] 检查评论数据，清理 spam
- [ ] 检查 404 日志，更新重定向
- [ ] 备份 ESA KV（评论数据）
- [ ] 更新 README.md + about/index.md 更新记录

---

## 十二、相关文件

| 文件 | 仓库 | 作用 |
|------|------|------|
| `BLOG_MIGRATION_DESIGN.md` | hvac-lab（草稿）→ cimugarage-blog | 迁移设计文档 |
| `_config.yml` | cimugarage-blog | Hexo 主配置（含 i18n） |
| `source/_data/blog-config.yml` | cimugarage-blog | 博客运行时配置 |
| `source/_posts/<slug>/{index,en}.md` | cimugarage-blog | 双语文章 |
| `public/_redirects` | cimugarage-blog | ESA 重定向规则 |
| `themes/cimu-kb/` | cimu-kb (submodule) | 共享主题 |
| `functions/comment/index.js` | cimugarage-blog | ESA 评论函数 |
| `themes/cimu-kb/languages/{zh-CN,en}.yml` | cimu-kb (submodule) | UI 字符串 |

---

## 十三、未来扩展

| 需求 | 实现位置 |
|------|---------|
| 文章搜索（站内） | 复用 hexo-generator-searchdb |
| 文章评论数显示 | KV 索引计数 + 模板渲染 |
| RSS 全量 / 单分类 | hexo-generator-feed 配置 |
| 文章封面图 | front matter `cover` 字段 |
| 系列文章 | front matter `series` 字段 + 模板 |
| 文章置顶 | front matter `sticky` 字段 |
| 阅读进度条 | 复用 hvac 站 layout.ejs（submodule 同步） |
| 夜间模式 | 复用 cimu-kb 主题（submodule 同步） |

---

## 十四、版本与变更

- **v0.5**（2026-07-01）— 与设计稿 v0.5 / v0.5.1 同步，10 项 P0 补漏 + 10 项 v0.5.1 backlog 沉淀。新增 §18-27：
  - P0 补漏：反 Bot（§20）/ 隐私政策（§18）/ A11Y（§19）/ 错误页与监控（§21）/ 迁移验证（§22）
  - P1+ 补漏：SEO + JSON-LD（§23）/ CI + 代码质量（§24）/ 社区规范（§25）/ 搜索 UX（§26）
  - 长期：可持续性原则（§27）
- **v0.4**（2026-07-01）— 4 项决议：分阶段交付 / 图片全部本地化 / 封面图三段兜底 / Trilium 编辑器
- **v0.3**（2026-07-01）— 4 项决议完成：关于页完整迁移 / 浏览排行榜 / 简易评论后台 / 启用封面图；仓库改 public
- **v0.2**（2026-07-01）— 浏览数从 busuanzi 改为自建 ESA 函数 + KV；新增网络抗性策略章节
- **v0.1**（2026-07-01）— 初稿，随设计文档同步

> **v0.5 同步说明**：本文件 §6 浏览数、§3.3 旧 URL 重定向、§4.5 评论后台等已与设计稿 v0.5 / v0.5.1 一致；不一致处以下方章节为最新口径。

---

## 十五、Trilium 编辑器集成

### 15.1 核心思路

**Trilium Notes** 是本项目的写作工具，**直接读写** `cimugarage-blog/source/_posts/` 目录，无中间环节。

### 15.2 配置步骤（P0 完成后用户执行）

1. **Trilium 启动参数**：指定笔记根目录为 `cimugarage-blog/source/_posts/`
2. **创建模板** `#template blog-post`（带 front matter）
3. **命名规范**：`<YYYY-MM-DD> <slug>`（如 `2026-07-01 hello-world`）
4. **目录结构**：
   ```
   source/_posts/
   └── 2026-07-01 hello-world/
       ├── index.md      # 中文
       ├── en.md         # 英文
       └── images/       # 笔记附件
   ```

### 15.3 模板示例

```markdown
---
title: <% tp.file.title %>
date: <% tp.date.now("YYYY-MM-DD HH:mm:ss") %>
updated: <% tp.date.now("YYYY-MM-DD HH:mm:ss") %>
lang: zh-CN
category: tech-learned
tags: []
license: CC BY 4.0
cover: 
description: 
---

<!-- 正文开始 -->
```

### 15.4 工作流

```
Trilium 写文章（双栏预览）
   ↓ Ctrl+S（自动保存到 source/_posts/）
hexo server（本地预览，可选）
   ↓ 满意后
git add + commit + push
   ↓
ESA Pages 自动部署
```

### 15.5 何时升级到自建 CMS（P1 触发）

- Trilium 笔记膨胀到 100+ 篇，搜索/组织困难
- 需要多人协作
- 需要远程写作（不在家时）
- 需要更细的发布控制（定时发布、A/B 测试）

详见 [设计文档 §12.4](../BLOG_MIGRATION_DESIGN.md#124-p1--p2-范围暂缓实施)。

---

## 十六、图片迁移（一次性任务）

### 16.1 流程

```
抓 Halo 8 篇文章 HTML
   ↓ cheerio 解析 <img>
下载到 source/assets/images/<slug>/
   ↓ 转 WebP（质量 80）
   ↓ 文件名 <slug>-NN.webp
替换 MD 中的 URL 为本地路径
```

### 16.2 脚本

`scripts/migrate-halo-images.js`（Node.js）：

- 输入：文章 URL 列表
- 输出：本地 WebP 文件 + URL 映射表
- 用法：`node scripts/migrate-halo-images.js`

### 16.3 资源规范

- 单张 < 500KB
- 总计预估 < 30MB
- 命名：`<slug>-NN.webp`（NN 两位数编号）
- 公共图放 `source/assets/images/common/`

### 16.4 迁移完成后

- 移除所有 Halo attachment URL 引用
- 提交到 git
- 删除本地缓存的原始图片（保留 WebP）

---

## 十七、封面图三段兜底

### 17.1 优先级

| 层级 | 来源 | 实现 |
|------|------|------|
| **1. 显式指定** | front matter `cover` 字段 | 用户手选 |
| **2. 兜底首图** | 文章正文第一张 `/assets/images/...` | 模板正则提取 |
| **3. 占位图** | `cover_placeholder: true` 标记 | AI 生成候选，用户挑选 |

### 17.2 模板逻辑

```ejs
<%
let cover = page.cover;
if (!cover) {
  const firstImg = page.content.match(/\/assets\/images\/[^"')]+\.(webp|jpg|png)/);
  cover = firstImg ? firstImg[0] : '/assets/images/common/cover-placeholder.webp';
}
%>
<img src="<%= cover %>" alt="<%= page.cover_caption || page.title %>" loading="lazy">
```

### 17.3 AI 生成流程

1. 扫描所有文章，识别无图列表
2. 调用图像生成技能，每篇生成 1-2 张候选
3. 候选图暂存 `source/assets/images/<slug>/cover-candidate-NN.webp`
4. 用户在 Trilium 中选择并填入 front matter

### 17.4 缺省占位图

`source/assets/images/common/cover-placeholder.webp`：
- 纯色背景 + 站名 logo + 文章分类色块
- 单文件 < 30KB
- 全站统一视觉

---

## 十八、隐私政策与 PIPL 合规

> **法务底线**：PIPL（个人信息保护法）+ CC BY 4.0 内容许可。v0.5 必做；上线前必读。

### 18.1 强制页面

**`source/about/privacy.md`**（中文）+ **`en.md`**（英文），双版本独立。

### 18.2 必含内容（PIPL §13/14/17/44 最小集）

| 章节 | 内容 |
|------|------|
| 收集什么 | 昵称（必填）、邮箱（可选）、网站（可选）、浏览数（无 IP 关联） |
| 不收集什么 | ❌ 真实姓名 / ❌ 手机号 / ❌ 地理位置 / ❌ 浏览器指纹 / ❌ 跨站追踪 ID |
| 存储 | 阿里云 ESA Pages KV（中国大陆地域） |
| 您的权利（PIPL §44） | 查询 / 更正 / 删除 / 注销（7 个工作日响应） |
| Cookie 使用 | 不设置追踪 cookie；唯一 cookie = 评论表单草稿暂存（仅前端） |
| 联系 | 邮箱 + QQ |

### 18.3 评论表单强制勾选

```html
<label>
  <input type="checkbox" name="agree_privacy" required>
  我已阅读并同意 <a href="/about/privacy/" target="_blank">《隐私政策》</a>
</label>
<button type="submit" :disabled="!agreed">提交</button>
```

未勾选 → 提交按钮 disabled，JS 拦截。

### 18.4 「我的评论」查询（PIPL §44 查询权）

**问题**：IP hash 不可逆，无法识别「我的评论」。

**解法**：用户提交时生成**一次性查询 token**（UUID），随评论返回（前端 localStorage 暂存 + 邮件发送）。后续用 token 查询/删除。

```javascript
// 评论提交响应
{ "id": "uuid-xxx", "queryToken": "uuid-yyy" }

// 用户用 token 调 DELETE /api/comment?id=xxx&token=yyy&userToken=zzz
```

不依赖 IP hash，符合 PIPL「最小必要」原则。

---

## 十九、A11Y 基础规范

> **目标**：WCAG 2.1 AA 最低合规。v0.5 必做。

### 19.1 最低要求清单

| 维度 | 要求 | 验收方法 |
|------|------|---------|
| 颜色对比 | 文本 vs 背景 ≥ 4.5:1 | Lighthouse 审计 |
| 键盘导航 | 所有交互元素 Tab 可达 | 手动测试 |
| 焦点指示 | 可见 outline | `*:focus-visible { outline: 2px solid }` |
| alt 文本 | 所有 `<img>` 必有 | Markdown lint 强制 |
| 标题层级 | 单一 H1，H2-H6 严格递进 | 模板检查 |
| 跳转链接 | 「跳到主内容」 | layout 顶部 |
| 语义化 | `<nav>`/`<main>`/`<article>`/`<aside>` | EJS 模板 |
| ARIA | 仅必要时加 `aria-label` | 谨慎使用 |
| 多媒体 | 无音频自动播放 | 评论无此需求 |
| 动效 | 尊重 `prefers-reduced-motion` | CSS 媒体查询 |

### 19.2 模板层强制（layout.ejs）

```ejs
<!-- 顶部跳转链接 -->
<a href="#main-content" class="skip-link">跳到主内容</a>
...
<main id="main-content" role="main" tabindex="-1">
  <article>...</article>
</main>
```

### 19.3 CSS 通用

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--primary);
  color: white;
  padding: 8px;
  z-index: 100;
}
.skip-link:focus { top: 0; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 19.4 Markdown lint（`.markdownlint.json`）

```json
{
  "MD033": false,         // 允许 HTML（KaTeX 需要）
  "MD045": false,         // 允许 h1 不在 front matter
  "MD059": true,          // 禁止重复标题
  "no-alt-text": true     // 强制 alt
}
```

### 19.5 暗色模式（user_profile 偏好）

- **不**跟随系统/浏览器 color-scheme
- **默认 light**，首次访问不切换
- 顶栏右侧显式切换按钮（☀️ / 🌙）
- 用户选择持久化到 localStorage
- 实现细节见 §27 长期可持续性

---

## 二十、反 Bot 机制

> **问题**：浏览数透明图打点会被爬虫/curl 污染。
> **解法**：3 层防护 + 1 个数据修正机制。

### 20.1 Layer 1：ESA 函数层 UA 过滤

`functions/view/index.js`：

```javascript
const BLOCKED_UAS = [
  /bot/i, /spider/i, /crawl/i, /slurp/i,
  /curl/i, /wget/i, /python-requests/i,
  /headlesschrome/i, /phantomjs/i,
  /baiduspider/i, /bingpreview/i, /facebookexternalhit/i,
];

export async function onRequestGet(context) {
  const ua = context.request.headers.get('user-agent') || '';
  if (BLOCKED_UAS.some(re => re.test(ua))) {
    return new Response('', { status: 204 });
  }
  // ... 原计数逻辑
}
```

### 20.2 Layer 2：频率限制（同 IP/24h）

```javascript
// KV key: view-ip:<ipHash>:<post>:<date>
// 超过 10 次/日 直接拒绝 +1（防止刷新党）
const ipKey = `view-ip:${ipHash}:${post}:${today}`;
const ipCount = parseInt(await KV.get(ipKey) || '0') + 1;
if (ipCount > 10) {
  return new Response('', { status: 204 });
}
await KV.put(ipKey, String(ipCount), { expirationTtl: 86400 });
```

### 20.3 Layer 3：前端蜜罐字段

```html
<!-- 隐藏字段，肉眼不可见，机器人会填 -->
<input type="text" name="website" style="position:absolute;left:-9999px" tabindex="-1" autocomplete="off">
```

### 20.4 数据修正（每周一次脚本）

`scripts/clean-view-spam.js`（Node.js + ESA API）：
- 统计每篇文章的浏览数
- 文章发布日期 < 30 天：剔除超过均值 5 倍标准差的数据
- 输出修正报告到 GitHub Actions artifact

---

## 二十一、错误页与监控

### 21.1 错误页

```
source/404.md → /404.html（Hexo 自动生成）
```

```ejs
<!-- layout/404.ejs -->
<% page.title = '页面未找到' %>
<div class="error-page">
  <h1>404</h1>
  <p>页面走丢了。可能是链接拼错了，或文章已被移除。</p>
  <ul>
    <li><a href="/">返回首页</a></li>
    <li><a href="/archives/">浏览归档</a></li>
    <li><a href="/search/">站内搜索</a></li>
  </ul>
</div>
```

**Hexo 配置**（`_config.yml`）：
```yaml
permalink_defaults:
  pretty_urls:
    trailing_index: true
```

### 21.2 维护页（P1 阶段）

通过 ESA `_redirects` 临时配置（实测 ESA 是否支持 503 语义）：

```
/*  /maintenance.html  503
```

### 21.3 监控方案

| 服务 | 用途 | 免费额度 | 通知方式 |
|------|------|---------|---------|
| **UptimeRobot** | 5 分钟一次心跳 | 50 监控 | 邮箱 / Telegram |
| **Better Stack** | uptime + status page | 1 monitor | 公开 status page |
| **ESA 内置日志** | 错误排查 | 30 天滚动 | ESA 控制台 |

**UptimeRobot 监控 3 个 URL**：
- `https://cimugarage.cn/`（首页）
- `https://cimugarage.cn/about/`
- `https://cimugarage.cn/api/comments?post=security-of-blog`（评论 API）

**通知链**：失败 2 次 → UptimeRobot → 邮箱 + Server 酱（微信推送）

---

## 二十二、迁移验证清单

### 22.1 自动化脚本（`scripts/verify-migration.sh`）

每篇迁移文章跑一次，对比 Halo 原文 vs Hexo 新版：

```bash
#!/bin/bash
# 用法：./verify-migration.sh <halo-url> <hexo-path>
set -e
HALO_URL=$1
HEXO_PATH=$2

# 1. 内容字数校验（±10% 容差）
halo_words=$(curl -s "$HALO_URL" | python -c "import sys, re; print(len(re.sub(r'<[^>]+>', '', sys.stdin.read())))")
hexo_words=$(wc -w < "$HEXO_PATH" | awk '{print $1*1.5}')
diff=$((halo_words > hexo_words ? halo_words - hexo_words : hexo_words - halo_words))
if [ $diff -gt $((halo_words / 10)) ]; then
  echo "❌ 字数差异过大: halo=$halo_words hexo=$hexo_words"
  exit 1
fi

# 2. 图片数量校验
halo_imgs=$(curl -s "$HALO_URL" | grep -c "<img")
hexo_imgs=$(grep -c "!\[" "$HEXO_PATH" || echo 0)
[ "$halo_imgs" -eq "$hexo_imgs" ] || echo "⚠️ 图片数差异"

# 3. 标题层级 + 代码块 + 链接（其他检查见设计稿 §12.6.4）
```

> **Windows 注意**：脚本要求 WSL / Git Bash，不在 PowerShell 运行。

### 22.2 人工审查项（每篇）

- [ ] 段落顺序与原文一致
- [ ] 强调（粗体/斜体）保留
- [ ] 列表编号风格一致（中文 `(1)` 不用 `-`，与 user_profile 一致）
- [ ] 表格完整
- [ ] 图片 alt 文本合理
- [ ] 内部链接指向新站（无 Halo 旧域）
- [ ] 外部链接完整
- [ ] 代码块语言标记正确

### 22.3 8 篇文章迁移分批

| 批次 | 数量 | 文章 | 触发回滚条件 |
|------|------|------|------------|
| 批次 1 | 4 篇 | security-of-blog / linux-intro / peripherals / about | 任一篇 URL 错乱或图片丢失 |
| 批次 2 | 4 篇 | 剩余 NAS / RAID / 超声波 / 其他 | 批次 1 稳定 7 天后 |

---

## 二十三、SEO + 结构化数据

### 23.1 JSON-LD（layout.ejs `<head>` 中）

**WebSite 级**：

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "此木的车间",
  "url": "https://cimugarage.cn",
  "inLanguage": ["zh-CN", "en"],
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://cimugarage.cn/search/?q={query}",
    "query-input": "required name=query"
  }
}
</script>
```

**BlogPosting 级**（文章详情页）：

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "<%= page.title %>",
  "datePublished": "<%= page.date.toISOString() %>",
  "dateModified": "<%= (page.updated || page.date).toISOString() %>",
  "author": { "@type": "Person", "name": "此木的车间", "url": "https://cimugarage.cn/about/" },
  "publisher": {
    "@type": "Organization",
    "name": "此木的车间",
    "logo": { "@type": "ImageObject", "url": "https://cimugarage.cn/assets/images/common/logo.svg" }
  },
  "image": "https://cimugarage.cn<%= page.cover || '/assets/images/common/cover-placeholder.webp' %>",
  "mainEntityOfPage": "https://cimugarage.cn/<%= page.path %>",
  "inLanguage": "<%= page.lang %>",
  "license": "https://creativecommons.org/licenses/by/4.0/",
  "keywords": "<%= page.tags?.join(',') %>"
}
</script>
```

### 23.2 Twitter Card

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="<%= page.title %>">
<meta name="twitter:description" content="<%= page.description || excerpt(page) %>">
<meta name="twitter:image" content="https://cimugarage.cn<%= page.cover || '/assets/images/common/cover-placeholder.webp' %>">
```

### 23.3 Canonical URL

```html
<!-- 双语版各自指向自身 URL（不互相 canonical） -->
<link rel="canonical" href="https://cimugarage.cn/<%= page.path.replace(/^en\//, '') %>">
```

### 23.4 Sitemap 包含 hreflang

`hexo-generator-sitemap` 默认不含 hreflang。需自定义插件或用 `hexo-generator-sitemap` + 后处理脚本（详见 P1+）。

### 23.5 robots.txt

```yaml
# public/robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Sitemap: https://cimugarage.cn/sitemap.xml
```

---

## 二十四、CI 与代码质量

### 24.1 Dependabot 配置

`.github/dependabot.yml`：

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    labels: ["dependencies"]
```

### 24.2 ESLint + Prettier

`.eslintrc.js`：

```javascript
module.exports = {
  root: true,
  env: { node: true, browser: true, es2022: true },
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
  },
};
```

### 24.3 CI 工作流（`.github/workflows/ci.yml`）

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { submodules: recursive }
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - name: 双语一致性检查
        run: ./scripts/check-bilingual.sh
      - name: 链接有效性
        run: ./scripts/check-links.sh
```

### 24.4 双语一致性脚本

`scripts/check-bilingual.sh`：

```bash
#!/bin/bash
for post in source/_posts/*/; do
  if [ -f "$post/en.md" ]; then
    for field in category tags date updated; do
      zh=$(grep "^$field:" "$post/index.md" | head -1)
      en=$(grep "^$field:" "$post/en.md" | head -1)
      [ "$zh" = "$en" ] || echo "❌ $post: $field 不一致"
    done
  fi
done
```

---

## 二十五、社区规范文档

> 个人博客公开仓库，规范文档提升可信度（即使 0 协作者）。

### 25.1 必备文档

| 文件 | 作用 |
|------|------|
| `README.md` | 项目说明 + 快速开始 + 更新记录 |
| `CHANGELOG.md` | 版本历史（commit 之外的高层变更） |
| `CONTRIBUTING.md` | 贡献指南（如何在本地开发） |
| `SECURITY.md` | 漏洞披露流程 + 联系方式 |
| `LICENSE` | 代码许可（推荐 MIT）+ 内容许可（CC BY 4.0） |
| `CODE_OF_CONDUCT.md` | 社区行为准则（可选，单人项目可选） |

### 25.2 README 模板

```markdown
# 此木的车间（cimugarage.cn · 静态博客）

[![Hexo](https://img.shields.io/badge/Hexo-7.3-blue)]()
[![License](https://img.shields.io/badge/license-CC_BY_4.0-green)]()
[![Uptime](https://img.shields.io/badge/uptime-99.9%25-brightgreen)]()

## 快速开始
git clone --recursive https://github.com/kingfps007/cimugarage-blog.git
cd cimugarage-blog
npm install
npm run server

## 写作
1. 打开 Trilium，根目录指向 source/_posts/
2. 新建笔记，应用 #template blog-post 模板
3. 写作，双语版分别保存为 index.md 和 en.md
4. git add && git commit && git push

## 部署
推送后 ESA Pages 自动构建，1-2 分钟生效。
```

---

## 二十六、搜索 UX

### 26.1 前端搜索栏

```html
<form class="search-form" action="/search/" method="get">
  <input type="search" name="q" placeholder="搜索文章..." aria-label="站内搜索">
  <button type="submit">🔍</button>
</form>
```

### 26.2 `/search/` 页面（本地化 Fuse.js）

**禁止** 引用 jsdelivr / cdnjs 等公共 CDN。Fuse.js 下载到本地：

```
themes/cimu-kb/source/lib/fuse.js/
└── fuse.min.js   # 约 12KB
```

**搜索特性**：
- 模糊匹配（容错 1-2 字符）
- 中文按字符匹配（无分词，简单实现）
- 标题/标签/分类权重 > 正文
- 双语版搜索结果独立
- 高亮匹配文字

### 26.3 与 §6 浏览数 / §4 评论的 API 失败降级一致

- 搜索 API 失败 → 显示「搜索功能维护中」
- 搜索结果 0 条 → 显示「未找到相关文章」+ 建议浏览归档

---

## 二十七、长期可持续性原则

> **核心目标**：构建一个**多年内不用大改**的内容创作与展示平台。

### 27.1 设计哲学

- **少即是多**：能不加的依赖就不加
- **稳定优先**：LTS / 稳定版，不追新
- **自动化一切**：能自动化的别手动
- **文档驱动**：所有决策沉淀到 .trae/rules/

### 27.2 依赖治理

```json
{
  "engines": {
    "node": ">=20.0.0 <21.0.0",
    "npm": ">=10.0.0 <11.0.0"
  }
}
```

- 重大依赖**最多 2 年**评估一次升级
- Dependabot 自动监控 + 周报
- Patch 版本自动合并；minor 人工 review

### 27.3 技术选型红线

**绝不引入**：
- ❌ 数据库（MySQL/PostgreSQL/MongoDB）— 静态站不需要
- ❌ 服务端运行时（Node.js 长驻）— 成本高、易出故障
- ❌ 复杂前端框架（React/Vue/Angular）— Hexo EJS 足够
- ❌ 公共 CDN（jsdelivr/cdnjs）— 网络风险
- ❌ 第三方分析（GA/百度统计）— 隐私风险
- ❌ 第三方评论（Disqus/网易云跟帖）— 隐私风险

### 27.4 数据可迁移性

| 数据 | 存储 | 导出格式 |
|------|------|---------|
| 文章 | `source/_posts/*.md` | Markdown（标准） |
| 评论 | ESA KV | JSON 脚本导出 |
| 浏览数 | ESA KV | JSON 脚本导出 |
| 配置 | `_config.yml` + `source/_data/*.yml` | YAML（标准） |
| 主题 | `themes/cimu-kb/` (submodule) | EJS + CSS（开源） |

**切换平台成本**：导出 markdown → 导入新 SSG（Jekyll / Hugo / Astro 都吃 markdown）。

### 27.5 备份与恢复

- **KV 备份**：GitHub Actions 每日导出 `backups/kv-YYYYMMDD.json` 推回仓库
- **仓库镜像**：GitLab / Gitee mirror（`git push --mirror`）
- **Halo 旧评论**：导出 JSON 保存到 `archives/halo-export-2026.json`（不公开）
- **RUNBOOK**：`docs/RUNBOOK.md`（2 页内）记录「ESA 挂了怎么办」「KV 被清空怎么恢复」

### 27.6 「可工作 5 年」清单

- [ ] 所有依赖 LTS / 稳定版
- [ ] Node.js 版本在 package.json 锁定
- [ ] Dependabot 配置开启
- [ ] CI 检查覆盖双语、链接、Lighthouse
- [ ] 备份策略（KV 导出 + git mirror）
- [ ] 监控（UptimeRobot 5 分钟心跳）
- [ ] 文档完整（README + 设计文档 + 规则）
- [ ] 子模块版本明确（pin tag）
- [ ] 隐私政策 / 错误页 / 维护页
- [ ] 至少 30 天试运行无重大问题

### 27.7 长期演进路线

| 年份 | 预期变化 | 应对 |
|------|---------|------|
| Y1 | 大量内容产出 | 工具链稳定，无大改 |
| Y2 | 评论数 > 1000 | 启用 KV 索引 + 分页优化 |
| Y3 | 视频内容增加 | 引入 OSS（如有预算） |
| Y4 | 文章 > 100 篇 | 启用搜索 UX 优化 |
| Y5 | Hexo 8 推出 | 评估升级（不主动追） |
| Y5+ | ESA 重大变化 | 评估迁移到 Vercel / Cloudflare |

**原则**：不主动升级 / 不引入新依赖 / 不重构代码（除非有具体理由）。

---

## 二十八、关联文档

| 文档 | 关系 |
|------|------|
| [`project_rules.md`](./project_rules.md) | 通用项目规则（部署、媒体、组件） |
| [`meta_rules.md`](./meta_rules.md) | AI 协作元规则 |
| [`comment_workflow.md`](./comment_workflow.md) | 评论系统详细规范（与 §4 互补） |
| [`media_workflow.md`](./media_workflow.md) | 媒体资源详细规范（与 §8 互补） |
| [`extensibility.md`](./extensibility.md) | 组件与扩展性（与 §二十六 搜索组件关联） |
| [`../BLOG_MIGRATION_DESIGN.md`](../BLOG_MIGRATION_DESIGN.md) | 迁移设计文档（v0.5.1，本文件上游） |
