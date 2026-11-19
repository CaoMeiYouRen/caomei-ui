<script setup lang="ts" generic="T extends object">
import {
    ComboboxAnchor,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxItemIndicator,
    ComboboxPortal,
    ComboboxRoot,
    ComboboxTrigger,
    ComboboxViewport,
} from 'reka-ui'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { warnDev } from '../../_shared/dev-warn'
import { CaomeiIcon, useInternalIcons } from '../../icons'
import CaomeiIconTooltip from '../tooltip/icon-tooltip.vue'
import { ComboboxPanelIdrefBridge, panelControlsAttr, panelControlsBinds, usePanelIdrefState } from '../_shared/panel-idref'
import { useAttrForwarding } from '../_shared/use-attr-forwarding'
import {
    EMPTY_OPTION_TOKEN,
    fromPanelValue,
    isEmptyOptionValue,
    isReservedEmptyToken,
    resolveOptionDisabled,
    resolveOptionField,
    resolveOptionValue,
    warnEmptyOptionValue,
    type OptionValue,
} from '../_shared/option'
import { labelAttrs } from '../_shared/use-label-attrs'
import { useOpenStateIsolation } from '../_shared/use-open-state-isolation'
import type { MultiSelectProps } from './types'

defineOptions({ name: 'CaomeiMultiSelect', inheritAttrs: false })

/** 开启空值选项后表单值由隐藏输入承载，原生 `required` 校验不再生效，开发期提示改用提交前校验 */
function warnRequiredWithHiddenInputs(): void {
    if (props.allowEmptyValue && props.required && props.name) {
        warnDev(
            '[CaomeiMultiSelect] 开启 allowEmptyValue 后表单值由隐藏输入提交，原生 required 校验不生效；请在提交前自行校验。',
        )
    }
}

const icons = useInternalIcons()

const props = withDefaults(defineProps<MultiSelectProps<T>>(), {
    options: () => [],
    optionLabel: 'label',
    optionValue: 'value',
    placeholder: '',
    size: 'md',
    disabled: false,
    invalid: false,
    required: false,
    bodyLock: false,
    showClear: false,
    allowEmptyValue: false,
})

warnRequiredWithHiddenInputs()

defineSlots<{
    /**
     * 自定义选项内容；`option` 为原始选项对象，`selected` 表示是否为当前选中项
     * @en Custom option content; `option` is the raw option object and `selected` marks the selected one
     */
    option?: (props: { option: T, selected: boolean }) => unknown
}>()

const model = defineModel<OptionValue[]>({ default: () => [] })

/** 面板 idref：关闭态省略 `aria-controls`、开启态指向面板 id（契约与理由见 `_shared/panel-idref`） */
const panelIdref = usePanelIdrefState(`caomei-multi-select-panel-${useId()}`)

const { rootAttrs, controlAttrs } = useAttrForwarding()

const locale = useLocale()
const openLabel = computed(() => props.openLabel ?? locale.value.multiSelect.open)
const removeLabel = computed(() => props.removeLabel ?? locale.value.multiSelect.remove)
const emptyLabel = computed(() => props.emptyLabel ?? locale.value.multiSelect.empty)
const clearLabel = computed(() => props.clearLabel ?? locale.value.multiSelect.clear)

const rootClass = computed(() => [
    `caomei-multi-select--${props.size}`,
    {
        'caomei-multi-select--invalid': props.invalid,
        'caomei-multi-select--disabled': props.disabled,
    },
])

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
    /** 是否为当前选中项 */
    selected: boolean
}

