# 组件目录

> 可插拔前端组件的根目录。**所有新功能通过本目录的组件接入**。
> 详细架构与规范见 [`.trae/rules/extensibility.md`](../../../../.trae/rules/extensibility.md)。

## 当前结构

```
components/
├── README.md       # 本文件
├── registry.js     # 组件注册表（核心入口）
└── _template/      # 新组件模板（开发时复制）
    ├── index.js
    ├── styles.css
    └── README.md
```

## 计划组件（占位，按需实现）

| 组件名 | 用途 | 状态 |
|--------|------|------|
| `psychrometric` | 焓湿图（d3.js + canvas） | 待实现 |
| `curves` | 性能曲线（chart.js） | 待实现 |
| `image-viewer` | 图片 lightbox 查看器 | 待实现 |
| `pdf-viewer` | PDF 阅读器（pdf.js） | 待实现 |
| `video-player` | 视频播放器 | 待实现 |
| `comment` | 评论组件 | 待实现（需先启用 ESA 函数） |

实现任一组件时：复制 `_template/` 为新目录 → 实现 → 在 `registry.js` 取消对应注释。

## 设计原则

1. **数据驱动**：组件参数通过 Markdown 传入，不硬编码
2. **按需加载**：ES Module 动态 import，滚动到视口时挂载
3. **可插拔**：每个组件独立，禁用/删除不影响其他
4. **统一接口**：`{ name, version, init, destroy?, validate? }`

## 加载机制

```
Markdown  ─→  [component:psychrometric id="std"]
              ↓ AI / 后处理转换
DOM      ─→  <component-tag data-component="psychrometric" data-id="std">
              ↓ component-loader.js 扫描
挂载     ─→  import('./psychrometric/index.js') → default.init(el, options)
```

加载器由 `layout.ejs` 在 `DOMContentLoaded` 时启动。无需手动调用。
