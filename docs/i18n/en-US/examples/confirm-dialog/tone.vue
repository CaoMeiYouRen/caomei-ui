<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { useConfirm } from '@/composables/use-confirm'

const confirmDialog = useConfirm()
const result = ref('—')

async function remove(): Promise<void> {
    const confirmed = await confirmDialog.open({
        title: 'Delete file',
        description: 'This cannot be undone.',
        confirmLabel: 'Delete',
        cancelLabel: 'Keep',
        tone: 'danger',
    })
    result.value = confirmed ? 'Deleted' : 'Kept'
}
</script>

<template>
    <div class="demo-row">
        <CaomeiButton variant="secondary" @click="remove">
            Delete file
        </CaomeiButton>
        <span class="demo-result">Result: {{ result }}</span>
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
