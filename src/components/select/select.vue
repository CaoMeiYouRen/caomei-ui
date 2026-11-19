<script setup lang="ts" generic="T extends object">
import {
    SelectContent,
    SelectIcon,
    SelectItem,
    SelectItemIndicator,
    SelectItemText,
    SelectLabel,
    SelectGroup,
    SelectPortal,
    SelectRoot,
    SelectTrigger,
    SelectValue,
    SelectViewport,
} from 'reka-ui'
import { computed, nextTick, ref } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon, useInternalIcons } from '../../icons'
import CaomeiIconTooltip from '../tooltip/icon-tooltip.vue'
import { warnDev } from '../../_shared/dev-warn'
import { EMPTY_OPTION_TOKEN, fromPanelValue, isEmptyOptionValue, isReservedEmptyToken, narrowOptionValue, resolveOptionDisabled, resolveOptionField, warnEmptyOptionValue, type OptionValue } from '../_shared/option'
import { labelAttrs } from '../_shared/use-label-attrs'
import { useOpenStateIsolation } from '../_shared/use-open-state-isolation'
import type { SelectOptionGroup, SelectProps } from './types'

defineOptions({ name: 'CaomeiSelect', inheritAttrs: false })

const icons = useInternalIcons()

const props = withDefaults(defineProps<SelectProps<T>>(), {
    options: () => [],
    optionLabel: 'label',
    optionValue: 'value',
    placeholder: '',
    size: 'md',
    disabled: false,
    invalid: false,
    bodyLock: false,
    showClear: false,
    allowEmptyValue: false,
})

defineSlots<{
    /**
     * 自定义选项内容；`option` 为原始选项对象，`selected` 表示是否为当前选中项
     * @en Custom option content; `option` is the raw option object and `selected` marks the selected one
     */
    option?: (props: { option: T, selected: boolean }) => unknown
    /**
     * 自定义触发器显示内容；作用域为当前选中的选项 `{ option, label, selected }`
     * 当未选中值时 `option` 为 `undefined`，`label` 为 `undefined`
     * @en Custom trigger display content; scope is the current selected option `{ option, label, selected }`.
     * When no value is selected, `option` is `undefined` and `label` is `undefined`.
     */
    value?: (props: { option: T | undefined, label: string | undefined, selected: boolean }) => unknown
}>()

const model = defineModel<OptionValue | null>()

const locale = useLocale()
const clearLabel = computed(() => props.clearLabel ?? locale.value.select.clear)

interface NormalizedOption {
    /** 原始选项对象，供 `#option` 插槽使用 */
    raw: T
    /** 解析后的选项值（字符串或数字） */
    value: OptionValue
    /** 解析后的显示文本；字段缺省时为 undefined */
    label: string | undefined
    /** 送往 Reka 面板的值：开启 allowEmptyValue 时空串项用内部 token 承载 */
    panelValue: OptionValue
    disabled: boolean
}

/**
 * 开发期提示：选项 value 解析为 `null` / `undefined` 时该选项会被丢弃。
 * 只做提示，不改变解析结果与生产输出（`warnDev` 在生产构建中静默）。
 */
function warnUnresolvedOption(raw: unknown, index: number): void {
    if (raw === null || raw === undefined) {
        warnDev(
            `[CaomeiSelect] 第 ${index + 1} 个选项的 value 解析为 ${raw === null ? 'null' : 'undefined'}，该选项不会渲染。`,
        )
    }
}

/** 判断是否为分组形态 */
function isOptionGroup(option: T | SelectOptionGroup<T>): option is SelectOptionGroup<T> {
    return 'options' in option && Array.isArray(option.options)
}

/**
 * 归一化单个选项：解析字段并按契约处置空串与保留 token。
 * - 默认（`allowEmptyValue === false`）：空串选项告警并丢弃；
 * - 开启时：空串项保留，面板值换成内部 token；值恰好等于 token 的非空选项丢弃并告警。
 */
