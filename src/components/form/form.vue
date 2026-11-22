<script setup lang="ts">
import { provide, ref } from 'vue'
import { formContextKey, isPromiseLike, type FormItemRegistration, type FormValidateOutcome } from './context'
import type { FormProps } from './types'

defineOptions({ name: 'CaomeiForm' })

const props = withDefaults(defineProps<FormProps>(), {
    novalidate: false,
    errors: undefined,
    validationMode: 'onSubmit',
})

const emit = defineEmits<{
    /**
     * 表单提交时触发；校验通过才触发，组件已调用 `preventDefault()`，由使用方接管提交逻辑
     * @en Emitted on submission once validation passes; the component has called
     * `preventDefault()`, so the consumer owns the submit logic
     */
    submit: [event: SubmitEvent]
}>()

const formRef = ref<HTMLFormElement | null>(null)
const submitCount = ref(0)
const items = new Set<FormItemRegistration>()

function register(item: FormItemRegistration): () => void {
    items.add(item)
    return () => {
        items.delete(item)
    }
}

/** 汇总已注册字段的值集；未提供 `name` 的字段不进入值集 */
function getValues(): Record<string, unknown> {
    const values: Record<string, unknown> = {}
    items.forEach((item) => {
        const name = item.name()
        if (name) {
            values[name] = item.value()
        }
    })
    return values
}

provide(formContextKey, {
    errors: () => props.errors ?? {},
    validationMode: () => props.validationMode,
    submitCount: () => submitCount.value,
    register,
    getValues,
})

/**
 * 逐字段执行校验，任一失败即整体失败。
 *
 * 全部字段同步校验时返回布尔（提交保持同步）；存在异步校验时返回 Promise。
 */
function validateAll(): FormValidateOutcome {
    const outcomes = Array.from(items, (item) => item.validate())
    if (!outcomes.some((outcome) => isPromiseLike(outcome))) {
        return outcomes.every(Boolean)
    }
    return Promise.all(outcomes as Promise<boolean>[]).then((results) => results.every(Boolean))
}

/**
 * 聚焦文档顺序上的首个无效字段。
 *
 * 字段注册顺序可能偏离文档顺序（后挂载 / 列表重排），故按根元素的文档位置排序；
 * 字段内控件由 `FormItem` 解析（原生控件优先，其次组根 / 按钮）。
 */
function focusFirstInvalid(): void {
    const candidates = Array.from(items)
        .filter((item) => item.invalid())
        .map((item) => ({ root: item.root(), control: item.control() }))
        .filter((entry): entry is { root: HTMLElement | null, control: HTMLElement } => entry.control !== null)

    candidates.sort((a, b) => {
        if (!a.root || !b.root || a.root === b.root) {
            return 0
        }
        // Node.DOCUMENT_POSITION_FOLLOWING
        return (a.root.compareDocumentPosition(b.root) & 4) !== 0 ? -1 : 1
    })

    candidates[0]?.control.focus()
}

function settle(result: FormValidateOutcome, event: SubmitEvent): void {
    if (!result) {
        focusFirstInvalid()
        return
    }
    emit('submit', event)
}

function onSubmit(event: SubmitEvent): void {
    event.preventDefault()
    submitCount.value += 1
    const result = validateAll()
    if (isPromiseLike(result)) {
        void result.then((valid) => {
            settle(valid, event)
        })
        return
    }
    settle(result, event)
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
