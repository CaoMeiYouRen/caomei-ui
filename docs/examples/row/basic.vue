<script setup lang="ts">
import { CaomeiCol } from '@/components/col'
import { CaomeiRow } from '@/components/row'
</script>

<template>
    <CaomeiRow :gutter="16">
        <CaomeiCol :span="8">
            <div class="demo-cell">
                8
            </div>
        </CaomeiCol>
        <CaomeiCol :span="8">
            <div class="demo-cell">
                8
            </div>
        </CaomeiCol>
        <CaomeiCol :span="8">
            <div class="demo-cell">
                8
            </div>
        </CaomeiCol>
    </CaomeiRow>
</template>

<style scoped>
.demo-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    border-radius: var(--caomei-radius-md);
    background: color-mix(in srgb, var(--caomei-color-primary) 12%, transparent);
    color: var(--caomei-color-primary);
}
</style>