function normalizeOption(option: T, index: number, groupLabel?: string): NormalizedOption | undefined {
    const rawValue = resolveOptionField<T, unknown>(option, props.optionValue, 'value')
    const value = narrowOptionValue(rawValue)
    if (value === undefined) {
        warnUnresolvedOption(rawValue, index)
        return undefined
    }
    if (isEmptyOptionValue(value)) {
        if (!props.allowEmptyValue) {
            warnEmptyOptionValue('CaomeiSelect', index, groupLabel)
            return undefined
        }
    } else if (props.allowEmptyValue && isReservedEmptyToken(value)) {
        warnDev(
            `[CaomeiSelect] 第 ${index + 1} 个选项的 value 使用了保留字符串，该选项不会渲染（allowEmptyValue 开启时该值由空值项占用）。`,
        )
        return undefined
    }
    return {
        raw: option,
        value,
        panelValue: props.allowEmptyValue && value === '' ? EMPTY_OPTION_TOKEN : value,
        label: resolveOptionField(option, props.optionLabel, 'label'),
        disabled: resolveOptionDisabled(option),
    }
}

/** 归一化选项列表：映射字段并剔除契约外项，供触发器与面板共用 */
const normalizedOptions = computed<NormalizedOption[]>(() => {
    const result: NormalizedOption[] = []
    for (const [index, option] of props.options.entries()) {
        // 跳过分组项，由模板单独处理
        if (isOptionGroup(option)) {
            continue
        }
        const normalized = normalizeOption(option, index)
        if (normalized) {
            result.push(normalized)
        }
    }
    return result
})

/** 归一化分组列表 */
const normalizedGroups = computed(() => {
    const result: { label: string, options: NormalizedOption[] }[] = []
    for (const option of props.options) {
        if (!isOptionGroup(option)) {
            continue
        }
        const groupOptions: NormalizedOption[] = []
        for (const [index, item] of option.options.entries()) {
            const normalized = normalizeOption(item, index, option.label)
            if (normalized) {
                groupOptions.push(normalized)
            }
        }
        result.push({ label: option.label, options: groupOptions })
    }
    return result
})

/** 是否包含分组 */
const hasGroups = computed(() => props.options.some(isOptionGroup))

/** 选项集中是否存在空值项（开启 allowEmptyValue 时 `''` 才是有值） */
const emptyOptionExists = computed(
    () => normalizedOptions.value.some((option) => option.value === '')
        || normalizedGroups.value.some((group) => group.options.some((option) => option.value === '')),
)

/** 有选中值（用于 data-filled；不依赖选项 label，空 label 也视为有值） */
const hasValue = computed(() => {
    const value = model.value
    if (value === undefined || value === null) {
        return false
    }
    // 开启 allowEmptyValue 后 `''` 是真实选中值，但仅当选项中确有该值
    if (value === '') {
        return props.allowEmptyValue && emptyOptionExists.value
    }
    return true
})

/** 送往 Reka 的模型：开启 allowEmptyValue 时把空串换成内部 token */
const panelModel = computed<OptionValue | null>(() => {
    const value = model.value
    if (value === undefined || value === null) {
        return null
    }
    return props.allowEmptyValue && value === '' ? EMPTY_OPTION_TOKEN : value
})

/**
 * Reka 回写模型：token 还原为空串；`null` / `undefined` 统一收敛为 `null`（未选择）。
 */
function onModelUpdate(value: unknown): void {
    if (value === undefined || value === null) {
        model.value = null
        return
    }
    // 仅在开启 allowEmptyValue 时还原 token；关闭时该字符串是用户的普通值
    const mapped = props.allowEmptyValue ? fromPanelValue(value) : value
    model.value = typeof mapped === 'string' || typeof mapped === 'number' ? mapped : null
}

/** 开启 allowEmptyValue 时由本组件渲染隐藏输入，避免内部 token 进入表单提交值 */
const panelName = computed<string | undefined>(() => (props.allowEmptyValue ? undefined : props.name))

const clearable = computed(() => props.showClear && hasValue.value && !props.disabled)

