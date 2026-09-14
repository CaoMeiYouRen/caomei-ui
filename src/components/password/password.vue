<script setup lang="ts">
import { Eye, EyeOff } from '@lucide/vue'
import { computed, ref, useAttrs } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon } from '../../icons'
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
})

const emit = defineEmits<{
    focus: [event: FocusEvent]
    blur: [event: FocusEvent]
    change: [event: Event]
    clear: []
    enter: [event: KeyboardEvent]
}>()

const model = defineModel<string>({ default: '' })

const attrs = useAttrs()
const forwardedAttrs = computed(() => {
    const rest = { ...attrs }
    delete rest.type
    return rest
})

const revealed = ref(false)
const inputRef = ref<InstanceType<typeof CaomeiInput> | null>(null)

const locale = useLocale()
const clearLabel = computed(() => props.clearLabel ?? locale.value.input.clear)
const showLabel = computed(() => props.showLabel ?? locale.value.password.show)
const hideLabel = computed(() => props.hideLabel ?? locale.value.password.hide)

const inputType = computed(() => (revealed.value ? 'text' : 'password'))
const toggleLabel = computed(() => (revealed.value ? hideLabel.value : showLabel.value))

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
        @focus="emit('focus', $event)"
        @blur="emit('blur', $event)"
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
</template>

<style scoped>
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
</style>
