<script setup lang="ts">
import { computed, ref, useId, useSlots } from 'vue'
import { PopoverAnchor, PopoverContent, PopoverPortal, PopoverRoot } from 'reka-ui'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon, useInternalIcons } from '../../icons'
import { CaomeiPopoverTrigger } from '../popover'
import TimeWheel from './time-wheel.vue'
import { buildTimeValue, clamp } from './utils'
import type { TimePickerEmits, TimePickerProps, TimePickerStep } from './types'

defineOptions({ name: 'CaomeiTimePicker', inheritAttrs: false })

const props = withDefaults(defineProps<TimePickerProps>(), {
    modelValue: null,
    label: undefined,
    ariaLabel: undefined,
    mode: 'input',
    hourFormat: '24',
    showSeconds: true,
    pad: true,
    step: undefined,
    minValue: undefined,
    maxValue: undefined,
    disabled: false,
    readonly: false,
    id: undefined,
})

const emit = defineEmits<TimePickerEmits>()

const slots = useSlots()
const messages = useLocale()
const icons = useInternalIcons()
const fieldId = useId()
const resolvedId = computed(() => props.id ?? fieldId)
const accessibleName = computed(() => props.ariaLabel ?? props.label)

const hourLabel = computed(() => messages.value.timePicker.hour)
const minuteLabel = computed(() => messages.value.timePicker.minute)
const secondLabel = computed(() => messages.value.timePicker.second)

const is12Hour = computed(() => props.hourFormat === '12')

/** 空值状态下各时间段不显示 0，而是留空（与 DatePicker 的空值占位语义一致）。 */
const isEmpty = computed(() => !props.modelValue || Number.isNaN(props.modelValue.getTime()))

const hour = computed(() => props.modelValue?.getHours() ?? 0)
const minute = computed(() => props.modelValue?.getMinutes() ?? 0)
const second = computed(() => props.modelValue?.getSeconds() ?? 0)

/** 12 小时制下的显示小时（1–12）。 */
const displayHour = computed(() => {
    if (!is12Hour.value) {
        return hour.value
    }
    const value = hour.value % 12
    return value === 0 ? 12 : value
})

const isPm = computed(() => hour.value >= 12)

const amLabel = computed(() => messages.value.timePicker.am)
const pmLabel = computed(() => messages.value.timePicker.pm)

function zeroPad(value: number): string {
    return String(value).padStart(2, '0')
}

/** 按 `pad` 输出时间段文本；关闭补 0 时保留自然数字。 */
function formatPart(value: number): string {
    return props.pad ? zeroPad(value) : String(value)
}

/** 空值展示：`--` 而不是 0，避免把「未填」误读为午夜。 */
const hourDisplay = computed(() => (isEmpty.value ? '' : formatPart(displayHour.value)))
const minuteDisplay = computed(() => (isEmpty.value ? '' : formatPart(minute.value)))
const secondDisplay = computed(() => (isEmpty.value ? '' : formatPart(second.value)))

/** 描述插槽的 id：渲染时才绑定到 `aria-describedby`。 */
const descriptionId = computed(() => `${resolvedId.value}-description`)
const hasDescription = computed(() => Boolean(slots.description))

/** 各段步进：`step.hour` / `step.minute` / `step.second`，缺省 1。 */
function stepOf(part: keyof TimePickerStep): number {
    const value = props.step?.[part]
    return value && Number.isFinite(value) && value > 0 ? value : 1
}

/** 把一次编辑写回 `Date`：日期部分沿用当前值（空值取今天），时间部分取编辑后的段值。 */
function commit(next: { hour?: number, minute?: number, second?: number }): void {
    emit('update:modelValue', buildTimeValue(props.modelValue, next, {
        showSeconds: props.showSeconds,
        minValue: props.minValue,
        maxValue: props.maxValue,
    }))
}

const open = ref(false)

function onWheelUpdate(value: Date | null): void {
    emit('update:modelValue', value)
}

/** 读取输入框数值；空串或非法值返回 `undefined`。 */
function readNumber(event: Event): number | undefined {
    const raw = (event.target as HTMLInputElement).value.trim()
    if (raw === '') {
        return undefined
    }
    const value = Number(raw)
    return Number.isFinite(value) ? value : undefined
}

