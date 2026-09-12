<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiTextarea } from '@/components/textarea'

const value = ref('')
</script>

<template>
    <div class="demo-column">
        <CaomeiTextarea
            v-model="value"
            placeholder="请输入多行内容"
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
