<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiPopconfirm } from '@/components/popconfirm'

const message = ref('')

function onConfirm(): void {
    message.value = 'Deleted.'
}

function onCancel(): void {
    message.value = 'Cancelled.'
}
</script>

<template>
    <div class="popconfirm-demo">
        <CaomeiPopconfirm
            title="Delete this project?"
            description="This cannot be undone. Please confirm first."
            @confirm="onConfirm"
            @cancel="onCancel"
        >
            <template #trigger>
                Delete project
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
