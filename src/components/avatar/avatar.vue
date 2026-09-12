<script setup lang="ts">
import { AvatarFallback, AvatarImage, AvatarRoot } from 'reka-ui'
import { computed, useSlots } from 'vue'
import type { AvatarProps } from './types'

defineOptions({ name: 'CaomeiAvatar' })

const props = withDefaults(defineProps<AvatarProps>(), {
    src: '',
    alt: '',
    fallback: '',
    size: 'md',
    shape: 'circle',
})

defineSlots<{
    fallback?: () => unknown
}>()

const slots = useSlots()
const hasFallbackSlot = computed(() => Boolean(slots.fallback))

const fallbackText = computed(() => {
    if (props.fallback) {
        return props.fallback
    }
    const name = props.alt.trim()
    return name ? name.charAt(0).toUpperCase() : ''
})

/** `delayMs <= 0` 视为不延迟：Reka 在 `delayMs === 0` 时既不立即渲染也不启动计时器 */
const resolvedDelayMs = computed(() =>
    typeof props.delayMs === 'number' && props.delayMs > 0 ? props.delayMs : undefined,
)

/** 自定义回退插槽可能包含交互内容，此时不覆盖其语义 */
const fallbackRole = computed(() => (props.alt && !hasFallbackSlot.value ? 'img' : undefined))
const fallbackAriaLabel = computed(() =>
    props.alt && !hasFallbackSlot.value ? props.alt : undefined,
)

const rootClass = computed(() => [
    `caomei-avatar--${props.size}`,
    `caomei-avatar--${props.shape}`,
])
</script>

<template>
    <!--
      Reka 的图片加载状态由 AvatarRoot 提供，且 AvatarImage 卸载时不复位；
      src 由「已加载」变为空时若仅卸载 AvatarImage，回退会因状态停留在 loaded 而消失。
      以 src 是否为空作为 key，令 AvatarRoot 在空 / 非空切换时重挂，复位加载状态。
    -->
    <AvatarRoot
        :key="src ? 'image' : 'empty'"
        class="caomei-avatar"
        :class="rootClass"
    >
        <AvatarImage
            v-if="src"
            class="caomei-avatar__image"
            :src="src"
            :alt="alt"
        />
        <AvatarFallback
            :delay-ms="resolvedDelayMs"
            class="caomei-avatar__fallback"
            :role="fallbackRole"
            :aria-label="fallbackAriaLabel"
        >
            <slot name="fallback">
                {{ fallbackText }}
            </slot>
        </AvatarFallback>
    </AvatarRoot>
</template>

<style scoped>
/*
  `--caomei-avatar-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值；
  尺寸档位选择器用 :where() 归零特异性，保证使用方单类覆盖生效。
*/
.caomei-avatar {
    box-sizing: border-box;
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    width: var(--caomei-avatar-size, 32px);
    height: var(--caomei-avatar-size, 32px);
    border-radius: var(--caomei-avatar-radius, 999px);
    background: var(--caomei-avatar-bg, var(--caomei-color-bg-elevated));
    color: var(--caomei-avatar-color, var(--caomei-color-text-muted));
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-avatar-font-size, 14px);
    font-weight: 600;
    line-height: 1;
    vertical-align: middle;
    user-select: none;
}

:where(.caomei-avatar--sm) {
    --caomei-avatar-size: 24px;
    --caomei-avatar-font-size: 12px;
}

:where(.caomei-avatar--md) {
    --caomei-avatar-size: 32px;
    --caomei-avatar-font-size: 14px;
}

:where(.caomei-avatar--lg) {
    --caomei-avatar-size: 40px;
    --caomei-avatar-font-size: 16px;
}

:where(.caomei-avatar--square) {
    --caomei-avatar-radius: var(--caomei-radius-md);
}

.caomei-avatar__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: inherit;
}

.caomei-avatar__fallback {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}
</style>
