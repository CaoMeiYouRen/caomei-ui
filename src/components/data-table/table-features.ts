import { tableFeatures } from '@tanstack/vue-table'

/**
 * DataTable 使用的无头表格特性集。
 *
 * 当前仅需核心行列模型；排序、分页、行选择等能力按 Tier 0 范围暂不启用，
 * 后续扩展时在此集中开启，避免每个组件实例重复构造。
 */
export const dataTableFeatures = tableFeatures({})
