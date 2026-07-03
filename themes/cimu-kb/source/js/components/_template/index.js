/**
 * 组件模板（_template）
 *
 * 使用步骤：
 *   1. 复制本目录为新组件目录（如 psychrometric/）
 *   2. 修改下方 name、version、init 等
 *   3. 在 registry.js 中取消对应注释
 *   4. 在 Markdown 中用 [component:name ...] 引用
 *
 * 接口规范见 .trae/rules/extensibility.md §2.2
 */

export default {
  // 必填：组件唯一标识（kebab-case，需与 registry.js key 一致）
  name: 'component-name',

  // 必填：组件版本（SemVer）
  version: '1.0.0',

  // 必填：外部依赖（CDN 库名，如 ['katex', 'd3']）
  dependencies: [],

  // 必填：组件初始化入口
  //   container: DOM 元素
  //   options:   组件参数
  init(container, options) {
    if (!container) {
      console.warn(`[${this.name}] 缺少 container`);
      return;
    }
    // 示例：在容器中显示组件名 + 参数
    container.innerHTML = `
      <div class="component-placeholder">
        <strong>${this.name}</strong> v${this.version}
        <pre>${JSON.stringify(options, null, 2)}</pre>
      </div>
    `;
  },

  // 选填：销毁方法（清理事件、移除 DOM）
  destroy() {
    // TODO: 清理逻辑
  },

  // 选填：参数校验（返回 false 时跳过初始化）
  validate(options) {
    return true;
  },
};
