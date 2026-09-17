<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiToggleButton } from '@/components/toggle-button'

const pinned = ref(false)
</script>

<template>
    <div class="demo-row">
        <CaomeiToggleButton
            v-model="pinned"
            on-label="已固定"
            off-label="固定"
        />
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
