<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiSelect } from '@/components/select'

const value = ref<string>('apple')

const options = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
]
</script>

<template>
    <div class="demo-column">
        <CaomeiSelect
            v-model="value"
            size="sm"
            :options="options"
            placeholder="Small"
        />
        <CaomeiSelect
            v-model="value"
            size="md"
            :options="options"
            placeholder="Medium (default)"
        />
        <CaomeiSelect
            v-model="value"
            size="lg"
            :options="options"
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
