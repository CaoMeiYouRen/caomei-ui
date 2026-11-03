<script setup lang="ts">
import { ref } from 'vue'
import type { FormProps } from './types'

defineOptions({ name: 'CaomeiForm' })

withDefaults(defineProps<FormProps>(), {
    novalidate: false,
})

const emit = defineEmits<{
    /**
     * 表单提交时触发；组件已调用 `preventDefault()`，由使用方接管提交逻辑
     * @en Emitted on form submission; the component has called `preventDefault()`, so the consumer owns the submit logic
     */
    submit: [event: SubmitEvent]
}>()

const formRef = ref<HTMLFormElement | null>(null)

function onSubmit(event: SubmitEvent): void {
    event.preventDefault()
    emit('submit', event)
}

/** 以原生 `requestSubmit()` 触发提交；会执行原生校验并走组件的 submit 事件 */
function submit(): void {
    formRef.value?.requestSubmit()
}

defineExpose({ form: formRef, submit })
</script>

<template>
    <form
        ref="formRef"
        class="caomei-form"
        :novalidate="novalidate || undefined"
        @submit="onSubmit"
    >
        <slot />
    </form>
</template>

<style scoped>
.caomei-form {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: var(--caomei-form-gap, var(--caomei-space-4));
    width: 100%;
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
}
</style>
