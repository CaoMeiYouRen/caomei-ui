<script setup lang="ts">
import { DropdownMenuContent, DropdownMenuPortal } from 'reka-ui'
import { computed } from 'vue'
import { CaomeiIcon } from '../../icons'
import CaomeiDropdownMenuItem from './dropdown-menu-item.vue'
import CaomeiDropdownMenuSeparator from './dropdown-menu-separator.vue'
import type { DropdownMenuContentProps, DropdownMenuModelItem } from './types'

defineOptions({ name: 'CaomeiDropdownMenuContent', inheritAttrs: false })

const props = withDefaults(defineProps<DropdownMenuContentProps>(), {
    side: 'bottom',
    sideOffset: 4,
    align: 'start',
    alignOffset: 0,
    loop: true,
    forceMount: false,
})

const items = computed(() => props.model ?? [])

function onModelSelect(item: DropdownMenuModelItem, event: Event): void {
    item.command?.({ item, originalEvent: event })
}
</script>

<template>
    <DropdownMenuPortal>
        <DropdownMenuContent
            v-bind="$attrs"
            :side="side"
            :side-offset="sideOffset"
            :align="align"
            :align-offset="alignOffset"
            :loop="loop"
            :force-mount="forceMount"
            class="caomei-dropdown-menu__content"
        >
            <template
                v-for="(item, index) in items"
                :key="item.separator ? `separator-${index}` : `${item.label ?? 'item'}-${index}`"
            >
                <CaomeiDropdownMenuSeparator v-if="item.separator" />
                <CaomeiDropdownMenuItem
                    v-else
                    :disabled="item.disabled"
                    :text-value="item.label"
                    @select="onModelSelect(item, $event)"
                >
                    <span class="caomei-dropdown-menu__model-item">
                        <CaomeiIcon
                            v-if="item.icon"
                            :icon="item.icon"
                        />
                        <span v-if="item.label">{{ item.label }}</span>
                    </span>
                </CaomeiDropdownMenuItem>
            </template>
            <slot />
        </DropdownMenuContent>
    </DropdownMenuPortal>
</template>

<!--
  Portal 面板样式说明：面板经 DropdownMenuPortal 挂载到 body，scoped 的 data-v 属性
  落在 popper 包裹层而非面板本体，因此改用命名空间化的非 scoped 规则（同 Select）。
-->
<style>
.caomei-dropdown-menu__content {
    box-sizing: border-box;
    z-index: var(--caomei-dropdown-menu-z-index, var(--caomei-z-dropdown));
    display: flex;
    flex-direction: column;

    /*
    窄屏收敛：宽度上限取 popper 可用宽（与触发器宽同源，见 responsive.md §3 矩阵 #3）；
    min-width 同步用 min() 收敛，否则 min-width 会压过 max-width 导致越界。
    桌面下可用宽远大于自然宽度，无表现变化。
     */
    min-width: min(var(--caomei-dropdown-menu-min-width, 9rem), var(--reka-dropdown-menu-content-available-width));
    max-width: var(--reka-dropdown-menu-content-available-width, none);
    max-height: var(--reka-dropdown-menu-content-available-height);
    padding: var(--caomei-dropdown-menu-padding, var(--caomei-space-1));
    overflow: hidden auto;
    border: 1px solid var(--caomei-dropdown-menu-border, var(--caomei-color-border));
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-dropdown-menu-bg, var(--caomei-color-bg));
    color: var(--caomei-color-text);
    box-shadow: var(--caomei-shadow-md);
    font-family: var(--caomei-font-sans);
    transform-origin: var(--reka-dropdown-menu-content-transform-origin);
    animation: caomei-dropdown-menu-in 0.12s ease-out;
}

.caomei-dropdown-menu__group {
    display: flex;
    flex-direction: column;
}

.caomei-dropdown-menu__model-item {
    display: inline-flex;
    align-items: center;
    gap: var(--caomei-dropdown-menu-item-gap, var(--caomei-space-2));
}

.caomei-dropdown-menu__item {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: var(--caomei-dropdown-menu-item-gap, var(--caomei-space-2));
    padding: var(--caomei-dropdown-menu-item-padding-y, var(--caomei-space-2)) var(--caomei-dropdown-menu-item-padding-x, var(--caomei-space-2));
    border-radius: var(--caomei-radius-sm);
    color: var(--caomei-color-text);
    font-size: var(--caomei-font-size-md);
    line-height: 1.4;
    cursor: pointer;
    user-select: none;
    outline: none;
}

.caomei-dropdown-menu__item[data-highlighted] {
    background: var(--caomei-dropdown-menu-item-highlighted-bg, var(--caomei-color-bg-elevated));
}

.caomei-dropdown-menu__item[data-disabled] {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-dropdown-menu__item-text {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.caomei-dropdown-menu__indicator {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: var(--caomei-dropdown-menu-indicator-width, 1em);
    height: 1em;
    color: var(--caomei-color-primary);
}

.caomei-dropdown-menu__shortcut {
    flex-shrink: 0;
    margin-left: auto;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
    letter-spacing: 0.05em;
}

.caomei-dropdown-menu__label {
    padding: var(--caomei-space-1) var(--caomei-space-2);
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
    font-weight: 500;
}

.caomei-dropdown-menu__separator {
    height: 1px;
    margin: var(--caomei-space-1) 0;
    background: var(--caomei-dropdown-menu-separator-color, var(--caomei-color-border));
}

@keyframes caomei-dropdown-menu-in {
    from {
        opacity: 0;
        transform: scale(0.96);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

@media (prefers-reduced-motion: reduce) {
    .caomei-dropdown-menu__content {
        animation: none;
    }
}
</style>
