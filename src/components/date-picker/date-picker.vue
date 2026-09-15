<script setup lang="ts">
import { Calendar as CalendarIcon } from '@lucide/vue'
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
import { computed } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon } from '../../icons'
import { defaultLocale } from '../../locale'
import { formatDate } from '../_shared/date-format'
import CalendarPanel from '../calendar/calendar-panel.vue'
import type { DatePickerProps } from './types'

// 组合 Reka Popover + 内部 CalendarPanel：面板日历与本库 Calendar 共用接线与可访问名，
// 避免 Reka DatePicker 内建英文文案（Event Date）无法本地化。
defineOptions({ name: 'CaomeiDatePicker', inheritAttrs: false })

const props = withDefaults(defineProps<DatePickerProps>(), {
    disabled: false,
    readonly: false,
    invalid: false,
    size: 'md',
    placeholder: '',
    showIcon: true,
    closeOnSelect: true,
    locale: defaultLocale,
    weekdayFormat: 'narrow',
    fixedWeeks: false,
    preventDeselect: false,
})

const model = defineModel<Date | null>({ default: null })
const open = defineModel<boolean>('open', { default: false })

const messages = useLocale()
const displayText = computed(() => formatDate(model.value, props.dateFormat, props.locale))
const fallbackLabel = computed(() => props.label ?? messages.value.datePicker.label)
const triggerLabel = computed(() =>
    props.label ?? (displayText.value || props.placeholder ? undefined : fallbackLabel.value),
)

const rootClass = computed(() => [
    `caomei-date-picker--${props.size}`,
    {
        'caomei-date-picker--invalid': props.invalid,
        'caomei-date-picker--disabled': props.disabled,
        'caomei-date-picker--readonly': props.readonly,
    },
])

function onUpdate(value: Date | null): void {
    model.value = value
    if (props.closeOnSelect) {
        open.value = false
    }
}
</script>

<template>
    <PopoverRoot v-model:open="open">
        <PopoverTrigger as-child>
            <button
                :id="id"
                v-bind="$attrs"
                type="button"
                class="caomei-date-picker"
                :class="rootClass"
                :aria-label="triggerLabel"
                :aria-invalid="invalid || undefined"
                :disabled="disabled"
            >
                <span
                    class="caomei-date-picker__text"
                    :data-empty="displayText ? undefined : 'true'"
                >{{ displayText || placeholder }}</span>
                <CaomeiIcon
                    v-if="showIcon"
                    :icon="CalendarIcon"
                    class="caomei-date-picker__icon"
                />
            </button>
        </PopoverTrigger>
        <PopoverPortal>
            <PopoverContent
                class="caomei-date-picker__content"
                align="start"
                :side-offset="6"
            >
                <CalendarPanel
                    :model-value="model"
                    :min-value="minValue"
                    :max-value="maxValue"
                    :disabled="disabled"
                    :readonly="readonly"
                    :locale="locale"
                    :week-starts-on="weekStartsOn"
                    :weekday-format="weekdayFormat"
                    :fixed-weeks="fixedWeeks"
                    :prevent-deselect="preventDeselect"
                    class="caomei-calendar"
                    @update:model-value="onUpdate"
                />
            </PopoverContent>
        </PopoverPortal>
    </PopoverRoot>
</template>

<style scoped>
.caomei-date-picker {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--caomei-space-2);
    width: 100%;
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    text-align: start;
    cursor: pointer;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.caomei-date-picker:focus-visible {
    border-color: var(--caomei-color-primary);
    outline: 0;
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--caomei-color-primary) 20%, transparent);
}

.caomei-date-picker--sm {
    height: var(--caomei-control-height-sm);
    padding: 0 var(--caomei-space-2);
    font-size: var(--caomei-font-size-sm);
}

.caomei-date-picker--md {
    height: var(--caomei-control-height-md);
    padding: 0 var(--caomei-space-3);
    font-size: var(--caomei-font-size-md);
}

.caomei-date-picker--lg {
    height: var(--caomei-control-height-lg);
    padding: 0 var(--caomei-space-4);
    font-size: var(--caomei-font-size-lg);
}

.caomei-date-picker--invalid {
    border-color: var(--caomei-color-danger);
}

.caomei-date-picker--disabled {
    cursor: not-allowed;
    background: var(--caomei-color-bg-elevated);
    opacity: 0.6;
}

.caomei-date-picker--readonly {
    background: var(--caomei-color-bg-elevated);
}

.caomei-date-picker__text {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.caomei-date-picker__text[data-empty] {
    color: var(--caomei-color-text-muted);
}

.caomei-date-picker__icon {
    flex-shrink: 0;
    color: var(--caomei-color-text-muted);
}
</style>

<!-- Portal 面板：Portal 内元素不带父级 scoped 属性，样式集中为命名空间化的非 scoped 规则 -->
<style>
.caomei-date-picker__content {
    box-sizing: border-box;
    z-index: var(--caomei-date-picker-z-index, 1050);
    width: max-content;
    padding: var(--caomei-space-3);
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    box-shadow: 0 8px 24px color-mix(in srgb, var(--caomei-color-text) 16%, transparent);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-md);
    outline: none;
    transform-origin: var(--reka-popover-content-transform-origin);
    animation: caomei-date-picker-in 0.12s ease-out;
}

@keyframes caomei-date-picker-in {
    from {
        opacity: 0;
        transform: scale(0.96);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

@media (prefers-reduced-motion: reduce) {
    .caomei-date-picker__content {
        animation: none;
    }
}
</style>
