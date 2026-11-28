<script setup lang="ts">
import { TagGroupItem } from 'reka-ui'
import type { TagGroupItemProps } from './types'

defineOptions({ name: 'CaomeiTagGroupItem', inheritAttrs: false })

withDefaults(defineProps<TagGroupItemProps>(), {
    disabled: false,
})
</script>

<template>
    <TagGroupItem
        v-bind="$attrs"
        :value="value"
        :text-value="textValue"
        :disabled="disabled || undefined"
        class="caomei-tag-group__item"
        :class="{'caomei-tag-group__item--disabled': disabled}"
    >
        <slot />
    </TagGroupItem>
</template>

<style scoped>
/**
 * 标签项：Reka 在外层 `role="row"` 元素上挂 `data-state`（选择模式）与 `data-disabled`，
 * 内层 `div` 承载渲染结构，故样式以 `__item` 自身为锚点，不依赖内层节点。
 */
.caomei-tag-group__item {
    display: inline-flex;
    gap: var(--caomei-space-1);
    align-items: center;
    min-height: var(--caomei-control-height-sm);
    padding: 0 var(--caomei-space-2);
    border: 1px solid var(--caomei-tag-group-item-border, var(--caomei-color-border));
    border-radius: var(--caomei-tag-group-item-radius, var(--caomei-radius-sm));
    background: var(--caomei-tag-group-item-bg, var(--caomei-color-bg-elevated));
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-sm);
    cursor: default;
}

.caomei-tag-group__item[data-state='checked'] {
    border-color: var(--caomei-tag-group-item-active-border, var(--caomei-color-primary));
    background: var(--caomei-tag-group-item-active-bg, var(--caomei-color-primary));
    color: var(--caomei-color-primary-foreground);
}

.caomei-tag-group__item:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
}

.caomei-tag-group__item--disabled,
.caomei-tag-group__item[data-disabled] {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}
</style>
