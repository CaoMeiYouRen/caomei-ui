<script setup lang="ts">
import { DropdownMenuTrigger, injectDropdownMenuRootContext } from 'reka-ui'
import { useId } from 'vue'
import { registerPanelIdref, usePanelIdrefState, type PanelIdrefContext } from '../_shared/panel-idref'
import type { DropdownMenuTriggerProps } from './types'

defineOptions({ name: 'CaomeiDropdownMenuTrigger', inheritAttrs: false })

const props = withDefaults(defineProps<DropdownMenuTriggerProps>(), {
    disabled: false,
    unstyled: false,
})

/**
 * 面板 idref 接线（契约与理由见 `_shared/panel-idref`）：把面板 id 预注册进浮层上下文，
 * 使 Reka 触发器自身的 `aria-controls: open ? contentId : void 0` 绑定在两态下都正确——
 * 关闭态省略（面板未挂载）、开启态指向面板 id（`contentId` 不再是面板挂载后才补的空串）。
 *
 * 注：触发器上的 `aria-controls` 由 Reka 内部绑定遮蔽 fallthrough（`Slot` 合并时子节点胜），
 * 本组件不额外覆盖该属性；「显式非空取值优先」仅适用于无内部绑定的接线点（多选 / 自动完成字段）。
 */
const panelIdref = usePanelIdrefState(`caomei-dropdown-menu-panel-${useId()}`)
registerPanelIdref(injectDropdownMenuRootContext() as unknown as PanelIdrefContext, panelIdref)
</script>

<template>
    <DropdownMenuTrigger
        v-bind="$attrs"
        :disabled="props.disabled || undefined"
        :class="props.unstyled ? undefined : 'caomei-dropdown-menu__trigger'"
    >
        <slot />
    </DropdownMenuTrigger>
</template>

<style scoped>
.caomei-dropdown-menu__trigger {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    gap: var(--caomei-dropdown-menu-trigger-gap, var(--caomei-space-1));
    padding: var(--caomei-dropdown-menu-trigger-padding-y, var(--caomei-space-2)) var(--caomei-dropdown-menu-trigger-padding-x, var(--caomei-space-3));
    border: 1px solid var(--caomei-dropdown-menu-trigger-border, var(--caomei-color-border));
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-dropdown-menu-trigger-bg, var(--caomei-color-bg));
    color: var(--caomei-color-text);
    font: inherit;
    font-size: var(--caomei-font-size-md);
    line-height: 1.4;
    white-space: nowrap;
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease;
}

.caomei-dropdown-menu__trigger:hover:not([data-disabled]),
.caomei-dropdown-menu__trigger[data-state='open'] {
    background: var(--caomei-color-bg-elevated);
}

.caomei-dropdown-menu__trigger:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
}

.caomei-dropdown-menu__trigger[data-disabled] {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

@media (prefers-reduced-motion: reduce) {
    .caomei-dropdown-menu__trigger {
        transition: none;
    }
}
</style>
