<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { useConfirm } from '@/composables/use-confirm'

const confirmDialog = useConfirm()
const result = ref('—')

async function ask(): Promise<void> {
    const confirmed = await confirmDialog.confirm({
        title: '保存更改？',
        description: '更改将同步到服务器。',
    })
    result.value = confirmed ? '已确认' : '已取消'
}
</script>

<template>
    <div class="demo-row">
        <CaomeiButton @click="ask">
            保存更改
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
