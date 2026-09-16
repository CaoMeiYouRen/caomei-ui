import type { FieldIdentityProps } from '../_shared/field'

/**
 * 与公共契约的差异：`name` 提供后随表单提交；`id` 关联外部 label；`disabled` 仅本组件使用，
 * 未纳入 `FieldStateProps`（后者含 `size` / `invalid`，纳入会新增对外 props）。
 * @en Differences from the shared contract: `name` is submitted with the form when provided; `id`
 * associates an external label; `disabled` stays local because `FieldStateProps` also carries `size`
 * and `invalid`, which this component does not support.
 */
export interface SwitchProps extends FieldIdentityProps {
    /**
     * 是否禁用
     * @en Whether the switch is disabled
     */
    disabled?: boolean
    /**
     * 是否必填（原生表单校验）
     * @en Whether it is required (native form validation)
     */
    required?: boolean

    /**
     * 提交时代表开启的值；缺省时由 Reka 提供 'on'
     * @en Value representing "on" when submitted; defaults to Reka's 'on'
     */
    value?: string

}
