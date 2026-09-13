<script setup lang="ts">
import { CaomeiButton } from '@/components/button'
import { useToast } from '@/composables/use-toast'

const toast = useToast()

function showAction(): void {
    toast.warning({
        title: 'Deleted "Sample doc"',
        description: 'You can undo within 8 seconds.',
        duration: 8000,
        action: {
            label: 'Undo',
            altText: 'Undo the delete',
            onClick: () => toast.success('Delete undone'),
        },
    })
}

function showPersistent(): void {
    toast.info({
        title: 'Persistent toast',
        description: 'With duration 0 it does not auto-close; dismiss it manually.',
        duration: 0,
    })
}
</script>

<template>
    <div class="demo-row">
        <CaomeiButton @click="showAction">
            With action button
        </CaomeiButton>
        <CaomeiButton variant="secondary" @click="showPersistent">
            Persistent toast
        </CaomeiButton>
    </div>
</template>

<style scoped>
.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}
</style>