/** 把 DOM 值回滚到模型值（被拒绝或非法输入时避免 DOM 与模型不一致）。 */
function resetInput(event: Event, value: string): void {
    (event.target as HTMLInputElement).value = value
}

function onHourInput(event: Event): void {
    if (props.disabled || props.readonly) {
        resetInput(event, hourDisplay.value)
        return
    }
    const raw = readNumber(event)
    if (raw === undefined) {
        resetInput(event, hourDisplay.value)
        return
    }
    if (is12Hour.value) {
        const display = clamp(raw, 1, 12)
        const nextHour = display === 12
            ? (isPm.value ? 12 : 0)
            : (isPm.value ? display + 12 : display)
        commit({ hour: nextHour })
        return
    }
    commit({ hour: clamp(raw, 0, 23) })
}

function onMinuteInput(event: Event): void {
    if (props.disabled || props.readonly) {
        resetInput(event, minuteDisplay.value)
        return
    }
    const raw = readNumber(event)
    if (raw === undefined) {
        resetInput(event, minuteDisplay.value)
        return
    }
    commit({ minute: clamp(raw, 0, 59) })
}

function onSecondInput(event: Event): void {
    if (props.disabled || props.readonly) {
        resetInput(event, secondDisplay.value)
        return
    }
    const raw = readNumber(event)
    if (raw === undefined) {
        resetInput(event, secondDisplay.value)
        return
    }
    commit({ second: clamp(raw, 0, 59) })
}

/** 12 小时制日序切换：只调整小时，不改分 / 秒。 */
function onDayPeriodChange(event: Event): void {
    if (props.disabled || props.readonly) {
        ;(event.target as HTMLSelectElement).value = isPm.value ? 'pm' : 'am'
        return
    }
    const pm = (event.target as HTMLSelectElement).value === 'pm'
    const current = hour.value
    if (pm && current < 12) {
        commit({ hour: current + 12 })
    } else if (!pm && current >= 12) {
        commit({ hour: current - 12 })
    }
}

/** 键盘上下键按 `step` 调整当前段；输入框为文本型，步进完全由本函数承载。 */
function onSegmentKeydown(event: KeyboardEvent, part: 'hour' | 'minute' | 'second'): void {
    if (props.disabled || props.readonly) {
        return
    }
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
        return
    }
    const step = stepOf(part)
    const direction = event.key === 'ArrowUp' ? 1 : -1
    const current = part === 'hour' ? hour.value : part === 'minute' ? minute.value : second.value
    const size = part === 'hour' ? 24 : 60
    const next = ((current + direction * step) % size + size) % size
    event.preventDefault()
    commit({ [part]: next })
}
</script>