/** 归一化选项列表：映射字段并按契约处置空串与保留 token，供触发器与面板共用 */
const normalizedOptions = computed<NormalizedOption[]>(() => {
    const result: NormalizedOption[] = []
    for (const [index, option] of props.options.entries()) {
        const value = resolveOptionValue(option, props.optionValue, 'value')
        if (value === undefined) {
            continue
        }
        if (isEmptyOptionValue(value)) {
            if (!props.allowEmptyValue) {
                warnEmptyOptionValue('CaomeiMultiSelect', index)
                continue
            }
        } else if (props.allowEmptyValue && isReservedEmptyToken(value)) {
            warnDev(
                `[CaomeiMultiSelect] 第 ${index + 1} 个选项的 value 使用了保留字符串，该选项不会渲染（allowEmptyValue 开启时该值由空值项占用）。`,
            )
            continue
        }
        result.push({
            raw: option,
            value,
            panelValue: props.allowEmptyValue && value === '' ? EMPTY_OPTION_TOKEN : value,
            label: resolveOptionField(option, props.optionLabel, 'label'),
            disabled: resolveOptionDisabled(option),
            selected: model.value.includes(value),
        })
    }
    return result
})

/** 选项集中是否存在空值项（开启 allowEmptyValue 时数组里的 `''` 才是有值） */
const emptyOptionExists = computed(() => normalizedOptions.value.some((option) => option.value === ''))

/** 有选中值：默认口径为「数组非空」；开启 allowEmptyValue 时孤儿 `''` 不计为有值 */
const hasValue = computed(() => {
    if (model.value.length === 0) {
        return false
    }
    if (!props.allowEmptyValue || emptyOptionExists.value) {
        return true
    }
    return model.value.some((value) => value !== '')
})

/** 送往 Reka 的模型：开启 allowEmptyValue 时把空串换成内部 token */
const panelModel = computed<OptionValue[]>(() => {
    if (!props.allowEmptyValue) {
        return model.value
    }
    return model.value.map((value) => (value === '' ? EMPTY_OPTION_TOKEN : value))
})

/** Reka 回写模型：token 还原为空串，非数组按空数组处理 */
function onModelUpdate(value: unknown): void {
    if (!Array.isArray(value)) {
        model.value = []
        return
    }
    model.value = (value as unknown[])
        .map((item) => (props.allowEmptyValue ? fromPanelValue(item) : item))
        .filter((item): item is OptionValue => typeof item === 'string' || typeof item === 'number')
}

/** 开启 allowEmptyValue 时由本组件渲染隐藏输入，避免内部 token 进入表单提交值 */
const panelName = computed<string | undefined>(() => (props.allowEmptyValue ? undefined : props.name))

const selectedOptions = computed<NormalizedOption[]>(() => {
    const seen = new Set<OptionValue>()
    const result: NormalizedOption[] = []
    for (const value of model.value) {
        if (seen.has(value)) {
            continue
        }
        seen.add(value)
        const option = normalizedOptions.value.find((item) => item.value === value)
        if (option) {
            result.push(option)
        }
    }
    return result
})

function removeValue(value: OptionValue): void {
    model.value = model.value.filter((item) => item !== value)
}

/** 有选中项且未禁用时显示清除按钮（与 Select 的 `showClear` 口径一致） */
const clearable = computed(() => props.showClear && hasValue.value && !props.disabled)

const inputRef = ref<{ $el?: unknown } | null>(null)

/**
 * 清空模型，并把焦点交回输入框：清除后按钮自身被移除，否则焦点会掉到 body。
 * 注意清空后各选项的 `selected` 同步复位，面板保持当前开合状态不变。
 */
function clearValue(): void {
    model.value = []
    void nextTick(() => {
        // 受控用法下外层可能拒绝更新：此时按钮仍在，不应把它自身的焦点抢走
        if (clearable.value) {
            return
        }
        const element = inputRef.value?.$el
        if (element instanceof HTMLElement) {
            element.focus()
        }
    })
}

/** 点击字段空白处聚焦搜索输入框，贴合原生多选字段的交互习惯 */
function onAnchorClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null
    if (target?.closest('button, input')) {
        return
    }
    ;(event.currentTarget as HTMLElement | null)?.querySelector('input')?.focus()
}

const contentRef = ref<{ $el?: unknown } | null>(null)
const anchorRef = ref<{ $el?: unknown } | null>(null)

/** 面板打开态：只用于兄弟隔离，不作为公开绑定 */
const open = ref(false)

