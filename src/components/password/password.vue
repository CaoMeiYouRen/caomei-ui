<script setup lang="ts">
import { Eye, EyeOff } from '@lucide/vue'
import { computed, ref, useId } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon } from '../../icons'
import { useAttrForwarding } from '../_shared/use-attr-forwarding'
import { CaomeiInput } from '../input'
import type { PasswordProps } from './types'

// type 由可见性状态管理，不可由外部透传覆盖（否则会静默关闭密码掩码）
defineOptions({ name: 'CaomeiPassword', inheritAttrs: false })

const props = withDefaults(defineProps<PasswordProps>(), {
    size: 'md',
    disabled: false,
    readonly: false,
    invalid: false,
    placeholder: '',
    clearable: false,
    // 默认按「已有密码」语义提示浏览器自动填充；注册场景可显式传 new-password
    autocomplete: 'current-password',
    feedback: false,
})

const emit = defineEmits<{
    focus: [event: FocusEvent]
    blur: [event: FocusEvent]
    change: [event: Event]
    clear: []
    enter: [event: KeyboardEvent]
}>()

const model = defineModel<string>({ default: '' })

const feedbackId = useId()
// 根为包裹层：按 development.md §5 复用统一透传，class / style 留在根元素，其余属性透传到内层控件
const { rootAttrs, controlAttrs } = useAttrForwarding()
const forwardedAttrs = computed(() => {
    const rest = { ...controlAttrs.value }
    delete rest.type
    if (props.feedback) {
        rest['aria-describedby'] = mergeDescribedBy(rest['aria-describedby'], feedbackId)
    }
    return rest
})

const revealed = ref(false)
const focused = ref(false)
const inputRef = ref<InstanceType<typeof CaomeiInput> | null>(null)

const locale = useLocale()
const clearLabel = computed(() => props.clearLabel ?? locale.value.input.clear)
const showLabel = computed(() => props.showLabel ?? locale.value.password.show)
const hideLabel = computed(() => props.hideLabel ?? locale.value.password.hide)
const promptLabel = computed(() => props.promptLabel ?? locale.value.password.prompt)
const weakLabel = computed(() => props.weakLabel ?? locale.value.password.weak)
const mediumLabel = computed(() => props.mediumLabel ?? locale.value.password.medium)
const strongLabel = computed(() => props.strongLabel ?? locale.value.password.strong)

const inputType = computed(() => (revealed.value ? 'text' : 'password'))
const toggleLabel = computed(() => (revealed.value ? hideLabel.value : showLabel.value))

// 与 PrimeVue 默认规则一致：强 → 同时含大小写与数字且 ≥8 位；中 → 任两类字符且 ≥6 位；其余非空为弱
const STRONG_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/
const MEDIUM_PATTERN = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/

const strengthLevel = computed(() => {
    if (!model.value) {
        return 0
    }

    if (STRONG_PATTERN.test(model.value)) {
        return 3
    }

    if (MEDIUM_PATTERN.test(model.value)) {
        return 2
    }

    return 1
})

const strengthLabel = computed(() => {
    switch (strengthLevel.value) {
        case 3:
            return strongLabel.value
        case 2:
            return mediumLabel.value
        case 1:
            return weakLabel.value
        default:
            return promptLabel.value
    }
})

const showFeedback = computed(
    () => props.feedback && (focused.value || Boolean(model.value)),
)

const feedbackClass = computed(() => ({
    'caomei-password__feedback--visible': showFeedback.value,
}))

function mergeDescribedBy(value: unknown, id: string): string {
    const existing = typeof value === 'string' ? value.trim() : ''
    return existing ? `${existing} ${id}` : id
}

function onFocus(event: FocusEvent): void {
    focused.value = true
    emit('focus', event)
}

function onBlur(event: FocusEvent): void {
    focused.value = false
    emit('blur', event)
}

function toggle(): void {
    revealed.value = !revealed.value
}

function focus(): void {
    inputRef.value?.focus()
}

function blur(): void {
    inputRef.value?.blur()
}

defineExpose({ focus, blur })
</script>

<template>
    <!-- 根保持单元素：强度反馈作为兄弟节点挂在包裹层内，避免 Fragment 根让 v-show / 指令失效 -->
    <div
        class="caomei-password"
        v-bind="rootAttrs"
    >
        <CaomeiInput
            :id="id"
            ref="inputRef"
            v-model="model"
            v-bind="forwardedAttrs"
            :type="inputType"
            :size="size"
            :disabled="disabled"
            :readonly="readonly"
            :invalid="invalid"
            :placeholder="placeholder"
            :name="name"
            :autocomplete="autocomplete"
            :clearable="clearable"
            :clear-label="clearLabel"
            :label="label"
            @focus="onFocus"
            @blur="onBlur"
            @change="emit('change', $event)"
            @clear="emit('clear')"
            @enter="emit('enter', $event)"
        >
            <template #suffix>
                <button
                    type="button"
                    class="caomei-password__toggle"
                    :aria-label="toggleLabel"
                    :aria-pressed="revealed"
                    :disabled="disabled"
                    @click="toggle"
                >
                    <CaomeiIcon :icon="revealed ? EyeOff : Eye" />
                </button>
            </template>
        </CaomeiInput>
        <div
            v-if="feedback"
            class="caomei-password__feedback"
            :class="feedbackClass"
        >
            <div class="caomei-password__meter" aria-hidden="true">
                <div
                    class="caomei-password__meter-fill"
                    :data-level="strengthLevel"
                />
            </div>
            <span
                :id="feedbackId"
                class="caomei-password__feedback-text"
                role="status"
            >{{ strengthLabel }}</span>
        </div>
    </div>
</template>

<style scoped>
.caomei-password {
    display: block;
    width: 100%;
}

.caomei-password__toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--caomei-color-text-muted);
    cursor: pointer;
}

.caomei-password__toggle:hover {
    color: var(--caomei-color-text);
}

.caomei-password__toggle:focus-visible {
    border-radius: var(--caomei-radius-sm);
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}

.caomei-password__toggle:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.caomei-password__feedback {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-1);
    width: 100%;
    margin-top: var(--caomei-space-1);
}

/* 未聚焦且无值时不占布局，仅保留 live region 供读屏器播报 */
.caomei-password__feedback:not(.caomei-password__feedback--visible) {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
}

.caomei-password__meter {
    width: 100%;
    height: 4px;
    overflow: hidden;
    border-radius: var(--caomei-radius-full);
    background: var(--caomei-color-border);
}

.caomei-password__meter-fill {
    width: 0;
    height: 100%;
    border-radius: inherit;
    background: var(--caomei-color-text-muted);
    transition: width 0.15s ease, background-color 0.15s ease;
}

.caomei-password__meter-fill[data-level='1'] {
    width: 33.333%;
    background: var(--caomei-color-danger);
}

.caomei-password__meter-fill[data-level='2'] {
    width: 66.666%;
    background: var(--caomei-color-warning);
}

.caomei-password__meter-fill[data-level='3'] {
    width: 100%;
    background: var(--caomei-color-success);
}

.caomei-password__feedback-text {
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}

@media (prefers-reduced-motion: reduce) {
    .caomei-password__meter-fill {
        transition: none;
    }
}
</style>
