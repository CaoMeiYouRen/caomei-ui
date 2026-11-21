<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiPopconfirm } from '@/components/popconfirm'

const message = ref('')

function onConfirm(): void {
    message.value = '已删除。'
}

function onCancel(): void {
    message.value = '已取消。'
}
</script>

<template>
    <div class="popconfirm-demo">
        <CaomeiPopconfirm
            title="删除该项目？"
            description="删除后无法恢复，请先确认。"
            @confirm="onConfirm"
            @cancel="onCancel"
        >
            <template #trigger>
                删除项目
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