/** 当前选中的归一化选项（含 raw 对象） */
const selectedOption = computed<NormalizedOption | undefined>(() => {
    if (!hasValue.value) {
        return undefined
    }
    // 先从扁平选项中查找
    const flatMatch = normalizedOptions.value.find((option) => option.value === model.value)
    if (flatMatch) {
        return flatMatch
    }
    // 再从分组中查找
    for (const group of normalizedGroups.value) {
        const match = group.options.find((option) => option.value === model.value)
        if (match) {
            return match
        }
    }
    return undefined
})

const selectedLabel = computed(() => selectedOption.value?.label)

const rootClass = computed(() => [
    `caomei-field--${props.size}`,
    {
        'caomei-field--invalid': props.invalid,
        'caomei-field--disabled': props.disabled,
        'caomei-select--clearable': clearable.value,
    },
])

const triggerRef = ref<{ $el?: unknown } | null>(null)

/** 清空模型，并把焦点交回触发器：清除后按钮自身被移除，否则焦点会掉到 body */
function clearValue(): void {
    model.value = null
    void nextTick(() => {
        // 受控用法下外层可能拒绝更新：此时按钮仍在，不应把它自身的焦点抢走
        if (clearable.value) {
            return
        }
        const element = triggerRef.value?.$el
        if (element instanceof HTMLElement) {
            element.focus()
        }
    })
}

const contentRef = ref<{ $el?: unknown } | null>(null)

/** 面板打开态：只用于兄弟隔离，不作为公开绑定 */
const open = ref(false)

/**
 * 打开态兄弟隔离：Reka 只用 `aria-hidden` 隐藏面板外的兄弟节点，背景里的可聚焦元素
 * 仍留在 Tab 序列里（axe `aria-hidden-focus`）。面板落位后补 `inert`，关闭时先于焦点
 * 归还触发器回退，避免触发器因 `inert` 接收不到焦点。
 */
useOpenStateIsolation(contentRef, () => [], () => open.value)

</script>

