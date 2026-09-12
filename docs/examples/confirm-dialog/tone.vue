<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { useConfirm } from '@/composables/use-confirm'

const confirmDialog = useConfirm()
const result = ref('—')

async function remove(): Promise<void> {
    const confirmed = await confirmDialog.open({
        title: '删除文件',
        description: '删除后不可恢复。',
        confirmLabel: '删除',
        cancelLabel: '保留',
        tone: 'danger',
    })
    result.value = confirmed ? '已删除' : '已保留'
}
</script>

<template>
    <div class="demo-row">
        <CaomeiButton variant="secondary" @click="remove">
            删除文件
        </CaomeiButton>
        <span class="demo-result">结果：{{ result }}</span>
    </div>
</template>

<style scoped>
.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}

.demo-result {
    color: var(--vp-c-text-2);
    font-size: 13px;
}
</style>
