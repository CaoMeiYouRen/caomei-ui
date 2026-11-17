<script setup lang="ts">
import {
    PopoverContent,
    PopoverPortal,
    PopoverRoot,
    colorToString,
    parseColor,
} from 'reka-ui'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { toHex6 } from '../_shared/color'
import { suppressOutside } from '../../_shared/open-state-inert'
import { resolveLabelName } from '../_shared/use-label-attrs'
import { CaomeiPopoverTrigger } from '../popover'
import CaomeiIconTooltip from '../tooltip/icon-tooltip.vue'
import CaomeiColorPickerPanel from './color-picker-panel.vue'
import type { ColorPickerProps } from './types'

defineOptions({ name: 'CaomeiColorPicker', inheritAttrs: false })

const props = withDefaults(defineProps<ColorPickerProps>(), {
    format: 'hex',
    defaultColor: '#ff0000',
    inline: false,
    showInput: true,
    disabled: false,
    invalid: false,
})

const emit = defineEmits<{
    'update:modelValue': [value: string]
}>()

const locale = useLocale()
const open = ref(false)

const contentRef = ref<{ $el?: unknown } | null>(null)
const triggerEl = ref<HTMLElement | null>(null)

let restoreContentInert: (() => void) | undefined
let restoreFieldInert: (() => void) | undefined
/** 键盘关闭（Escape）时置位：非模态浮层不保证自动归还焦点，关闭后由本组件补 */
let restoreFocusOnClose = false

function releaseInert(): void {
    restoreContentInert?.()
    restoreContentInert = undefined
    restoreFieldInert?.()
    restoreFieldInert = undefined
}

/** 非模态浮层：背景被隔离后点击会落在 `inert` 子树里，先解除隔离再让这次点击落到目标上 */
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
    if (triggerEl.value?.contains(target)) {
        return
    }
    releaseInert()
}

/** Escape 关闭标记：仅面板展开时置位，避免关闭态按键残留导致后续鼠标关闭抢焦点 */
function markEscapeClose(): void {
    if (open.value) {
        restoreFocusOnClose = true
    }
}

// 关闭：同步回退隔离，必须先于焦点归还（否则触发器仍在 `inert` 子树、焦点掉到 body）
watch(
    open,
    (isOpen) => {
        if (isOpen) {
            return
        }
        releaseInert()
        if (!restoreFocusOnClose) {
            return
        }
        restoreFocusOnClose = false
        void nextTick(() => {
            triggerEl.value?.focus()
        })
    },
    { flush: 'sync' },
)

// 打开：面板落位后隔离背景（保留面板与触发器两根，触发器保持可聚焦）
watch(
    open,
    (isOpen) => {
        if (!isOpen) {
            return
        }
        void nextTick(() => {
            if (!open.value) {
                return
            }
            // 先撤销上一轮写入，避免同 tick 反复开合时遗留隔离层
            releaseInert()
            const content = contentRef.value?.$el
            if (content instanceof HTMLElement && content.isConnected) {
                restoreContentInert = suppressOutside(content)
            }
            if (triggerEl.value?.isConnected) {
                restoreFieldInert = suppressOutside(triggerEl.value)
            }
        })
    },
    { flush: 'post' },
)

onMounted(() => {
    document.addEventListener('pointerdown', onDocumentPointerDown, true)
    // 受控用法下挂载即展开：watch 不会触发，这里补一次隔离
    if (open.value) {
        void nextTick(() => {
            if (!open.value) {
                return
            }
            const content = contentRef.value?.$el
            if (content instanceof HTMLElement && content.isConnected) {
                restoreContentInert = suppressOutside(content)
            }
            const field = triggerEl.value
            if (field instanceof HTMLElement && field.isConnected) {
                restoreFieldInert = suppressOutside(field)
            }
        })
    }
})

onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', onDocumentPointerDown, true)
    releaseInert()
})

const attrs = useAttrs()

const triggerLabel = computed(
    () => resolveLabelName(props.label, attrs['aria-label'], locale.value.colorPicker.label),
)

/** 归一为 `#rrggbb`（剥离 alpha）；空值或非法值回退 `defaultColor`（不写回模型） */
function toHex(value?: string): string {
    return toHex6(value ?? '', props.defaultColor)
}

const hex = ref(toHex(props.modelValue))

watch(() => props.modelValue, (value) => {
    const next = toHex(value)
    if (next !== hex.value) {
        hex.value = next
    }
})

function onUpdate(value: string): void {
    const next = toHex(value)
    hex.value = next
    emit('update:modelValue', colorToString(parseColor(next), props.format))
}
</script>

