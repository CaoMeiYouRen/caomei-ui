<script setup lang="ts">
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
import { computed, useAttrs } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon, useInternalIcons } from '../../icons'
import type { OptionValue } from '../_shared/option'
import { useLabelAttrs, resolveLabelName } from '../_shared/use-label-attrs'
import { CaomeiSelect } from '../select'
import type { PaginatorProps } from './types'

defineOptions({ name: 'CaomeiPaginator', inheritAttrs: false })

const icons = useInternalIcons()

const props = withDefaults(defineProps<PaginatorProps>(), {
    itemsPerPage: 10,
    siblingCount: 2,
    showEdges: false,
    disabled: false,
})

const page = defineModel<number>('page', { default: 1 })

const emit = defineEmits<{
    'update:itemsPerPage': [value: number]
}>()

defineSlots<{
    /**
     * 报表插槽（渲染在页码列表之前），作用域为当前页 / 总页数 / 总条数
     * @en Report slot (rendered before the page list); scope is the current page / page count / total items
     */
    report?: (props: { page: number, pages: number, total: number }) => unknown
}>()

const locale = useLocale()
const attrs = useAttrs()
/** 可访问名优先级：显式 `label` > 透传 `aria-label` > 语言兜底文案 */
const label = computed(() => resolveLabelName(props.label, attrs['aria-label'], locale.value.pagination.label))
const forwardedAttrs = useLabelAttrs(() => label.value)
const firstLabel = computed(() => props.firstLabel ?? locale.value.pagination.first)
const previousLabel = computed(() => props.previousLabel ?? locale.value.pagination.previous)
const nextLabel = computed(() => props.nextLabel ?? locale.value.pagination.next)
const lastLabel = computed(() => props.lastLabel ?? locale.value.pagination.last)
const pageLabel = computed(() => props.pageLabel ?? locale.value.pagination.page)
const rowsPerPageLabel = computed(
    () => props.rowsPerPageLabel ?? locale.value.pagination.rowsPerPage,
)

/** 每页条数候选映射为 Select 的选项对象（本库 Select 仅接受对象选项） */
const rowsPerPageChoices = computed(() =>
    (props.rowsPerPageOptions ?? []).map((value) => ({ label: String(value), value })),
)

function resolvePageLabel(value: number): string {
    return pageLabel.value.replaceAll('{page}', String(value))
}

/**
 * 切换每页条数：向父级抛出 `update:itemsPerPage`，并按 PrimeVue 的偏移保持语义重新推导页码
 * （保留当前首行偏移 `(page - 1) * itemsPerPage`，而非无条件回到第 1 页）。
 * 仅接受候选内的值：Select 的模型面较宽（含 `null` / `undefined` / 字符串），此处按白名单收窄。
 */
function onRowsPerPageChange(value: OptionValue | null | undefined): void {
    const next = typeof value === 'number' ? value : Number(value)
    if (!Number.isFinite(next) || !props.rowsPerPageOptions?.includes(next)) {
        return
    }
    const first = Math.max(page.value - 1, 0) * props.itemsPerPage
    emit('update:itemsPerPage', next)
    page.value = Math.floor(first / next) + 1
}
</script>

<template>
    <PaginationRoot
        v-bind="forwardedAttrs"
        v-model:page="page"
        :items-per-page="itemsPerPage"
        :total="total"
        :sibling-count="siblingCount"
        :show-edges="showEdges"
        :disabled="disabled"
        class="caomei-paginator"
    >
        <template #default="{page: currentPage, pageCount}">
            <!-- div 而非 span：插槽内容可能含块级元素，span 会造成非法嵌套与 hydration 风险 -->
            <div v-if="$slots.report" class="caomei-paginator__report">
                <slot
                    name="report"
                    :page="currentPage"
                    :pages="pageCount"
                    :total="total"
                />
            </div>
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
                        <CaomeiIcon :icon="icons.chevronsLeft" />
                    </PaginationFirst>
                </li>
                <li class="caomei-paginator__item">
                    <PaginationPrev
                        class="caomei-paginator__control"
                        :aria-label="previousLabel"
                    >
                        <CaomeiIcon :icon="icons.chevronLeft" />
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
                        <CaomeiIcon :icon="icons.chevronRight" />
                    </PaginationNext>
                </li>
                <li v-if="showEdges" class="caomei-paginator__item">
                    <PaginationLast
                        class="caomei-paginator__control"
                        :aria-label="lastLabel"
                    >
                        <CaomeiIcon :icon="icons.chevronsRight" />
                    </PaginationLast>
                </li>
            </PaginationList>
            <span v-if="rowsPerPageChoices.length > 0" class="caomei-paginator__rows-per-page">
                <CaomeiSelect
                    :model-value="itemsPerPage"
                    :options="rowsPerPageChoices"
                    :label="rowsPerPageLabel"
                    :disabled="disabled"
                    size="sm"
                    @update:model-value="onRowsPerPageChange"
                />
            </span>
        </template>
    </PaginationRoot>
</template>

<style scoped>
/*
  `--caomei-paginator-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值。
*/
.caomei-paginator {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--caomei-paginator-gap, 4px);
}

/*
  每页条数选择器：外层收紧宽度，并经 `--caomei-select-max-width` 让内层字段跟随
  （Select 的宽度上限声明在字段包装层上，覆盖变量需作用于其祖先）。
*/
.caomei-paginator__rows-per-page {
    --caomei-select-max-width: 100%;

    display: inline-flex;
    width: var(--caomei-paginator-rows-width, 5rem);
}

/*
  选择器内部字段跟随 Paginator 的控制尺寸：Select 的 `size="sm"` 在触发器上直接声明
  `--caomei-field-height`（`:where()` 零特异性），故需在触发器本身上覆盖；高度固定为
  页码控件的 32px，默认密度与 `data-density="touch"` 下都不再随 sm 档（28 / 36）翻转。
  字号 / 图标 / 内边距仍由 `size="sm"` 决定，保持与页码控件一致。
*/
.caomei-paginator__rows-per-page :deep(.caomei-select) {
    --caomei-field-height: var(--caomei-paginator-control-size, 32px);
}

.caomei-paginator__report {
    display: inline-flex;
    align-items: center;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
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
    border: 1px solid var(--caomei-paginator-border, var(--caomei-color-control-border));
    border-radius: var(--caomei-paginator-radius, var(--caomei-radius-sm));
    background: var(--caomei-paginator-bg, var(--caomei-color-bg));
    color: var(--caomei-paginator-color, var(--caomei-color-text));
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-sm);
    cursor: pointer;
    transition: border-color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard), background-color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard), color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard);
}

.caomei-paginator__control:hover:not(:disabled, [data-selected='true']) {
    border-color: var(--caomei-color-primary);
    color: var(--caomei-color-primary-text);
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
    opacity: var(--caomei-disabled-opacity);
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
