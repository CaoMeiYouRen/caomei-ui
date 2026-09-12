<script setup lang="ts">
import { CaomeiAvatar } from '@/components/avatar'
</script>

<template>
    <div class="demo-row">
        <CaomeiAvatar alt="alice" />
        <CaomeiAvatar fallback="CM" />
        <CaomeiAvatar alt="草梅友仁">
            <template #fallback>
                <span class="demo-badge">友</span>
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
