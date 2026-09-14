import {
    columnPinningFeature,
    createPaginatedRowModel,
    createSortedRowModel,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,
    sortFn_alphanumeric,
    sortFn_basic,
    sortFn_text,
    tableFeatures,
} from '@tanstack/vue-table'

/**
 * DataTable 使用的无头表格特性集。
 *
 * 已启用：核心行列模型 + 排序（含受控 / 非受控）+ 行选择 + 分页 + 列冻结。
 */
export const dataTableFeatures = tableFeatures({
    rowSortingFeature,
    rowSelectionFeature,
    rowPaginationFeature,
    columnPinningFeature,
    sortedRowModel: createSortedRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
    sortFns: {
        alphanumeric: sortFn_alphanumeric,
        text: sortFn_text,
        basic: sortFn_basic,
    },
})