<template>
    <SelectRoot
        v-model:open="open"
        :model-value="panelModel"
        :disabled="disabled"
        :name="panelName"
        @update:model-value="onModelUpdate"
    >
        <!-- 开启 allowEmptyValue 时由本组件提交表单值，避免内部 token 外泄 -->
        <input
            v-if="allowEmptyValue && name"
            type="hidden"
            :name="name"
            :value="model ?? ''"
            :disabled="disabled || undefined"
        >
        <div
            class="caomei-select__field"
            :class="[`caomei-select__field--${size}`, rootClass]"
        >
            <SelectTrigger
                v-bind="{...$attrs, ...labelAttrs(label)}"
                :id="id"
                ref="triggerRef"
                class="caomei-field caomei-select"
                :class="rootClass"
                :data-filled="hasValue ? 'true' : undefined"
                :data-has-placeholder="placeholder ? 'true' : undefined"
                :aria-invalid="invalid || undefined"
            >
                <SelectValue class="caomei-select__value">
                    <slot
                        name="value"
                        :option="selectedOption?.raw"
                        :label="selectedLabel"
                        :selected="hasValue"
                    >
                        <span v-if="selectedLabel">{{ selectedLabel }}</span>
                        <!-- 选中空值项但缺 label：渲染空文本，不回落到 placeholder -->
                        <span v-else-if="hasValue && allowEmptyValue" />
                        <span v-else class="caomei-select__placeholder">{{ placeholder }}</span>
                    </slot>
                </SelectValue>
                <SelectIcon class="caomei-select__icon">
                    <CaomeiIcon :icon="icons.chevronDown" />
                </SelectIcon>
            </SelectTrigger>
            <CaomeiIconTooltip
                v-if="clearable"
                :content="clearLabel"
            >
                <button
                    type="button"
                    class="caomei-hit-target caomei-select__clear"
                    :aria-label="clearLabel"
                    @click="clearValue"
                >
                    <CaomeiIcon :icon="icons.dismiss" />
                </button>
            </CaomeiIconTooltip>
        </div>
        <SelectPortal>
            <SelectContent
                ref="contentRef"
                class="caomei-select__content"
                position="popper"
                :side-offset="4"
                :body-lock="bodyLock"
            >
                <SelectViewport class="caomei-select__viewport">
                    <!-- 扁平选项 -->
                    <template v-if="!hasGroups">
                        <SelectItem
                            v-for="option in normalizedOptions"
                            :key="option.panelValue"
                            class="caomei-select__item"
                            :value="option.panelValue"
                            :disabled="option.disabled"
                        >
                            <SelectItemText class="caomei-select__item-text">
                                <slot
                                    name="option"
                                    :option="option.raw"
                                    :selected="option.value === model"
                                >
                                    {{ option.label }}
                                </slot>
                            </SelectItemText>
                            <SelectItemIndicator class="caomei-select__indicator">
                                <CaomeiIcon :icon="icons.check" />
                            </SelectItemIndicator>
                        </SelectItem>
                    </template>
                    <!-- 分组选项 -->
                    <template v-else>
                        <!-- 顶层扁平选项 -->
                        <SelectItem
                            v-for="option in normalizedOptions"
                            :key="option.panelValue"
                            class="caomei-select__item"
                            :value="option.panelValue"
                            :disabled="option.disabled"
                        >
                            <SelectItemText class="caomei-select__item-text">
                                <slot
                                    name="option"
                                    :option="option.raw"
                                    :selected="option.value === model"
                                >
                                    {{ option.label }}
                                </slot>
                            </SelectItemText>
                            <SelectItemIndicator class="caomei-select__indicator">
                                <CaomeiIcon :icon="icons.check" />
                            </SelectItemIndicator>
                        </SelectItem>
                        <!-- 分组 -->
                        <SelectGroup
                            v-for="(group, groupIndex) in normalizedGroups"
                            :key="`group-${group.label}-${groupIndex}`"
                            class="caomei-select-group"
                        >
                            <SelectLabel class="caomei-select-group__label">
                                {{ group.label }}
                            </SelectLabel>
                            <SelectItem
                                v-for="option in group.options"
                                :key="option.panelValue"
                                class="caomei-select__item"
                                :value="option.panelValue"
                                :disabled="option.disabled"
                            >
                                <SelectItemText class="caomei-select__item-text">
                                    <slot
                                        name="option"
                                        :option="option.raw"
                                        :selected="option.value === model"
                                    >
                                        {{ option.label }}
                                    </slot>
                                </SelectItemText>
                                <SelectItemIndicator class="caomei-select__indicator">
                                    <CaomeiIcon :icon="icons.check" />
                                </SelectItemIndicator>
                            </SelectItem>
                        </SelectGroup>
                    </template>
                </SelectViewport>
            </SelectContent>
        </SelectPortal>
    </SelectRoot>
</template>

<style scoped>
/*
  Select 触发器特有样式：inline-flex 布局、图标/清除按钮定位、值/占位文本截断。
  外壳样式（边框/圆角/背景/色值/聚焦/非法/禁用/尺寸档位基础变量）由共享层 `field-shell.css`
  的 `.caomei-field` 基类提供。
  差异点：触发器为原生 <button>，聚焦态走 `:focus-visible` 而非 `:focus-within`，需在此覆盖。
*/
.caomei-select {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--caomei-space-1);
    width: 100%;

    /* height/padding/font-size 由 .caomei-field 基类变量控制 */
    padding-inline-end: var(--caomei-field-padding-end);
    cursor: pointer;
}

/* 清除按钮绝对定位：覆盖在字段右侧 [图标 + 间隙] 之前 */
.caomei-select--clearable .caomei-select__value {
    margin-inline-end: calc(var(--caomei-select-clear-width, 1.25rem) + var(--caomei-space-1));
}

/* 触发器为原生 button，聚焦态走 :focus-visible 覆盖基类的 :focus-within */
.caomei-select:focus-visible {
    border-color: var(--caomei-field-focus-border-color);
    outline: none;
    box-shadow: var(--caomei-field-focus-shadow);
}

/* 非法态聚焦：字段外层带有 caomei-field--invalid 且 :focus-within 时，
   使用 :deep() 穿透 scoped 透传不到 Reka UI 原生 button 的限制。 */
.caomei-field--invalid:focus-within :deep([role="combobox"]) {
    border-color: var(--caomei-field-invalid-border-color) !important;
    box-shadow: var(--caomei-field-invalid-focus-shadow) !important;
}

