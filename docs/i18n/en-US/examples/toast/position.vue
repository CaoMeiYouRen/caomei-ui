<script setup lang="ts">
import { defineComponent, h, ref, type VNode } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiToastProvider, type ToastPosition } from '@/components/toast'
import { useToast } from '@/composables/use-toast'

const positions: { value: ToastPosition, label: string }[] = [
    { value: 'top-left', label: 'Top left' },
    { value: 'top-center', label: 'Top center' },
    { value: 'top-right', label: 'Top right' },
    { value: 'bottom-left', label: 'Bottom left' },
    { value: 'bottom-center', label: 'Bottom center' },
    { value: 'bottom-right', label: 'Bottom right' },
]

const position = ref<ToastPosition>('bottom-center')

// Demonstrates a nested Provider: useToast resolves the nearest Provider,
// overriding the docs site's global default position.
const Trigger = defineComponent({
    setup(): () => VNode {
        const toast = useToast()
        return () =>
            h(
                CaomeiButton,
                { onClick: () => toast.success(`Current position: ${position.value}`) },
                () => 'Show toast',
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
