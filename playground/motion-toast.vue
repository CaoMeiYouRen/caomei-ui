<script setup lang="ts">
import { CaomeiButton, useToast } from '@/index'

/**
 * 动效审查页的 Toast 触发器：`useToast()` 必须在 `<CaomeiToastProvider>` 的后代中调用，
 * 故单独拆一个子组件；按钮文案覆盖四种语气以便对比图标与入场。
 */
const toast = useToast()
</script>

<template>
    <div class="review-row">
        <CaomeiButton @click="toast.show('操作已完成')">
            默认提示
        </CaomeiButton>
        <CaomeiButton
            variant="secondary"
            @click="toast.show({title: '保存成功', description: '更改已同步到服务器。'})"
        >
            标题 + 描述
        </CaomeiButton>
        <CaomeiButton
            variant="secondary"
            @click="toast.success('同步完成')"
        >
            成功
        </CaomeiButton>
        <CaomeiButton
            variant="secondary"
            @click="toast.danger('同步失败')"
        >
            危险
        </CaomeiButton>
    </div>
</template>

<style scoped>
.review-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
</style>