/**
 * 打开态兄弟隔离：Reka 只用 `aria-hidden` 隐藏面板外的兄弟节点，背景里的可聚焦元素
 * 仍留在 Tab 序列里（axe `aria-hidden-focus`）。面板落位后补 `inert`，关闭时先于焦点
 * 归还输入框回退，避免背景因 `inert` 接收不到焦点。字段自身（含输入框）是 Combobox
 * 的交互面，必须留在隔离面之外。
 */
const { release } = useOpenStateIsolation(
    contentRef,
    () => [anchorRef.value?.$el],
    () => open.value,
)

/** 键盘关闭（Escape）时置位：Reka Combobox 非模态、不自动归还焦点，关闭后由本组件补 */
let restoreFocusOnClose = false

/** 非模态浮层：背景被隔离后点击会落在 `inert` 子树里，先解除隔离再让这次点击落到目标控件上 */
function onDocumentPointerDown(event: PointerEvent): void {
    if (!open.value) {
        return
    }
    const target = event.target
    if (!(target instanceof Node)) {
        return
    }
    const content = contentRef.value?.$el
    if (content instanceof HTMLElement && content.contains(target)) {
        return
    }
    const field = anchorRef.value?.$el
    if (field instanceof HTMLElement && field.contains(target)) {
        return
    }
    release()
}

/** 可聚焦候选：展开态按 Tab 时把焦点交给字段之后（Shift 时为之前）的下一个控件 */
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * 展开态按 Tab：先收起面板并解除隔离，再把焦点交给字段之后（Shift 时为之前）的下一个控件。
 * 不拦截时浏览器会在 `inert` 仍生效的瞬间算好下一个可聚焦元素，焦点因此落到 `body`
 * （APG Combobox 要求 Tab 关闭弹层并把焦点移到下一个元素）。
 */
function onFieldKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || !open.value) {
        return
    }
    event.preventDefault()
    const backward = event.shiftKey
    open.value = false
    void nextTick(() => {
        const field = anchorRef.value?.$el
        if (!(field instanceof HTMLElement)) {
            return
        }
        const candidates = [...document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)]
            .filter((element) => element.tabIndex >= 0 && !field.contains(element))
        const target = backward
            ? [...candidates].reverse().find((element) => field.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_PRECEDING)
            : candidates.find((element) => field.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING)
        target?.focus()
    })
}

/** Escape 关闭标记：仅面板展开时置位，避免关闭态按键残留导致后续鼠标关闭抢焦点 */
function markEscapeClose(): void {
    if (open.value) {
        restoreFocusOnClose = true
    }
}

/**
 * 关闭后补焦点归还：隔离已由 `useOpenStateIsolation` 同步回退（先于此处执行的焦点归还）。
 */
watch(
    open,
    (isOpen) => {
        if (isOpen || !restoreFocusOnClose) {
            return
        }
        restoreFocusOnClose = false
        void nextTick(() => {
            const element = inputRef.value?.$el
            if (element instanceof HTMLElement) {
                element.focus()
            }
        })
    },
    { flush: 'sync' },
)

onMounted(() => {
    document.addEventListener('pointerdown', onDocumentPointerDown, true)
})

onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', onDocumentPointerDown, true)
})
</script>

