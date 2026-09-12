<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiInput } from '@/components/input'

const value = ref('可清除的内容')
</script>

<template>
    <div class="demo-column">
        <CaomeiInput
            v-model="value"
            clearable
            placeholder="带清除按钮"
        />
        <p class="demo-value">
            当前值：{{ value || '（空）' }}
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
