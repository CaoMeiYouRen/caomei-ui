<script setup lang="ts">
import { Download, RefreshCw } from '@lucide/vue'
import { CaomeiIcon } from '@/icons'
import { CaomeiSplitButton } from '@/components/split-button'
import type { SplitButtonMenuItem } from '@/components/split-button'

const items: SplitButtonMenuItem[] = [
    { label: 'Export as CSV', icon: Download },
    { label: 'Regenerate', icon: RefreshCw },
]
</script>

<template>
    <div class="demo-column">
        <div class="demo-row">
            <CaomeiSplitButton :model="items">
                Default
            </CaomeiSplitButton>
            <CaomeiSplitButton
                variant="secondary"
                :model="items"
            >
                secondary
            </CaomeiSplitButton>
            <CaomeiSplitButton
                variant="ghost"
                :model="items"
            >
                ghost
            </CaomeiSplitButton>
        </div>

        <div class="demo-row">
            <CaomeiSplitButton
                tone="danger"
                :model="items"
            >
                danger
            </CaomeiSplitButton>
            <CaomeiSplitButton
                size="sm"
                :model="items"
            >
                sm
            </CaomeiSplitButton>
            <CaomeiSplitButton
                size="lg"
                :model="items"
            >
                lg
            </CaomeiSplitButton>
            <CaomeiSplitButton
                rounded
                :model="items"
            >
                Pill
            </CaomeiSplitButton>
        </div>

        <div class="demo-row">
            <CaomeiSplitButton
                disabled
                :model="items"
            >
                Disabled
            </CaomeiSplitButton>
            <CaomeiSplitButton
                loading
                :model="items"
            >
                Loading
            </CaomeiSplitButton>
        </div>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
}

.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}
</style>
