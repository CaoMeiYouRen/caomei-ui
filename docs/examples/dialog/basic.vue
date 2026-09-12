<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiDialog } from '@/components/dialog'

const open = ref(false)
</script>

<template>
    <div class="demo-row">
        <CaomeiButton @click="open = true">
            打开对话框
        </CaomeiButton>
        <CaomeiDialog
            v-model:open="open"
            title="对话框标题"
            description="这是一段用于无障碍说明的描述文本。"
        >
            <p class="demo-text">
                对话框正文内容，可放置表单或任意内容。
            </p>
            <template #footer>
                <CaomeiButton variant="secondary" @click="open = false">
                    取消
                </CaomeiButton>
                <CaomeiButton @click="open = false">
                    确定
                </CaomeiButton>
            </template>
        </CaomeiDialog>
    </div>
</template>

<style scoped>
.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}

.demo-text {
    margin: 0;
}
</style>
