<script setup lang="ts">
import { computed, provide } from 'vue'
import { caomeiBreadcrumbContextKey } from './context'
import type { BreadcrumbProps } from './types'

defineOptions({ name: 'CaomeiBreadcrumb' })

const props = withDefaults(defineProps<BreadcrumbProps>(), {
    label: '',
    separator: '/',
})

defineSlots<{
    default?: () => unknown
}>()

/*
  只下发分隔符文本；**首项不显示分隔符**由容器 CSS 按**渲染位置**（`:first-child`）判定——
  序号若在 setup 期登记，动态项集（`v-for` + `:key` 换键 / 删首项）下会与 DOM 位置脱钩，
  首项会渲染出前置分隔符（Review Gate 抓出）。
*/
provide(caomeiBreadcrumbContextKey, {
    separator: computed(() => props.separator),
})
</script>

<template>
    <nav
        :aria-label="label || undefined"
        class="caomei-breadcrumb"
    >
        <ol class="caomei-breadcrumb__list">
            <slot />
        </ol>
    </nav>
</template>

<style scoped>
.caomei-breadcrumb {
    box-sizing: border-box;
    color: var(--caomei-color-text-muted);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-breadcrumb-font-size, var(--caomei-font-size-md));
}

.caomei-breadcrumb__list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin: 0;
    padding: 0;
    list-style: none;
}
</style>
