# 组件模板（_template）

> 复制本目录为新组件起点。**不要直接修改本目录**。

## 快速开始

```bash
# 1. 复制模板
cp -r _template/ my-component/

# 2. 编辑 my-component/index.js 中的 name、version、init
# 3. 编辑 my-component/styles.css
# 4. 在 registry.js 中注册：
#      'my-component': () => import('./my-component/index.js'),
# 5. 在 layout.ejs 引入 CSS（如需全局样式）
# 6. 在 Markdown 中引用：
#      [component:my-component option="value"]
```

## 接口规范

每个组件 `default export` 必须包含：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | ✓ | 组件唯一标识（kebab-case） |
| `version` | string | ✓ | SemVer 版本号 |
| `dependencies` | string[] | ✓ | 外部库依赖 |
| `init(container, options)` | function | ✓ | 初始化入口 |
| `destroy()` | function | ✗ | 销毁清理 |
| `validate(options)` | function | ✗ | 参数校验 |

完整规范见 [`.trae/rules/extensibility.md`](../../../../../.trae/rules/extensibility.md) §2.2。

## 调用约定

- Markdown：`[component:NAME key="value" ...]`
- 自动转 `<component-tag data-component="NAME" data-key="value" ...></component-tag>`
- 由 `component-loader.js` 在 DOMContentLoaded 时扫描并挂载
- 所有组件独立模块，按需懒加载

## 禁用

- ❌ 绕过 `registry.js` 直接 import
- ❌ 在组件内访问全局变量
- ❌ 使用公共 CDN（所有依赖走 `/lib/<name>/` 本地化）