<template>
    <PopoverRoot v-model:open="open">
        <div
            v-bind="$attrs"
            :id="resolvedId"
            class="caomei-time-picker"
            :class="{
                'caomei-time-picker--disabled': disabled,
                [`caomei-time-picker--${mode}`]: true
            }"
            :data-mode="mode"
            :data-seconds="showSeconds ? 'true' : undefined"
            :data-pad="pad ? 'true' : 'false'"
            :data-hour-format="hourFormat"
        >
            <label
                v-if="label"
                :id="`${resolvedId}-label`"
                class="caomei-time-picker__label"
            >
                {{ label }}
            </label>
            <!--
              PopoverAnchor 固定为**整个字段**：滚轮与「输入 + 滚轮」共用同一锚点，
              弹层始终从字段左缘展开，不随内部触发按钮的位置漂移。
            -->
            <PopoverAnchor as-child>
                <div
                    class="caomei-time-picker__field"
                    :class="{
                        'caomei-time-picker__field--wheel': mode === 'wheel',
                        'caomei-time-picker__field--both': mode === 'both'
                    }"
                    :role="mode === 'wheel' ? undefined : 'group'"
                    :aria-label="mode === 'wheel' ? undefined : accessibleName"
                    :aria-labelledby="mode !== 'wheel' && label && !ariaLabel ? `${resolvedId}-label` : undefined"
                    :aria-disabled="mode !== 'wheel' && disabled ? true : undefined"
                    :aria-describedby="mode !== 'wheel' && hasDescription ? descriptionId : undefined"
                >
                    <!--
                      三种模式共用同一组段位：显示层与输入层使用相同宽度 / 分隔符，
                      数字基线、左右内边距与字段高度因此不会随模式变化。
                    -->
                    <span
                        class="caomei-time-picker__segments"
                        :class="{'caomei-time-picker__wheel-text': mode === 'wheel'}"
                        :aria-hidden="mode === 'wheel' ? 'true' : undefined"
                    >
                        <template v-if="mode === 'wheel'">
                            <span
                                class="caomei-time-picker__segment caomei-time-picker__segment--display"
                                :data-empty="isEmpty ? 'true' : undefined"
                            >{{ isEmpty ? '--' : formatPart(displayHour) }}</span>
                            <span class="caomei-time-picker__separator" aria-hidden="true">:</span>
                            <span
                                class="caomei-time-picker__segment caomei-time-picker__segment--display"
                                :data-empty="isEmpty ? 'true' : undefined"
                            >{{ isEmpty ? '--' : formatPart(minute) }}</span>
                            <template v-if="showSeconds">
                                <span class="caomei-time-picker__separator" aria-hidden="true">:</span>
                                <span
                                    class="caomei-time-picker__segment caomei-time-picker__segment--display"
                                    :data-empty="isEmpty ? 'true' : undefined"
                                >{{ isEmpty ? '--' : formatPart(second) }}</span>
                            </template>
                            <span
                                v-if="is12Hour"
                                class="caomei-time-picker__period caomei-time-picker__period--display"
                                :data-empty="isEmpty ? 'true' : undefined"
                            >{{ isEmpty ? '--' : (isPm ? pmLabel : amLabel) }}</span>
                        </template>
                        <template v-else>
                            <input
                                class="caomei-time-picker__segment"
                                type="text"
                                inputmode="numeric"
                                autocomplete="off"
                                :role="isEmpty ? undefined : 'spinbutton'"
                                :aria-valuemin="isEmpty ? undefined : (is12Hour ? 1 : 0)"
                                :aria-valuemax="isEmpty ? undefined : (is12Hour ? 12 : 23)"
                                :aria-valuenow="isEmpty ? undefined : displayHour"
                                :aria-valuetext="isEmpty ? undefined : (is12Hour ? `${hourDisplay} ${isPm ? pmLabel : amLabel}` : hourDisplay)"
                                :value="hourDisplay"
                                :aria-label="hourLabel"
                                :disabled="disabled"
                                :readonly="readonly"
                                @change="onHourInput"
                                @keydown="onSegmentKeydown($event, 'hour')"
                            >
                            <span class="caomei-time-picker__separator" aria-hidden="true">:</span>
                            <input
                                class="caomei-time-picker__segment"
                                type="text"
                                inputmode="numeric"
                                autocomplete="off"
                                :role="isEmpty ? undefined : 'spinbutton'"
                                :aria-valuemin="isEmpty ? undefined : 0"
                                :aria-valuemax="isEmpty ? undefined : 59"
                                :aria-valuenow="isEmpty ? undefined : minute"
                                :aria-valuetext="isEmpty ? undefined : minuteDisplay"
                                :value="minuteDisplay"
                                :aria-label="minuteLabel"
                                :disabled="disabled"
                                :readonly="readonly"
                                @change="onMinuteInput"
                                @keydown="onSegmentKeydown($event, 'minute')"
                            >
                            <template v-if="showSeconds">
                                <span class="caomei-time-picker__separator" aria-hidden="true">:</span>
                                <input
                                    class="caomei-time-picker__segment"
                                    type="text"
                                    inputmode="numeric"
                                    autocomplete="off"
                                    :role="isEmpty ? undefined : 'spinbutton'"
                                    :aria-valuemin="isEmpty ? undefined : 0"
                                    :aria-valuemax="isEmpty ? undefined : 59"
                                    :aria-valuenow="isEmpty ? undefined : second"
                                    :aria-valuetext="isEmpty ? undefined : secondDisplay"
                                    :value="secondDisplay"
                                    :aria-label="secondLabel"
                                    :disabled="disabled"
                                    :readonly="readonly"
                                    @change="onSecondInput"
                                    @keydown="onSegmentKeydown($event, 'second')"
                                >
                            </template>
                            <select
                                v-if="is12Hour"
                                class="caomei-time-picker__period"
                                :value="isPm ? 'pm' : 'am'"
                                :aria-label="`${hourLabel} ${amLabel}/${pmLabel}`"
                                :disabled="disabled"
                                :aria-readonly="readonly || undefined"
                                @change="onDayPeriodChange"
                            >
                                <option value="am">
                                    {{ amLabel }}
                                </option>
                                <option value="pm">
                                    {{ pmLabel }}
                                </option>
                            </select>
                        </template>
                    </span>
                    <template v-if="mode === 'wheel'">
                        <CaomeiPopoverTrigger
                            as-child
                            unstyled
                            :disabled="disabled"
                        >
                            <button
                                type="button"
                                class="caomei-time-picker__trigger caomei-time-picker__trigger--fill"
                                :aria-label="accessibleName ?? hourLabel"
                                :aria-labelledby="label && !ariaLabel ? `${resolvedId}-label` : undefined"
                                :aria-disabled="disabled || undefined"
                                :aria-describedby="hasDescription ? descriptionId : undefined"
                            >
                                <CaomeiIcon
                                    :icon="icons.chevronDown"
                                    class="caomei-time-picker__wheel-icon"
                                    aria-hidden="true"
                                />
                            </button>
                        </CaomeiPopoverTrigger>
                    </template>
                    <CaomeiPopoverTrigger
                        v-else-if="mode === 'both'"
                        as-child
                        unstyled
                        :disabled="disabled"
                    >
                        <button
                            type="button"
                            class="caomei-time-picker__trigger caomei-time-picker__wheel-trigger"
                            :aria-label="accessibleName ?? hourLabel"
                            :aria-describedby="hasDescription ? descriptionId : undefined"
                        >
                            <CaomeiIcon
                                :icon="icons.chevronDown"
                                class="caomei-time-picker__wheel-icon"
                            />
                        </button>
                    </CaomeiPopoverTrigger>
                </div>
            </PopoverAnchor>
            <span
                v-if="hasDescription"
                :id="descriptionId"
                class="caomei-time-picker__description"
            >
                <slot name="description" />
            </span>
            <PopoverPortal v-if="mode !== 'input'">
                <PopoverContent
                    class="caomei-time-picker__content"
                    align="start"
                    :side-offset="6"
                    :aria-label="accessibleName ?? hourLabel"
                >
                    <TimeWheel
                        :model-value="modelValue"
                        :show-seconds="showSeconds"
                        :hour-format="hourFormat"
                        :pad="pad"
                        :min-value="minValue"
                        :max-value="maxValue"
                        :disabled="disabled"
                        :readonly="readonly"
                        @update:model-value="onWheelUpdate"
                    />
                </PopoverContent>
            </PopoverPortal>
        </div>
    </PopoverRoot>