/* 禁用态：基类 .caomei-field--disabled 已提供，此处仅补充 cursor/opacity 细节 */
.caomei-field--disabled.caomei-select {
    cursor: not-allowed;
}

/*
  字段外层仅承担「宽度上限 + 定位上下文 + 尺寸变量分发」：
  触发器保留 `.caomei-select` 类与全部交互属性，清除按钮是其兄弟节点（避免嵌套 <button>）。
  宽度上限因此只在此处声明一次；覆盖 `--caomei-select-max-width` 需作用于本元素或其祖先。
  可覆盖 token（如 `--caomei-select-clear-width`）不在本规则内预声明默认值，改由消费处 fallback 提供。
*/
.caomei-select__field {
    position: relative;
    display: inline-flex;
    width: 100%;
    max-width: var(--caomei-select-max-width);
    font-size: var(--caomei-field-font-size);
}

/* 尺寸档位：复用 .caomei-field 基类变量，仅声明 Select 特有的图标尺寸与清除按钮定位相关变量 */
:where(.caomei-select__field--sm) {
    --caomei-field-font-size: var(--caomei-font-size-sm);
    --caomei-select-icon-size: var(--caomei-font-size-sm);
}

:where(.caomei-select__field--md) {
    --caomei-field-font-size: var(--caomei-font-size-md);
    --caomei-select-icon-size: var(--caomei-font-size-md);
}

:where(.caomei-select__field--lg) {
    --caomei-field-font-size: var(--caomei-font-size-lg);
    --caomei-select-icon-size: var(--caomei-font-size-lg);
}

.caomei-select__clear {
    position: absolute;
    inset-block: 0;
    inset-inline-end: calc(var(--caomei-field-padding-end) + var(--caomei-select-icon-size, 1rem) + var(--caomei-space-1));
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--caomei-select-clear-width, 1.25rem);
    padding: 0;
    border: 0;
    border-radius: var(--caomei-radius-sm);
    background: transparent;
    color: var(--caomei-color-text-muted);
    font: inherit;
    cursor: pointer;
}

.caomei-select__clear:hover {
    color: var(--caomei-color-text);
}

.caomei-select__clear:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}

.caomei-select__value {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-align: left;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.caomei-select__placeholder {
    color: var(--caomei-color-text-muted);
}

.caomei-select__icon {
    display: inline-flex;
    flex-shrink: 0;
    color: var(--caomei-color-text-muted);
}

.caomei-select__icon svg {
    width: var(--caomei-select-icon-size, 1rem);
    height: var(--caomei-select-icon-size, 1rem);
}

/* 动效优先模式：清空按钮颜色过渡 + 按下反馈（清空动作的即时反馈）；reduce 归零 */
:where([data-motion='expressive']) .caomei-select__clear {
    transition:
        color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard),
        transform var(--caomei-motion-duration-fast) var(--caomei-motion-ease-standard);
}

:where([data-motion='expressive']) .caomei-select__clear:active {
    transform: scale(var(--caomei-motion-scale-from));
}

@media (prefers-reduced-motion: reduce) {
    :where([data-motion='expressive']) .caomei-select__clear {
        transition: none;
        transform: none;
    }

    :where([data-motion='expressive']) .caomei-select__clear:active {
        transform: none;
    }
}
</style>

<!--
  Portal 面板样式说明：Reka UI 的 SelectContent 由 popper 包裹层挂载到 body，scoped 的
  data-v 属性落在包裹层而非面板本体，因此 `.caomei-select__content[data-v-x]` 无法命中。
  `:deep(.caomei-select__content)` 虽可通过「祖先 + 后代」命中，但会提高特异性并依赖
  Vue 作用域沿 popper 包裹层下放；这里改用命名空间化（`caomei-select__` 前缀）的
  非 scoped 规则，特异性更低、更易被使用方覆盖。
