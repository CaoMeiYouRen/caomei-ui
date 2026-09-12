<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiInput } from '@/components/input'

const value = ref('')
</script>

<template>
    <div class="demo-column">
        <CaomeiInput
            v-model="value"
            size="sm"
            placeholder="小尺寸"
        />
        <CaomeiInput
            v-model="value"
            size="md"
            placeholder="中尺寸（默认）"
        />
        <CaomeiInput
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
