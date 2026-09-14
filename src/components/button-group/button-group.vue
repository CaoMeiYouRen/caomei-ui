<script setup lang="ts">
import { computed } from 'vue'
import type { ButtonGroupProps } from './types'

defineOptions({ name: 'CaomeiButtonGroup' })

const props = withDefaults(defineProps<ButtonGroupProps>(), {
    orientation: 'horizontal',
})

const rootClass = computed(() => `caomei-button-group--${props.orientation}`)
</script>

<template>
    <div class="caomei-button-group" :class="rootClass">
        <slot />
    </div>
</template>

<style scoped>
.caomei-button-group {
    box-sizing: border-box;
    display: inline-flex;
}

.caomei-button-group--horizontal {
    flex-direction: row;
    align-items: stretch;
}

.caomei-button-group--vertical {
    flex-direction: column;
    align-items: stretch;
}

/*
  插槽内容 scope id 属于使用方，普通 scoped 选择器命中不到成员，
  故统一用 :deep()（scope id 落在容器上 + 直接子组合）包裹成员。
  成员自身的 border / border-radius 由带伪类 / :not() 的选择器（特异性 0,3,0 起）压过。
*/
.caomei-button-group--horizontal :deep(> *) {
    flex-shrink: 0;
}

/* 移除内侧边框宽度（不用简写，避免连带重置成员的 border-color） */
.caomei-button-group--horizontal :deep(> *:not(:last-child)) {
    border-inline-end-width: 0;
}

.caomei-button-group--vertical :deep(> *) {
    flex-shrink: 0;
}

.caomei-button-group--vertical :deep(> *:not(:last-child)) {
    border-block-end-width: 0;
}

/* 圆角拼接：中间成员完全去圆角，首 / 末成员仅保留外侧圆角 */
.caomei-button-group--horizontal :deep(> *:not(:first-child, :last-child)) {
    border-radius: 0;
}

.caomei-button-group--horizontal :deep(> *:first-child:not(:last-child)) {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
}

.caomei-button-group--horizontal :deep(> *:last-child:not(:first-child)) {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
}

.caomei-button-group--vertical :deep(> *:not(:first-child, :last-child)) {
    border-radius: 0;
}

.caomei-button-group--vertical :deep(> *:first-child:not(:last-child)) {
    border-end-start-radius: 0;
    border-end-end-radius: 0;
}

.caomei-button-group--vertical :deep(> *:last-child:not(:first-child)) {
    border-start-start-radius: 0;
    border-start-end-radius: 0;
}

/* 聚焦成员抬升，保证自身边框压在相邻成员之上 */
.caomei-button-group :deep(> *:focus-within) {
    position: relative;
    z-index: 1;
}
</style>
