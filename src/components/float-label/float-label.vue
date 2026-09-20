<script setup lang="ts">
import { computed } from 'vue'
import type { FloatLabelProps } from './types'

defineOptions({ name: 'CaomeiFloatLabel' })

const props = withDefaults(defineProps<FloatLabelProps>(), {
    variant: 'over',
})

const rootClass = computed(() => `caomei-float-label--${props.variant}`)
</script>

<template>
    <div class="caomei-float-label" :class="rootClass">
        <slot />
    </div>
</template>

<style scoped>
.caomei-float-label {
    box-sizing: border-box;
    display: block;
    position: relative;
    width: 100%;
}

/* over 变体在字段上方浮出标签，需要预留外侧空间；置 0 可由使用方自行控制间距 */
.caomei-float-label--over {
    margin-block-start: var(--caomei-float-label-over-space, var(--caomei-space-4));
}

/*
  直接子级 <label> 为浮层标签。插槽内容 scope id 属于使用方，故用 :deep() 命中。
  pointer-events: none 避免遮挡字段文本选择；关联仍由 label 的 for 属性保证。
*/
.caomei-float-label :deep(> label) {
    position: absolute;
    z-index: var(--caomei-z-raise);
    inset-inline-start: var(--caomei-float-label-inset, var(--caomei-space-3));
    margin: 0;
    color: var(--caomei-float-label-color, var(--caomei-color-text-muted));
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-md);
    line-height: 1;
    pointer-events: none;
    transition:
        top var(--caomei-float-label-transition-duration, 0.15s) ease,
        font-size var(--caomei-float-label-transition-duration, 0.15s) ease,
        color var(--caomei-float-label-transition-duration, 0.15s) ease,
        transform var(--caomei-float-label-transition-duration, 0.15s) ease;
}

/* over：空值且未聚焦时，标签居中充当占位提示 */
.caomei-float-label--over :deep(> label) {
    top: 50%;
    transform: translateY(-50%);
}

/* over：多行文本框内容自顶部开始，空值标签亦贴顶（置于浮动态之前，浮动态可覆盖） */
.caomei-float-label--over:has(> .caomei-textarea) :deep(> label) {
    top: var(--caomei-float-label-over-textarea-top, var(--caomei-space-2));
    transform: none;
    font-size: var(--caomei-font-size-sm);
}

/*
  over：聚焦 / 有值 / 存在非空 placeholder 时，标签浮到字段**上方**，
  不再占用字段内部空间，因而不会与输入值或占位文本重叠。
  - 有值：字段根元素暴露 data-filled；
  - 占位：原生 input/textarea 的 placeholder 属性，或字段根元素暴露 data-has-placeholder
    （Select 的占位是 span，且 Reka SelectTrigger 已占用 data-placeholder，故用独立标记）。
  两者都用后代匹配，以兼容 MultiSelect 经 Reka ComboboxRoot 包裹层渲染（字段非直接子级）的情况。
*/
.caomei-float-label--over:has(> *:focus-within, [data-filled], :is(input, textarea)[placeholder]:not([placeholder='']), [data-has-placeholder]) :deep(> label) {
    top: var(--caomei-float-label-over-top, calc(-1 * var(--caomei-space-4)));
    transform: translateY(0);
    font-size: var(--caomei-font-size-sm);
}

/* in：标签常驻字段顶部，字段以顶部内边距为其预留空间 */
.caomei-float-label--in :deep(> label) {
    top: var(--caomei-float-label-in-top, var(--caomei-space-1));
    transform: none;
    font-size: var(--caomei-font-size-sm);
}

/* in：固定高度控件改为内容高度，并以 min-height 保证不塌陷 */
.caomei-float-label--in :deep(> :is(.caomei-input, .caomei-select)) {
    height: auto;
    min-height: var(--caomei-float-label-in-min-height, var(--caomei-control-height-lg));
    padding-block: var(--caomei-float-label-in-padding-top, var(--caomei-space-4)) var(--caomei-float-label-in-padding-bottom, var(--caomei-space-1));
}

.caomei-float-label--in :deep(> .caomei-textarea),
.caomei-float-label--in :deep(.caomei-multi-select) {
    padding-block-start: var(--caomei-float-label-in-padding-top, var(--caomei-space-4));
}

/* 聚焦态标签色 */
.caomei-float-label:has(> *:focus-within) :deep(> label) {
    color: var(--caomei-float-label-focus-color, var(--caomei-color-primary));
}

/* 校验失败态标签色（置于聚焦之后，优先于聚焦色） */
.caomei-float-label:has(> :is(.caomei-input--invalid, .caomei-input-number--invalid, .caomei-select--invalid, .caomei-multi-select--invalid, .caomei-textarea--invalid)) :deep(> label),
.caomei-float-label:has([aria-invalid='true']) :deep(> label) {
    color: var(--caomei-float-label-invalid-color, var(--caomei-color-danger));
}

@media (prefers-reduced-motion: reduce) {
    .caomei-float-label :deep(> label) {
        transition: none;
    }
}
</style>
