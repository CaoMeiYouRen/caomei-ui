<script setup lang="ts">
import { CaomeiAvatar } from '@/components/avatar'
</script>

<template>
    <div class="demo-col">
        <div class="demo-row">
            <CaomeiAvatar size="sm" fallback="S" />
            <CaomeiAvatar size="md" fallback="M" />
            <CaomeiAvatar size="lg" fallback="L" />
        </div>
        <div class="demo-row">
            <CaomeiAvatar shape="circle" fallback="C" />
            <CaomeiAvatar shape="square" fallback="S" />
        </div>
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.demo-row {
    display: flex;
    align-items: center;
    gap: 16px;
}
</style>
