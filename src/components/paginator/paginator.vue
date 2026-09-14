<script setup lang="ts">
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from '@lucide/vue'
import {
    PaginationEllipsis,
    PaginationFirst,
    PaginationLast,
    PaginationList,
    PaginationListItem,
    PaginationNext,
    PaginationPrev,
    PaginationRoot,
} from 'reka-ui'
import { computed } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon } from '../../icons'
import type { PaginatorProps } from './types'

defineOptions({ name: 'CaomeiPaginator' })

const props = withDefaults(defineProps<PaginatorProps>(), {
    itemsPerPage: 10,
    siblingCount: 2,
    showEdges: false,
    disabled: false,
})

const page = defineModel<number>('page', { default: 1 })

const locale = useLocale()
const label = computed(() => props.label ?? locale.value.pagination.label)
const firstLabel = computed(() => props.firstLabel ?? locale.value.pagination.first)
const previousLabel = computed(() => props.previousLabel ?? locale.value.pagination.previous)
const nextLabel = computed(() => props.nextLabel ?? locale.value.pagination.next)
const lastLabel = computed(() => props.lastLabel ?? locale.value.pagination.last)
const pageLabel = computed(() => props.pageLabel ?? locale.value.pagination.page)

function resolvePageLabel(value: number): string {
    return pageLabel.value.replaceAll('{page}', String(value))
}
</script>

<template>
    <PaginationRoot
        v-model:page="page"
        :items-per-page="itemsPerPage"
        :total="total"
        :sibling-count="siblingCount"
        :show-edges="showEdges"
        :disabled="disabled"
        :aria-label="label"
        class="caomei-paginator"
    >
        <PaginationList
            v-slot="{items}"
            as="ul"
            class="caomei-paginator__list"
        >
            <li v-if="showEdges" class="caomei-paginator__item">
                <PaginationFirst
                    class="caomei-paginator__control"
                    :aria-label="firstLabel"
                >
                    <CaomeiIcon :icon="ChevronsLeft" />
                </PaginationFirst>
            </li>
            <li class="caomei-paginator__item">
                <PaginationPrev
                    class="caomei-paginator__control"
                    :aria-label="previousLabel"
                >
                    <CaomeiIcon :icon="ChevronLeft" />
                </PaginationPrev>
            </li>
            <template
                v-for="(item, index) in items"
                :key="item.type === 'page' ? `page-${item.value}` : `ellipsis-${index}`"
            >
                <li v-if="item.type === 'ellipsis'" class="caomei-paginator__item">
                    <PaginationEllipsis
                        class="caomei-paginator__ellipsis"
                        aria-hidden="true"
                    />
                </li>
                <li v-else class="caomei-paginator__item">
                    <PaginationListItem
                        class="caomei-paginator__control"
                        :value="item.value"
                        :aria-label="resolvePageLabel(item.value)"
                    >
                        {{ item.value }}
                    </PaginationListItem>
                </li>
            </template>
            <li class="caomei-paginator__item">
                <PaginationNext
                    class="caomei-paginator__control"
                    :aria-label="nextLabel"
                >
                    <CaomeiIcon :icon="ChevronRight" />
                </PaginationNext>
            </li>
            <li v-if="showEdges" class="caomei-paginator__item">
                <PaginationLast
                    class="caomei-paginator__control"
                    :aria-label="lastLabel"
                >
                    <CaomeiIcon :icon="ChevronsRight" />
                </PaginationLast>
            </li>
        </PaginationList>
    </PaginationRoot>
</template>

<style scoped>
/*
  `--caomei-paginator-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值。
*/
.caomei-paginator {
    display: inline-flex;
}

.caomei-paginator__list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--caomei-paginator-gap, 4px);
    margin: 0;
    padding: 0;
    list-style: none;
}

/* 重置宿主页列表样式（如 VitePress `.vp-doc li + li`），避免页码项间距被抬高 */
.caomei-paginator__item {
    display: inline-flex;
    margin: 0;
}

.caomei-paginator__control {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: var(--caomei-paginator-control-size, 32px);
    height: var(--caomei-paginator-control-size, 32px);
    padding: 0 6px;
    border: 1px solid var(--caomei-paginator-border, var(--caomei-color-border));
    border-radius: var(--caomei-paginator-radius, var(--caomei-radius-sm));
    background: var(--caomei-paginator-bg, var(--caomei-color-bg));
    color: var(--caomei-paginator-color, var(--caomei-color-text));
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-sm);
    cursor: pointer;
    transition: border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease;
}

.caomei-paginator__control:hover:not(:disabled, [data-selected='true']) {
    border-color: var(--caomei-color-primary);
    color: var(--caomei-color-primary);
}

.caomei-paginator__control:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
}

.caomei-paginator__control[data-selected='true'] {
    border-color: var(--caomei-paginator-active-bg, var(--caomei-color-primary));
    background: var(--caomei-paginator-active-bg, var(--caomei-color-primary));
    color: var(--caomei-paginator-active-color, var(--caomei-color-primary-foreground));
}

.caomei-paginator__control:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.caomei-paginator__ellipsis {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: var(--caomei-paginator-control-size, 32px);
    height: var(--caomei-paginator-control-size, 32px);
    color: var(--caomei-color-text-muted);
}

@media (prefers-reduced-motion: reduce) {
    .caomei-paginator__control {
        transition: none;
    }
}
</style>
