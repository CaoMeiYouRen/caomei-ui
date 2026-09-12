<script setup lang="ts">
import { CaomeiButton } from '@/components/button'
import { useToast } from '@/composables/use-toast'

const toast = useToast()

function showAction(): void {
    toast.warning({
        title: '已删除「示例文档」',
        description: '误操作可在 8 秒内撤销。',
        duration: 8000,
        action: {
            label: '撤销',
            altText: '撤销删除操作',
            onClick: () => toast.success('删除已撤销'),
        },
    })
}

function showPersistent(): void {
    toast.info({
        title: '常驻提示',
        description: 'duration 为 0 时不会自动关闭，需手动关闭。',
        duration: 0,
    })
}
</script>

<template>
    <div class="demo-row">
        <CaomeiButton @click="showAction">
            带操作按钮
        </CaomeiButton>
        <CaomeiButton variant="secondary" @click="showPersistent">
            常驻提示
        </CaomeiButton>
    </div>
</template>

<style scoped>
.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}
</style>
