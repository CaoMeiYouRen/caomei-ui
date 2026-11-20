<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon, useInternalIcons } from '../../icons'
import type { EmptyProps } from './types'

defineOptions({ name: 'CaomeiEmpty' })

const props = withDefaults(defineProps<EmptyProps>(), {
    image: '',
    imageAlt: '',
    title: '',
    description: '',
    size: 'md',
    as: 'div',
})

defineSlots<{
    /** 自定义图标内容（优先于 `icon` / `image`） */
    icon?: () => unknown
    /** 自定义图片内容（优先于 `image`） */
    image?: () => unknown
    title?: () => unknown
    description?: () => unknown
    /** 底部操作区（如「新建」「重试」按钮） */
    action?: () => unknown
}>()

const slots = useSlots()
const locale = useLocale()
const icons = useInternalIcons()

const titleText = computed(() => props.title || locale.value.dataView.empty)
const hasMedia = computed(() => [slots.image, slots.icon, props.image, props.icon].some(Boolean))
</script>

<template>
    <component
        :is="as"
        class="caomei-empty"
        :class="`caomei-empty--${size}`"
    >
        <div
            v-if="hasMedia"
            class="caomei-empty__media"
        >
            <slot name="image">
                <slot name="icon">
                    <img
                        v-if="image"
                        class="caomei-empty__image"
                        :src="image"
                        :alt="imageAlt"
                    >
                    <CaomeiIcon
                        v-else-if="icon"
                        class="caomei-empty__icon"
                        :icon="icon"
                        aria-hidden="true"
                    />
                </slot>
            </slot>
        </div>
        <CaomeiIcon
            v-else
            class="caomei-empty__icon caomei-empty__icon--default"
            :icon="icons.info"
            aria-hidden="true"
        />
        <div class="caomei-empty__title">
            <slot name="title">
                {{ titleText }}
            </slot>
        </div>
        <div v-if="$slots.description || description" class="caomei-empty__description">
            <slot name="description">
                {{ description }}
            </slot>
        </div>
        <div v-if="$slots.action" class="caomei-empty__action">
            <slot name="action" />
        </div>
    </component>
</template>

<style scoped>
/*
  `--caomei-empty-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值；
  尺寸档选择器用 :where() 归零特异性，且只声明自定义属性。
*/
.caomei-empty {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--caomei-empty-gap, var(--caomei-space-2));
    width: 100%;
    min-width: 0;
    max-width: 100%;
    padding: var(--caomei-empty-padding, calc(var(--caomei-space-4) + var(--caomei-space-2))) var(--caomei-space-3);
    color: var(--caomei-color-text-muted);
    font-family: var(--caomei-font-sans);
    text-align: center;
}

:where(.caomei-empty--sm) {
    --caomei-empty-padding: var(--caomei-space-4) var(--caomei-space-3);
    --caomei-empty-media-size: 40px;
    --caomei-empty-title-size: var(--caomei-font-size-md);
}

:where(.caomei-empty--md) {
    --caomei-empty-media-size: 56px;
    --caomei-empty-title-size: var(--caomei-font-size-lg);
}

:where(.caomei-empty--lg) {
    --caomei-empty-padding: calc(var(--caomei-space-4) + var(--caomei-space-4)) var(--caomei-space-3);
    --caomei-empty-media-size: 72px;
    --caomei-empty-title-size: var(--caomei-font-size-lg);
}

.caomei-empty__media {
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 100%;
    color: var(--caomei-color-text-muted);
}

.caomei-empty__image {
    display: block;
    max-width: 100%;
    max-height: calc(var(--caomei-empty-media-size, 56px) * 2);
    object-fit: contain;
}

.caomei-empty__icon {
    font-size: var(--caomei-empty-media-size, 56px);
    line-height: 1;
}

.caomei-empty__icon--default {
    color: var(--caomei-color-text-muted);
    opacity: 0.7;
}

.caomei-empty__title {
    color: var(--caomei-color-text);
    font-size: var(--caomei-empty-title-size, var(--caomei-font-size-lg));
    font-weight: 600;
    line-height: 1.4;
    overflow-wrap: anywhere;
}

.caomei-empty__description {
    max-width: 100%;
    font-size: var(--caomei-font-size-md);
    line-height: 1.5;
    overflow-wrap: anywhere;
}

.caomei-empty__action {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--caomei-space-2);
    margin-top: var(--caomei-space-1);
}

/* 极窄视口只收紧留白，内容按 `overflow-wrap` 折行，不裁切 */
@media (width <= 640px) {
    .caomei-empty {
        padding-inline: var(--caomei-space-2);
    }
}
</style>
