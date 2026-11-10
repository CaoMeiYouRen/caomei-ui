<script setup lang="ts">
import { computed } from 'vue'
import type { InputGroupProps } from './types'

defineOptions({ name: 'CaomeiInputGroup' })

const props = withDefaults(defineProps<InputGroupProps>(), {
    orientation: 'horizontal',
})

const rootClass = computed(() => `caomei-input-group--${props.orientation}`)
</script>

<template>
    <div class="caomei-input-group" :class="rootClass">
        <slot />
    </div>
</template>

<style scoped>
.caomei-input-group {
    box-sizing: border-box;
    display: flex;
    width: 100%;
}

.caomei-input-group--horizontal {
    flex-direction: row;
    align-items: stretch;
}

.caomei-input-group--vertical {
    flex-direction: column;
    align-items: stretch;
}

/*
  插槽内容的 scope id 属于使用方，普通 scoped 选择器命中不到子组件根元素，
  故这里统一用 :deep()（scope id 落在容器上 + 直接子组合）包裹成员。
*/
.caomei-input-group--horizontal :deep(> *) {
    flex-shrink: 0;
}

/*
  输入类成员占满剩余宽度：宽度取 1% 让 flex 以剩余空间计算，避免默认 width:100% 挤占按钮；
  同时解除成员自身的 max-width（Select / InputNumber 默认封顶），使组合真正铺满。
  使用 :is() 列举以保持单条规则，:is() 的特异性取参数最高值（单个类），足以压过成员自身样式。
  列举的是「承载宽度的成员根元素」：Select 的根元素是字段包装层 `.caomei-select__field`
  （宽度上限也声明在该元素上），其内层触发器不参与组合布局。
*/
.caomei-input-group--horizontal :deep(> :is(.caomei-input, .caomei-input-number, .caomei-select__field, .caomei-multi-select, .caomei-textarea)) {
    flex: 1 1 auto;
    min-width: 0;
    max-width: none;
    width: 1%;
}

/* 相邻成员负外边距重叠 1px 边框，避免拼成 2px 双线 */
.caomei-input-group--horizontal :deep(> *:not(:first-child)) {
    margin-inline-start: -1px;
}

.caomei-input-group--vertical :deep(> *:not(:first-child)) {
    margin-block-start: -1px;
}

/* 圆角拼接：中间成员完全去圆角 */
.caomei-input-group--horizontal :deep(> *:not(:first-child, :last-child)) {
    border-radius: 0;
}

.caomei-input-group--vertical :deep(> *:not(:first-child, :last-child)) {
    border-radius: 0;
}

/* 首成员保留起始侧圆角、去掉连接侧圆角 */
.caomei-input-group--horizontal :deep(> *:first-child:not(:last-child)) {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
}

.caomei-input-group--horizontal :deep(> *:last-child:not(:first-child)) {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
}

.caomei-input-group--vertical :deep(> *:first-child:not(:last-child)) {
    border-end-start-radius: 0;
    border-end-end-radius: 0;
}

.caomei-input-group--vertical :deep(> *:last-child:not(:first-child)) {
    border-start-start-radius: 0;
    border-start-end-radius: 0;
}

/* 外侧圆角统一由 --caomei-input-group-radius 控制（默认与控件一致） */
.caomei-input-group--horizontal :deep(> *:first-child) {
    border-start-start-radius: var(--caomei-input-group-radius, var(--caomei-radius-md));
    border-end-start-radius: var(--caomei-input-group-radius, var(--caomei-radius-md));
}

.caomei-input-group--horizontal :deep(> *:last-child) {
    border-start-end-radius: var(--caomei-input-group-radius, var(--caomei-radius-md));
    border-end-end-radius: var(--caomei-input-group-radius, var(--caomei-radius-md));
}

.caomei-input-group--vertical :deep(> *:first-child) {
    border-start-start-radius: var(--caomei-input-group-radius, var(--caomei-radius-md));
    border-start-end-radius: var(--caomei-input-group-radius, var(--caomei-radius-md));
}

.caomei-input-group--vertical :deep(> *:last-child) {
    border-end-start-radius: var(--caomei-input-group-radius, var(--caomei-radius-md));
    border-end-end-radius: var(--caomei-input-group-radius, var(--caomei-radius-md));
}

/*
  Select 的可见边框与圆角位于内层触发器 `.caomei-select` 上，成员根元素只是定位 / 宽度包装层，
  上面的圆角规则落在包装层后不会被内层沿用（表现为与选择器组合时拼接侧圆角仍在）。
  故让组内的触发器继承包装层圆角，使同一组规则（含 --caomei-input-group-radius）对 Select 同样成立。
  注意：选择器依赖 `.caomei-select` 是 `.caomei-select__field` 的直接子，Select 内部结构变更时本规则会静默失配。
*/
.caomei-input-group :deep(> .caomei-select__field > .caomei-select) {
    border-radius: inherit;
}

/* 聚焦成员抬升，保证自身边框压在重叠的相邻边框之上（:focus-within 自身聚焦或含聚焦均匹配） */
.caomei-input-group :deep(> *:focus-within) {
    position: relative;
    z-index: var(--caomei-z-raise);
}

/*
  动效优先模式：聚焦成员轻微上移（transform 不触发布局），过渡沿用共享字段层的
  属性清单并追加 transform；`minimal` 无对应规则，`reduce` 在末尾显式归零。
  `[class]` 属性选择器用于把特异性稳定抬到成员自身过渡规则之上（成员为
  `.caomei-field[data-v]`），避免依赖样式源序；属性恒存在，不改变匹配范围。
*/
:where([data-motion='expressive']) .caomei-input-group[class] :deep(> *) {
    transition:
        border-color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard),
        box-shadow var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard),
        transform var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard);
}

:where([data-motion='expressive']) .caomei-input-group[class] :deep(> *:focus-within) {
    transform: translateY(calc(var(--caomei-motion-distance-sm) * -0.5));
}

@media (prefers-reduced-motion: reduce) {
    :where([data-motion='expressive']) .caomei-input-group[class] :deep(> *) {
        transition: none;
        transform: none;
    }

    :where([data-motion='expressive']) .caomei-input-group[class] :deep(> *:focus-within) {
        transform: none;
    }
}
</style>
