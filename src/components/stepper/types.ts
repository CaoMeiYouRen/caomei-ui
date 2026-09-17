/**
 * 步骤排布方向
 * @en Layout orientation of the steps
 */
export type StepperOrientation = 'horizontal' | 'vertical'

/**
 * 阅读方向
 * @en Reading direction
 */
export type StepperDirection = 'ltr' | 'rtl'

export interface StepperProps {
    /**
     * 受控的当前步骤值（从 1 开始）；绑定 `v-model` 时由外部维护
     * @en Controlled current step value (1-based); maintained externally when bound with `v-model`
     */
    modelValue?: number
    /**
     * 非受控模式下的初始步骤；受控时改用 `v-model`
     * @en Initial step in uncontrolled mode; use `v-model` instead when controlled
     */
    defaultValue?: number
    /**
     * 排布方向
     * @en Layout orientation
     */
    orientation?: StepperOrientation
    /**
     * 是否必须按顺序完成步骤（禁止跳步）
     * @en Whether steps must be completed in order (disallows skipping)
     */
    linear?: boolean
    /**
     * 阅读方向；仅影响键盘方向导航，布局镜像需在上层元素设置 `dir`
     * @en Reading direction; only affects keyboard arrow navigation, set `dir` on an ancestor element for layout mirroring
     */
    dir?: StepperDirection
    /**
     * 步骤条的可访问名（映射 aria-label）；优先级为「本 prop > 透传 `aria-label` > 当前语言的「步骤」」
     * @en Accessible name of the stepper (maps to aria-label); priority is "this prop > forwarded `aria-label` > the current locale's \"Steps\" text"
     */
    label?: string
}

export interface StepperItemProps {
    /**
     * 步骤序号（从 1 开始），在单个 Stepper 内唯一
     * @en Step index (1-based), unique within a single Stepper
     */
    step: number
    /**
     * 是否禁用该步骤
     * @en Whether the step is disabled
     */
    disabled?: boolean
    /**
     * 是否标记为已完成
     * @en Whether the step is marked as completed
     */
    completed?: boolean
}

/**
 * 仅透传 Reka primitive 的公共属性
 * @en Common props shared by the pass-through Reka primitives
 */
export interface StepperPrimitiveProps {
    /**
     * 是否将子元素作为根渲染（`asChild`）
     * @en Whether to render the child as the root (`asChild`)
     */
    asChild?: boolean
}

/**
 * 步骤触发器；默认渲染为 `button`，可经 `as` / `as-child` 自定义
 * @en Step trigger; renders as a `button` by default and can be customized via `as` / `as-child`
 */
export type StepperTriggerProps = StepperPrimitiveProps

/**
 * 步骤指示器；默认插槽提供 `{ step }`
 * @en Step indicator; the default slot provides `{ step }`
 */
export type StepperIndicatorProps = StepperPrimitiveProps

/**
 * 步骤标题
 * @en Step title
 */
export type StepperTitleProps = StepperPrimitiveProps

/**
 * 步骤描述
 * @en Step description
 */
export type StepperDescriptionProps = StepperPrimitiveProps

/**
 * 步骤分隔线
 * @en Step separator
 */
export type StepperSeparatorProps = StepperPrimitiveProps

/**
 * 步骤列表布局容器；Reka 无对应 primitive，仅提供 `flex` 布局
 * @en Step list layout container; Reka has no matching primitive, so it only provides `flex` layout
 */
export type StepperListProps = StepperPrimitiveProps

/**
 * `CaomeiStepper` 通过模板 ref 暴露的导航方法
 * @en Navigation methods exposed by `CaomeiStepper` through a template ref
 */
export interface StepperExposed {
    /**
     * 跳转到指定步骤
     * @en Jump to the given step
     */
    goToStep: (step: number) => void
    /**
     * 进入下一步
     * @en Go to the next step
     */
    nextStep: () => void
    /**
     * 返回上一步
     * @en Go to the previous step
     */
    prevStep: () => void
}

/**
 * `CaomeiStepper` 默认插槽透传的 Reka 上下文
 * @en Reka context forwarded through `CaomeiStepper`'s default slot
 */
export interface StepperSlotProps {
    modelValue: number | undefined
    totalSteps: number
    isNextDisabled: boolean
    isPrevDisabled: boolean
    isFirstStep: boolean
    isLastStep: boolean
    goToStep: (step: number) => void
    nextStep: () => void
    prevStep: () => void
    hasNext: () => boolean
    hasPrev: () => boolean
}
