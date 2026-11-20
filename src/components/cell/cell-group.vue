<script setup lang="ts">
import { useId } from 'vue'
import type { CellGroupProps } from './types'

defineOptions({ name: 'CaomeiCellGroup' })

defineProps<CellGroupProps>()

defineSlots<{
    default?: () => unknown
    title?: () => unknown
}>()

const titleId = useId()
</script>

<template>
    <div
        class="caomei-cell-group"
        role="group"
        :aria-labelledby="$slots.title || title ? titleId : undefined"
    >
        <div
            v-if="$slots.title || title"
            :id="titleId"
            class="caomei-cell-group__title"
        >
            <slot name="title">
                {{ title }}
            </slot>
        </div>
        <div class="caomei-cell-group__list">
            <slot />
        </div>
    </div>
</template>

<style scoped>
.caomei-cell-group {
    overflow: hidden;
    border: 1px solid var(--caomei-cell-group-border, var(--caomei-color-border));
    border-radius: var(--caomei-cell-group-radius, var(--caomei-radius-md));
    background: var(--caomei-cell-group-bg, var(--caomei-color-bg));
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
}

.caomei-cell-group__title {
    padding: var(--caomei-space-2) var(--caomei-space-3);
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}

.caomei-cell-group__list {
    display: flex;
    flex-direction: column;
}

/*
  相邻单元格之间只画一条分隔线：首个单元格不顶上边框，末个不补底边框。
  Cell 根节点会继承本组件的 scope id，故 scoped 选择器可直接命中子组件根元素。
*/
.caomei-cell-group__list > .caomei-cell + .caomei-cell {
    border-top: 1px solid var(--caomei-cell-group-divider, var(--caomei-color-border));
}

/* 窄屏不改变行结构，分隔线与圆角沿用桌面形态 */
@media (width <= 640px) {
    .caomei-cell-group {
        border-radius: var(--caomei-cell-group-radius, var(--caomei-radius-sm));
    }
}
</style>
