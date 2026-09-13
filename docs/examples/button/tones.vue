<script setup lang="ts">
import { CaomeiButton } from '@/components/button'
</script>

<template>
    <div class="demo-row">
        <CaomeiButton tone="primary">
            Primary
        </CaomeiButton>
        <CaomeiButton tone="neutral">
            Neutral
        </CaomeiButton>
        <CaomeiButton tone="success">
            Success
        </CaomeiButton>
        <CaomeiButton tone="warning">
            Warning
        </CaomeiButton>
        <CaomeiButton tone="danger">
            Danger
        </CaomeiButton>
        <CaomeiButton
            tone="danger"
            variant="secondary"
        >
            Danger outline
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
