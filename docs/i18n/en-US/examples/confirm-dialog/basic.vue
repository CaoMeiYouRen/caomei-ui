<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { useConfirm } from '@/composables/use-confirm'

const confirmDialog = useConfirm()
const result = ref('—')

async function ask(): Promise<void> {
    const confirmed = await confirmDialog.confirm({
        title: 'Save changes?',
        description: 'Changes will be synced to the server.',
    })
    result.value = confirmed ? 'Confirmed' : 'Cancelled'
}
</script>

<template>
    <div class="demo-row">
        <CaomeiButton @click="ask">
            Save changes
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
