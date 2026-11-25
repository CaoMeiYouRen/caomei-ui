<script setup lang="ts">
import { ContextMenuTrigger } from 'reka-ui'
import { inject, onBeforeUnmount, onMounted, ref } from 'vue'
import { triggerElementKey } from '../_shared/trigger-element'
import type { ContextMenuTriggerProps } from './types'

defineOptions({ name: 'CaomeiContextMenuTrigger', inheritAttrs: false })

const props = withDefaults(defineProps<ContextMenuTriggerProps>(), {
    unstyled: false,
})

const rootRef = ref<{ $el?: unknown } | null>(null)
const triggerEl = inject(triggerElementKey, null)

onMounted(() => {
    const element = rootRef.value?.$el
    if (triggerEl && element instanceof HTMLElement) {
        triggerEl.value = element
    }
})

onBeforeUnmount(() => {
    if (triggerEl) {
        triggerEl.value = null
    }
})
</script>

<template>
    <ContextMenuTrigger
        ref="rootRef"
        v-bind="$attrs"
        :class="props.unstyled ? undefined : 'caomei-context-menu__trigger'"
    >
        <slot />
    </ContextMenuTrigger>
</template>

<style scoped>
/*
  触发区默认只是「保持内容原样」的容器：`display: contents` 不生成盒，仅提供右键 / 触屏长按开合。

  焦点契约（上游 Reka 同源）：右键菜单打开不移动焦点；Escape 关闭后焦点归还「打开前最后一个焦点元素」
  （通常是 `body` 或所在模态内容），而不是触发区本身。触发区不带 `tabindex`，键盘开合由使用方
  自行提供入口（如按 Shift+F10 时调用 `v-model:open`）。
*/
.caomei-context-menu__trigger {
    box-sizing: border-box;
    display: contents;
}
</style>
