<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'
import {
    AccordionContent,
    AccordionHeader,
    AccordionItem,
    AccordionTrigger,
} from 'reka-ui'
import { CaomeiIcon } from '../../icons'
import type { AccordionItemProps } from './types'

defineOptions({ name: 'CaomeiAccordionItem', inheritAttrs: false })

withDefaults(defineProps<AccordionItemProps>(), {
    title: '',
    disabled: false,
})

/**
 * 折叠触发器**不输出** `aria-controls`：Reka 的 `Collapsible` 把内容 id 放在非响应式上下文字段、
 * 并在内容挂载时才赋值，导致关闭态为空串、初始即展开时保持空串、展开后收起则残留已卸载元素的旧
 * id——三态皆为空 / 悬空引用。`aria-controls` 在 ARIA 折叠模式中为**可选**属性，触发器的
 * `aria-expanded` 与内容 `role="region"` 的 `aria-labelledby` 已完整表达两者关系，故统一省略，
 * 不再让不可靠的上游取值泄漏到 DOM。
 */
const triggerAria = { 'aria-controls': null } as const
</script>

<template>
    <AccordionItem
        v-bind="$attrs"
        :value="value"
        :disabled="disabled"
        class="caomei-accordion__item"
    >
        <AccordionHeader class="caomei-accordion__header">
            <AccordionTrigger
                v-bind="triggerAria"
                class="caomei-accordion__trigger"
            >
                <span class="caomei-accordion__title">
                    <slot name="trigger">{{ title }}</slot>
                </span>
                <CaomeiIcon
                    :icon="ChevronDown"
                    class="caomei-accordion__chevron"
                />
            </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent class="caomei-accordion__content">
            <div class="caomei-accordion__panel">
                <slot />
            </div>
        </AccordionContent>
    </AccordionItem>
</template>

<style scoped>
.caomei-accordion__item + .caomei-accordion__item {
    border-top: 1px solid var(--caomei-accordion-border, var(--caomei-color-border));
}

.caomei-accordion__header {
    margin: 0;
}

.caomei-accordion__trigger {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--caomei-accordion-trigger-gap, var(--caomei-space-3));
    width: 100%;
    padding: var(--caomei-accordion-trigger-padding-y, var(--caomei-space-3)) var(--caomei-accordion-trigger-padding-x, var(--caomei-space-4));
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    font-size: var(--caomei-font-size-md);
    font-weight: 500;
    line-height: 1.4;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.15s ease;
}

.caomei-accordion__trigger:hover:not([data-disabled]) {
    background: var(--caomei-color-bg-elevated);
}

.caomei-accordion__trigger:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: -2px;
}

.caomei-accordion__trigger[data-disabled] {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-accordion__title {
    display: inline-flex;
    align-items: center;
    gap: var(--caomei-accordion-title-gap, var(--caomei-space-2));
}

.caomei-accordion__chevron {
    color: var(--caomei-color-text-muted);
    transition: transform 0.2s ease;
}

.caomei-accordion__trigger[data-state='open'] .caomei-accordion__chevron {
    transform: rotate(180deg);
}

.caomei-accordion__content {
    overflow: hidden;
    font-size: var(--caomei-font-size-md);
    line-height: 1.6;
}

.caomei-accordion__content[data-state='open'] {
    animation: caomei-accordion-slide-down 0.2s ease-out;
}

.caomei-accordion__content[data-state='closed'] {
    animation: caomei-accordion-slide-up 0.2s ease-out;
}

.caomei-accordion__panel {
    padding: var(--caomei-accordion-panel-padding, var(--caomei-space-3)) var(--caomei-accordion-trigger-padding-x, var(--caomei-space-4));
}

@keyframes caomei-accordion-slide-down {
    from {
        height: 0;
    }

    to {
        height: var(--reka-accordion-content-height);
    }
}

@keyframes caomei-accordion-slide-up {
    from {
        height: var(--reka-accordion-content-height);
    }

    to {
        height: 0;
    }
}

@media (prefers-reduced-motion: reduce) {
    .caomei-accordion__trigger {
        transition: none;
    }

    .caomei-accordion__chevron {
        transition: none;
    }

    .caomei-accordion__content[data-state='open'],
    .caomei-accordion__content[data-state='closed'] {
        animation: none;
    }
}
</style>
