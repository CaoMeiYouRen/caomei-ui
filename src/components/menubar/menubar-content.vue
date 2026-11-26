<script setup lang="ts">
import { MenubarContent, MenubarPortal } from 'reka-ui'
import type { MenubarContentProps } from './types'

defineOptions({ name: 'CaomeiMenubarContent', inheritAttrs: false })

// 菜单栏为非模态浮层（Reka `MenubarMenu` 固定 `modal: false`）：
// 不做打开态整页隔离，点击外部或切换触发器即关闭，背景保持可交互。

withDefaults(defineProps<MenubarContentProps>(), {
    side: 'bottom',
    sideOffset: 4,
    align: 'start',
    alignOffset: 0,
    loop: true,
    forceMount: false,
})
</script>

<template>
    <MenubarPortal>
        <MenubarContent
            v-bind="$attrs"
            :side="side"
            :side-offset="sideOffset"
            :align="align"
            :align-offset="alignOffset"
            :loop="loop"
            :force-mount="forceMount"
            class="caomei-menubar__content"
        >
            <slot />
        </MenubarContent>
    </MenubarPortal>
</template>

<!--
  portal 面板的内容挂在 body 下，scoped 作用域不会命中；
  与 dropdown-menu / popover / context-menu 一致，改为命名空间化非 scoped 块。
-->
<style>
.caomei-menubar__content {
    box-sizing: border-box;
    z-index: var(--caomei-menubar-z-index, var(--caomei-z-dropdown));
    display: flex;
    flex-direction: column;
    min-width: min(var(--caomei-menubar-min-width, 9rem), var(--reka-menubar-content-available-width));
    max-width: var(--reka-menubar-content-available-width, none);
    max-height: var(--reka-menubar-content-available-height);
    padding: var(--caomei-menubar-content-padding, var(--caomei-space-1));
    overflow: hidden auto;
    border: 1px solid var(--caomei-menubar-content-border, var(--caomei-color-border));
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-menubar-content-bg, var(--caomei-color-bg-elevated));
    color: var(--caomei-color-text);
    box-shadow: var(--caomei-shadow-md);
    font-family: var(--caomei-font-sans);
    transform-origin: var(--reka-menubar-content-transform-origin);
}
</style>
