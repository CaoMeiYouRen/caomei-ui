<script setup lang="ts">
import {
    ColorAreaArea,
    ColorAreaRoot,
    ColorAreaThumb,
    ColorFieldInput,
    ColorFieldRoot,
    ColorSliderRoot,
    ColorSliderThumb,
    ColorSliderTrack,
    ColorSwatchPickerItem,
    ColorSwatchPickerItemIndicator,
    ColorSwatchPickerItemSwatch,
    ColorSwatchPickerRoot,
    colorToString,
    convertToHsb,
    parseColor,
} from 'reka-ui'
import { computed } from 'vue'
import { toHex6 } from '../_shared/color'

defineOptions({ name: 'CaomeiColorPickerPanel' })

const props = withDefaults(defineProps<{
    /** 当前颜色（`#rrggbb`） */
    modelValue: string
    disabled?: boolean
    showInput?: boolean
    swatches?: string[]
    hexLabel?: string
    hueLabel?: string
    areaLabel?: string
    swatchesLabel?: string
    saturationLabel?: string
    brightnessLabel?: string
}>(), {
    disabled: false,
    showInput: true,
})

const emit = defineEmits<{
    'update:modelValue': [value: string]
}>()

const normalizedSwatches = computed(() => (props.swatches ?? []).map((swatch) => toHex6(swatch)))

/**
 * 区域（ColorArea）声明 `color-space="hsb"`，其渐变与指针映射都按 HSB 饱和度计算；
 * 但 Reka 的 `getChannelValue('saturation')` 对 rgb 颜色返回的是 **HSL** 饱和度，
 * 直接传 `#rrggbb` 会让 thumb 位置 / `aria-valuenow` 与区域坐标轴（HSB）不一致
 * （浅色差异极大，如 #ffcccc：HSL 100 vs HSB 20）。故这里把区域模型转成 hsb 空间字符串。
 */
const areaModel = computed(() => {
    try {
        return colorToString(convertToHsb(parseColor(props.modelValue)), 'hsb')
    } catch {
        return props.modelValue
    }
})

// 覆盖 Reka 内建的英文 aria-valuetext（如 "Saturation 71, Brightness 77"）
const areaValueText = computed(() => {
    try {
        const hsb = convertToHsb(parseColor(props.modelValue))
        return `${props.saturationLabel ?? ''} ${Math.round(hsb.s)}, ${props.brightnessLabel ?? ''} ${Math.round(hsb.b)}`.trim()
    } catch {
        return undefined
    }
})

/** 各 primitive 都回传颜色字符串，统一归一为 `#rrggbb` 后再上抛 */
/**
 * 区域 pointerdown 处于捕获阶段时先让十六进制输入框失焦。
 *
 * Reka 的 `ColorAreaArea.handlePointerDown` 会先 `updateValues()` 再 `thumbRef.focus()`；
 * 焦点转移触发输入框 blur → `ColorFieldRoot.commit()` 用字段此刻仍持有的旧值重设颜色，
 * 从而覆盖掉区域刚写入的新值（表现为「输入框聚焦时首次点击区域无效」）。
 * 在捕获阶段先 blur，可让字段的提交发生在区域更新之前，使较新的点击结果生效。
 */
function onAreaPointerDownCapture(): void {
    const active = document.activeElement
    if (active instanceof HTMLElement && active.classList.contains('caomei-color-picker__input')) {
        active.blur()
    }
}

function onUpdate(value: unknown): void {
    if (typeof value !== 'string') {
        return
    }
    try {
        emit('update:modelValue', toHex6(value, props.modelValue))
    } catch {
        // 非法输入（如输入框中间态）忽略，等待下一次有效值
    }
}
</script>

