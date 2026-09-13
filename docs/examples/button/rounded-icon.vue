<script setup lang="ts">
import { ArrowRight, Plus } from '@lucide/vue'
import { CaomeiButton } from '@/components/button'
</script>

<template>
    <div class="demo-row">
        <CaomeiButton rounded>
            <template #icon>
                <Plus :size="16" />
            </template>
            Rounded
        </CaomeiButton>
        <CaomeiButton
            variant="secondary"
            rounded
        >
            Outlined
        </CaomeiButton>
        <CaomeiButton
            variant="ghost"
            icon-position="end"
        >
            Next
            <template #icon>
                <ArrowRight :size="16" />
            </template>
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
