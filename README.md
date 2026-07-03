# 此木的车间 · cimugarage.cn

[![Hexo](https://img.shields.io/badge/Hexo-7.3-blue)]()
[![License: CC BY 4.0](https://img.shields.io/badge/content-CC_BY_4.0-green)]()
[![Code: MIT](https://img.shields.io/badge/code-MIT-blue)]()
[![Status: Static](https://img.shields.io/badge/deploy-ESA_Pages-orange)]()

个人博客静态站。中文（默认）+ 英文双语，技术学习、生活记录、专题研究。

站点：<https://cimugarage.cn>

## 快速开始

```bash
# 1. 克隆（带 submodule）
git clone --recursive https://github.com/kingfps007/cimugarage-blog.git
cd cimugarage-blog

# 2. 安装依赖
npm install

# 3. 本地预览
npm run server
# 访问 http://localhost:4000

# 4. 部署
git push origin main
# ESA Pages 自动构建，1-2 分钟生效
```

## 写作流程

1. 打开 Trilium Notes，根目录指向 `source/_posts/`
2. 新建笔记，应用 `#template blog-post` 模板
3. 写作，中文版保存为 `index.md`，英文版保存为 `en.md`（同目录）
4. 完成后 `git add && git commit && git push`

详见 [`.trae/rules/blog_workflow.md`](.trae/rules/blog_workflow.md) §15。

## 仓库结构

```
cimugarage-blog/
├── source/                     # 内容源
│   ├── _posts/                 # 双语文章（<date>-<slug>/{index,en}.md）
│   ├── _data/                  # 运行时配置（YAML）
│   ├── about/                  # 关于页
│   ├── 404/                    # 404 页
│   ├── assets/                 # 图片 / 视频 / PDF
│   └── categories/ tags/ archives/
├── themes/cimu-kb/             # 共享主题（submodule → kingfps007/cimu-kb）
├── public/                     # 构建产物（不入库）
│   └── _redirects              # ESA Pages 静态重定向
├── functions/                  # ESA 云函数
│   ├── comment/                # 评论 API
│   ├── view/                   # 浏览数 API
│   └── top-posts/              # 浏览排行榜 API
├── scripts/                    # 工具脚本
│   ├── check-bilingual.sh      # 双语一致性检查
│   ├── verify-migration.sh     # 迁移验证
│   └── clean-view-spam.js      # 浏览数反 Bot 数据修正
├── _config.yml                 # Hexo 主配置
├── package.json
├── .github/workflows/ci.yml    # CI 工作流
└── README.md
```

## 设计文档

- 迁移设计：[`BLOG_MIGRATION_DESIGN.md`](BLOG_MIGRATION_DESIGN.md) v0.5.1
- 工作流规则：[`.trae/rules/blog_workflow.md`](.trae/rules/blog_workflow.md) v0.5

## 许可

- **代码**：MIT（见 [LICENSE](LICENSE)）
- **内容**：[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

## 联系

- 邮箱：2479010668@qq.com
- QQ：2479010668
