<script setup lang="ts">
import { CaomeiCol } from '@/components/col'
import { CaomeiRow } from '@/components/row'

const mdWide = { span: 12, offset: 0 }
</script>

<template>
    <div class="demo-stack">
        <CaomeiRow :gutter="16">
            <CaomeiCol
                :span="6"
                :md="12"
                :sm="24"
            >
                <div class="demo-cell">
                    6 / md 12 / sm 24
                </div>
            </CaomeiCol>
            <CaomeiCol
                :span="6"
                :md="12"
                :sm="24"
            >
                <div class="demo-cell">
                    6 / md 12 / sm 24
                </div>
            </CaomeiCol>
            <CaomeiCol
                :span="6"
                :md="mdWide"
                :sm="24"
            >
                <div class="demo-cell">
                    6 / md 12 / sm 24
                </div>
            </CaomeiCol>
            <CaomeiCol
                :span="6"
                :md="12"
                :sm="24"
            >
                <div class="demo-cell">
                    6 / md 12 / sm 24
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
