<script setup lang="ts">
import { computed, inject } from 'vue'
import { CaomeiTooltipText } from '../tooltip'
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
            class="caomei-breadcrumb__link caomei-hit-target"
            :href="href"
            :aria-current="current ? 'page' : undefined"
        >
            <CaomeiTooltipText
                class="caomei-breadcrumb__label"
                mode="auto"
            >
                <slot />
            </CaomeiTooltipText>
        </a>
        <span
            v-else
            class="caomei-breadcrumb__text"
            :aria-current="current ? 'page' : undefined"
        >
            <CaomeiTooltipText
                class="caomei-breadcrumb__label"
                mode="auto"
            >
                <slot />
            </CaomeiTooltipText>
        </span>
    </li>
</template>

<style scoped>
.caomei-breadcrumb__item {
    display: inline-flex;
    align-items: center;
    min-width: 0;

    /* 复位宿主文档对相邻 `li` 的间距（如 `.prose li + li { margin-top }`），否则首项与其余项错位 */
    margin-block: 0;
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

/*
  截断前提：项宽超过容器时单行省略（`flex-wrap` 下每行仍会把超宽项压到容器宽度）。
  `min-width: 0` 允许链接 / 文本作为 flex 子项收缩，`overflow: hidden` 把内层最小内容宽归零，
  否则 `min-content` 恒等于整段文本、省略号永不出现。上限可经
  `--caomei-breadcrumb-label-max-width` 收紧到固定值。
*/
.caomei-breadcrumb__item {
    max-width: 100%;
}

.caomei-breadcrumb__link,
.caomei-breadcrumb__text {
    min-width: 0;
}

/*
  提示包装经多层组件渲染，父级 scope id 到不了内层 span，故用 `:deep()` 落到实际元素。
  `position: relative` + `z-index: 1` 让文本盒绘制在链接的不可见命中区（`.caomei-hit-target::after`）
  之上：否则悬停链接中部时事件落在该伪元素上，提示触发器收不到 `pointermove`，长链接中段会「悬停无反应」。
  点击仍会冒泡到链接，命中区语义不受影响。
*/
.caomei-breadcrumb__item :deep(.caomei-breadcrumb__label) {
    position: relative;
    z-index: var(--caomei-z-raise);

    /* 块级而非行内块：`overflow: hidden` 的行内块基线取盒子底边，会把行盒抬高约 3px，
       链接视觉盒从 18px 变 21px（P2 命中区「宿主短边 < 18px」断言因此失败）。
       块级盒高度与行高一致，链接保持原高度。 */
    display: block;
    max-width: var(--caomei-breadcrumb-label-max-width, 100%);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

:where([data-motion='expressive']) .caomei-breadcrumb__link {
    transition: color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard);
}

.caomei-breadcrumb__link:hover {
    color: var(--caomei-breadcrumb-link-hover-color, var(--caomei-color-primary-text));
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
