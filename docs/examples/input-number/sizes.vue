<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiInputNumber } from '@/components/input-number'

const value = ref<number | null>(1)
</script>

<template>
    <div class="demo-column">
        <CaomeiInputNumber
            v-model="value"
            size="sm"
            placeholder="小尺寸"
        />
        <CaomeiInputNumber
            v-model="value"
            size="md"
            placeholder="中尺寸（默认）"
        />
        <CaomeiInputNumber
            v-model="value"
            size="lg"
            placeholder="大尺寸"
        />
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}
</style>
