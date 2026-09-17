<script setup lang="ts">
import { ToolbarRoot } from 'reka-ui'
import { useLabelAttrs } from '../_shared/use-label-attrs'
import type { ToolbarProps } from './types'

defineOptions({ name: 'CaomeiToolbar', inheritAttrs: false })

const props = withDefaults(defineProps<ToolbarProps>(), {
    orientation: 'horizontal',
    loop: true,
    label: '',
})

/** label 属性优先于透传的 aria-label；二者都缺省时由容器语义推导 */
const forwardedAttrs = useLabelAttrs(() => props.label)
</script>

<template>
    <ToolbarRoot
        v-bind="forwardedAttrs"
        :id="id"
        :orientation="orientation"
        :dir="dir"
        :loop="loop"
        class="caomei-toolbar"
        :class="`caomei-toolbar--${orientation}`"
    >
        <slot />
    </ToolbarRoot>
</template>

<style scoped>
/*
  `--caomei-toolbar-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值。
*/
.caomei-toolbar {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    gap: var(--caomei-toolbar-gap, var(--caomei-space-1));
    padding: var(--caomei-toolbar-padding, var(--caomei-space-1));
    border: 1px solid var(--caomei-toolbar-border, var(--caomei-color-border));
    border-radius: var(--caomei-toolbar-radius, var(--caomei-radius-md));
    background: var(--caomei-toolbar-bg, var(--caomei-color-bg));
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
}

.caomei-toolbar--vertical {
    flex-direction: column;
    align-items: stretch;
}

/*
  窄屏允许横向形态换行：成员为 `flex-shrink: 0`，不加换行时整条工具栏会被压出容器；成员总宽
  可超过平板可用宽，故按响应式设计 §2 的 md 档（≤768px）收敛。仅在实际放不下时生效，桌面不变。
  纵向形态（`--vertical`）不参与：其换行由使用方的高度约束决定，本组件不预设。
  依据见响应式设计 §3 矩阵 #7。
*/
@media (width <= 768px) {
    .caomei-toolbar--horizontal {
        flex-wrap: wrap;
        max-width: 100%;
    }
}
</style>

<!--
  成员控件（按钮与开关条目）由各自的子组件渲染，作用域 id 不属于任何单一 SFC，
  故共享样式集中在本文件的非 scoped 块，以命名空间化的 `.caomei-toolbar__*` 限定范围。
-->
<style>
.caomei-toolbar__button {
    box-sizing: border-box;
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    gap: var(--caomei-toolbar-button-gap, var(--caomei-space-1));
    height: var(--caomei-toolbar-button-size, var(--caomei-control-height-md));
    min-width: var(--caomei-toolbar-button-size, var(--caomei-control-height-md));
    padding: 0 var(--caomei-toolbar-button-padding-x, var(--caomei-space-2));
    border: none;
    border-radius: var(--caomei-toolbar-button-radius, var(--caomei-radius-sm));
    background: transparent;
    color: var(--caomei-color-text);
    font: inherit;
    font-size: var(--caomei-font-size-md);
    white-space: nowrap;
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease;
}

.caomei-toolbar__button:hover:not(:disabled, [data-state='on']) {
    background: var(--caomei-color-bg-elevated);
}

.caomei-toolbar__button:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: -2px;
}

.caomei-toolbar__button:disabled,
.caomei-toolbar__button[data-disabled] {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-toolbar__button[data-state='on'] {
    background: var(--caomei-toolbar-button-active-bg, var(--caomei-color-primary));
    color: var(--caomei-toolbar-button-active-color, var(--caomei-color-primary-foreground));
}

@media (prefers-reduced-motion: reduce) {
    .caomei-toolbar__button {
        transition: none;
    }
}
</style>
