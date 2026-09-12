<script setup lang="ts">
import { computed, ref } from 'vue'
import { CaomeiPassword } from '@/components/password'

const password = ref('')
const length = computed(() => password.value.length)
</script>

<template>
    <div class="demo-column">
        <CaomeiPassword
            v-model="password"
            label="密码"
            placeholder="请输入密码"
        />
        <span class="demo-text">长度：{{ length }}</span>
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
    color: var(--caomei-color-text-muted);
    font-size: 14px;
}
</style>
