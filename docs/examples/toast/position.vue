<script setup lang="ts">
import { defineComponent, h, ref, type VNode } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiToastProvider, type ToastPosition } from '@/components/toast'
import { useToast } from '@/composables/use-toast'

const positions: { value: ToastPosition, label: string }[] = [
    { value: 'top-left', label: '左上' },
    { value: 'top-center', label: '中上' },
    { value: 'top-right', label: '右上' },
    { value: 'bottom-left', label: '左下' },
    { value: 'bottom-center', label: '中下' },
    { value: 'bottom-right', label: '右下' },
]

const position = ref<ToastPosition>('bottom-center')

// 演示嵌套 Provider：useToast 解析最近的 Provider，从而覆盖文档站全局默认位置。
const Trigger = defineComponent({
    setup(): () => VNode {
        const toast = useToast()
        return () =>
            h(
                CaomeiButton,
                { onClick: () => toast.success(`当前位置：${position.value}`) },
                () => '显示提示',
            )
    },
})
</script>

<template>
    <div class="demo-col">
        <div class="demo-row">
            <CaomeiButton
                v-for="item in positions"
                :key="item.value"
                variant="secondary"
                @click="position = item.value"
            >
                {{ item.label }}
            </CaomeiButton>
        </div>
        <CaomeiToastProvider :position="position">
            <Trigger />
        </CaomeiToastProvider>
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}
</style>
