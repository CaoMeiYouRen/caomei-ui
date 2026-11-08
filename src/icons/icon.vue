<script setup lang="ts">
import { computed, useAttrs, watchEffect } from 'vue'
import { warnDev } from '../_shared/dev-warn'
import { useIconRegistry } from './registry'
import type { IconProps } from './types'

defineOptions({ name: 'CaomeiIcon', inheritAttrs: false })

const props = withDefaults(defineProps<IconProps>(), {
    size: '1em',
})

const attrs = useAttrs()
const registry = useIconRegistry()

/** 解析优先级：`icon` 组件 > 注册表 `name`；两者都缺省时渲染空占位。 */
const resolvedIcon = computed(() => props.icon ?? (props.name ? registry.value[props.name] : undefined))

/** `size` 的档位取值（`sm` / `md` / `lg`）；其余值保持原样传给图标组件。 */
const TIER_SIZES = new Set(['sm', 'md', 'lg'])
const tierSize = computed(() =>
    typeof props.size === 'string' && TIER_SIZES.has(props.size) ? props.size : undefined,
)
const iconSize = computed(() => (tierSize.value ? '1em' : props.size))
const sizeClass = computed(() => (tierSize.value ? `caomei-icon--${tierSize.value}` : undefined))

/**
 * 可访问名优先级：显式 `label` > 透传 `aria-*` / `role` / `title` > 默认装饰性 `aria-hidden`。
 * 任一显式语义属性存在时不加 `aria-hidden`，避免「已标注却被吞掉」。
 */
function hasExplicitA11y(): boolean {
    return Object.keys(attrs).some((key) => key === 'role' || key === 'title' || key.startsWith('aria-'))
}

/**
 * 渲染期解析（非 `computed`）：`attrs` 的代理不追踪 `ownKeys`，用 computed 会把结果冻结在首帧；
 * 每次渲染重新读取，才能响应父级后到的 `aria-*` / `role` / `title`。
 */
function resolveAccessibilityAttrs(): Record<string, string | undefined> {
    if (props.label) {
        return {
            role: 'img',
            'aria-label': props.label,
            // 显式 label 优先于透传 aria-hidden，避免「已命名却被隐藏」
            'aria-hidden': undefined,
        }
    }
    if (hasExplicitA11y()) {
        return {}
    }
    return {
        'aria-hidden': 'true',
    }
}

function resolveMergedAttrs(): Record<string, unknown> {
    return {
        ...attrs,
        ...resolveAccessibilityAttrs(),
    }
}

watchEffect(() => {
    if (props.icon) {
        return
    }
    if (!props.name) {
        warnDev('[caomei-ui] CaomeiIcon 需要 icon 或 name 之一；当前渲染空占位。')
        return
    }
    if (!registry.value[props.name]) {
        warnDev(
            `[caomei-ui] CaomeiIcon 未在图标注册表中找到 "${props.name}"；请先调用 provideIconRegistry({ ... }) 或改传 icon 组件。`,
        )
    }
})
</script>

<template>
    <component
        :is="resolvedIcon"
        v-if="resolvedIcon"
        v-bind="resolveMergedAttrs()"
        class="caomei-icon"
        :class="[sizeClass, {'caomei-icon--default-stroke': strokeWidth === undefined}]"
        :size="iconSize"
        :stroke-width="strokeWidth"
    />
    <span
        v-else
        class="caomei-icon caomei-icon--empty"
        aria-hidden="true"
        data-caomei-icon-missing=""
    />
</template>

<style scoped>
.caomei-icon {
    display: inline-block;
    flex-shrink: 0;
    vertical-align: -0.125em;
}

/*
  独立图标档位：容器内仍由 `font-size` 驱动 `1em`；独立图标用 `size="sm|md|lg"` 选择档位。
  档位只设置 `font-size`，Lucide 的 `width/height: 1em` 随字号缩放。
*/
.caomei-icon--sm {
    font-size: var(--caomei-icon-size-sm, 16px);
}

.caomei-icon--md {
    font-size: var(--caomei-icon-size-md, 20px);
}

.caomei-icon--lg {
    font-size: var(--caomei-icon-size-lg, 24px);
}

/*
  未显式传 `strokeWidth` 时由 token 控制 Lucide 图标的线宽；显式 prop 仍原样透传。
  只命中带 `lucide` 类的根节点：`icon` 允许接收任意组件，自备 SVG 自带的 `stroke-width`
  不应被本库静默改写（CSS 声明优先于 presentation attribute）。
*/
.caomei-icon--default-stroke.lucide {
    stroke-width: var(--caomei-icon-stroke-width, 2);
}
</style>
