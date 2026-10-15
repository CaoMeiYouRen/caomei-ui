<script setup lang="ts">
import { computed, inject } from 'vue'
import { caomeiBreadcrumbContextKey } from './context'
import type { BreadcrumbItemProps } from './types'

defineOptions({ name: 'CaomeiBreadcrumbItem' })

withDefaults(defineProps<BreadcrumbItemProps>(), {
    href: '',
    current: false,
})

defineSlots<{
    default?: () => unknown
}>()

const context = inject(caomeiBreadcrumbContextKey, null)

/** 分隔符文本来自容器；**首项隐藏**由容器 CSS 按渲染位置处理（见 `breadcrumb.vue`）。 */
const separator = computed(() => context?.separator.value ?? '/')
</script>

<template>
    <li class="caomei-breadcrumb__item">
        <span
            class="caomei-breadcrumb__separator"
            aria-hidden="true"
        >{{ separator }}</span>
        <a
            v-if="href"
            class="caomei-breadcrumb__link"
            :href="href"
            :aria-current="current ? 'page' : undefined"
        >
            <slot />
        </a>
        <span
            v-else
            class="caomei-breadcrumb__text"
            :aria-current="current ? 'page' : undefined"
        >
            <slot />
        </span>
    </li>
</template>

<style scoped>
.caomei-breadcrumb__item {
    display: inline-flex;
    align-items: center;
    min-width: 0;
    gap: var(--caomei-breadcrumb-gap, var(--caomei-space-2));
}

.caomei-breadcrumb__separator {
    color: var(--caomei-breadcrumb-separator-color, var(--caomei-color-border));
}

/*
  首项的分隔符按**渲染位置**隐藏（与项集是否动态变化无关；序号式实现在 `v-for` 换键 /
  删首项后会与 DOM 位置脱钩，首项会渲染出前置分隔符）。规则落在项自身的作用域块内：
  scoped 只为最后一个选择器附加 scope id，跨组件（容器 → 项）选择器匹配不到。
*/
.caomei-breadcrumb__item:first-child .caomei-breadcrumb__separator {
    display: none;
}

.caomei-breadcrumb__link {
    border-radius: var(--caomei-radius-sm);
    color: inherit;
    text-decoration: none;
}

.caomei-breadcrumb__link:hover {
    color: var(--caomei-breadcrumb-link-hover-color, var(--caomei-color-primary));
}

.caomei-breadcrumb__link:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
}

.caomei-breadcrumb__item [aria-current='page'] {
    color: var(--caomei-breadcrumb-current-color, var(--caomei-color-text));
    font-weight: 600;
}
</style>
