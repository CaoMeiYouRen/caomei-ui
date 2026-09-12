<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiInputNumber } from '@/components/input-number'

const value = ref<number | null>(1)
</script>

<template>
    <div class="demo-column">
        <CaomeiInputNumber v-model="value" placeholder="请输入数量" />
        <p class="demo-value">
            当前值：{{ value ?? '（空）' }}
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
