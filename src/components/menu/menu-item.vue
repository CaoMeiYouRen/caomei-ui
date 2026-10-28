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
/* 项外观对链接与按钮同构（`a` 也需复位，故两选择器共用一组声明）。 */
.caomei-menu__item-wrapper {
    min-width: 0;
}

.caomei-menu__item {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: var(--caomei-menu-item-gap, var(--caomei-space-2));
    width: 100%;
    padding: var(--caomei-menu-item-padding, var(--caomei-space-2) var(--caomei-space-3));
    border: 0;
    border-radius: var(--caomei-menu-item-radius, var(--caomei-radius-md));
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: start;
    text-decoration: none;
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease;
}

.caomei-menu__item:hover:not([aria-disabled='true']) {
    background: var(--caomei-menu-item-hover-bg, var(--caomei-color-bg-elevated));
}

.caomei-menu__item:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: -2px;
}

.caomei-menu__item[aria-current] {
    background: var(--caomei-menu-item-current-bg, var(--caomei-color-bg-elevated));
    color: var(--caomei-menu-item-current-color, var(--caomei-color-primary-text));
    font-weight: 600;
}

.caomei-menu__item[aria-disabled='true'] {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

@media (prefers-reduced-motion: reduce) {
    .caomei-menu__item {
        transition: none;
    }
}
</style>
