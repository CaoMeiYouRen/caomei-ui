<script setup lang="ts">
import { CaomeiCol } from '@/components/col'
import { CaomeiRow } from '@/components/row'
</script>

<template>
    <div class="demo-stack">
        <CaomeiRow :gutter="16">
            <CaomeiCol :span="8" :offset="4">
                <div class="demo-cell">
                    span 8 / offset 4
                </div>
            </CaomeiCol>
            <CaomeiCol :span="8">
                <div class="demo-cell">
                    span 8
                </div>
            </CaomeiCol>
        </CaomeiRow>
        <CaomeiRow :gutter="16">
            <CaomeiCol :span="8" :order="2">
                <div class="demo-cell">
                    order 2
                </div>
            </CaomeiCol>
            <CaomeiCol :span="8" :order="1">
                <div class="demo-cell">
                    order 1
                </div>
            </CaomeiCol>
            <CaomeiCol :span="8">
                <div class="demo-cell">
                    order 0
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
    min-height: 48px;
    text-align: center;
    border-radius: var(--caomei-radius-md);
    background: color-mix(in srgb, var(--caomei-color-primary) 12%, transparent);
    color: var(--caomei-color-primary);
}
</style>
