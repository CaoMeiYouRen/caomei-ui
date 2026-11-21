<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiPopconfirm } from '@/components/popconfirm'

const open = ref(false)
const loading = ref(false)
const message = ref('')

function onConfirm(): void {
    loading.value = true
    setTimeout(() => {
        loading.value = false
        open.value = false
        message.value = '已保存。'
    }, 800)
}
</script>

<template>
    <div class="popconfirm-demo">
        <CaomeiPopconfirm
            v-model:open="open"
            title="保存当前修改？"
            description="保存期间按钮会进入加载态。"
            tone="danger"
            confirm-label="保存"
            :loading="loading"
            @confirm="onConfirm"
        >
            <template #trigger>
                保存
            </template>
        </CaomeiPopconfirm>
        <p
            v-if="message"
            class="popconfirm-demo__hint"
        >
            {{ message }}
        </p>
    </div>
</template>

<style scoped>
.popconfirm-demo {
    display: flex;
    flex-wrap: wrap;
    gap: var(--caomei-space-2);
    align-items: center;
}

.popconfirm-demo__hint {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>
