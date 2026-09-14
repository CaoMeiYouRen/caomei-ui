<script setup lang="ts">
import { computed, ref } from 'vue'
import { CaomeiAutoComplete } from '@/components/auto-complete'

const options = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
    { label: 'Durian', value: 'durian', disabled: true },
]

const selected = ref<string[]>(['apple'])
const count = computed(() => selected.value.length)
</script>

<template>
    <div class="demo-column">
        <CaomeiAutoComplete
            v-model="selected"
            :options="options"
            multiple
            placeholder="Type or select fruits"
            label="Fruits"
        />
        <span class="demo-text">{{ count }} selected; each tag can be removed</span>
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
