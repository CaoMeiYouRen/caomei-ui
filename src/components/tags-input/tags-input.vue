<script setup lang="ts">
import { X } from '@lucide/vue'
import {
    TagsInputClear,
    TagsInputInput,
    TagsInputItem,
    TagsInputItemDelete,
    TagsInputItemText,
    TagsInputRoot,
} from 'reka-ui'
import { computed, nextTick, ref } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon } from '../../icons'
import { useAttrForwarding } from '../_shared/use-attr-forwarding'
import { labelAttrs } from '../_shared/use-label-attrs'
import type { TagsInputProps } from './types'

defineOptions({ name: 'CaomeiTagsInput', inheritAttrs: false })

const props = withDefaults(defineProps<TagsInputProps>(), {
    id: undefined,
    name: undefined,
    label: undefined,
    placeholder: '',
    size: 'md',
    disabled: false,
    invalid: false,
    required: false,
    allowDuplicate: false,
    delimiter: ',',
    max: undefined,
    addOnPaste: true,
    addOnTab: false,
    addOnBlur: false,
    showClear: false,
    clearLabel: undefined,
})

const emit = defineEmits<{
    /**
     * 新增标签后抛出；被拒绝的输入（重复标签 / 超出 `max`）走 `invalidInput`
     * @en Emitted after a tag is added; rejected input (duplicate tag / beyond `max`) goes through `invalidInput`
     */
    addTag: [tag: string]
    /**
     * 删除标签后抛出
     * @en Emitted after a tag is removed
     */
    removeTag: [tag: string]
    /**
     * 输入被拒绝时抛出（重复标签 / 超出 `max`）
     * @en Emitted when input is rejected (duplicate tag / beyond `max`)
     */
    invalidInput: [value: string]
}>()

const model = defineModel<string[]>({ default: () => [] })

const { rootAttrs, controlAttrs } = useAttrForwarding()

const locale = useLocale()
const clearLabel = computed(() => props.clearLabel ?? locale.value.tagsInput.clear)

const rootClass = computed(() => [
    `caomei-tags-input--${props.size}`,
    {
        'caomei-tags-input--invalid': props.invalid,
        'caomei-tags-input--disabled': props.disabled,
    },
])

/** 有标签且未禁用时显示清空按钮（与 MultiSelect 的 `showClear` 口径一致） */
const clearable = computed(() => props.showClear && model.value.length > 0 && !props.disabled)

const inputRef = ref<{ $el?: unknown } | null>(null)

/**
 * 清空后清除按钮自身被移除，把焦点交回输入框，否则焦点会掉到 body。
 * 受控用法下外层可能拒绝更新：此时按钮仍在，不应把它自身的焦点抢走。
 */
function restoreInputFocus(): void {
    void nextTick(() => {
        if (clearable.value) {
            return
        }
        const element = inputRef.value?.$el
        if (element instanceof HTMLElement) {
            element.focus()
        }
    })
}
</script>

<template>
    <TagsInputRoot
        v-bind="rootAttrs"
        :id="id"
        v-model="model"
        class="caomei-tags-input"
        :class="rootClass"
        :name="name"
        :required="required"
        :disabled="disabled"
        :delimiter="delimiter"
        :max="max"
        :duplicate="allowDuplicate"
        :add-on-paste="addOnPaste"
        :add-on-tab="addOnTab"
        :add-on-blur="addOnBlur"
        :data-filled="model.length > 0 ? 'true' : undefined"
        @add-tag="emit('addTag', $event)"
        @remove-tag="emit('removeTag', $event)"
        @invalid="emit('invalidInput', $event)"
    >
        <!--
          标签项显式声明 role="group"：Reka 在 `role=generic` 的 div 上输出 `aria-labelledby`，
          而 ARIA 1.2 禁止在 generic 上命名（axe 报 aria-prohibited-attr）；group 允许命名且无必需父级。
        -->
        <TagsInputItem
            v-for="(tag, index) in model"
            :key="`${tag}-${index}`"
            :value="tag"
            role="group"
            class="caomei-tags-input__tag"
        >
            <TagsInputItemText class="caomei-tags-input__tag-label" />
            <TagsInputItemDelete class="caomei-tags-input__tag-remove">
                <CaomeiIcon :icon="X" />
            </TagsInputItemDelete>
        </TagsInputItem>
        <TagsInputInput
            v-bind="{...controlAttrs, ...labelAttrs(label)}"
            ref="inputRef"
            class="caomei-tags-input__input"
            :placeholder="placeholder"
            :disabled="disabled"
            :aria-invalid="invalid || undefined"
        />
        <TagsInputClear
            v-if="clearable"
            class="caomei-tags-input__clear"
            :aria-label="clearLabel"
            @click="restoreInputFocus"
        >
            <CaomeiIcon :icon="X" />
        </TagsInputClear>
    </TagsInputRoot>