</template>

<style scoped>
/*
  宽度策略：时间内容的长度可预见，默认只保留刚好容纳「时 / 分 / 秒」的宽度
  （由根元素上的 `data-seconds` / `data-hour-format` 选择档位），而不是跟随选择器家族的
  20rem 上限。需要与其它表单控件对齐时，把 `--caomei-time-picker-max-width` 覆盖为 `100%`
  或 `none`。
*/
:where(.caomei-time-picker) {
    --caomei-time-picker-content-width: 8.5rem;
}

:where(.caomei-time-picker[data-hour-format='12']) {
    --caomei-time-picker-content-width: calc(8.5rem + 3.75rem);
}

:where(.caomei-time-picker[data-seconds='true']) {
    --caomei-time-picker-content-width: 11.5rem;
}

:where(.caomei-time-picker[data-seconds='true'][data-hour-format='12']) {
    --caomei-time-picker-content-width: calc(11.5rem + 3.75rem);
}

.caomei-time-picker {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-1);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-md);
}

.caomei-time-picker__label {
    color: var(--caomei-color-text);
    font-size: var(--caomei-font-size-sm);
    font-weight: 500;
}

.caomei-time-picker__field {
    position: relative;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: var(--caomei-space-2);
    box-sizing: border-box;
    width: 100%;
    max-width: var(--caomei-time-picker-max-width, var(--caomei-time-picker-content-width));
    min-height: var(--caomei-time-picker-height, var(--caomei-control-height-md, 2.25rem));
    padding-inline: var(--caomei-time-picker-padding-inline, var(--caomei-space-2));
    border: 1px solid var(--caomei-time-picker-border, var(--caomei-color-control-border));
    border-radius: var(--caomei-time-picker-radius, var(--caomei-radius-md));
    background: var(--caomei-time-picker-bg, var(--caomei-color-bg));
    color: var(--caomei-time-picker-color, var(--caomei-color-text));
    font: inherit;
}

