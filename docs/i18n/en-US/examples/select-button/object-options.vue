<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiSelectButton } from '@/components/select-button'

interface Level {
    id: number
    name: string
}

const value = ref<number>(1)

const levels: Level[] = [
    { id: 1, name: 'Low' },
    { id: 2, name: 'Medium' },
    { id: 3, name: 'High' },
]
</script>

<template>
    <div class="demo-column">
        <CaomeiSelectButton
            v-model="value"
            :options="levels"
            option-label="name"
            option-value="id"
            label="Priority"
        />
        <p class="demo-value">
            Value: {{ value }}
        </p>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}

.demo-value {
    margin: 0;
    font-size: 13px;
    color: var(--vp-c-text-2);
}
</style>
