<script setup lang="ts">
import { computed } from 'vue'
import type { ColBreakpointConfig, ColBreakpointValue, ColProps } from './types'

defineOptions({ name: 'CaomeiCol' })

const BREAKPOINTS = ['sm', 'md', 'lg'] as const

const props = withDefaults(defineProps<ColProps>(), {
    span: 24,
    offset: 0,
    order: 0,
    as: 'div',
})

/** 把一个断点取值归一为 `{ span, offset, order }`；数字等价于 `{ span }`。 */
function normalizeBreakpoint(value: ColBreakpointValue | undefined): ColBreakpointConfig | undefined {
    if (value === undefined) {
        return undefined
    }
    return typeof value === 'number' ? { span: value } : value
}

const rootStyle = computed(() => {
    const style: Record<string, string> = {
        '--caomei-col-span': String(props.span),
    }

    if (props.offset) {
        style['--caomei-col-offset'] = String(props.offset)
    }
    if (props.order) {
        style['--caomei-col-order'] = String(props.order)
    }

    for (const breakpoint of BREAKPOINTS) {
        const config = normalizeBreakpoint(props[breakpoint])
        if (!config) {
            continue
        }
        if (config.span !== undefined) {
            style[`--caomei-col-${breakpoint}-span`] = String(config.span)
        }
        if (config.offset !== undefined) {
            style[`--caomei-col-${breakpoint}-offset`] = String(config.offset)
        }
        if (config.order !== undefined) {
            style[`--caomei-col-${breakpoint}-order`] = String(config.order)
        }
    }

    return style
})
</script>

<template>
    <component
        :is="as"
        class="caomei-col"
        :style="rootStyle"
    >
        <slot />
    </component>
</template>

<style scoped>
/*
  列定位完全由 CSS 变量驱动（`CaomeiCol` 经内联 style 写入）：
  `offset + 1` 得到栅格起始线，`span` 决定跨越的列数，`order` 为 CSS `order`。
  基类只消费带回退值的覆盖钩子、不声明默认值，故不触发 scoped 变量声明约束。
*/
.caomei-col {
    box-sizing: border-box;
    min-width: 0;
    grid-column: calc(var(--caomei-col-offset, 0) + 1) / span var(--caomei-col-span, 24);
    order: var(--caomei-col-order, 0);
}

/*
  断点覆盖按「宽 → 窄」书写：三条媒体查询在窄视口同时命中，靠源序让最窄档最终生效。
  断点取值 640 / 768 / 1024 与[响应式设计](../../../docs/design/responsive.md)一致。
*/
@media (width <= 1024px) {
    .caomei-col {
        grid-column: calc(var(--caomei-col-lg-offset, var(--caomei-col-offset, 0)) + 1) / span var(--caomei-col-lg-span, var(--caomei-col-span, 24));
        order: var(--caomei-col-lg-order, var(--caomei-col-order, 0));
    }
}

@media (width <= 768px) {
    .caomei-col {
        grid-column: calc(var(--caomei-col-md-offset, var(--caomei-col-offset, 0)) + 1) / span var(--caomei-col-md-span, var(--caomei-col-span, 24));
        order: var(--caomei-col-md-order, var(--caomei-col-order, 0));
    }
}

@media (width <= 640px) {
    .caomei-col {
        grid-column: calc(var(--caomei-col-sm-offset, var(--caomei-col-offset, 0)) + 1) / span var(--caomei-col-sm-span, var(--caomei-col-span, 24));
        order: var(--caomei-col-sm-order, var(--caomei-col-order, 0));
    }
}
</style>
