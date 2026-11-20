<script setup lang="ts">
import { computed, provide, useAttrs } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { resolveLabelName } from '../_shared/use-label-attrs'
import CaomeiTabbarItem from './tabbar-item.vue'
import { caomeiTabbarContextKey, type TabbarContext } from './context'
import type { TabbarItemOption, TabbarProps, TabbarValue } from './types'

defineOptions({ name: 'CaomeiTabbar', inheritAttrs: false })

const props = withDefaults(defineProps<TabbarProps>(), {
    label: '',
    fixed: false,
})

const modelValue = defineModel<TabbarValue>()

defineSlots<{
    default?: () => unknown
    /** 数据驱动条目时替换文案内容 */
    item?: (props: { item: TabbarItemOption, active: boolean }) => unknown
}>()

const attrs = useAttrs()
const locale = useLocale()

/** 三级可访问名：显式 `label` > 透传 `aria-label` > 语言兜底文案 */
const accessibleLabel = computed(() =>
    resolveLabelName(props.label, attrs['aria-label'], locale.value.tabbar.label),
)

const context: TabbarContext = {
    value: computed(() => modelValue.value),
    select(value: TabbarValue): void {
        modelValue.value = value
    },
}

provide(caomeiTabbarContextKey, context)

const items = computed(() => props.items ?? [])
</script>

<template>
    <nav
        v-bind="$attrs"
        class="caomei-tabbar"
        :class="{'caomei-tabbar--fixed': fixed}"
        :aria-label="accessibleLabel"
    >
        <div class="caomei-tabbar__list">
            <template v-if="items.length">
                <CaomeiTabbarItem
                    v-for="item in items"
                    :key="item.value"
                    :value="item.value"
                    :label="item.label"
                    :icon="item.icon"
                    :badge="item.badge"
                    :disabled="item.disabled"
                >
                    <template
                        v-if="$slots.item"
                        #default="{active}"
                    >
                        <slot
                            name="item"
                            :item="item"
                            :active="active"
                        />
                    </template>
                </CaomeiTabbarItem>
            </template>
            <slot v-else />
        </div>
    </nav>
</template>

<style scoped>
.caomei-tabbar {
    box-sizing: border-box;
    width: 100%;
    padding-block: var(--caomei-tabbar-padding-y, var(--caomei-space-1)) calc(var(--caomei-tabbar-padding-y, var(--caomei-space-1)) + var(--caomei-safe-area-bottom, 0px));
    padding-inline: var(--caomei-tabbar-padding-x, var(--caomei-space-1));
    border-top: 1px solid var(--caomei-tabbar-border, var(--caomei-color-border));
    background: var(--caomei-tabbar-bg, var(--caomei-color-bg));
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
}

.caomei-tabbar--fixed {
    position: fixed;
    z-index: var(--caomei-z-sticky);
    right: 0;
    bottom: 0;
    left: 0;
}

.caomei-tabbar__list {
    display: flex;
    align-items: stretch;
    justify-content: space-around;
    gap: var(--caomei-tabbar-gap, var(--caomei-space-1));
}
</style>

<!--
  条目自身的样式集中在条目 SFC（含角标与选中态），此处只承担容器布局。
-->
