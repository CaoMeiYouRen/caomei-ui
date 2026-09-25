import { defineComponent, reactive, watchEffect, type PropType, type Ref } from 'vue'
import { injectComboboxRootContext } from 'reka-ui'

/**
 * 开合两态下的面板引用（`aria-controls` 取值来源）。
 * @en Panel reference for both open/closed states (source of `aria-controls` values).
 */
export interface PanelIdrefState {
    /** 面板元素 id（由本库生成并注册进 Reka 浮层上下文） */
    panelId: string
    /** 面板是否展开（镜像自浮层上下文的 `open`） */
    open: boolean
}

/** Reka 浮层上下文中与面板 id / 开合态相关的最小结构面 */
export interface PanelIdrefContext {
    contentId: string
    open: Ref<boolean>
}

/**
 * 面板 idref 接线：把本库生成的面板 id 注册进 Reka 浮层上下文，并镜像其 `open` 态。
 *
 * 为什么不能直接沿用 Reka 的 `aria-controls` 绑定：`rootContext.contentId` 是**非响应式字符串**，
 * 由面板挂载时才 `||=` 生成，而触发器 / 输入框的渲染早于面板挂载——关闭态会渲染出
 * `aria-controls=""`（空引用），开启态取值也随渲染时序漂移（实测同一组件在不同事件路径下
 * 分别表现为「已指向面板 id」与「仍为空」）。由本库持有 id 后，内容侧 `id`、触发器 / 输入框的
 * `aria-controls` 与 Reka 内部 `document.getElementById(contentId)` 查找三者同源。
 *
 * 取值契约：**关闭态省略**（面板未挂载，空引用与悬空引用都不应输出）、**开启态指向面板 id**。
 */
export function registerPanelIdref(context: PanelIdrefContext, state: PanelIdrefState): void {
    if (context.contentId) {
        // 已被占用时镜像生效 id，保证 `aria-controls` 与面板 id 恒同源（不静默漂移成悬空引用）
        state.panelId = context.contentId
    } else {
        context.contentId = state.panelId
    }
    watchEffect(() => {
        state.open = context.open.value
    })
}

/** 创建面板引用状态；`panelId` 全局唯一，直接作为面板元素 id 与 `aria-controls` 取值。 */
export function usePanelIdrefState(panelId: string): PanelIdrefState {
    return reactive<PanelIdrefState>({ panelId, open: false })
}

/** 由取值状态派生的 `aria-controls` 绑定值：关闭态为 `undefined`（省略属性）。 */
export function panelControlsAttr(state: PanelIdrefState): string | undefined {
    return state.open ? state.panelId : undefined
}

/**
 * 合并进 `v-bind` 的 `aria-controls` 绑定；使用方显式提供**非空** `aria-controls` 时以其为准
 * （空串 / `undefined` / `null` 按「无意见」处理，继续取派生值，与 `labelAttrs` 空串语义一致）。
 */
export function panelControlsBinds(state: PanelIdrefState, forwarded: Record<string, unknown>): { 'aria-controls'?: string } {
    const explicit = forwarded['aria-controls']
    const hasExplicit = typeof explicit === 'string' && explicit !== ''
    return hasExplicit ? {} : { 'aria-controls': panelControlsAttr(state) }
}

/**
 * 把面板 id 注册进 Combobox 上下文的桥接组件。
 *
 * 必须以组件形态落在 `<ComboboxRoot>` 子树内：`provide` / `inject` 以组件实例为链路，
 * 业务组件自身的 setup 早于 Reka 根的 provide，拿不到该上下文。
 */
export const ComboboxPanelIdrefBridge = defineComponent({
    name: 'CaomeiComboboxPanelIdrefBridge',
    props: { state: { type: Object as PropType<PanelIdrefState>, required: true } },
    setup(props): () => null {
        registerPanelIdref(injectComboboxRootContext() as unknown as PanelIdrefContext, props.state)
        return () => null
    },
})