<template>
    <div
        v-bind="$attrs"
        class="caomei-color-picker"
    >
        <PopoverRoot
            v-if="!inline"
            v-model:open="open"
        >
            <!--
              触发器经本库 CaomeiPopoverTrigger（as-child + unstyled）：由本库触发器统一承载开合与无障碍接线（内部委托 Reka primitive），
              外观仍由下方自持 button 提供（`unstyled` 保证不合并内建触发器外观类）。
            -->
            <CaomeiPopoverTrigger
                as-child
                unstyled
                :disabled="disabled"
            >
                <button
                    ref="triggerEl"
                    type="button"
                    class="caomei-color-picker__trigger"
                    :class="{'caomei-color-picker__trigger--invalid': invalid}"
                    :aria-label="triggerLabel"
                    :aria-invalid="invalid || undefined"
                    :disabled="disabled"
                >
                    <CaomeiIconTooltip :content="triggerLabel" :disabled="disabled">
                        <span
                            class="caomei-color-picker__swatch"
                            :style="{backgroundColor: hex}"
                        />
                    </CaomeiIconTooltip>
                </button>
            </CaomeiPopoverTrigger>
            <PopoverPortal>
                <PopoverContent
                    ref="contentRef"
                    class="caomei-color-picker__panel"
                    align="start"
                    :side-offset="4"
                    @escape-key-down="markEscapeClose"
                >
                    <CaomeiColorPickerPanel
                        :model-value="hex"
                        :disabled="disabled"
                        :show-input="showInput"
                        :swatches="swatches"
                        :hex-label="locale.colorPicker.hex"
                        :hue-label="locale.colorPicker.hue"
                        :area-label="locale.colorPicker.area"
                        :swatches-label="locale.colorPicker.swatches"
                        :saturation-label="locale.colorPicker.saturation"
                        :brightness-label="locale.colorPicker.brightness"
                        :area-role="locale.colorPicker.areaRole"
                        :thumb-role="locale.colorPicker.thumbRole"
                        @update:model-value="onUpdate"
                    />
                </PopoverContent>
            </PopoverPortal>
        </PopoverRoot>

        <div
            v-else
            class="caomei-color-picker__panel caomei-color-picker__panel--inline"
        >
            <CaomeiColorPickerPanel
                :model-value="hex"
                :disabled="disabled"
                :show-input="showInput"
                :swatches="swatches"
                :hex-label="locale.colorPicker.hex"
                :hue-label="locale.colorPicker.hue"
                :area-label="locale.colorPicker.area"
                :swatches-label="locale.colorPicker.swatches"
                :saturation-label="locale.colorPicker.saturation"
                :brightness-label="locale.colorPicker.brightness"
                :area-role="locale.colorPicker.areaRole"
                :thumb-role="locale.colorPicker.thumbRole"
                @update:model-value="onUpdate"
            />
        </div>
    </div>
</template>

<style scoped>
.caomei-color-picker {
    box-sizing: border-box;
    display: inline-flex;
}

.caomei-color-picker__trigger {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--caomei-control-height-md);
    height: var(--caomei-control-height-md);
    padding: var(--caomei-space-1);
    border: 1px solid var(--caomei-color-control-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg);
    cursor: pointer;
}

.caomei-color-picker__trigger:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}

.caomei-color-picker__trigger:disabled {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-color-picker__trigger--invalid {
    border-color: var(--caomei-color-danger);
}

.caomei-color-picker__swatch {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: var(--caomei-radius-sm);
}

.caomei-color-picker__panel--inline {
    /* 内联形态跟随容器：窄容器内收敛为容器宽度，避免固定 260px 溢出 */
    width: min(260px, 100%);
    padding: var(--caomei-space-3);
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-lg);
    background: var(--caomei-color-bg);
}
</style>

<!--
  面板经 PopoverPortal 挂到 body，scoped 的 data-v 属性落在 popper 包裹层而非面板本体，
  因此改用命名空间化的非 scoped 规则（同 DropdownMenuContent / Select）。
-->
<style>
.caomei-color-picker__panel {
    box-sizing: border-box;

    /* 窄屏收敛：面板宽度取 `min(260px, popper 可用宽)`，避免固定宽度越出视口（回退保持既有 260px） */
    width: min(260px, var(--reka-popover-content-available-width, 260px));
    padding: var(--caomei-space-3);
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-lg);
    background: var(--caomei-color-bg-elevated);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    box-shadow: var(--caomei-shadow-lg);
}

/*
  层级：**仅 portal 面板**。面板经 PopoverPortal 挂到 body，与模态内容同处根层叠上下文，
  故取「锚定浮层面板」档位，使其在 Dialog / Drawer 内确定性地高于模态内容（不再依赖
  DOM 顺序的平局裁决）。
  `inline` 形态（`.caomei-color-picker__panel--inline`）是页面内的静态 flex item——
  `z-index` 对 flex item 同样生效，若沿用基类档位会被抬到模态内容之上，故以 `:not()`
  把它排除在浮层层叠之外。
*/
.caomei-color-picker__panel:not(.caomei-color-picker__panel--inline) {
    z-index: var(--caomei-color-picker-z-index, var(--caomei-z-dropdown));
}
</style>
