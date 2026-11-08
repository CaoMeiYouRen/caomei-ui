<script setup lang="ts">
import { computed } from 'vue'
import type { MenuItemProps } from './types'

defineOptions({ name: 'CaomeiMenuItem' })

const props = withDefaults(defineProps<MenuItemProps>(), {
    href: '',
    disabled: false,
    current: false,
})

defineSlots<{
    default?: () => unknown
}>()

/** `true` 归一为 `page`；`false` 不渲染属性。 */
const ariaCurrent = computed(() => {
    if (props.current === false) {
        return undefined
    }
    return props.current === true ? 'page' : props.current
})

/** 禁用态输出 `aria-disabled`（链接另去 `href` 与 Tab 停靠点）。 */
const ariaDisabled = computed(() => (props.disabled ? 'true' : undefined))
</script>

<template>
    <li class="caomei-menu__item-wrapper">
        <a
            v-if="href"
            class="caomei-menu__item"
            data-caomei-menu-target
            :href="disabled ? undefined : href"
            :tabindex="disabled ? -1 : undefined"
            :aria-disabled="ariaDisabled"
            :aria-current="ariaCurrent"
        >
            <slot />
        </a>
        <button
            v-else
            class="caomei-menu__item"
            data-caomei-menu-target
            type="button"
            :disabled="disabled"
            :aria-disabled="ariaDisabled"
            :aria-current="ariaCurrent"
        >
            <slot />
        </button>
    </li>
</template>

<style scoped>
/*
  项外观由 `menu.vue` 的非 scoped 块统一提供（MenuItem 与 SubMenu 触发器共用）。
  约束：两者须在 `<CaomeiMenu>` 内使用；单独渲染 MenuItem 不会带入 `.caomei-menu` 前缀的共享样式。
*/
.caomei-menu__item-wrapper {
    min-width: 0;

    /* 复位宿主文档对相邻 `li` 的间距，避免菜单项间距被放大 */
    margin-block: 0;
}
</style>
