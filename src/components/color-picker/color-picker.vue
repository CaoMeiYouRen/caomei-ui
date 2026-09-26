<script setup lang="ts">
import {
    PopoverContent,
    PopoverPortal,
    PopoverRoot,
    colorToString,
    parseColor,
} from 'reka-ui'
import { computed, ref, useAttrs, watch } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { toHex6 } from '../_shared/color'
import { resolveLabelName } from '../_shared/use-label-attrs'
import { CaomeiPopoverTrigger } from '../popover'
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
                    type="button"
                    class="caomei-color-picker__trigger"
                    :class="{'caomei-color-picker__trigger--invalid': invalid}"
                    :aria-label="triggerLabel"
                    :aria-invalid="invalid || undefined"
                    :disabled="disabled"
                >
                    <span
                        class="caomei-color-picker__swatch"
                        :style="{backgroundColor: hex}"
                    />
                </button>
            </CaomeiPopoverTrigger>
            <PopoverPortal>
                <PopoverContent
                    class="caomei-color-picker__panel"
                    align="start"
                    :side-offset="4"
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
    border: 1px solid var(--caomei-color-border);
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
    z-index: var(--caomei-z-modal);
    box-sizing: border-box;

    /* 窄屏收敛：面板宽度取 `min(260px, popper 可用宽)`，避免固定宽度越出视口（回退保持既有 260px） */
    width: min(260px, var(--reka-popover-content-available-width, 260px));
    padding: var(--caomei-space-3);
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-lg);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    box-shadow: var(--caomei-shadow-lg);
}
</style>
