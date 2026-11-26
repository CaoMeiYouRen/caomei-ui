<script setup lang="ts">
import { NavigationMenuLink } from 'reka-ui'
import type { NavigationMenuLinkProps } from './types'

defineOptions({ name: 'CaomeiNavigationMenuLink', inheritAttrs: false })

withDefaults(defineProps<NavigationMenuLinkProps>(), {
    active: false,
})
</script>

<template>
    <NavigationMenuLink
        v-bind="$attrs"
        :active="active"
        class="caomei-navigation-menu__link"
    >
        <slot />
    </NavigationMenuLink>
</template>

<style scoped>
.caomei-navigation-menu__link {
    display: block;
    padding: var(--caomei-navigation-menu-link-padding-y, var(--caomei-space-2)) var(--caomei-navigation-menu-link-padding-x, var(--caomei-space-2));
    border-radius: var(--caomei-radius-sm);
    color: var(--caomei-color-text);
    text-decoration: none;
}

.caomei-navigation-menu__link:hover,
.caomei-navigation-menu__link[data-active] {
    background: var(--caomei-navigation-menu-link-active-bg, var(--caomei-color-bg));
}

.caomei-navigation-menu__link:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
}
</style>
