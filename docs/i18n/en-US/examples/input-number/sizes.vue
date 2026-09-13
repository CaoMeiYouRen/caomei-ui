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
            placeholder="Small"
        />
        <CaomeiInputNumber
            v-model="value"
            size="md"
            placeholder="Medium (default)"
        />
        <CaomeiInputNumber
            v-model="value"
            size="lg"
            placeholder="Large"
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
