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
    border-bottom: 1px solid var(--caomei-tabs-border, var(--caomei-color-border));
}

:where(.caomei-tabs--vertical) .caomei-tabs__list {
    flex-direction: column;
    align-items: stretch;

    /* 纵向必须保持 `visible`：指示条同样靠 `margin-right: -1px` 越出内容盒 1px 压住右边框，
       裁剪会削掉它（与横向的 `overflow-y` 同源，但这里两轴都不能裁剪）。见上方承重声明。 */
    overflow: visible;
    border-right: 1px solid var(--caomei-tabs-border, var(--caomei-color-border));
    border-bottom: none;
}
</style>
