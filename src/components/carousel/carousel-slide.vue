<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted } from 'vue'
import { carouselContextKey } from './context'
import type { CarouselSlideProps } from './types'

defineOptions({ name: 'CaomeiCarouselSlide', inheritAttrs: false })

const props = defineProps<CarouselSlideProps>()

const context = inject(carouselContextKey, null)
const id = Symbol('caomei-carousel-slide')

/**
 * 序号取父级登记表的挂载顺序，等价于首屏渲染顺序：
 * 追加子页（末尾挂载）序号正确；在中间插入或整体重排不会改变已挂载项的序号，
 * 需要改变页序时请让整组子页重新挂载（例如更换 `v-for` 的 `key`）。
 */

onMounted(() => {
    context?.registerSlide(id)
})

onBeforeUnmount(() => {
    context?.unregisterSlide(id)
})

const index = computed(() => context?.slideIndex(id) ?? -1)
const accessibleLabel = computed(() => props.label ?? (context ? context.slideLabel(index.value) : undefined))
</script>

<template>
    <div
        v-bind="$attrs"
        class="caomei-carousel__slide"
        role="group"
        aria-roledescription="slide"
        :aria-label="accessibleLabel"
    >
        <slot />
    </div>
</template>

<style scoped>
.caomei-carousel__slide {
    box-sizing: border-box;
    min-width: 0;
    min-height: 0;
}
</style>
