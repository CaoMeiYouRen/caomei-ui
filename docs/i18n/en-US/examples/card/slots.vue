<script setup lang="ts">
import { CaomeiButton } from '@/components/button'
import { CaomeiCard } from '@/components/card'
import { CaomeiTag } from '@/components/tag'
</script>

<template>
    <div class="demo-grid">
        <CaomeiCard hoverable>
            <template #title>
                <span class="demo-title">
                    Custom title
                    <CaomeiTag tone="primary" size="sm">
                        New
                    </CaomeiTag>
                </span>
            </template>
            <template #extra>
                <CaomeiButton variant="ghost" size="sm">
                    More
                </CaomeiButton>
            </template>
            <p class="demo-text">
                Customize the header via the title and extra slots.
            </p>
        </CaomeiCard>

        <CaomeiCard>
            <template #header>
                <div class="demo-header">
                    Fully custom header
                </div>
            </template>
            <p class="demo-text">
                The header slot replaces the default header entirely.
            </p>
            <template #footer>
                <CaomeiButton variant="secondary" size="sm">
                    Cancel
                </CaomeiButton>
                <CaomeiButton size="sm">
                    Confirm
                </CaomeiButton>
            </template>
        </CaomeiCard>

        <CaomeiCard title="Title and footer only">
            <template #footer>
                <CaomeiButton variant="secondary" size="sm">
                    Cancel
                </CaomeiButton>
                <CaomeiButton size="sm">
                    Save
                </CaomeiButton>
            </template>
        </CaomeiCard>
    </div>
</template>

<style scoped>
.demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
}

.demo-title {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.demo-header {
    font-weight: 600;
}

.demo-text {
    margin: 0;
}

.demo-text + * {
    margin-top: 12px;
}
</style>
