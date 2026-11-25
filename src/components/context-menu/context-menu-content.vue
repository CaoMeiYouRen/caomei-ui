<script setup lang="ts">
import { ContextMenuContent, ContextMenuPortal } from 'reka-ui'
import { computed, inject, ref } from 'vue'
import { CaomeiIcon } from '../../icons'
import { onBeforeUnmount, onMounted } from 'vue'
import { panelElementKey, triggerElementKey } from '../_shared/trigger-element'
import { useOpenStateIsolation } from '../_shared/use-open-state-isolation'
import CaomeiContextMenuItem from './context-menu-item.vue'
import CaomeiContextMenuSeparator from './context-menu-separator.vue'
import type { ContextMenuContentProps, ContextMenuModelItem } from './types'

defineOptions({ name: 'CaomeiContextMenuContent', inheritAttrs: false })

const props = withDefaults(defineProps<ContextMenuContentProps>(), {
    loop: true,
    forceMount: false,
})

const contentRef = ref<{ $el?: unknown } | null>(null)
const triggerRef = inject(triggerElementKey, null)
const panelEl = inject(panelElementKey, null)

onMounted(() => {
    const element = contentRef.value?.$el
    if (panelEl && element instanceof HTMLElement) {
        panelEl.value = element
    }
})

onBeforeUnmount(() => {
    if (panelEl && panelEl.value === contentRef.value?.$el) {
        panelEl.value = null
    }
})

const { release, sync } = useOpenStateIsolation(contentRef, () => [triggerRef?.value])

const items = computed(() => props.model ?? [])

function onModelSelect(item: ContextMenuModelItem, event: Event): void {
    item.command?.({ item, originalEvent: event })
}
</script>

<template>
    <ContextMenuPortal>
        <ContextMenuContent
            ref="contentRef"
            v-bind="$attrs"
            :loop="loop"
            :force-mount="forceMount"
            class="caomei-context-menu__content"
            @open-auto-focus="sync"
            @close-auto-focus="release"
        >
            <template
                v-for="(item, index) in items"
                :key="item.separator ? `separator-${index}` : `${item.label ?? 'item'}-${index}`"
            >
                <CaomeiContextMenuSeparator v-if="item.separator" />
                <CaomeiContextMenuItem
                    v-else
                    :disabled="item.disabled"
                    :shortcut="item.shortcut"
                    :danger="item.danger"
                    :text-value="item.label"
                    :class="item.class"
                    @select="onModelSelect(item, $event)"
                >
                    <span class="caomei-context-menu__model-item">
                        <CaomeiIcon
                            v-if="item.icon"
                            :icon="item.icon"
                        />
                        <span v-if="item.label">{{ item.label }}</span>
                    </span>
                </CaomeiContextMenuItem>
            </template>
            <slot />
        </ContextMenuContent>
    </ContextMenuPortal>
</template>

<!--
  Portal 面板样式说明：面板经 ContextMenuPortal 挂到 body，scoped 的 data-v 落在 popper 包裹层
  而非面板本体，因此使用命名空间化的非 scoped 规则（同 DropdownMenu）。
-->
<style>
.caomei-context-menu__content {
    box-sizing: border-box;
    z-index: var(--caomei-context-menu-z-index, var(--caomei-z-dropdown));
    display: flex;
    flex-direction: column;
    min-width: var(--caomei-context-menu-min-width, 10rem);
    max-height: var(--reka-context-menu-content-available-height, calc(100vh - 2rem));
    padding: var(--caomei-context-menu-padding, var(--caomei-space-1));
    overflow: auto;
    border: 1px solid var(--caomei-context-menu-border, var(--caomei-color-border));
    border-radius: var(--caomei-context-menu-radius, var(--caomei-radius-md));
    background: var(--caomei-context-menu-bg, var(--caomei-color-bg-elevated));
    color: var(--caomei-color-text);
    box-shadow: var(--caomei-shadow-md);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-md);
    outline: none;
    transform-origin: var(--reka-context-menu-content-transform-origin);
    animation: caomei-context-menu-in var(--caomei-motion-duration-fast) var(--caomei-motion-ease-out);
}

.caomei-context-menu__group {
    display: flex;
    flex-direction: column;
}

.caomei-context-menu__label {
    padding: var(--caomei-space-2) var(--caomei-space-3);
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
    line-height: 1.4;
}

.caomei-context-menu__item {
    display: flex;
    align-items: center;
    gap: var(--caomei-space-2);
    box-sizing: border-box;
    width: 100%;
    padding: var(--caomei-context-menu-item-padding-y, var(--caomei-space-2)) var(--caomei-space-3);
    border: 0;
    border-radius: var(--caomei-radius-sm);
    background: transparent;
    color: var(--caomei-color-text);
    font: inherit;
    font-size: var(--caomei-font-size-md);
    line-height: 1.4;
    text-align: start;
    cursor: pointer;
    user-select: none;
}

.caomei-context-menu__item[data-highlighted] {
    background: var(--caomei-context-menu-item-highlighted-bg, var(--caomei-color-bg-elevated));
}

.caomei-context-menu__item--danger {
    color: var(--caomei-color-danger-text);
}

.caomei-context-menu__item--danger[data-highlighted] {
    background: var(--caomei-context-menu-danger-bg, color-mix(in srgb, var(--caomei-color-danger) 12%, transparent));
}

.caomei-context-menu__item[data-disabled] {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-context-menu__item-text,
.caomei-context-menu__model-item {
    display: inline-flex;
    flex: 1;
    align-items: center;
    gap: var(--caomei-space-2);
    min-width: 0;
}

.caomei-context-menu__item-text {
    flex-direction: column;
    align-items: flex-start;
    gap: 0;
}

.caomei-context-menu__shortcut {
    flex-shrink: 0;
    margin-left: auto;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
    letter-spacing: 0.02em;
}

.caomei-context-menu__separator {
    height: 1px;
    margin: var(--caomei-space-1) 0;
    background: var(--caomei-color-border);
}

@keyframes caomei-context-menu-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@media (prefers-reduced-motion: reduce) {
    .caomei-context-menu__content {
        animation: none;
    }
}
</style>
