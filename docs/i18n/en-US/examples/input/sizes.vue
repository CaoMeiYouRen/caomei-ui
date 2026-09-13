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
            placeholder="Small"
        />
        <CaomeiInput
            v-model="value"
            size="md"
            placeholder="Medium (default)"
        />
        <CaomeiInput
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
