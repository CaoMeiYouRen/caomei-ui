<script setup lang="ts">
import { EditableRoot } from 'reka-ui'
import type { EditableProps } from './types'

defineOptions({ name: 'CaomeiEditable', inheritAttrs: false })

withDefaults(defineProps<EditableProps>(), {
    disabled: false,
    readonly: false,
    activationMode: 'focus',
    submitMode: 'blur',
    selectOnFocus: false,
    startWithEditMode: false,
})

/**
 * 受控值。`defineModel` 生成的 `modelValue` prop 与 `<EditableRoot>` 的同名 prop 会撞在模板作用域里，
 * 故以 `model` 命名并在模板中显式绑定 `:model-value`。
 */
const model = defineModel<string | null>('modelValue', { default: '' })

const emit = defineEmits<{
    /**
     * 提交时触发（回车、失焦或提交触发器），载荷为提交后的值
     * @en Emitted on submit (Enter, blur or the submit trigger) with the submitted value
     */
    submit: [value: string | null]
}>()

/** Reka 的 `submit` 事件带提交值；不要在处理器里读 `model`（父级写回是异步的） */
function onSubmit(value?: string | null): void {
    emit('submit', value ?? null)
}
</script>

<template>
    <EditableRoot
        v-bind="$attrs"
        :model-value="model"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly || undefined"
        :activation-mode="activationMode"
        :submit-mode="submitMode"
        :select-on-focus="selectOnFocus || undefined"
        :start-with-edit-mode="startWithEditMode || undefined"
        :max-length="maxLength"
        :data-disabled="disabled || undefined"
        class="caomei-editable"
        :class="{'caomei-editable--disabled': disabled}"
        @update:model-value="model = $event"
        @submit="onSubmit"
    >
        <slot />
    </EditableRoot>
</template>

<style scoped>
/**
 * 行内编辑容器：只提供布局与状态钩子，具体形态由 `__preview` / `__input` 承担。
 * `--caomei-editable-*` 只作为覆盖钩子（消费处带默认回退值），不预声明默认值。
 */
.caomei-editable {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    min-height: var(--caomei-editable-min-height, var(--caomei-control-height-md));
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-md);
}

.caomei-editable--disabled {
    opacity: var(--caomei-disabled-opacity);
}

</style>
