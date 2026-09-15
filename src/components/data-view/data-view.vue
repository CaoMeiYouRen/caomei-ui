<script setup lang="ts" generic="T extends object">
import { computed } from 'vue'
import { useLocale } from '../../composables/use-locale'
import type { DataViewLayout, DataViewProps } from './types'

defineOptions({ name: 'CaomeiDataView' })

const props = withDefaults(defineProps<DataViewProps<T>>(), {
    layout: 'list',
    loading: false,
})

defineSlots<{
    /**
     * 头部区域（如布局切换、筛选等操作）
     * @en Header area (e.g. layout switch or filters)
     */
    header?: () => unknown
    /**
     * 底部区域
     * @en Footer area
     */
    footer?: () => unknown
    /**
     * 空态内容；缺省渲染 `emptyText`
     * @en Empty-state content; renders `emptyText` by default
     */
    empty?: (props: { layout: DataViewLayout }) => unknown
    /**
     * 列表布局内容；`items` 为当前数据（与 `value` 相同）
     * @en List-layout content; `items` is the current data (same as `value`)
     */
    list?: (props: { items: T[] }) => unknown
    /**
     * 网格布局内容；`items` 为当前数据（与 `value` 相同）
     * @en Grid-layout content; `items` is the current data (same as `value`)
     */
    grid?: (props: { items: T[] }) => unknown
}>()

const locale = useLocale()
const emptyText = computed(() => props.emptyText ?? locale.value.dataView.empty)
const loadingText = computed(() => props.loadingText ?? locale.value.progress.loading)

const items = computed<T[]>(() => props.value ?? [])
const isEmpty = computed(() => items.value.length === 0)
</script>

<template>
    <div
        class="caomei-data-view"
        :class="`caomei-data-view--${layout}`"
        :aria-busy="loading || undefined"
    >
        <div v-if="$slots.header" class="caomei-data-view__header">
            <slot name="header" />
        </div>

        <div class="caomei-data-view__content">
            <div v-if="loading" class="caomei-data-view__loading">
                {{ loadingText }}
            </div>
            <div v-else-if="isEmpty" class="caomei-data-view__empty">
                <slot name="empty" :layout="layout">
                    {{ emptyText }}
                </slot>
            </div>
            <slot
                v-else-if="layout === 'grid'"
                name="grid"
                :items="items"
            />
            <slot
                v-else
                name="list"
                :items="items"
            />
        </div>

        <div v-if="$slots.footer" class="caomei-data-view__footer">
            <slot name="footer" />
        </div>
    </div>
</template>

<style scoped>
.caomei-data-view {
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-md);
}

.caomei-data-view__header,
.caomei-data-view__footer {
    padding: var(--caomei-space-2) 0;
}

.caomei-data-view__empty,
.caomei-data-view__loading {
    padding: calc(var(--caomei-space-4) + var(--caomei-space-2)) var(--caomei-space-3);
    color: var(--caomei-color-text-muted);
    text-align: center;
}

.caomei-data-view__loading {
    color: var(--caomei-color-primary);
}
</style>
