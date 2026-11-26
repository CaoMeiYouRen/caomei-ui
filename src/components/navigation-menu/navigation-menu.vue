<script setup lang="ts">
import { NavigationMenuList, NavigationMenuRoot, NavigationMenuViewport } from 'reka-ui'
import type { NavigationMenuProps } from './types'

defineOptions({ name: 'CaomeiNavigationMenu', inheritAttrs: false })

withDefaults(defineProps<NavigationMenuProps>(), {
    delayDuration: 200,
    skipDelayDuration: 300,
    orientation: 'horizontal',
    dir: undefined,
})

/** 当前展开的菜单标识（`v-model`），对应各触发器的 `value` */
const modelValue = defineModel<string | undefined>('modelValue', { default: undefined })
</script>

<template>
    <NavigationMenuRoot
        v-bind="$attrs"
        v-model="modelValue"
        :delay-duration="delayDuration"
        :skip-delay-duration="skipDelayDuration"
        :orientation="orientation"
        :dir="dir"
        class="caomei-navigation-menu"
    >
        <NavigationMenuList class="caomei-navigation-menu__list">
            <slot />
        </NavigationMenuList>
        <NavigationMenuViewport class="caomei-navigation-menu__viewport" />
    </NavigationMenuRoot>
</template>

<!--
  尺寸切换不做 width/height 过渡：布局属性过渡违反动效契约（check-motion-contract）。
  描边 / 底色 / 阴影落在 viewport 而非面板：viewport 自身 overflow: hidden，
  面板与视口等大时阴影会被裁掉。
-->
<style scoped>
.caomei-navigation-menu {
    position: relative;
    display: flex;
    min-width: 0;
}

.caomei-navigation-menu__list {
    display: flex;
    align-items: center;
    gap: var(--caomei-navigation-menu-gap, var(--caomei-space-1));
    margin: 0;
    padding: var(--caomei-navigation-menu-padding, var(--caomei-space-1));
    border: 1px solid var(--caomei-navigation-menu-border, var(--caomei-color-border));
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-navigation-menu-bg, var(--caomei-color-bg-elevated));
    list-style: none;
}

.caomei-navigation-menu__viewport {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: var(--caomei-navigation-menu-z-index, var(--caomei-z-dropdown));
    width: var(--reka-navigation-menu-viewport-width);
    height: var(--reka-navigation-menu-viewport-height);
    overflow: hidden;
    border: 1px solid var(--caomei-navigation-menu-content-border, var(--caomei-color-border));
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-navigation-menu-content-bg, var(--caomei-color-bg-elevated));
    box-shadow: var(--caomei-shadow-md);
}
</style>
