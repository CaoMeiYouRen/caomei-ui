<script setup lang="ts">
import { ToolbarSeparator } from 'reka-ui'

defineOptions({ name: 'CaomeiToolbarSeparator' })
</script>

<template>
    <ToolbarSeparator class="caomei-toolbar__separator" />
</template>

<style scoped>
/*
  Reka 把工具条方向原样传给分隔线（data-orientation 等于工具条方向），
  故此处按该值绘制垂直于工具条的分隔线。
*/
.caomei-toolbar__separator {
    flex-shrink: 0;
    align-self: stretch;
    background: var(--caomei-toolbar-separator, var(--caomei-color-border));
}

.caomei-toolbar__separator[data-orientation='horizontal'] {
    width: 1px;
    margin: var(--caomei-toolbar-separator-margin, var(--caomei-space-1)) 0;
}

.caomei-toolbar__separator[data-orientation='vertical'] {
    width: auto;
    height: 1px;
    margin: 0 var(--caomei-toolbar-separator-margin, var(--caomei-space-1));
}
</style>