<template>
    <ComboboxRoot
        v-model:open="open"
        :model-value="panelModel"
        multiple
        :disabled="disabled"
        :name="panelName"
        :required="required"
        :open-on-click="true"
        @update:model-value="onModelUpdate"
    >
        <ComboboxPanelIdrefBridge :state="panelIdref" />
        <ComboboxAnchor
            ref="anchorRef"
            v-bind="rootAttrs"
            class="caomei-multi-select"
            :class="rootClass"
            :data-filled="hasValue ? 'true' : undefined"
            @click="onAnchorClick"
            @keydown="onFieldKeydown"
            @keydown.escape="markEscapeClose"
        >
            <!-- 开启 allowEmptyValue 时由本组件提交表单值，避免内部 token 外泄 -->
            <template v-if="allowEmptyValue && name">
                <input
                    v-for="(value, index) in model"
                    :key="`hidden-${index}`"
                    type="hidden"
                    :name="name"
                    :value="value"
                    :disabled="disabled || undefined"
                >
            </template>
            <span
                v-for="option in selectedOptions"
                :key="option.value"
                class="caomei-multi-select__tag"
            >
                <span class="caomei-multi-select__tag-label">{{ option.label }}</span>
                <button
                    type="button"
                    class="caomei-hit-target caomei-multi-select__tag-remove"
                    :disabled="disabled"
                    :aria-label="`${removeLabel} ${option.label}`"
                    @click.stop="removeValue(option.value)"
                >
                    <CaomeiIcon :icon="icons.dismiss" />
                </button>
            </span>
            <ComboboxInput
                v-bind="{...controlAttrs, ...labelAttrs(label), ...panelControlsBinds(panelIdref, controlAttrs)}"
                :id="id"
                ref="inputRef"
                class="caomei-multi-select__input"
                :placeholder="hasValue ? undefined : placeholder"
                :aria-invalid="invalid || undefined"
                :disabled="disabled"
            />
            <CaomeiIconTooltip
                v-if="clearable"
                :content="clearLabel"
            >
                <button
                    type="button"
                    class="caomei-hit-target caomei-multi-select__clear"
                    :aria-label="clearLabel"
                    @click.stop="clearValue"
                >
                    <CaomeiIcon :icon="icons.dismiss" />
                </button>
            </CaomeiIconTooltip>
            <ComboboxTrigger
                class="caomei-multi-select__icon"
                :disabled="disabled"
                :aria-label="openLabel"
                :aria-controls="panelControlsAttr(panelIdref)"
            >
                <CaomeiIcon :icon="icons.chevronDown" />
            </ComboboxTrigger>
        </ComboboxAnchor>
        <ComboboxPortal>
            <ComboboxContent
                ref="contentRef"
                class="caomei-multi-select__content"
                position="popper"
                :side-offset="4"
                :body-lock="bodyLock"
                @escape-key-down="markEscapeClose"
            >
                <ComboboxViewport class="caomei-multi-select__viewport">
                    <ComboboxEmpty class="caomei-multi-select__empty">
                        {{ emptyLabel }}
                    </ComboboxEmpty>
                    <ComboboxItem
                        v-for="option in normalizedOptions"
                        :key="option.panelValue"
                        class="caomei-multi-select__item"
                        :value="option.panelValue"
                        :disabled="option.disabled"
                        :text-value="option.label"
                    >
                        <span class="caomei-multi-select__item-label">
                            <slot
                                name="option"
                                :option="option.raw"
                                :selected="option.selected"
                            >
                                {{ option.label }}
                            </slot>
                        </span>
                        <ComboboxItemIndicator class="caomei-multi-select__indicator">
                            <CaomeiIcon :icon="icons.check" />
                        </ComboboxItemIndicator>
                    </ComboboxItem>
                </ComboboxViewport>
            </ComboboxContent>
        </ComboboxPortal>
    </ComboboxRoot>
</template>

<style scoped>
/*
  `--caomei-multi-select-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值；
  档位选择器用 :where() 归零特异性，只声明 CSS 变量。
*/
.caomei-multi-select {
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--caomei-space-1);

    /* 多行值片的行距 +2px：使 24px 不可见命中区在相邻行之间留出间隙（WCAG 2.5.8） */
    row-gap: calc(var(--caomei-space-1) + 2px);
    width: 100%;
    max-width: var(--caomei-multi-select-max-width, var(--caomei-select-max-width));
    min-height: var(--caomei-multi-select-min-height, var(--caomei-control-height-md));
    padding: var(--caomei-multi-select-padding-block, var(--caomei-space-1)) var(--caomei-multi-select-padding-inline, var(--caomei-space-3));
    border: 1px solid var(--caomei-color-control-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-multi-select-font-size, var(--caomei-font-size-md));
    cursor: text;
    transition: border-color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard), box-shadow var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard);
}

