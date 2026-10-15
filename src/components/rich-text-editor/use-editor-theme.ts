import type { Ref } from 'vue'
import { resolveRootDark, useRootTheme } from '../_shared/use-root-theme'

/**
 * 编辑器包装组件的暗色解析。
 *
 * 观察逻辑与「主题相关属性」清单收敛在 `_shared/use-root-theme`，与图表封装共用同一实现；
 * 本模块只保留编辑器语境下的导出名（`resolveEditorDark` / `useEditorTheme`）。
 */

/** 从根元素与系统偏好解析当前是否为暗色（共享实现的重导出，便于单测直接调用）。 */
export const resolveEditorDark = resolveRootDark

/**
 * 响应式读取宿主当前的暗色状态；作用域销毁时清理监听（实现见 `useRootTheme`）。
 */
export function useEditorTheme(): Ref<boolean> {
    return useRootTheme().isDark
}
