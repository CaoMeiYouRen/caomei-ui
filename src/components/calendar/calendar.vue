<script setup lang="ts">
import { defaultLocale } from '../../locale'
import CalendarPanel from './calendar-panel.vue'
import type { CalendarProps } from './types'

defineOptions({ name: 'CaomeiCalendar' })

const props = withDefaults(defineProps<CalendarProps>(), {
    disabled: false,
    readonly: false,
    locale: defaultLocale,
    weekdayFormat: 'narrow',
    fixedWeeks: false,
    preventDeselect: false,
    pagedNavigation: false,
    initialFocus: false,
})

const model = defineModel<Date | null>({ default: null })
</script>

<template>
    <!--
      v-model 必须置于 v-bind 之后：props 在运行期含 modelValue，合并时同键后者胜，
      顺序颠倒会静默退回 props 携带的旧值（半受控下表现为选了不显示）。
    -->
    <CalendarPanel
        v-bind="props"
        v-model="model"
        class="caomei-calendar"
    />
</template>

<style scoped>
.caomei-calendar {
    box-sizing: border-box;
    display: inline-block;
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
}

.caomei-calendar[data-disabled] {
    opacity: var(--caomei-disabled-opacity);
}
</style>
