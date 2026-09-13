<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiInput } from '@/components/input'

const value = ref('Clearable content')
</script>

<template>
    <div class="demo-column">
        <CaomeiInput
            v-model="value"
            clearable
            placeholder="With a clear button"
        />
        <p class="demo-value">
            Value: {{ value || '(empty)' }}
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
