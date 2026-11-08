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
        :size="size"
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
</style>