<template>
    <div class="caomei-color-picker__panel-inner">
        <div
            class="caomei-color-picker__area"
            @pointerdown.capture="onAreaPointerDownCapture"
        >
            <ColorAreaRoot
                :model-value="areaModel"
                color-space="hsb"
                x-channel="saturation"
                y-channel="brightness"
                :disabled="disabled"
                :aria-label="areaLabel"
                class="caomei-color-picker__area-root"
                @update:model-value="onUpdate"
            >
                <template #default="{style}">
                    <ColorAreaArea
                        class="caomei-color-picker__area-bg"
                        :style="style"
                    >
                        <!-- Reka 的 anatomy 要求 thumb 位于 area 内，否则区域键盘与抓 thumb 拖拽都收不到事件 -->
                        <ColorAreaThumb
                            class="caomei-color-picker__area-thumb"
                            :aria-label="areaLabel"
                            :aria-valuetext="areaValueText"
                        />
                    </ColorAreaArea>
                </template>
            </ColorAreaRoot>
        </div>

        <ColorSliderRoot
            :model-value="modelValue"
            color-space="hsb"
            channel="hue"
            :disabled="disabled"
            :aria-label="hueLabel"
            class="caomei-color-picker__hue"
            @update:model-value="onUpdate"
        >
            <ColorSliderTrack class="caomei-color-picker__hue-track">
                <ColorSliderThumb
                    class="caomei-color-picker__hue-thumb"
                    :aria-label="hueLabel"
                />
            </ColorSliderTrack>
        </ColorSliderRoot>

        <ColorFieldRoot
            v-if="showInput"
            :model-value="modelValue"
            :disabled="disabled"
            class="caomei-color-picker__field"
            @update:model-value="onUpdate"
        >
            <ColorFieldInput
                class="caomei-color-picker__input"
                :aria-label="hexLabel"
            />
        </ColorFieldRoot>

        <ColorSwatchPickerRoot
            v-if="normalizedSwatches.length"
            :default-value="modelValue"
            :disabled="disabled"
            :aria-label="swatchesLabel"
            class="caomei-color-picker__swatches"
            @update:model-value="onUpdate"
        >
            <ColorSwatchPickerItem
                v-for="swatch in normalizedSwatches"
                :key="swatch"
                :value="swatch"
                :aria-label="swatch"
                class="caomei-color-picker__swatch"
            >
                <!-- 内层为纯装饰；Reka 会为其生成英文色名，这里统一对 AT 隐藏 -->
                <span
                    class="caomei-color-picker__swatch-visual"
                    aria-hidden="true"
                >
                    <ColorSwatchPickerItemSwatch class="caomei-color-picker__swatch-color" />
                    <ColorSwatchPickerItemIndicator class="caomei-color-picker__swatch-indicator" />
                </span>
            </ColorSwatchPickerItem>
        </ColorSwatchPickerRoot>
    </div>
</template>

<style scoped>
.caomei-color-picker__panel-inner {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-3);
    width: 100%;
}

.caomei-color-picker__area {
    position: relative;
    width: 100%;
    height: 160px;
    border-radius: var(--caomei-radius-md);
}

.caomei-color-picker__area-root {
    display: block;
    width: 100%;
    height: 100%;
}

.caomei-color-picker__area-bg {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    cursor: crosshair;
}

.caomei-color-picker__area-thumb,
.caomei-color-picker__hue-thumb {
    display: block;
    width: 14px;
    height: 14px;
    border: 2px solid var(--caomei-color-bg);
    border-radius: var(--caomei-radius-full);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--caomei-color-text) 35%, transparent);
    transform: translate(-50%, -50%);
    cursor: grab;
}

.caomei-color-picker__hue {
    position: relative;
    width: 100%;
    height: 14px;
}

.caomei-color-picker__hue-track {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: var(--caomei-radius-full);
}

.caomei-color-picker__hue-thumb {
    top: 50%;
}

.caomei-color-picker__field {
    display: flex;
}

.caomei-color-picker__input {
    box-sizing: border-box;
    width: 100%;
    height: var(--caomei-control-height-md);
    padding: 0 var(--caomei-space-3);
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-md);
}

.caomei-color-picker__input:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}

.caomei-color-picker__swatches {
    display: flex;
    flex-wrap: wrap;
    gap: var(--caomei-space-2);
}

.caomei-color-picker__swatch {
    display: block;
    width: 22px;
    height: 22px;
    border-radius: var(--caomei-radius-sm);
    cursor: pointer;
}

.caomei-color-picker__swatch-visual {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
}

.caomei-color-picker__swatch-color {
    display: block;
    width: 100%;
    height: 100%;
    border: 1px solid var(--caomei-color-border);
    border-radius: inherit;
}

.caomei-color-picker__swatch-indicator {
    position: absolute;
    inset: 0;
    border: 2px solid var(--caomei-color-primary);
    border-radius: inherit;
}
</style>
