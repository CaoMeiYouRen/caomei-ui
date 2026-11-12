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

/** 内容区重挂载键：只在状态或布局变化时切换，`value` 刷新不触发重挂载。 */
const contentKey = computed(() => {
    if (props.loading) {
        return 'loading'
    }
    if (isEmpty.value) {
        return 'empty'
    }
    return `ready-${props.layout}`
})
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

        <!--
          状态 + 布局键驱动重挂载：加载 / 空态 / 内容切换与列表 ↔ 网格切换都重放入场动画。
          布局切换本就替换 `#list` / `#grid` 插槽内容（不同插槽），故不额外损失消费方状态；
          `value` 刻意不入键——筛选 / 翻页刷新数据时不应重挂载消费方内容。
        -->
        <div
            :key="contentKey"
            class="caomei-data-view__content"
        >
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
    color: var(--caomei-color-primary-text);
}

/*
  动效轴（数据展示）：状态切换与列表 ↔ 网格切换都以透明度入场，只动 `opacity`、不触发布局。
  容器不带 `min-height`，入场前后内容高度由插槽内容决定（与迁移前逐值一致）。
*/
@media (prefers-reduced-motion: no-preference) {
    :where([data-motion='expressive']) .caomei-data-view__content {
        animation: caomei-data-view-content-in var(--caomei-motion-duration-base) var(--caomei-motion-ease-out);
    }
}

@keyframes caomei-data-view-content-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}
</style>
