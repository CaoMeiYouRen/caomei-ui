<script setup lang="ts">
import { CaomeiAvatar } from '@/components/avatar'
</script>

<template>
    <div class="demo-row">
        <CaomeiAvatar alt="alice" />
        <CaomeiAvatar fallback="CM" />
        <CaomeiAvatar alt="Alice">
            <template #fallback>
                <span class="demo-badge">A</span>
            </template>
        </CaomeiAvatar>
    </div>
</template>

<style scoped>
.demo-row {
    display: flex;
    align-items: center;
    gap: 16px;
}

.demo-badge {
    font-size: 12px;
}
</style>
