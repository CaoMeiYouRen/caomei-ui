<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiSelectButton } from '@/components/select-button'

const align = ref<string | number>('left')

const options = [
    { label: '左对齐', value: 'left' },
    { label: '居中', value: 'center' },
    { label: '右对齐', value: 'right' },
]
</script>

<template>
    <div class="demo-column">
        <CaomeiSelectButton
            v-model="align"
            :options="options"
            label="文本对齐"
        />
        <p class="demo-state">
            当前值：{{ align }}
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
