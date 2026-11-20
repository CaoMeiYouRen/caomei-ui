<script setup lang="ts">
import { computed, inject, useSlots } from 'vue'
import { CaomeiIcon } from '../../icons'
import CaomeiBadge from '../badge/badge.vue'
import { caomeiTabbarContextKey } from './context'
import type { TabbarItemProps } from './types'

defineOptions({ name: 'CaomeiTabbarItem' })

const props = withDefaults(defineProps<TabbarItemProps>(), {
    label: '',
    disabled: false,
})

defineSlots<{
    /** 文案内容；作用域提供 `active` */
    default?: (props: { active: boolean }) => unknown
    /** 图标内容；作用域提供 `active` */
    icon?: (props: { active: boolean }) => unknown
}>()

const slots = useSlots()
const context = inject(caomeiTabbarContextKey, null)

const active = computed(() => context?.value.value === props.value)
const hasIcon = computed(() => [props.icon, slots.icon, props.badge].some((value) => value !== undefined))

function onClick(): void {
    if (props.disabled) {
        return
    }
    context?.select(props.value)
}
</script>

<template>
    <button
        type="button"
        class="caomei-tabbar-item"
        :class="{'caomei-tabbar-item--active': active}"
        :disabled="disabled"
        :aria-current="active ? 'page' : undefined"
        @click="onClick"
    >
        <span v-if="hasIcon" class="caomei-tabbar-item__icon">
            <slot name="icon" :active="active">
                <CaomeiBadge
                    v-if="badge !== undefined && icon"
                    :value="badge"
                    size="sm"
                >
                    <CaomeiIcon :icon="icon" />
                </CaomeiBadge>
                <CaomeiIcon
                    v-else-if="icon"
                    :icon="icon"
                />
                <CaomeiBadge
                    v-else-if="badge !== undefined"
                    :value="badge"
                    size="sm"
                />
            </slot>
        </span>
        <span class="caomei-tabbar-item__label">
            <slot :active="active">
                {{ label }}
            </slot>
        </span>
    </button>
</template>

<style scoped>
.caomei-tabbar-item {
    box-sizing: border-box;
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--caomei-tabbar-item-gap, var(--caomei-space-1));
    min-width: 0;
    min-height: var(--caomei-tabbar-item-min-height, var(--caomei-control-height-lg));
    padding: var(--caomei-space-1) var(--caomei-space-2);
    border: 0;
    border-radius: var(--caomei-radius-md);
    background: transparent;
    color: var(--caomei-color-text-muted);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-sm);
    line-height: 1.2;
    white-space: nowrap;
    cursor: pointer;
    transition: background-color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard), color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard);
}

.caomei-tabbar-item:hover:not(:disabled, .caomei-tabbar-item--active) {
    background: var(--caomei-color-bg-elevated);
}

.caomei-tabbar-item:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: -2px;
}

.caomei-tabbar-item:disabled {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-tabbar-item--active {
    background: color-mix(in srgb, var(--caomei-color-primary) 8%, transparent);
    color: var(--caomei-color-primary);
}

.caomei-tabbar-item__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: var(--caomei-tabbar-icon-size, 22px);
    line-height: 1;
}

.caomei-tabbar-item__label {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
}

@media (prefers-reduced-motion: reduce) {
    .caomei-tabbar-item {
        transition: none;
    }
}
</style>
