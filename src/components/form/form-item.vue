<script setup lang="ts">
import { computed, useId } from 'vue'
import type { FormItemProps, FormItemSlotProps } from './types'

defineOptions({ name: 'CaomeiFormItem' })

const props = withDefaults(defineProps<FormItemProps>(), {
    id: undefined,
    name: undefined,
    label: '',
    hint: '',
    error: '',
    required: false,
    invalid: false,
})

defineSlots<{
    /**
     * 字段内容；作用域提供 `id` / `name` / `aria-labelledby` / `aria-describedby` / `invalid`
     * @en Field content; the scope provides `id` / `name` / `aria-labelledby` / `aria-describedby` / `invalid`
     */
    default?: (props: FormItemSlotProps) => unknown
}>()

const instanceId = useId()

/** 控件 id：显式 id 优先，缺省按实例生成（SSR 与客户端一致） */
const controlId = computed(() => props.id || `caomei-form-item-${instanceId}`)
const labelId = computed(() => `${instanceId}-label`)
const hintId = computed(() => `${instanceId}-hint`)
const errorId = computed(() => `${instanceId}-error`)

/** `error` 非空即视为校验失败，避免使用方两处状态不同步 */
const isInvalid = computed(() => props.invalid || Boolean(props.error))

/** hint / error 的 id 列表；只有实际渲染的文本才进入 `aria-describedby` */
const describedBy = computed(() => {
    const ids = [
        props.hint ? hintId.value : '',
        props.error ? errorId.value : '',
    ].filter(Boolean)
    return ids.length > 0 ? ids.join(' ') : undefined
})

const slotProps = computed<FormItemSlotProps>(() => ({
    id: controlId.value,
    name: props.name,
    'aria-labelledby': props.label ? labelId.value : undefined,
    'aria-describedby': describedBy.value,
    invalid: isInvalid.value,
}))
</script>

<template>
    <div
        class="caomei-form-item"
        :class="{'caomei-form-item--invalid': isInvalid}"
    >
        <span
            v-if="label"
            :id="labelId"
            class="caomei-form-item__label"
        >
            {{ label }}
            <span
                v-if="required"
                class="caomei-form-item__required"
                aria-hidden="true"
            >*</span>
        </span>
        <div class="caomei-form-item__control">
            <slot v-bind="slotProps" />
        </div>
        <p
            v-if="hint"
            :id="hintId"
            class="caomei-form-item__hint"
        >
            {{ hint }}
        </p>
        <p
            v-if="error"
            :id="errorId"
            class="caomei-form-item__error"
            role="alert"
        >
            {{ error }}
        </p>
    </div>
</template>

<style scoped>
.caomei-form-item {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: var(--caomei-form-item-gap, var(--caomei-space-1));
    width: 100%;
}

.caomei-form-item__label {
    display: inline-flex;
    align-items: baseline;
    gap: var(--caomei-form-item-required-gap, var(--caomei-space-1));
    color: var(--caomei-form-item-label-color, var(--caomei-color-text));
    font-size: var(--caomei-form-item-label-font-size, var(--caomei-font-size-sm));
    font-weight: 500;
    line-height: 1.4;
}

.caomei-form-item__required {
    color: var(--caomei-form-item-required-color, var(--caomei-color-danger-text));
}

.caomei-form-item__control {
    display: block;
    min-width: 0;
}

.caomei-form-item__hint,
.caomei-form-item__error {
    margin: 0;
    font-size: var(--caomei-form-item-message-font-size, var(--caomei-font-size-sm));
    line-height: 1.4;
}

.caomei-form-item__hint {
    color: var(--caomei-form-item-hint-color, var(--caomei-color-text-muted));
}

.caomei-form-item__error {
    color: var(--caomei-form-item-error-color, var(--caomei-color-danger-text));
}

.caomei-form-item--invalid .caomei-form-item__label {
    color: var(--caomei-form-item-invalid-label-color, var(--caomei-color-danger-text));
}
</style>