-->
<style>
.caomei-select__content {
    box-sizing: border-box;

    /*
    层级：面板必须高于模态内容（`.caomei-dialog__content` 等，`--caomei-z-modal`），
    否则在 Dialog / Drawer 内打开的 Select 会被模态卡片盖住（面板为 popper 挂到 body，
    与模态同处根层叠上下文，只能靠 z-index 分胜负）。故取「锚定浮层面板」档位。
    */
    z-index: var(--caomei-select-z-index, var(--caomei-z-dropdown));
    overflow: hidden;

    /*
    窄屏收敛：宽度上限取 popper 可用宽（Reka 由 floating-ui 的 size 中间件写在 popper 包裹层，
    与触发器宽同源）；min-width 同步用 min() 收敛，否则 min-width 会压过 max-width 导致越界。
    桌面下可用宽远大于面板自然宽度，故该上限不改变既有表现。
    两个变量同时提供，缺失时 max-width 回退 none、min-width 回退 auto（退回本规则引入前的行为）。
     */
    min-width: min(var(--reka-select-trigger-width), var(--reka-select-content-available-width));
    max-width: var(--reka-select-content-available-width, none);
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg-elevated);
    color: var(--caomei-color-text);
    box-shadow: var(--caomei-shadow-md);
}

.caomei-select__viewport {
    /*
      长列表可达性：视口上限取「面板可用高」与「与选择器家族一致的 15rem」的较小值。
      Reka 在 SelectContent 写入 `--reka-select-content-available-height`（popper 可用高），
      缺失时回退 15rem（与 MultiSelect / AutoComplete 一致）；无上限时选项会把面板撑出视口，而模态已锁页面滚动，
      导致超出部分不可达（下游「修改手机号」国家码列表实测）。
    */
    max-height: min(15rem, var(--reka-select-content-available-height, 15rem));
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: var(--caomei-space-1);
}

.caomei-select__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--caomei-space-2);
    padding: var(--caomei-space-1) var(--caomei-space-2);
    border-radius: var(--caomei-radius-sm);
    font-size: var(--caomei-font-size-md);
    cursor: pointer;
    user-select: none;
    outline: none;
}

.caomei-select__item[data-highlighted] {
    background: var(--caomei-color-bg-elevated);
}

/* 长选项文本省略号：面板宽度被可用宽限制后，文本须可收缩而非撑破面板 */
.caomei-select__item-text {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.caomei-select__item[data-disabled] {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-select__indicator {
    display: inline-flex;
    flex-shrink: 0;
    color: var(--caomei-color-primary-text);
}

.caomei-select-group {
    padding-block: var(--caomei-space-1);
}

.caomei-select-group__label {
    display: block;
    padding: var(--caomei-space-1) var(--caomei-space-2);
    font-size: var(--caomei-font-size-sm);
    font-weight: 600;
    color: var(--caomei-color-text-muted);
    user-select: none;
}

@keyframes caomei-select-content-in {
    from {
        opacity: 0;
        transform: translateY(var(--caomei-motion-distance-sm)) scale(var(--caomei-motion-scale-from));
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes caomei-select-indicator-in {
    from {
        opacity: 0;
        transform: scale(var(--caomei-motion-scale-from));
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

/*
  动效优先模式：面板仅以 `[data-state='open']` 承载入场，关闭后选择器不再命中，
  Reka Presence 不会等待一个不会重放的退场动画；条目高亮与选中指示器各自过渡 / 入场。
  Portal 继承 `<html data-motion>`，局部容器不穿透（与 `data-density` 同一边界）。
*/
:where([data-motion='expressive']) .caomei-select__content[data-state='open'] {
    animation: caomei-select-content-in var(--caomei-motion-duration-fast) var(--caomei-motion-ease-out);
}

:where([data-motion='expressive']) .caomei-select__item {
    transition:
        background-color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard),
        color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard);
}

:where([data-motion='expressive']) .caomei-select__indicator {
    animation: caomei-select-indicator-in var(--caomei-motion-duration-fast) var(--caomei-motion-ease-out);
}

@media (prefers-reduced-motion: reduce) {
    :where([data-motion='expressive']) .caomei-select__content[data-state='open'],
    :where([data-motion='expressive']) .caomei-select__indicator {
        animation: none;
    }

    :where([data-motion='expressive']) .caomei-select__item {
        transition: none;
    }
}
</style>
