<script setup lang="ts">
import { EditablePreview } from 'reka-ui'

defineOptions({ name: 'CaomeiEditablePreview', inheritAttrs: false })
</script>

<template>
    <!-- Reka 的预览区自带 `role="button"` 与 `tabindex`，由它承接进入编辑的键盘路径 -->
    <EditablePreview
        v-bind="$attrs"
        class="caomei-editable__preview"
    >
        <slot />
    </EditablePreview>
</template>

<style scoped>
.caomei-editable__preview {
    max-width: 100%;
    padding: 0 var(--caomei-space-1);
    border-bottom: 1px dashed transparent;
    border-radius: var(--caomei-radius-sm);
    cursor: text;
    overflow-wrap: anywhere;
}

.caomei-editable__preview:hover {
    border-bottom-color: var(--caomei-color-control-border);
}

.caomei-editable__preview:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
}

.caomei-editable__preview[data-placeholder] {
    color: var(--caomei-color-text-muted);
}

/* 祖先选择器不带 scope 约束，故可跨组件匹配根上的 `data-disabled` */
.caomei-editable[data-disabled] .caomei-editable__preview {
    cursor: not-allowed;
}
</style>
