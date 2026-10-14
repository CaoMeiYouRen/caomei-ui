<script setup lang="ts">
import { computed } from 'vue'
import type { RowProps } from './types'

defineOptions({ name: 'CaomeiRow' })

const props = withDefaults(defineProps<RowProps>(), {
    align: 'stretch',
    as: 'div',
})

const rootStyle = computed(() => {
    const style: Record<string, string> = {}
    const { gutter } = props

    if (typeof gutter === 'number') {
        style['--caomei-row-gutter-x'] = `${gutter}px`
    } else if (Array.isArray(gutter)) {
        const [inlineGutter, blockGutter] = gutter
        style['--caomei-row-gutter-x'] = `${inlineGutter}px`
        style['--caomei-row-gutter-y'] = `${blockGutter}px`
    }

    return style
})
</script>

<template>
    <component
        :is="as"
        class="caomei-row"
        :class="`caomei-row--align-${align}`"
        :style="rootStyle"
    >
        <slot />
    </component>
</template>

<style scoped>
/*
  24 栅格由 CSS Grid 承载：固定 24 条等宽轨道，`CaomeiCol` 以 `grid-column` 定位。
  间距走 `gap`（只出现在相邻项之间），无需 Element Plus 的负外边距补偿。
  `--caomei-row-gutter-*` 与 `--caomei-row-align` 只作为覆盖钩子（带默认回退值），
  基类不预声明默认值；档位选择器用 :where() 归零特异性，保证「低特异性便于覆盖」成立。
*/
.caomei-row {
    box-sizing: border-box;
    display: grid;
    grid-template-columns: repeat(24, minmax(0, 1fr));

    /*
      横向间距走 `gap`（px）：`gap` 不参与收缩，故**横向间距总宽 `23 × gutter` 必须小于容器宽**——
      否则栅格会把页面撑出横向溢出（窄屏请按断点减小 `gutter`）。刻意不使用 `min(…, %)` 之类的
      容器相对上限：百分比 gap 在计算样式里保持百分比形态（`getComputedStyle` 不解析为 px），
      会破坏 `capture:styles` 的逐属性基线；容器查询（`cqw`）则属非目标。
    */
    gap: var(--caomei-row-gutter-y, 0px) var(--caomei-row-gutter-x, 0px);
    align-items: var(--caomei-row-align, stretch);
}

:where(.caomei-row--align-start) {
    --caomei-row-align: start;
}

:where(.caomei-row--align-center) {
    --caomei-row-align: center;
}

:where(.caomei-row--align-end) {
    --caomei-row-align: end;
}

:where(.caomei-row--align-stretch) {
    --caomei-row-align: stretch;
}

:where(.caomei-row--align-baseline) {
    --caomei-row-align: baseline;
}
</style>
