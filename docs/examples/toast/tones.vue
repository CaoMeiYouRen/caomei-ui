<script setup lang="ts">
import { CaomeiButton } from '@/components/button'
import { useToast } from '@/composables/use-toast'

const toast = useToast()
</script>

<template>
    <div class="demo-row">
        <CaomeiButton variant="secondary" @click="toast.info('已同步最新数据')">
            中性
        </CaomeiButton>
        <CaomeiButton variant="secondary" @click="toast.success('保存成功')">
            成功
        </CaomeiButton>
        <CaomeiButton variant="secondary" @click="toast.warning('存储空间即将用尽')">
            警告
        </CaomeiButton>
        <CaomeiButton variant="secondary" @click="toast.danger('删除失败，请重试')">
            危险
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
