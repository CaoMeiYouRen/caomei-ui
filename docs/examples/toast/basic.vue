<script setup lang="ts">
import { CaomeiButton } from '@/components/button'
import { useToast } from '@/composables/use-toast'

const toast = useToast()

function showDetailed(): void {
    toast.show({ title: '保存成功', description: '更改已同步到服务器。' })
}
</script>

<template>
    <div class="demo-row">
        <CaomeiButton @click="toast.show('操作已完成')">
            显示提示
        </CaomeiButton>
        <CaomeiButton variant="secondary" @click="showDetailed">
            标题 + 描述
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
