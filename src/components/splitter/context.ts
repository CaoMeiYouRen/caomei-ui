import type { InjectionKey, Ref } from 'vue'
import type { SplitterDirection } from './types'

/** 面板控制器：根组件据此按受控布局调用各面板的 `resize` */
export interface SplitterPanelController {
    resize: (size: number) => void
    /** 当前实际尺寸（百分比）；用于兜底镜像「不发 layout 事件」的内部变更（如 Enter 折叠） */
    getSize: () => number | undefined
    /** 渲染态尺寸（读 Reka 写在 DOM 上的 `data-panel-size`），优先于内部布局值 */
    getRenderedSize: () => number | undefined
}

export interface SplitterPanelRegistry {
    register: (controller: SplitterPanelController) => void
    unregister: (controller: SplitterPanelController) => void
    /** 从各面板实际尺寸回读布局（无事件变更的兜底） */
    sync: () => void
}

/** 面板登记表：根组件 provide，面板在挂载 / 卸载时登记 */
export const splitterPanelKey: InjectionKey<SplitterPanelRegistry> = Symbol('caomeiSplitterPanel')

/** 分栏方向：根组件提供，手柄据此输出 `aria-orientation` */
export const splitterDirectionKey: InjectionKey<Ref<SplitterDirection>> = Symbol('caomeiSplitterDirection')
