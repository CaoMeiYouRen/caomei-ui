<script setup lang="ts">
import { ToolbarLink } from 'reka-ui'
import { useLabelAttrs } from '../_shared/use-label-attrs'
import type { ToolbarLinkProps } from './types'

defineOptions({ name: 'CaomeiToolbarLink', inheritAttrs: false })

const props = withDefaults(defineProps<ToolbarLinkProps>(), {
    label: '',
})

/** label 属性优先于透传的 aria-label；二者都缺省时由可见文本推导可访问名 */
const forwardedAttrs = useLabelAttrs(() => props.label)
</script>

<template>
    <ToolbarLink
        v-bind="forwardedAttrs"
        class="caomei-toolbar__link"
    >
        <slot />
    </ToolbarLink>
</template>

<style scoped>
.caomei-toolbar__link {
    box-sizing: border-box;
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    gap: var(--caomei-toolbar-button-gap, var(--caomei-space-1));
    height: var(--caomei-toolbar-button-size, var(--caomei-control-height-md));
    padding: 0 var(--caomei-toolbar-button-padding-x, var(--caomei-space-2));
    border-radius: var(--caomei-toolbar-button-radius, var(--caomei-radius-sm));
    color: var(--caomei-color-text);
    font-size: var(--caomei-font-size-md);
    text-decoration: none;
    white-space: nowrap;
    transition: background-color 0.15s ease, color 0.15s ease;
}

.caomei-toolbar__link:hover {
    background: var(--caomei-color-bg-elevated);
}

.caomei-toolbar__link:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: -2px;
}

@media (prefers-reduced-motion: reduce) {
    .caomei-toolbar__link {
        transition: none;
    }
}
</style>
