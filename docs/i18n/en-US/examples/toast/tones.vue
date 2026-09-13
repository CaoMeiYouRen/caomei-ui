<script setup lang="ts">
import { CaomeiButton } from '@/components/button'
import { useToast } from '@/composables/use-toast'

const toast = useToast()
</script>

<template>
    <div class="demo-row">
        <CaomeiButton variant="secondary" @click="toast.info('Latest data synced')">
            Neutral
        </CaomeiButton>
        <CaomeiButton variant="secondary" @click="toast.success('Saved successfully')">
            Success
        </CaomeiButton>
        <CaomeiButton variant="secondary" @click="toast.warning('Storage is almost full')">
            Warning
        </CaomeiButton>
        <CaomeiButton variant="secondary" @click="toast.danger('Delete failed, please retry')">
            Danger
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
