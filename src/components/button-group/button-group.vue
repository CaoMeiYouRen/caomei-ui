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

/*
  窄屏：成员 `flex-shrink: 0`，且拼接边框 / 圆角由相邻选择器决定、换行会破坏拼接外观，
  故改为组内横向滚动（成员保持完整可读）；成员总宽可超过平板可用宽，故按响应式设计 §2 的
  md 档（≤768px）收敛，仅在实际放不下时出现滚动。依据见响应式设计 §3 矩阵 #7。
*/
@media (width <= 768px) {
    .caomei-button-group--horizontal {
        max-width: 100%;

        /*
          简写：横向可滚动、纵向裁切。纵向显式 hidden 是为了避免 `overflow-x: auto` 使
          `overflow-y` 计算为 `auto`，从而凭空引入纵向滚动容器；纵向 ink（焦点环）由成员
          内缩补偿（见下），非 Button 成员自行声明的外溢装饰则被裁切、由使用方自担。
        */
        overflow: auto hidden;
    }

    /*
      滚动容器会裁切 `outline-offset: 2px` 的焦点环，故成员焦点环改内缩（同 SelectButton 的既有做法）。
      选择器点出 `.caomei-button`：Button 自身的 `:focus-visible` 规则经 scoped 编译后同为
      0-3-0 特异性，仅靠样式表顺序取胜；此处抬到 0-4-0 使其不依赖打包顺序。非 Button 成员
      自行声明的焦点环不受影响（其可读性由使用方自担）。
    */
    .caomei-button-group--horizontal :deep(> .caomei-button:focus-visible) {
        outline-offset: -2px;
    }
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