</template>

<style scoped>
/*
  `--caomei-tags-input-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值；
  档位选择器用 :where() 归零特异性，只声明 CSS 变量。
*/
.caomei-tags-input {
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--caomei-space-1);
    width: 100%;
    min-height: var(--caomei-tags-input-min-height, var(--caomei-control-height-md));
    padding: var(--caomei-tags-input-padding-block, var(--caomei-space-1)) var(--caomei-tags-input-padding-inline, var(--caomei-space-3));
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-tags-input-font-size, var(--caomei-font-size-md));
    cursor: text;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.caomei-tags-input:focus-within {
    border-color: var(--caomei-color-primary);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--caomei-color-primary) 20%, transparent);
}

.caomei-tags-input--invalid {
    border-color: var(--caomei-color-danger);
}

.caomei-tags-input--invalid:focus-within {
    border-color: var(--caomei-color-danger);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--caomei-color-danger) 20%, transparent);
}

.caomei-tags-input--disabled {
    cursor: not-allowed;
    background: var(--caomei-color-bg-elevated);
    opacity: var(--caomei-disabled-opacity);
}

:where(.caomei-tags-input--sm) {
    --caomei-tags-input-min-height: var(--caomei-control-height-sm);
    --caomei-tags-input-padding-block: var(--caomei-space-1);
    --caomei-tags-input-padding-inline: var(--caomei-space-2);
    --caomei-tags-input-font-size: var(--caomei-font-size-sm);
}

:where(.caomei-tags-input--lg) {
    --caomei-tags-input-min-height: var(--caomei-control-height-lg);
    --caomei-tags-input-padding-block: var(--caomei-space-2);
    --caomei-tags-input-padding-inline: var(--caomei-space-4);
    --caomei-tags-input-font-size: var(--caomei-font-size-lg);
}

.caomei-tags-input__tag {
    display: inline-flex;
    align-items: center;
    gap: var(--caomei-space-1);
    max-width: 100%;
    padding: 0 var(--caomei-space-1) 0 var(--caomei-space-2);
    border-radius: var(--caomei-radius-sm);
    background: var(--caomei-color-bg-elevated);
    font-size: var(--caomei-font-size-sm);
    line-height: 1.6;
}

/* 键盘方向键选中的标签（Reka 以 data-state 表达选中态） */
.caomei-tags-input__tag[data-state='active'] {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}

.caomei-tags-input__tag-label {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.caomei-tags-input__tag-remove {
    display: inline-flex;
    flex-shrink: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--caomei-color-text-muted);
    cursor: pointer;
}

.caomei-tags-input__tag-remove:hover {
    color: var(--caomei-color-text);
}

.caomei-tags-input__input {
    flex: 1;
    min-width: 4rem;
    padding: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: inherit;
    font: inherit;
}

.caomei-tags-input__input::placeholder {
    color: var(--caomei-color-text-muted);
}

.caomei-tags-input__input:disabled {
    cursor: not-allowed;
}

/* 清空按钮为字段内的常规 flex 成员（不是绝对定位）：字段可多行换行，绝对定位会压在标签之上 */
.caomei-tags-input__clear {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--caomei-color-text-muted);

    /* 按钮默认不继承字体：显式继承以保持图标与字段文本同源 */
    font: inherit;
    cursor: pointer;
}

.caomei-tags-input__clear:hover {
    color: var(--caomei-color-text);
}

.caomei-tags-input__clear:focus-visible {
    border-radius: var(--caomei-radius-sm);
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}
</style>
