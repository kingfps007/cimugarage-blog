# cimu-kb 主题

此木的车间·cimugarage.cn 共享主题。三栏知识库布局 + 卡片首页 + 全屏工具。

## 特性

- 响应式（桌面 3 栏 / 平板 2 栏 / 手机 1 栏）
- 暗色模式（不跟随系统，默认 light，按钮切换）
- 知识库侧边栏 + 文章目录（TOC）
- 站内搜索（前端 Fuse.js）
- 人生倒计时（仅 about 页）
- 评论组件（自建 ESA 函数）
- 浏览数（透明图打点 + JSON 拉取）
- 封面图三段兜底
- 浏览排行榜
- 跳过链接（skip-link，无障碍 A11Y）
- KaTeX 数学公式（本地化）

## 安装

作为 git submodule 引用（推荐）：

```bash
cd your-hexo-blog
git submodule add https://github.com/kingfps007/cimu-kb.git themes/cimu-kb
git submodule update --init --recursive
```

修改 `_config.yml`：

```yaml
theme: cimu-kb
```

## 依赖

- Hexo 7+
- 本地化 JS / CSS / 字体（**禁用**公共 CDN）
- 可选：Fuse.js（搜索，已本地化）

## 配置项

见 [cimu-kb/_config.yml](_config.yml)。

### 核心开关

```yaml
dark_mode:
  enabled: true
  default: light  # 不要改成 'auto'，必须显式切换
view_counter: self-hosted  # 自建 ESA 函数 + KV
comment:
  enabled: true
  endpoint: /api/comments
life_progress:
  enabled: true
  birth_date: '1990-01-01'  # ← 改为实际出生日期
```

## 目录结构

```
cimu-kb/
├── _config.yml         # 主题配置
├── layout/             # EJS 模板
│   ├── layout.ejs      # 主布局
│   ├── _partial/       # 组件（header/footer/sidebar/toc 等）
│   └── ...
├── source/             # 静态资源
│   ├── css/            # 样式
│   ├── js/             # 脚本
│   ├── lib/            # 第三方库（本地化）
│   ├── fonts/          # 字体（本地化）
│   └── images/         # 图片
├── README.md
├── CHANGELOG.md
└── LICENSE
```

## 升级

```bash
cd themes/cimu-kb
git pull origin main
cd ../..
git add themes/cimu-kb
git commit -m "chore: 升级 cimu-kb 主题"
```

## 许可

[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

## 联系

- 邮箱：2479010668@qq.com
- QQ：2479010668
- 站点：<https://cimugarage.cn>

## 上游仓库

- 源仓库（hvac-lab）：<https://github.com/kingfps007/hvac-lab>
- 独立仓库（cimu-kb）：<https://github.com/kingfps007/cimu-kb>
- 博客仓库（cimugarage-blog）：<https://github.com/kingfps007/cimugarage-blog>
