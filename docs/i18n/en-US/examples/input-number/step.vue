<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiInputNumber } from '@/components/input-number'

const integer = ref<number | null>(3)
const decimal = ref<number | null>(1)
</script>

<template>
    <div class="demo-column">
        <CaomeiInputNumber
            v-model="integer"
            :min="0"
            :max="10"
            :step="1"
            placeholder="Integer from 0 to 10"
        />
        <CaomeiInputNumber
            v-model="decimal"
            :min="0"
            :max="2"
            :step="0.1"
            :precision="1"
            placeholder="0 to 2, 1 decimal place"
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
