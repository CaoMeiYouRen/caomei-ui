<script setup lang="ts">
import { Rocket } from '@lucide/vue'
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { useConfirm } from '@/composables/use-confirm'

const confirmDialog = useConfirm()
const result = ref('—')

async function publish(): Promise<void> {
    const confirmed = await confirmDialog.open({
        title: '发布新版本？',
        description: '发布后所有用户将立即收到更新。',
        icon: Rocket,
        confirmLabel: '立即发布',
        cancelLabel: '再想想',
    })
    result.value = confirmed ? '已发布' : '已取消'
}
</script>

<template>
    <div class="demo-row">
        <CaomeiButton @click="publish">
            发布
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
