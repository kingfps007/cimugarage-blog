/**
 * 组件注册表
 *
 * 工作流（详见 .trae/rules/extensibility.md）：
 *   1. 复制 _template/ 为新组件目录（如 psychrometric/）
 *   2. 实现 index.js（遵守 _template 接口规范）
 *   3. 在下方注册：取消对应注释 + 实现组件目录
 *   4. 在 Markdown 中用 [component:name ...] 引用
 *
 * 新增组件 = 修改本文件一行 + 新建一个组件目录。无需改 layout/模板。
 */

// 已实现组件在此注册。占位组件已注释，避免空目录噪音。
const components = {
  // 'psychrometric': () => import('./psychrometric/index.js'),
  // 'curves':        () => import('./curves/index.js'),
  // 'image-viewer':  () => import('./image-viewer/index.js'),
  // 'pdf-viewer':    () => import('./pdf-viewer/index.js'),
  // 'video-player':  () => import('./video-player/index.js'),
  // 'comment':       () => import('./comment/index.js'),
};

/**
 * 挂载组件到指定 DOM 容器
 * @param {string} name - 组件标识（与注册表 key 一致）
 * @param {HTMLElement} container - 容器元素
 * @param {Object} options - 组件参数
 */
export async function mountComponent(name, container, options) {
  if (!components[name]) {
    console.warn(`[components] 未注册: ${name}`);
    return;
  }
  try {
    const module = await components[name]();
    if (typeof module.default.init !== 'function') {
      console.warn(`[components] ${name} 缺少 init()`);
      return;
    }
    module.default.init(container, options);
  } catch (err) {
    console.error(`[components] ${name} 加载失败:`, err);
  }
}

/**
 * 列出已注册组件名（调试用）
 */
export function listComponents() {
  return Object.keys(components);
}
