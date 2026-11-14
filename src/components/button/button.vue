<script setup lang="ts">
import { computed, ref, useSlots, watchEffect } from 'vue'
import { CaomeiBadge } from '../badge'
import { Passthrough } from '../_shared/passthrough'
import { CaomeiTooltip, CaomeiTooltipContent, CaomeiTooltipTrigger } from '../tooltip'
import { useOverflowTooltip } from '../../composables/use-overflow-tooltip'
import { warnDev } from '../../_shared/dev-warn'
import { useLabelAttrs } from '../_shared/use-label-attrs'
import type { TooltipConfig } from '../tooltip/types'
import type { ButtonProps } from './types'

defineOptions({ name: 'CaomeiButton', inheritAttrs: false })

const props = withDefaults(defineProps<ButtonProps>(), {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    block: false,
    rounded: false,
    iconOnly: false,
    iconPosition: 'start',
    type: 'button',
    badgeTone: 'neutral',
    tooltip: false,
})

const emit = defineEmits<{
    click: [event: MouseEvent]
}>()

defineSlots<{
    default?: () => unknown
    icon?: () => unknown
}>()

const isInactive = computed(() => props.disabled || props.loading)

const forwardedAttrs = useLabelAttrs(() => props.label)
const slots = useSlots()

/** 是否存在可见文本：无默认插槽（只有图标 / 角标）时按纯图标语义处理 */
const hasVisibleText = computed(() => Boolean(slots.default))

/** 文本按钮的可见文本承接元素；`iconOnly` 时不渲染，故只作为溢出检测的目标 */
const contentRef = ref<HTMLElement | null>(null)
const visibleText = ref('')

/**
 * 提示配置：显式关闭（`false` / 未传）时为 `null`。
 *
 * 默认触发模式：纯图标 / 无可见文本、或显式提供了提示内容时「始终显示」（前者没有可溢出的文本，
 * 后者是作者明确要展示的补充说明）；只有「有可见文本 + `tooltip: true`」才退化为
 * 「仅在被截断时显示」，由 `useOverflowTooltip` 判定。
 */
const tooltipConfig = computed<TooltipConfig | null>(() => {
    const value = props.tooltip
    if (!value) {
        return null
    }
    const content = typeof value === 'string' ? value : (value === true ? undefined : value.content)
    const mode = typeof value === 'object' ? value.mode : undefined
    return {
        content,
        // 没有可溢出文本的形态（纯图标 / 无默认插槽）以及显式给了内容的形态都始终展示
        mode: mode ?? (props.iconOnly || !hasVisibleText.value || content ? 'always' : 'auto'),
    }
})

const { overflowing } = useOverflowTooltip(contentRef, {
    // `always` 与纯图标形态不需要溢出判定（后者没有文本承接元素）
    disabled: () => !tooltipConfig.value || props.iconOnly || tooltipConfig.value.mode === 'always',
    onMeasure: () => {
        visibleText.value = (contentRef.value?.textContent ?? '').replace(/\s+/gu, ' ').trim()
    },
})

const tooltipEnabled = computed(() => tooltipConfig.value !== null)

/** 已提供给按钮的可访问名：显式 `label` 优先于透传的 `aria-label` */
const accessibleName = computed(() => {
    if (props.label) {
        return props.label
    }
    const forwarded = forwardedAttrs.value['aria-label']
    return typeof forwarded === 'string' && forwarded ? forwarded : undefined
})

/**
 * 提示内容优先级：显式 `content` > 透传原生 `title`（接管后不再落到 DOM）> 可访问名（纯图标）>
 * 可见文本（文本按钮）。
 */
const tooltipText = computed(() => {
    const config = tooltipConfig.value
    if (!config) {
        return ''
    }
    if (config.content) {
        return config.content
    }
    const nativeTitle = forwardedAttrs.value.title
    if (typeof nativeTitle === 'string' && nativeTitle) {
        return nativeTitle
    }
    if (props.iconOnly) {
        return accessibleName.value ?? ''
    }
    // 无默认插槽但提供了可访问名时，仍按契约取 `aria-label` 作为内容
    return visibleText.value || accessibleName.value || ''
})

/** 是否真的启用提示：`always` 直接启用，`auto` 仅在文本溢出时启用 */
const tooltipActive = computed(() => {
    const config = tooltipConfig.value
    if (!config || !tooltipText.value) {
        return false
    }
    return config.mode === 'always' || overflowing.value
})

// 没有可访问名的纯图标按钮既无法被读屏识别，也没有内容可提示——开发期点名提示。
watchEffect(() => {
    if (tooltipEnabled.value && props.iconOnly && !accessibleName.value) {
        warnDev('[CaomeiButton] iconOnly 缺少 label：按钮没有可访问名，内建提示也没有内容可显示。')
    }
})