.caomei-multi-select:focus-within {
    border-color: var(--caomei-color-primary);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--caomei-color-primary) 20%, transparent);
}

.caomei-multi-select--invalid {
    border-color: var(--caomei-color-danger);
}

.caomei-multi-select--invalid:focus-within {
    border-color: var(--caomei-color-danger);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--caomei-color-danger) 20%, transparent);
}

.caomei-multi-select--disabled {
    cursor: not-allowed;
    background: var(--caomei-color-bg-elevated);
    opacity: var(--caomei-disabled-opacity);
}

:where(.caomei-multi-select--sm) {
    --caomei-multi-select-min-height: var(--caomei-control-height-sm);
    --caomei-multi-select-padding-block: var(--caomei-space-1);
    --caomei-multi-select-padding-inline: var(--caomei-space-2);
    --caomei-multi-select-font-size: var(--caomei-font-size-sm);
}

:where(.caomei-multi-select--lg) {
    --caomei-multi-select-min-height: var(--caomei-control-height-lg);
    --caomei-multi-select-padding-block: var(--caomei-space-2);
    --caomei-multi-select-padding-inline: var(--caomei-space-4);
    --caomei-multi-select-font-size: var(--caomei-font-size-lg);
}

.caomei-multi-select__tag {
    display: inline-flex;
    align-items: center;
    gap: var(--caomei-space-1);
    max-width: 100%;
    padding: 0 var(--caomei-space-1) 0 var(--caomei-space-2);
    border-radius: var(--caomei-radius-sm);
    background: var(--caomei-color-bg-elevated);
    font-size: var(--caomei-font-size-sm);
    line-height: 1.6;
}

.caomei-multi-select__tag-label {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.caomei-multi-select__tag-remove {
    display: inline-flex;
    flex-shrink: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--caomei-color-text-muted);
    cursor: pointer;
}

.caomei-multi-select__tag-remove:hover {
    color: var(--caomei-color-text);
}

.caomei-multi-select__tag-remove:focus-visible {
    border-radius: var(--caomei-radius-sm);
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}

.caomei-multi-select__tag-remove:disabled {
    cursor: not-allowed;
}

.caomei-multi-select__input {
    flex: 1;
    min-width: 4rem;
    padding: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: inherit;
    font: inherit;
}

.caomei-multi-select__input::placeholder {
    color: var(--caomei-color-text-muted);
}

.caomei-multi-select__input:disabled {
    cursor: not-allowed;
}

/*
  清除按钮为字段内的常规 flex 成员（不是绝对定位）：本组件字段可多行换行，
  绝对定位在标签占满首行时会压在标签之上，改为随输入行流动。
*/
.caomei-multi-select__clear {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--caomei-color-text-muted);

    /* 按钮默认不继承字体：显式继承以保持图标与字段文本同源 */
    font: inherit;
    cursor: pointer;
}

.caomei-multi-select__clear:hover {
    color: var(--caomei-color-text);
}

.caomei-multi-select__clear:focus-visible {
    border-radius: var(--caomei-radius-sm);
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}

.caomei-multi-select__icon {
    display: inline-flex;
    flex-shrink: 0;
    color: var(--caomei-color-text-muted);
}

