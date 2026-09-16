<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiSelectButton } from '@/components/select-button'

const styles = ref<(string | number)[]>(['bold'])

const options = [
    { label: '加粗', value: 'bold' },
    { label: '斜体', value: 'italic' },
    { label: '下划线', value: 'underline' },
]
</script>

<template>
    <div class="demo-column">
        <CaomeiSelectButton
            v-model="styles"
            :options="options"
            multiple
            label="字体样式"
        />
        <p class="demo-state">
            已选：{{ styles.length ? styles.join('、') : '（无）' }}
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
