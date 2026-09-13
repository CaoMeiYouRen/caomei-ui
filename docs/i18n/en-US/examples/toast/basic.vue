<script setup lang="ts">
import { CaomeiButton } from '@/components/button'
import { useToast } from '@/composables/use-toast'

const toast = useToast()

function showDetailed(): void {
    toast.show({ title: 'Saved', description: 'Changes have been synced to the server.' })
}
</script>

<template>
    <div class="demo-row">
        <CaomeiButton @click="toast.show('Action completed')">
            Show toast
        </CaomeiButton>
        <CaomeiButton variant="secondary" @click="showDetailed">
            Title + description
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
