import { inject, onBeforeUnmount, onMounted, provide, reactive, type InjectionKey } from 'vue'

/**
 * 步骤内「关联目标」在位计数：`CaomeiStepperTitle` / `CaomeiStepperDescription` 各自登记。
 * @en In-place counters of the step's referenced targets (`CaomeiStepperTitle` / `CaomeiStepperDescription`).
 */
export interface StepperLabelPresence {
    title: number
    description: number
}

export const stepperLabelPresenceKey: InjectionKey<StepperLabelPresence> = Symbol('CaomeiStepperLabelPresence')

/** 由步骤容器提供在位计数（每个 `CaomeiStepperItem` 一份）。 */
export function provideStepperLabelPresence(): StepperLabelPresence {
    const presence = reactive<StepperLabelPresence>({ title: 0, description: 0 })
    provide(stepperLabelPresenceKey, presence)
    return presence
}

/**
 * 登记关联目标的在位状态（挂载 +1 / 卸载 -1）。
 *
 * Reka 的 `StepperTrigger` 无条件绑定 `aria-describedby`（描述）与 `aria-labelledby`（标题），
 * 而两个 id 由 `StepperItem` 生成、只在对应部件渲染时落 DOM——部件缺席即悬空引用。
 * 挂载期首帧计数为 0（部件尚未挂载），随后由响应式计数补齐，属预期的两段渲染。
 */
export function useStepperLabelPresence(kind: keyof StepperLabelPresence): void {
    const presence = inject(stepperLabelPresenceKey, null)
    if (!presence) {
        return
    }
    onMounted(() => {
        presence[kind] += 1
    })
    onBeforeUnmount(() => {
        presence[kind] -= 1
    })
}
