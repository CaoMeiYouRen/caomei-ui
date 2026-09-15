<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiInputNumber } from '@/components/input-number'

const grouped = ref<number | null>(1234567.891)
const plain = ref<number | null>(1234567.891)
const amount = ref<number | null>(10)
</script>

<template>
    <div class="demo-col">
        <CaomeiInputNumber v-model="grouped" />
        <CaomeiInputNumber v-model="plain" :use-grouping="false" />
        <CaomeiInputNumber
            v-model="amount"
            :min-fraction-digits="2"
            :max-fraction-digits="2"
        />
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
</style>
