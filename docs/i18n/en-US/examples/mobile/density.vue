<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiInput } from '@/components/input'
import { CaomeiSelect } from '@/components/select'

const keyword = ref('')
const selected = ref<string | null>('caomei')
const options = [
    { label: 'Caomei preset', value: 'caomei' },
    { label: 'Ink preset', value: 'ink' },
]
</script>

<template>
    <div
        class="demo-row density-demo"
        data-density="touch"
    >
        <CaomeiButton>Save</CaomeiButton>
        <CaomeiInput v-model="keyword" placeholder="Search keywords" />
        <CaomeiSelect
            v-model="selected"
            :options="options"
            label="Theme preset"
        />
    </div>
</template>

<style scoped>
.density-demo {
    padding: var(--caomei-space-4);
    border: 1px dashed var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
}

.density-demo > * {
    max-width: 100%;
}
</style>