.caomei-time-picker__field:focus-within {
    border-color: var(--caomei-color-primary);
}

.caomei-time-picker--disabled .caomei-time-picker__field {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity, 0.6);
}

/*
  段位布局：输入与滚轮显示共用同一组宽度 / 对齐，避免同一字段在三种模式下数字位置漂移。
  段位只占内容宽，剩余空间留给右缘的滚轮入口。
*/
.caomei-time-picker__segments {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    min-width: 0;
    gap: var(--caomei-time-picker-segment-gap, 0);
}

.caomei-time-picker__segment {
    box-sizing: border-box;
    width: var(--caomei-time-picker-segment-width, 2.25rem);
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    font-variant-numeric: tabular-nums;
    text-align: center;
    appearance: textfield;
}

.caomei-time-picker__segment--display {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.caomei-time-picker__segment:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}

.caomei-time-picker__segment[data-empty] {
    color: var(--caomei-color-text-muted);
}

.caomei-time-picker__separator {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--caomei-time-picker-separator-width, 0.75rem);
    color: var(--caomei-color-text-muted);
    font-variant-numeric: tabular-nums;
    text-align: center;
}

.caomei-time-picker__period {
    box-sizing: border-box;
    width: var(--caomei-time-picker-period-width, 3.75rem);
    min-height: var(--caomei-control-height-sm, 1.75rem);
    padding-inline: var(--caomei-space-1);
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: center;
}

.caomei-time-picker__period--display {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.caomei-time-picker__period--display[data-empty] {
    color: var(--caomei-color-text-muted);
}

/* 滚轮入口固定在字段右缘：both 模式不再紧贴数字，弹层锚点也因此是整条字段。 */
.caomei-time-picker__trigger {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: var(--caomei-time-picker-trigger-size, 1.5rem);
    height: var(--caomei-time-picker-trigger-size, 1.5rem);
    margin-inline-start: auto;
    padding: 0;
    border: 0;
    border-radius: var(--caomei-radius-sm);
    background: transparent;
    color: var(--caomei-color-text-muted);
    cursor: pointer;
}

/* wheel 模式的整字段触发器：透明覆盖层，只承接指针与焦点，视觉仍由下方段位提供。 */
.caomei-time-picker__trigger--fill {
    position: absolute;
    inset: 0;
    z-index: var(--caomei-z-raise);
    justify-content: flex-end;
    width: auto;
    height: auto;
    margin: 0;
    padding-inline: var(--caomei-time-picker-padding-inline, var(--caomei-space-2));
    border-radius: inherit;
}

.caomei-time-picker__trigger:hover:not(:disabled) {
    color: var(--caomei-color-text);
}

.caomei-time-picker__trigger:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}

.caomei-time-picker__wheel-icon {
    flex-shrink: 0;
    color: var(--caomei-color-text-muted);
    pointer-events: none;
}

.caomei-time-picker--disabled .caomei-time-picker__wheel-icon {
    opacity: var(--caomei-disabled-opacity, 0.6);
}

.caomei-time-picker__wheel-text {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
}

.caomei-time-picker__description {
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>

<!-- Portal 面板：Portal 内元素不带父级 scoped 属性，样式集中为命名空间化的非 scoped 规则 -->
<style>
.caomei-time-picker__content {
    box-sizing: border-box;
    z-index: var(--caomei-time-picker-z-index, var(--caomei-z-dropdown));
    width: max-content;

    /*
      窄屏上限：面板不得超出 popper 可用宽 / 可用高（`--reka-popover-content-available-*` 由 Reka
      PopoverContentImpl 写入，回退 `none` 保持原行为）；可用空间不足时在面板内滚动，避免内容不可达。
    */
    max-width: var(--reka-popover-content-available-width, none);
    max-height: var(--reka-popover-content-available-height, none);
    overflow: auto;
    padding: var(--caomei-space-2);
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg-elevated);
    color: var(--caomei-color-text);
    box-shadow: var(--caomei-shadow-md);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-md);
    outline: none;
    transform-origin: var(--reka-popover-content-transform-origin);
}
</style>
