<script setup lang="ts">
import { CaomeiCol } from '@/components/col'
import { CaomeiRow } from '@/components/row'
</script>

<template>
    <div class="demo-stack">
        <CaomeiRow :gutter="16">
            <CaomeiCol :span="12">
                <div class="demo-cell">
                    horizontal gutter 16
                </div>
            </CaomeiCol>
            <CaomeiCol :span="12">
                <div class="demo-cell">
                    horizontal gutter 16
                </div>
            </CaomeiCol>
        </CaomeiRow>
        <CaomeiRow :gutter="[16, 12]">
            <CaomeiCol :span="12">
                <div class="demo-cell">
                    horizontal 16 / vertical 12
                </div>
            </CaomeiCol>
            <CaomeiCol :span="12">
                <div class="demo-cell">
                    horizontal 16 / vertical 12
                </div>
            </CaomeiCol>
            <CaomeiCol :span="12">
                <div class="demo-cell">
                    second row
                </div>
            </CaomeiCol>
            <CaomeiCol :span="12">
                <div class="demo-cell">
                    second row
                </div>
            </CaomeiCol>
        </CaomeiRow>
    </div>
</template>

<style scoped>
.demo-stack {
    display: grid;
    gap: 16px;
}

.demo-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 40px;
    border-radius: var(--caomei-radius-md);
    background: color-mix(in srgb, var(--caomei-color-primary) 12%, transparent);
    color: var(--caomei-color-primary);
}
</style>
