<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiDialog } from '@/components/dialog'

const open = ref(false)
const hideCount = ref(0)
</script>

<template>
    <div class="demo-row">
        <CaomeiButton @click="open = true">
            无头部对话框
        </CaomeiButton>
        <span class="demo-hint">已关闭 {{ hideCount }} 次</span>

        <CaomeiDialog
            v-model:open="open"
            title="搜索"
            :show-header="false"
            @hide="hideCount += 1"
        >
            <p class="demo-text">
                showHeader 为 false 时不渲染标题区域与关闭按钮，title 仅作为不可见可访问名保留；点击遮罩或按 Esc
                关闭后触发 hide。
            </p>
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

.demo-hint {
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>
