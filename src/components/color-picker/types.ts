/**
 * `v-model` 的颜色字符串格式
 * @en Color string format of the `v-model` value
 */
export type ColorPickerFormat = 'hex' | 'rgb' | 'hsb'

export interface ColorPickerProps {
    /**
     * 颜色值（标准 CSS 颜色字符串，按 `format` 序列化）；空值或非法值展示 `defaultColor`
     * @en Color value (a standard CSS color string, serialized per `format`); empty or invalid values display `defaultColor`
     */
    modelValue?: string
    /**
     * 格式；默认 `hex`（`#rrggbb`）
     * @default 'hex'
     * @en Format; defaults to `hex` (`#rrggbb`)
     */
    format?: ColorPickerFormat
    /**
     * 模型为空或非法时用于展示的颜色（不写回模型）
     * @default '#ff0000'
     * @en Color shown when the model is empty or invalid (not written back to the model)
     */
    defaultColor?: string
    /**
     * 是否内联展示面板（不显示触发按钮与浮层）
     * @default false
     * @en Whether to render the panel inline (no trigger button or overlay)
     */
    inline?: boolean
    /**
     * 面板内是否显示十六进制输入框
     * @default true
     * @en Whether to show the hex input inside the panel
     */
    showInput?: boolean
    /**
     * 预设色板（点击即选中该颜色）
     * @en Preset swatches (clicking one selects that color)
     */
    swatches?: string[]
    /**
     * 是否禁用
     * @default false
     * @en Whether the color picker is disabled
     */
    disabled?: boolean
    /**
     * 是否处于校验失败态
     * @default false
     * @en Whether the color picker is in an invalid state
     */
    invalid?: boolean
    /**
     * 触发按钮的不可见可访问名；默认取内建文案「颜色」
     * @en Invisible accessible name of the trigger button; defaults to the built-in "Color" text
     */
    label?: string
}
