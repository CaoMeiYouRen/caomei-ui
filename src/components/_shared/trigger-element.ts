import type { InjectionKey, Ref } from 'vue'

/**
 * 浮层触发器元素：根组件 provide，触发器写入、内容组件读取。
 *
 * 用途：打开态隔离需要同时保留「面板根」与「触发器根」——只保留面板会把触发器一起标
 * `inert`，用户无法再点触发器关闭，既有交互回归。Vue 的 provide/inject 取最近一层提供者，
 * 因此同一 Symbol 在嵌套浮层中也能解析到各自的根。
 */
export const triggerElementKey: InjectionKey<Ref<HTMLElement | null>> = Symbol('caomeiTriggerElement')

/**
 * 打开前的焦点元素：由浮层触发器在 `pointerdown` 捕获阶段写入（此时浏览器尚未因后续
 * mousedown 改变焦点），根组件在打开时读取并用于关闭后的焦点归还。
 */
export const openFocusElementKey: InjectionKey<Ref<HTMLElement | null>> = Symbol('caomeiOpenFocusElement')

/** 浮层面板根：根组件 provide，内容组件写入；关闭时的焦点归还据此判断焦点是否仍在面板内 */
export const panelElementKey: InjectionKey<Ref<HTMLElement | null>> = Symbol('caomeiPanelElement')
