<script setup lang="ts">
import { Check, Ellipsis, Plus, Search } from '@lucide/vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiTag } from '@/components/tag'
import { CaomeiIcon } from '@/icons'
</script>

<template>
    <div class="demo-row">
        <CaomeiButton variant="primary">
            <template #icon>
                <CaomeiIcon :icon="Plus" />
            </template>
            Create
        </CaomeiButton>
        <CaomeiButton
            variant="secondary"
            icon-position="end"
        >
            <template #icon>
                <CaomeiIcon :icon="Search" />
            </template>
            Search
        </CaomeiButton>
        <CaomeiButton
            variant="ghost"
            label="More actions"
        >
            <template #icon>
                <CaomeiIcon :icon="Ellipsis" />
            </template>
        </CaomeiButton>
        <CaomeiTag
            tone="success"
            variant="soft"
        >
            <template #icon>
                <CaomeiIcon :icon="Check" />
            </template>
            Published
        </CaomeiTag>
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
