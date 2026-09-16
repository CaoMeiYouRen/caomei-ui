<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiSelectButton } from '@/components/select-button'

const styles = ref<(string | number)[]>(['bold'])

const options = [
    { label: 'Bold', value: 'bold' },
    { label: 'Italic', value: 'italic' },
    { label: 'Underline', value: 'underline' },
]
</script>

<template>
    <div class="demo-column">
        <CaomeiSelectButton
            v-model="styles"
            :options="options"
            multiple
            label="Font style"
        />
        <p class="demo-state">
            Selected: {{ styles.length ? styles.join(', ') : '(none)' }}
        </p>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
}

.demo-state {
    margin: 0;
    color: var(--vp-c-text-2);
    font-size: 13px;
}
</style>
