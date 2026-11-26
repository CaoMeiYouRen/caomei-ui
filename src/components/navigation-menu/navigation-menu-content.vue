<script setup lang="ts">
import { NavigationMenuContent } from 'reka-ui'
import type { NavigationMenuContentProps } from './types'

defineOptions({ name: 'CaomeiNavigationMenuContent', inheritAttrs: false })

withDefaults(defineProps<NavigationMenuContentProps>(), {
    forceMount: false,
})
</script>

<template>
    <NavigationMenuContent
        v-bind="$attrs"
        :force-mount="forceMount"
        :role="($attrs.role as string | undefined) ?? 'group'"
        class="caomei-navigation-menu__content"
    >
        <slot />
    </NavigationMenuContent>
</template>

<!--
  Reka 把内容 Teleport 到 viewport（在根组件模板内），但 scoped 作用域不会随内容穿透，
  故使用命名空间化非 scoped 块；与 menubar / dropdown-menu 的面板写法一致。
-->
<style>
.caomei-navigation-menu__content {
    box-sizing: border-box;
    position: absolute;
    top: 0;
    left: 0;
    min-width: var(--caomei-navigation-menu-content-min-width, 12rem);
    padding: var(--caomei-navigation-menu-content-padding, var(--caomei-space-2));
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
}
</style>
