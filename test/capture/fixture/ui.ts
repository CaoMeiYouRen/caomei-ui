/**
 * 采集夹具的脚本驱动接口（`window.__ui`）与共享实例。
 *
 * 单列模块的原因：夹具（`app.vue`）与两个无渲染驱动组件（Toast / Confirm）分属不同
 * SFC / 模块，满足 `vue/one-component-per-file`。占位实现 fail-closed——未被对应
 * 驱动覆写即调用属夹具装配错误，不静默无操作。
 */
export interface CaptureUi {
    setDrawer: (size: 'sm' | 'md' | 'lg', open: boolean) => void
    setDialog: (size: 'sm' | 'md' | 'lg', open: boolean) => void
    showToasts: () => void
    confirm: () => void
}

export const ui: CaptureUi = {
    setDrawer: () => {
        throw new Error('[capture] setDrawer 尚未接线')
    },
    setDialog: () => {
        throw new Error('[capture] setDialog 尚未接线')
    },
    showToasts: () => {
        throw new Error('[capture] ToastDriver 尚未挂载，无法入队提示')
    },
    confirm: () => {
        throw new Error('[capture] ConfirmDriver 尚未挂载，无法打开确认框')
    },
}

const target = window as unknown as { __ui: CaptureUi }
target.__ui = ui
