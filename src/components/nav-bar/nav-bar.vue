<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon, useInternalIcons } from '../../icons'
import { resolveLabelName } from '../_shared/use-label-attrs'
import type { NavBarProps } from './types'

defineOptions({ name: 'CaomeiNavBar', inheritAttrs: false })

const props = withDefaults(defineProps<NavBarProps>(), {
    title: '',
    back: true,
    backLabel: '',
    backDisabled: false,
    sticky: false,
    safeArea: true,
    label: '',
})

const emit = defineEmits<{
    /**
     * 返回按钮点击；组件不接路由，跳转与历史判断由使用方接管
     * @en Emitted when the back button is clicked; the component owns no router, so navigation and
     * history checks stay with the consumer
     */
    back: []
}>()

defineSlots<{
    /** 标题内容；优先于 `title` */
    default?: () => unknown
    /** 左侧区域（替换默认返回按钮） */
    start?: () => unknown
    /** 右侧操作区 */
    end?: () => unknown
}>()

const icons = useInternalIcons()
const locale = useLocale()
const attrs = useAttrs()

/** 导航区可访问名：显式 `label` > 透传 `aria-label` > 语言兜底 */
const accessibleLabel = computed(() =>
    resolveLabelName(props.label, attrs['aria-label'], locale.value.navBar.label),
)

/** 返回按钮可访问名：显式 `backLabel` > 语言兜底 */
const accessibleBackLabel = computed(() => props.backLabel || locale.value.navBar.back)

function onBack(): void {
    if (props.backDisabled) {
        return
    }
    emit('back')
}
</script>

<template>
    <nav
        v-bind="$attrs"
        class="caomei-nav-bar"
        :class="{
            'caomei-nav-bar--sticky': sticky,
            'caomei-nav-bar--safe-area': safeArea
        }"
        :aria-label="accessibleLabel"
    >
        <div class="caomei-nav-bar__start">
            <slot name="start">
                <button
                    v-if="back"
                    type="button"
                    class="caomei-hit-target caomei-nav-bar__back"
                    :aria-label="accessibleBackLabel"
                    :disabled="backDisabled"
                    @click="onBack"
                >
                    <CaomeiIcon :icon="icons.chevronLeft" />
                </button>
            </slot>
        </div>
        <div class="caomei-nav-bar__title">
            <slot>{{ title }}</slot>
        </div>
        <div class="caomei-nav-bar__end">
            <slot name="end" />
        </div>
    </nav>
</template>

<style scoped>
/*
  页头高度取触摸下限 44px；标题单行省略，左右区域等宽以保持标题居中。
  吸顶层级走 `--caomei-z-sticky`，安全区由 `--caomei-safe-area-top` 叠加。
*/
:where(.caomei-nav-bar) {
    --caomei-nav-bar-height: var(--caomei-control-height-lg, 2.75rem);
    --caomei-nav-bar-gap: var(--caomei-space-2);
    --caomei-nav-bar-padding-x: var(--caomei-space-3);
    --caomei-nav-bar-bg: var(--caomei-color-bg);
    --caomei-nav-bar-border: var(--caomei-color-border);
    --caomei-nav-bar-title-font-size: var(--caomei-font-size-md);
}

.caomei-nav-bar {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: var(--caomei-nav-bar-gap);
    width: 100%;
    min-height: var(--caomei-nav-bar-height);
    padding: 0 var(--caomei-nav-bar-padding-x);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    background: var(--caomei-nav-bar-bg);
    border-bottom: 1px solid var(--caomei-nav-bar-border);
}

.caomei-nav-bar--safe-area {
    padding-top: var(--caomei-safe-area-top, 0px);
}

.caomei-nav-bar--sticky {
    position: sticky;
    top: 0;
    z-index: var(--caomei-z-sticky);
}

.caomei-nav-bar__start,
.caomei-nav-bar__end {
    display: flex;
    flex: 1 1 0;
    align-items: center;
    gap: var(--caomei-nav-bar-gap);
    min-width: 0;
}

.caomei-nav-bar__end {
    justify-content: flex-end;
}

.caomei-nav-bar__title {
    overflow: hidden;
    flex: 0 1 auto;
    max-width: 60%;
    font-size: var(--caomei-nav-bar-title-font-size);
    font-weight: 600;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.caomei-nav-bar__back {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--caomei-nav-bar-height);
    height: var(--caomei-nav-bar-height);
    margin-inline-start: calc(var(--caomei-nav-bar-padding-x) * -1);
    padding: 0;
    color: var(--caomei-color-text);
    background: transparent;
    border: none;
    border-radius: var(--caomei-radius-md);
    cursor: pointer;
}

.caomei-nav-bar__back:hover:not(:disabled) {
    background: var(--caomei-color-bg-elevated);
}

.caomei-nav-bar__back:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: -2px;
}

.caomei-nav-bar__back:disabled {
    color: var(--caomei-color-text-muted);
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}
</style>
