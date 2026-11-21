<script setup lang="ts">
import { PinInputInput, PinInputRoot } from 'reka-ui'
import { computed, ref, watch } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { useLabelAttrs } from '../_shared/use-label-attrs'
import type { InputOtpEmits, InputOtpProps } from './types'

defineOptions({ name: 'CaomeiInputOtp' })

const props = withDefaults(defineProps<InputOtpProps>(), {
    length: 6,
    type: 'numeric',
    placeholder: '',
    mask: false,
    otp: true,
    readonly: false,
    required: false,
    size: 'md',
    disabled: false,
    invalid: false,
})

const emit = defineEmits<InputOtpEmits>()

const model = defineModel<string>({ default: '' })

const locale = useLocale()
const groupAttrs = useLabelAttrs(() => props.label)

/** 归一化为定长的字符数组：保持空位，避免中间删除时后续数字左移。 */
function normalize(value: string | readonly (string | number | undefined)[], length: number): string[] {
    const cells = Array.from({ length }, () => '')
    const list = typeof value === 'string' ? [...value] : value
    for (let index = 0; index < Math.min(list.length, length); index += 1) {
        const cell = list[index]
        cells[index] = cell === undefined ? '' : String(cell)
    }
    return cells
}

const cells = ref<string[]>(normalize(model.value, props.length))

/**
 * 最近一次由组件内部抛出的值。
 * 受控用法下父级回写同值时不再把内部数组重置——否则中间删除留下的空位会被抹平。
 */
let lastEmitted: string | null = null
let lastComplete = false

watch(
    () => model.value,
    (value) => {
        if (value === lastEmitted) {
            return
        }
        cells.value = normalize(value, props.length)
        lastComplete = cells.value.every(Boolean)
    },
)

watch(
    () => props.length,
    (length) => {
        cells.value = normalize(model.value, length)
    },
)

const rekaType = computed(() => (props.type === 'numeric' ? 'number' : 'text'))
const rootClass = computed(() => [
    `caomei-input-otp--${props.size}`,
    {
        'caomei-input-otp--invalid': props.invalid,
        'caomei-input-otp--disabled': props.disabled,
        'caomei-input-otp--readonly': props.readonly,
    },
])

/** 逐格可访问名，取当前语言模板；`{index}` / `{total}` 按 1 起计。 */
function cellLabel(index: number): string {
    return locale.value.inputOtp.cellLabel
        .replace('{index}', String(index + 1))
        .replace('{total}', String(props.length))
}

function onUpdate(value: string[] | (number | undefined)[]): void {
    const next = normalize(value, props.length)
    cells.value = next
    const joined = next.join('')
    lastEmitted = joined
    model.value = joined

    const complete = next.every(Boolean)
    if (complete && !lastComplete) {
        emit('complete', joined)
    }
    lastComplete = complete
}
</script>

<template>
    <PinInputRoot
        v-bind="groupAttrs"
        :id="id"
        :name="name"
        :model-value="cells as string[]"
        :type="rekaType as 'text'"
        :otp="otp"
        :mask="mask"
        :disabled="disabled"
        :required="required"
        role="group"
        :aria-invalid="invalid || undefined"
        :aria-disabled="disabled || undefined"
        class="caomei-input-otp"
        :class="rootClass"
        @update:model-value="onUpdate"
    >
        <PinInputInput
            v-for="(_, index) in length"
            :key="index"
            :index="index"
            :aria-label="cellLabel(index)"
            :readonly="readonly || undefined"
            :placeholder="placeholder"
            class="caomei-input-otp__cell"
        />
    </PinInputRoot>
</template>

<style scoped>
/*
  `--caomei-input-otp-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值；
  档位选择器用 :where() 归零特异性，只声明自定义属性 / 选择器槽位。
*/
.caomei-input-otp {
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    gap: var(--caomei-input-otp-gap, var(--caomei-space-2));
    align-items: center;
    width: 100%;
    min-width: 0;
    font-family: var(--caomei-font-sans);
}

.caomei-input-otp__cell {
    box-sizing: border-box;
    flex: 0 0 auto;
    width: var(--caomei-input-otp-cell-width, var(--caomei-control-height-md));
    height: var(--caomei-input-otp-cell-height, var(--caomei-control-height-md));
    padding: 0;
    border: 1px solid var(--caomei-color-control-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    font: inherit;
    font-size: var(--caomei-input-otp-font-size, var(--caomei-font-size-lg));
    font-variant-numeric: tabular-nums;
    text-align: center;
    transition: border-color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard), box-shadow var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard);
}

.caomei-input-otp__cell::placeholder {
    color: var(--caomei-color-text-muted);
}

.caomei-input-otp__cell:focus-visible {
    border-color: var(--caomei-color-primary);
    outline: none;
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--caomei-color-primary) 20%, transparent);
}

.caomei-input-otp__cell:disabled {
    background: var(--caomei-color-bg-elevated);
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-input-otp__cell[readonly] {
    background: var(--caomei-color-bg-elevated);
}

.caomei-input-otp--invalid .caomei-input-otp__cell {
    border-color: var(--caomei-color-danger);
}

.caomei-input-otp--invalid .caomei-input-otp__cell:focus-visible {
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--caomei-color-danger) 20%, transparent);
}

:where(.caomei-input-otp--sm) {
    --caomei-input-otp-cell-width: var(--caomei-control-height-sm);
    --caomei-input-otp-cell-height: var(--caomei-control-height-sm);
    --caomei-input-otp-font-size: var(--caomei-font-size-md);
}

:where(.caomei-input-otp--lg) {
    --caomei-input-otp-cell-width: var(--caomei-control-height-lg);
    --caomei-input-otp-cell-height: var(--caomei-control-height-lg);
    --caomei-input-otp-font-size: var(--caomei-font-size-xl);
}

@media (prefers-reduced-motion: reduce) {
    .caomei-input-otp__cell {
        transition: none;
    }
}
</style>
