<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiDrawer } from '@/components/drawer'

const open = ref(false)
</script>

<template>
    <div class="demo-row">
        <CaomeiButton @click="open = true">
            打开抽屉
        </CaomeiButton>
        <CaomeiDrawer
            v-model:open="open"
            title="抽屉标题"
            description="默认从左侧滑出，用于承载次要内容或设置面板。"
        >
            <p class="demo-text">
                抽屉正文内容，可放置表单或任意内容。
            </p>
            <template #footer>
                <CaomeiButton variant="secondary" @click="open = false">
                    取消
                </CaomeiButton>
                <CaomeiButton @click="open = false">
                    确定
                </CaomeiButton>
            </template>
        </CaomeiDrawer>
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
