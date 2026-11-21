<script setup lang="ts">
import { computed } from 'vue'
import { useLocaleCode } from '../../composables/use-locale'
import { resolveWeekdayFormat } from '../_shared/locale-defaults'
import CalendarPanel from './calendar-panel.vue'
import type { CalendarProps } from './types'

defineOptions({ name: 'CaomeiCalendar' })

const props = withDefaults(defineProps<CalendarProps>(), {
    disabled: false,
    readonly: false,
    fixedWeeks: false,
    preventDeselect: false,
    pagedNavigation: false,
    initialFocus: false,
})

const model = defineModel<Date | null>({ default: null })

const localeCode = useLocaleCode()
/** 缺省跟随 `ConfigProvider` / `provideLocale` 的注入语言；显式 prop 仍优先 */
const resolvedLocale = computed(() => props.locale ?? localeCode.value)
const resolvedWeekdayFormat = computed(() => resolveWeekdayFormat(resolvedLocale.value, props.weekdayFormat))
</script>

<template>
    <!--
      v-model 必须置于 v-bind 之后：props 在运行期含 modelValue，合并时同键后者胜，
      顺序颠倒会静默退回 props 携带的旧值（半受控下表现为选了不显示）。
    -->
    <CalendarPanel
        v-bind="props"
        v-model="model"
        :locale="resolvedLocale"
        :weekday-format="resolvedWeekdayFormat"
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
