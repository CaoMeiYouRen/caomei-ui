<script setup lang="ts">
import { StepperTrigger } from 'reka-ui'
import { computed, inject, useAttrs } from 'vue'
import { stepperLabelPresenceKey } from './stepper-presence'
import type { StepperTriggerProps } from './types'

defineOptions({ name: 'CaomeiStepperTrigger', inheritAttrs: false })

withDefaults(defineProps<StepperTriggerProps>(), {
    asChild: false,
})

const attrs = useAttrs()
const presence = inject(stepperLabelPresenceKey, null)

/** 引用型属性键：显式值为空（`undefined` / `null` / 空串）按「无意见」处理，不参与透传与覆盖 */
const IDREF_ATTRS = ['aria-describedby', 'aria-labelledby']

function isExplicit(value: unknown): boolean {
    return value !== undefined && value !== null && value !== ''
}

/** 透传面：过滤掉空值引用型属性，让派生取值（或省略策略）存活 */
const forwardedAttrs = computed<Record<string, unknown>>(() => {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(attrs)) {
        if (IDREF_ATTRS.includes(key) && !isExplicit(value)) {
            continue
        }
        result[key] = value
    }
    return result
})

/**
 * 关联目标缺席时条件输出引用型属性：Reka 无条件绑定 `aria-describedby` / `aria-labelledby`，
 * 而目标只在 `CaomeiStepperDescription` / `CaomeiStepperTitle` 渲染时落 DOM，缺席即悬空引用。
 * 使用方显式提供的非空取值优先（与库内「显式 > 派生」口径一致）。
 *
 * 已知取舍（SSR）：在位计数在挂载期登记，服务端渲染恒为 0——含描述步骤的服务端 HTML 也不带
 * `aria-describedby` / `aria-labelledby`，关联在水合后建立。服务端与客户端首帧一致（均省略）故无
 * hydration mismatch；描述本身在触发器内容内、可读性不受影响。原始 HTML 永不产生悬空引用。
 */
const idrefBinds = computed<Record<string, string | undefined>>(() => {
    const binds: Record<string, string | undefined> = {}
    if (!isExplicit(attrs['aria-describedby']) && (presence?.description ?? 0) === 0) {
        binds['aria-describedby'] = undefined
    }
    if (!isExplicit(attrs['aria-labelledby']) && (presence?.title ?? 0) === 0) {
        binds['aria-labelledby'] = undefined
    }
    return binds
})
</script>

<template>
    <StepperTrigger
        v-bind="{...forwardedAttrs, ...idrefBinds}"
        :as-child="asChild"
        class="caomei-stepper__trigger"
    >
        <slot />
    </StepperTrigger>
</template>

<style scoped>
.caomei-stepper__trigger {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    gap: var(--caomei-stepper-trigger-gap, var(--caomei-space-2));
    padding: var(--caomei-stepper-trigger-padding, var(--caomei-space-1));
    border: 0;
    border-radius: var(--caomei-radius-md);
    background: transparent;
    color: var(--caomei-stepper-inactive-color, var(--caomei-color-text-muted));
    font: inherit;
    text-align: start;
    cursor: pointer;
    transition: color 0.15s ease, background-color 0.15s ease;
}

.caomei-stepper__trigger:hover:not([data-disabled]) {
    background: var(--caomei-color-bg-elevated);
}

.caomei-stepper__trigger:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
}

.caomei-stepper__trigger[data-state='active'] {
    color: var(--caomei-stepper-active-color, var(--caomei-color-primary));
}

.caomei-stepper__trigger[data-state='completed'] {
    color: var(--caomei-stepper-completed-color, var(--caomei-color-success));
}

.caomei-stepper__trigger[data-disabled] {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

@media (prefers-reduced-motion: reduce) {
    .caomei-stepper__trigger {
        transition: none;
    }
}
</style>
