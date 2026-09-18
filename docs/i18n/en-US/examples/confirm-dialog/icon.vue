<script setup lang="ts">
import { Rocket } from '@lucide/vue'
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { useConfirm } from '@/composables/use-confirm'

const confirmDialog = useConfirm()
const result = ref('—')

async function publish(): Promise<void> {
    const confirmed = await confirmDialog.open({
        title: 'Publish a new version?',
        description: 'Everyone will receive the update as soon as it is published.',
        icon: Rocket,
        confirmLabel: 'Publish now',
        cancelLabel: 'Not yet',
    })
    result.value = confirmed ? 'Published' : 'Cancelled'
}
</script>

<template>
    <div class="demo-row">
        <CaomeiButton @click="publish">
            Publish
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