// 纯图标没有可溢出的文本：`auto` 在这里等价于「永不显示」，静默会让人误以为接入失败。
watchEffect(() => {
    if (tooltipConfig.value?.mode === 'auto' && props.iconOnly) {
        warnDev('[CaomeiButton] iconOnly 下 tooltip 的 auto 模式没有可溢出文本，提示不会显示；请改用 always 或传内容。')
    }
})

/** 加载态由组件表达 `aria-busy`；非加载态保留消费者透传值。 */
const rootAttrs = computed<Record<string, unknown>>(() => {
    const base: Record<string, unknown> = {
        ...forwardedAttrs.value,
        ...(props.loading ? { 'aria-busy': 'true' } : {}),
    }
    // iconOnly 时强制使用 label 作为 aria-label（优先级高于透传）
    if (props.iconOnly && props.label) {
        base['aria-label'] = props.label
    }
    // 启用内建提示后接管原生 title（其值已作为提示内容兜底），避免系统提示与内建提示双显
    if (tooltipEnabled.value) {
        delete base.title
    }
    return base
})

const rootClass = computed(() => [
    `caomei-button--${props.variant}`,
    `caomei-button--${props.size}`,
    {
        [`caomei-button--tone-${props.tone}`]: Boolean(props.tone),
        'caomei-button--block': props.block,
        'caomei-button--rounded': props.rounded,
        'caomei-button--loading': props.loading,
        'caomei-button--icon-only': props.iconOnly,
    },
])

/*
  以「启用与否」而非「当前是否活跃」选择包装层：活跃度会随溢出检测翻转，切换包装组件会重建
  按钮 DOM、丢掉焦点，故活跃度只用 `disabled` 传给提示根组件。
*/

const RootWrapper = computed(() => (tooltipEnabled.value ? CaomeiTooltip : Passthrough))
const TriggerWrapper = computed(() => (tooltipEnabled.value ? CaomeiTooltipTrigger : Passthrough))

function onClick(event: MouseEvent): void {
    emit('click', event)
}
</script>

<template>
    <component
        :is="RootWrapper"
        :disabled="tooltipActive ? undefined : true"
    >
        <component
            :is="TriggerWrapper"
            as-child
            unstyled
        >
            <button
                v-bind="rootAttrs"
                class="caomei-button"
                :class="rootClass"
                :type="type"
                :disabled="isInactive"
                @click="onClick"
            >
                <span
                    v-if="loading"
                    class="caomei-button__spinner"
                    aria-hidden="true"
                />
                <span
                    v-else-if="iconOnly && $slots.icon"
                    class="caomei-button__icon"
                >
                    <slot name="icon" />
                </span>
                <span
                    v-else-if="!loading && !iconOnly && $slots.icon && iconPosition === 'start'"
                    class="caomei-button__icon"
                >
                    <slot name="icon" />
                </span>
                <span
                    v-if="!iconOnly && $slots.default"
                    ref="contentRef"
                    class="caomei-button__content"
                >
                    <slot />
                </span>
                <span
                    v-if="!loading && !iconOnly && $slots.icon && iconPosition === 'end'"
                    class="caomei-button__icon"
                >
                    <slot name="icon" />
                </span>
                <CaomeiBadge
                    v-if="badge"
                    class="caomei-button__badge"
                    :value="badge"
                    :tone="badgeTone"
                />
            </button>
        </component>
        <CaomeiTooltipContent v-if="tooltipEnabled" :aria-label="tooltipText">
            {{ tooltipText }}
        </CaomeiTooltipContent>
    </component>
</template>

<style scoped>
/*
  `--caomei-button-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值；
  尺寸与语气档位选择器用 :where() 归零特异性，只声明 CSS 变量。
*/
.caomei-button {
    position: relative;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--caomei-space-1);
    border: 1px solid transparent;
    border-radius: var(--caomei-radius-md);
    height: var(--caomei-button-height, var(--caomei-control-height-md));
    padding: 0 var(--caomei-button-padding-x, var(--caomei-space-3));
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-button-font-size, var(--caomei-font-size-md));
    line-height: 1;
    cursor: pointer;
    user-select: none;
    transition: opacity var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard), color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard), background-color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard), border-color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard);
}

:where([data-motion='expressive']) .caomei-button {
    /* transform 仅用于按压缩放（悬浮不再位移） */
    transition: opacity var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard), color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard), background-color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard), border-color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard), transform var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard);
}

:where([data-motion='expressive']) .caomei-button:active:not(:disabled) {
    transform: scale(0.98);
}