@keyframes caomei-multi-select-tag-in {
    from {
        opacity: 0;
        transform: scale(var(--caomei-motion-scale-from));
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

/* 动效优先模式：选中标签入场 + 清除 / 关闭按钮颜色过渡与按下反馈 */
:where([data-motion='expressive']) .caomei-multi-select__tag {
    animation: caomei-multi-select-tag-in var(--caomei-motion-duration-fast) var(--caomei-motion-ease-out);
}

:where([data-motion='expressive']) .caomei-multi-select__tag-remove,
:where([data-motion='expressive']) .caomei-multi-select__clear {
    transition:
        color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard),
        transform var(--caomei-motion-duration-fast) var(--caomei-motion-ease-standard);
}

:where([data-motion='expressive']) .caomei-multi-select__tag-remove:active:not(:disabled),
:where([data-motion='expressive']) .caomei-multi-select__clear:active {
    transform: scale(var(--caomei-motion-scale-from));
}

/* 减弱动效：字段 / 标签 / 按钮动效整体关闭 */
@media (prefers-reduced-motion: reduce) {
    .caomei-multi-select {
        transition: none;
    }

    :where([data-motion='expressive']) .caomei-multi-select__tag {
        animation: none;
    }

    :where([data-motion='expressive']) .caomei-multi-select__tag-remove,
    :where([data-motion='expressive']) .caomei-multi-select__clear {
        transition: none;
        transform: none;
    }

    :where([data-motion='expressive']) .caomei-multi-select__tag-remove:active:not(:disabled),
    :where([data-motion='expressive']) .caomei-multi-select__clear:active {
        transform: none;
    }
}
</style>

<!--
  Portal 面板样式说明：ComboboxContent 由 popper 包裹层挂载到 body，scoped 的 data-v 落在包裹层
  而非面板本体（同 Select）。改用命名空间化的非 scoped 规则，保证可覆盖性与低特异性。
-->
<style>
.caomei-multi-select__content {
    box-sizing: border-box;

    /* 层级同 Select：面板必须高于模态内容，否则在 Dialog / Drawer 内会被盖住 */
    z-index: var(--caomei-multi-select-z-index, var(--caomei-z-dropdown));
    overflow: hidden;

    /*
    窄屏收敛：宽度上限取 popper 可用宽（与触发器宽同源，见 responsive.md §3 矩阵 #4）；
    min-width 同步用 min() 收敛，否则 min-width 会压过 max-width 导致越界。
    桌面下可用宽远大于自然宽度，无表现变化。
     */
    min-width: min(var(--reka-combobox-trigger-width), var(--reka-combobox-content-available-width));
    max-width: var(--reka-combobox-content-available-width, none);
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg-elevated);
    color: var(--caomei-color-text);
    box-shadow: var(--caomei-shadow-md);
}

.caomei-multi-select__viewport {
    max-height: 15rem;
    overflow-y: auto;
    padding: var(--caomei-space-1);
}

.caomei-multi-select__empty {
    padding: var(--caomei-space-2);
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-md);
}

.caomei-multi-select__item {
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

.caomei-multi-select__item-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.caomei-multi-select__item[data-highlighted] {
    background: var(--caomei-color-bg-elevated);
}

.caomei-multi-select__item[data-disabled] {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-multi-select__indicator {
    display: inline-flex;
    flex-shrink: 0;
    color: var(--caomei-color-primary-text);
}

@keyframes caomei-multi-select-content-in {
    from {
        opacity: 0;
        transform: translateY(var(--caomei-motion-distance-sm)) scale(var(--caomei-motion-scale-from));
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes caomei-multi-select-indicator-in {
    from {
        opacity: 0;
        transform: scale(var(--caomei-motion-scale-from));
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

/* 动效优先模式：面板入场、条目高亮过渡、选中指示器入场；关闭态不命中，避免 Presence 等待无重放的退场 */
:where([data-motion='expressive']) .caomei-multi-select__content[data-state='open'] {
    animation: caomei-multi-select-content-in var(--caomei-motion-duration-fast) var(--caomei-motion-ease-out);
}

:where([data-motion='expressive']) .caomei-multi-select__item {
    transition:
        background-color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard),
        color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard);
}

:where([data-motion='expressive']) .caomei-multi-select__indicator {
    animation: caomei-multi-select-indicator-in var(--caomei-motion-duration-fast) var(--caomei-motion-ease-out);
}

@media (prefers-reduced-motion: reduce) {
    :where([data-motion='expressive']) .caomei-multi-select__content[data-state='open'],
    :where([data-motion='expressive']) .caomei-multi-select__indicator {
        animation: none;
    }

    :where([data-motion='expressive']) .caomei-multi-select__item {
        transition: none;
    }
}
</style>
