<script setup lang="ts">
import { TabsList } from 'reka-ui'
import type { TabListProps } from './types'

defineOptions({ name: 'CaomeiTabList', inheritAttrs: false })

withDefaults(defineProps<TabListProps>(), {
    loop: true,
})
</script>

<template>
    <TabsList
        v-bind="$attrs"
        :loop="loop"
        class="caomei-tabs__list"
    >
        <slot />
    </TabsList>
</template>

<style scoped>
.caomei-tabs__list {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--caomei-tabs-list-gap, var(--caomei-space-1));

    /* 两轴必须成对声明（承重声明）：只写 `overflow-x: auto` 时，另一轴的 `visible` 会被
       CSS overflow 计算规则改成 `auto`，而触发器的 `margin-bottom: -1px` 让它的边框盒比
       列表内容盒向下多出 1px（用于让激活下划线压住列表下边框），这 1px 纵向溢出就会被渲染成
       **一条多余的纵向滚动条**：虽然列表根本不需要纵向滚动，但滚轮在列表上滚动会把内容顶起
       1px（实测 `scrollTop` 由 0 变 1）。声明界面实测值：`overflow-y: auto` 时
       `scrollHeight 38 > clientHeight 37`。把纵向显式声明为 `hidden`（简写 `overflow: auto hidden`）
       与 `auto` 的裁剪行为完全一致（像素级实测零差异），只阻止滚动条与用户滚动。
       声明层守卫见 test/contracts/tabs-list-overflow.test.ts，真实几何守卫见
       test/e2e/tabs-list-overflow.e2e.ts。 */
    overflow: auto hidden;

    /* 分隔线（承重声明）：`overflow` 非 `visible` 时在**内边距盒**处裁剪，会把触发器越出内容盒的
       1px 指示条削掉。原 `border-bottom` 位于边框盒、比内容盒低 1px，与指示条（触发器
       `margin-bottom: -1px` 越界 1px）不在同一像素行，无法被盖住。改为：内容盒之下留 1px 内边距，
       用内阴影在该内边距盒底边画分隔线，使激活指示条（2px）正好落在这 1px 上、把它整行盖住，
       同时列表总高与分隔线像素位置逐值不变（行高：原 `border-bottom` 1px ↔ 现 `padding-bottom` 1px）。
       声明层守卫见 test/contracts/tabs-list-separator.test.ts，真实几何 / 像素对照见
       test/e2e/tabs-indicator.e2e.ts。 */
    padding-bottom: 1px;
    box-shadow: inset 0 -1px 0 0 var(--caomei-tabs-border, var(--caomei-color-border));
}

:where(.caomei-tabs--vertical) .caomei-tabs__list {
    flex-direction: column;
    align-items: stretch;

    /* 纵向必须保持 `visible`：指示条同样靠 `margin-right: -1px` 越出内容盒 1px 压住右边框，
       裁剪会削掉它（与横向的 `overflow-y` 同源，但这里两轴都不能裁剪）。见上方承重声明。
       同时重置横向的分隔线实现（`padding-bottom` + 内阴影），保持原 `border-right` 形态。 */
    overflow: visible;
    padding-bottom: 0;
    box-shadow: none;
    border-right: 1px solid var(--caomei-tabs-border, var(--caomei-color-border));
}
</style>