.caomei-button:disabled {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-button:focus-visible {
    outline: 2px solid var(--caomei-button-focus, var(--caomei-color-primary));
    outline-offset: 2px;
}

.caomei-button--block {
    width: 100%;
}

.caomei-button--rounded {
    border-radius: var(--caomei-radius-full);
}

/*
  iconOnly：方形、内边距归零、图标居中。
  宽度等于高度（由尺寸档位变量控制），padding 归零，gap 归零。
*/
.caomei-button--icon-only {
    width: var(--caomei-button-height);
    padding: 0;
    gap: 0;
}

.caomei-button--icon-only .caomei-button__icon {
    margin: 0;
}

.caomei-button--primary {
    background: var(--caomei-button-bg, var(--caomei-color-primary));
    color: var(--caomei-button-fg, var(--caomei-color-primary-foreground));
}

.caomei-button--secondary {
    background: var(--caomei-color-bg);
    border-color: var(--caomei-button-border, var(--caomei-color-control-border));
    color: var(--caomei-button-text, var(--caomei-color-text));
}

.caomei-button--ghost {
    background: transparent;
    color: var(--caomei-button-text, var(--caomei-color-text));
}

/*
  状态反馈：`hover` / `active` 全部由既有 token 经 `color-mix()` 派生，**不新增冻结 token**。
  - 实底变体向中性深色 token 混合：白字档对比度上升；暗色主题的默认 `primary`（浅底深字）向文字方向
    小幅移动、对比度略降但仍留有 ≥ 4.5:1 裕度（由 `button-states.e2e.ts` 的 18 条受检面逐条锁定）；
  - 文字型变体把文字向 `--caomei-color-text` 混合（亮色更深 / 暗色更浅），底色取同一来源低比例着色
    ⇒ 两个方向都远离底色，对比度同样不下降；
  - `:disabled`（含复用原生 disabled 的 loading）不参与状态反馈；
  - `:focus-visible` 只叠加描边，不改动状态色；`prefers-reduced-motion` 由下方媒体查询关闭过渡。
*/
.caomei-button--primary:hover:not(:disabled) {
    background: color-mix(in srgb, var(--caomei-button-bg, var(--caomei-color-primary)) 88%, var(--caomei-color-neutral-solid));
}

.caomei-button--primary:active:not(:disabled) {
    background: color-mix(in srgb, var(--caomei-button-bg, var(--caomei-color-primary)) 78%, var(--caomei-color-neutral-solid));
}

/*
  `tone="neutral"` 的实底与上面的加深锚点同值（`--caomei-color-neutral-solid`），混合同色恒等 ⇒ 状态零变化。
  该语气的实底足够深，改用文字色作锚点（亮色变深 / 暗色变浅）仍保持白字 ≥ 4.5:1；比例比默认档更保守。
  选择器用「基类 + 语气类」的复合形态提高特异性，与源码顺序解耦（不依赖规则先后）。
*/
.caomei-button--primary.caomei-button--tone-neutral:hover:not(:disabled) {
    background: color-mix(in srgb, var(--caomei-button-bg, var(--caomei-color-neutral-solid)) 92%, var(--caomei-color-text));
}

.caomei-button--primary.caomei-button--tone-neutral:active:not(:disabled) {
    background: color-mix(in srgb, var(--caomei-button-bg, var(--caomei-color-neutral-solid)) 84%, var(--caomei-color-text));
}

.caomei-button--secondary:hover:not(:disabled) {
    border-color: color-mix(in srgb, var(--caomei-button-border, var(--caomei-color-control-border)) 80%, var(--caomei-color-text));
    background: color-mix(in srgb, var(--caomei-button-text, var(--caomei-color-text)) 8%, var(--caomei-color-bg));
    color: color-mix(in srgb, var(--caomei-button-text, var(--caomei-color-text)) 88%, var(--caomei-color-text));
}

.caomei-button--secondary:active:not(:disabled) {
    border-color: color-mix(in srgb, var(--caomei-button-border, var(--caomei-color-control-border)) 70%, var(--caomei-color-text));
    background: color-mix(in srgb, var(--caomei-button-text, var(--caomei-color-text)) 14%, var(--caomei-color-bg));
    color: color-mix(in srgb, var(--caomei-button-text, var(--caomei-color-text)) 78%, var(--caomei-color-text));
}

.caomei-button--ghost:hover:not(:disabled) {
    background: color-mix(in srgb, var(--caomei-button-text, var(--caomei-color-text)) 8%, transparent);
    color: color-mix(in srgb, var(--caomei-button-text, var(--caomei-color-text)) 88%, var(--caomei-color-text));
}

.caomei-button--ghost:active:not(:disabled) {
    background: color-mix(in srgb, var(--caomei-button-text, var(--caomei-color-text)) 14%, transparent);
    color: color-mix(in srgb, var(--caomei-button-text, var(--caomei-color-text)) 78%, var(--caomei-color-text));
}

:where(.caomei-button--tone-neutral) {
    --caomei-button-bg: var(--caomei-color-neutral-solid);
    --caomei-button-fg: var(--caomei-color-on-solid);
    --caomei-button-border: var(--caomei-color-control-border);
    --caomei-button-text: var(--caomei-color-text);
    --caomei-button-focus: var(--caomei-color-text);
}

:where(.caomei-button--tone-primary) {
    --caomei-button-bg: var(--caomei-color-primary-solid);
    --caomei-button-fg: var(--caomei-color-on-solid);
    --caomei-button-border: var(--caomei-color-primary-text);
    --caomei-button-text: var(--caomei-color-primary-text);
    --caomei-button-focus: var(--caomei-color-primary-text);
}

:where(.caomei-button--tone-success) {
    --caomei-button-bg: var(--caomei-color-success-solid);
    --caomei-button-fg: var(--caomei-color-on-solid);
    --caomei-button-border: var(--caomei-color-success-text);
    --caomei-button-text: var(--caomei-color-success-text);
    --caomei-button-focus: var(--caomei-color-success-text);
}

:where(.caomei-button--tone-warning) {
    --caomei-button-bg: var(--caomei-color-warning-solid);
    --caomei-button-fg: var(--caomei-color-on-solid);
    --caomei-button-border: var(--caomei-color-warning-text);
    --caomei-button-text: var(--caomei-color-warning-text);
    --caomei-button-focus: var(--caomei-color-warning-text);
}

:where(.caomei-button--tone-danger) {
    --caomei-button-bg: var(--caomei-color-danger-solid);
    --caomei-button-fg: var(--caomei-color-on-solid);
    --caomei-button-border: var(--caomei-color-danger-text);
    --caomei-button-text: var(--caomei-color-danger-text);
    --caomei-button-focus: var(--caomei-color-danger-text);
}

:where(.caomei-button--sm) {
    --caomei-button-height: var(--caomei-control-height-sm);
    --caomei-button-padding-x: var(--caomei-space-2);
    --caomei-button-font-size: var(--caomei-font-size-sm);
}

:where(.caomei-button--md) {
    --caomei-button-height: var(--caomei-control-height-md);
    --caomei-button-padding-x: var(--caomei-space-3);
    --caomei-button-font-size: var(--caomei-font-size-md);
}

:where(.caomei-button--lg) {
    --caomei-button-height: var(--caomei-control-height-lg);
    --caomei-button-padding-x: var(--caomei-space-4);
    --caomei-button-font-size: var(--caomei-font-size-lg);
}

.caomei-button__icon,
.caomei-button__spinner {
    display: inline-flex;
    align-items: center;
}

/*
  文本承接层：作为 flex 子项必须声明 `min-width: 0`，否则内容宽度会撑破容器、`overflow` 永不生效。
  单行截断（`nowrap` + `overflow: hidden` + `text-overflow: ellipsis`）让「按钮被限宽时文字被截断」
  成为 `tooltip` 的 `auto` 触发前提；未限宽时按钮仍按内容撑开，几何与改造前一致。
  上限定为 100% 而非固定值：截断宽度始终跟随按钮自身的可用宽度。
*/
.caomei-button__content {
    display: block;
    min-width: 0;
    max-width: var(--caomei-button-content-max-width, 100%);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.caomei-button__icon,
.caomei-button__spinner {
    flex-shrink: 0;
}

/*
  角标以右上角外扩方式叠加（对齐 PrimeVue）：按钮需为定位上下文且不裁切，
  `pointer-events: none` 保证角标不吞掉按钮的点击区域。
*/
.caomei-button__badge {
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(50%, -50%);
    pointer-events: none;
}

.caomei-button__spinner {
    width: 1em;
    height: 1em;
    border: 2px solid currentcolor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: caomei-button-spin 0.6s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
    .caomei-button {
        transition: none;
    }

    .caomei-button__spinner {
        animation: none;
    }
}

@keyframes caomei-button-spin {
    to {
        transform: rotate(360deg);
    }
}

@media (prefers-reduced-motion: reduce) {
    :where([data-motion='expressive']) .caomei-button,
    :where([data-motion='expressive']) .caomei-button:hover:not(:disabled),
    :where([data-motion='expressive']) .caomei-button:active:not(:disabled) {
        transform: none;
        transition: none;
    }
}
</style>
