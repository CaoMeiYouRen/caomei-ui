<script setup lang="ts">
import { Check, ChevronDown } from '@lucide/vue'
import {
    SelectContent,
    SelectIcon,
    SelectItem,
    SelectItemIndicator,
    SelectItemText,
    SelectPortal,
    SelectRoot,
    SelectTrigger,
    SelectValue,
    SelectViewport,
} from 'reka-ui'
import { computed } from 'vue'
import { CaomeiIcon } from '../../icons'
import type { SelectProps } from './types'

defineOptions({ name: 'CaomeiSelect', inheritAttrs: false })

const props = withDefaults(defineProps<SelectProps>(), {
    options: () => [],
    placeholder: '',
    size: 'md',
    disabled: false,
    invalid: false,
    bodyLock: false,
})

const model = defineModel<string>()

const selectedLabel = computed(
    () => props.options.find((option) => option.value === model.value)?.label,
)

const rootClass = computed(() => [
    `caomei-select--${props.size}`,
    {
        'caomei-select--invalid': props.invalid,
        'caomei-select--disabled': props.disabled,
    },
])
</script>

<template>
    <SelectRoot
        v-model="model"
        :disabled="disabled"
        :name="name"
    >
        <SelectTrigger
            v-bind="$attrs"
            :id="id"
            class="caomei-select"
            :class="rootClass"
            :aria-invalid="invalid || undefined"
            :aria-label="label"
        >
            <SelectValue class="caomei-select__value">
                <span v-if="selectedLabel">{{ selectedLabel }}</span>
                <span v-else class="caomei-select__placeholder">{{ placeholder }}</span>
            </SelectValue>
            <SelectIcon class="caomei-select__icon">
                <CaomeiIcon :icon="ChevronDown" />
            </SelectIcon>
        </SelectTrigger>
        <SelectPortal>
            <SelectContent
                class="caomei-select__content"
                position="popper"
                :side-offset="4"
                :body-lock="bodyLock"
            >
                <SelectViewport class="caomei-select__viewport">
                    <SelectItem
                        v-for="option in options"
                        :key="option.value"
                        class="caomei-select__item"
                        :value="option.value"
                        :disabled="option.disabled"
                    >
                        <SelectItemText>{{ option.label }}</SelectItemText>
                        <SelectItemIndicator class="caomei-select__indicator">
                            <CaomeiIcon :icon="Check" />
                        </SelectItemIndicator>
                    </SelectItem>
                </SelectViewport>
            </SelectContent>
        </SelectPortal>
    </SelectRoot>
</template>

<style scoped>
.caomei-select {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--caomei-space-1);
    width: 100%;
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    cursor: pointer;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.caomei-select:focus-visible {
    border-color: var(--caomei-color-primary);
    outline: none;
    box-shadow: 0 0 0 2px var(--caomei-color-border);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--caomei-color-primary) 20%, transparent);
}

.caomei-select--invalid {
    border-color: var(--caomei-color-danger);
}

.caomei-select--invalid:focus-visible {
    border-color: var(--caomei-color-danger);
    box-shadow: 0 0 0 2px var(--caomei-color-border);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--caomei-color-danger) 20%, transparent);
}

.caomei-select--disabled {
    cursor: not-allowed;
    background: var(--caomei-color-bg-elevated);
    opacity: 0.6;
}

.caomei-select--sm {
    height: var(--caomei-control-height-sm);
    padding: 0 var(--caomei-space-2);
    font-size: var(--caomei-font-size-sm);
}

.caomei-select--md {
    height: var(--caomei-control-height-md);
    padding: 0 var(--caomei-space-3);
    font-size: var(--caomei-font-size-md);
}

.caomei-select--lg {
    height: var(--caomei-control-height-lg);
    padding: 0 var(--caomei-space-4);
    font-size: var(--caomei-font-size-lg);
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
    z-index: 1000;
    overflow: hidden;
    min-width: var(--reka-select-trigger-width);
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
}

.caomei-select__viewport {
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

.caomei-select__item[data-disabled] {
    cursor: not-allowed;
    opacity: 0.5;
}

.caomei-select__indicator {
    display: inline-flex;
    flex-shrink: 0;
    color: var(--caomei-color-primary);
}
</style>
