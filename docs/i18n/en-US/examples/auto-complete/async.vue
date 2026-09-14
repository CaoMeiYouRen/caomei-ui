<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiAutoComplete } from '@/components/auto-complete'

interface Fruit {
    label: string
    value: string
}

const ALL_FRUITS: Fruit[] = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
    { label: 'Blueberry', value: 'blueberry' },
    { label: 'Blackberry', value: 'blackberry' },
]

const value = ref('')
const options = ref<Fruit[]>([])
const loading = ref(false)

function onComplete(query: string): void {
    loading.value = true
    // Simulated async request: call your backend here in a real app
    window.setTimeout(() => {
        const keyword = query.trim().toLowerCase()
        options.value = keyword
            ? ALL_FRUITS.filter((fruit) => fruit.label.toLowerCase().includes(keyword))
            : ALL_FRUITS
        loading.value = false
    }, 400)
}
</script>

<template>
    <div class="demo-column">
        <CaomeiAutoComplete
            v-model="value"
            :options="options"
            :loading="loading"
            :debounce="300"
            placeholder="Type a keyword to search"
            label="Fruit search"
            dropdown
            @complete="onComplete"
        />
        <span class="demo-text">
            The complete event fires after 300ms of inactivity; this demo simulates a 400ms response.
        </span>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}

.demo-text {
    color: var(--vp-c-text-2);
    font-size: 13px;
}
</style>
