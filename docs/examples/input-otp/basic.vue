<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiInputOtp } from '@/components/input-otp'

const code = ref('')
const completed = ref(false)

function onComplete(): void {
    // 示例不打印验证码本身，只反馈填写状态。
    completed.value = true
}
</script>

<template>
    <div class="input-otp-demo">
        <CaomeiInputOtp
            v-model="code"
            label="验证码"
            :length="6"
            @complete="onComplete"
        />
        <p class="input-otp-demo__hint">
            {{ completed ? '验证码已填满，可以提交。' : '请输入 6 位验证码。' }}
        </p>
    </div>
</template>

<style scoped>
.input-otp-demo {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-2);
    max-width: 24rem;
}

.input-otp-demo__hint {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>
