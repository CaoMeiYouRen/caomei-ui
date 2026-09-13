<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiInputNumber } from '@/components/input-number'

const value = ref<number | null>(5)
const empty = ref<number | null>(null)
</script>

<template>
    <div class="demo-column">
        <CaomeiInputNumber
            v-model="value"
            disabled
            placeholder="Disabled"
        />
        <CaomeiInputNumber
            v-model="value"
            readonly
            placeholder="Read-only"
        />
        <CaomeiInputNumber
            v-model="empty"
            invalid
            placeholder="Invalid"
        />
        <CaomeiInputNumber
            v-model="value"
            :controls="false"
            placeholder="Steppers hidden"
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
