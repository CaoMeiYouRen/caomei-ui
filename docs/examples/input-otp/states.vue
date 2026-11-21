<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiInputOtp } from '@/components/input-otp'

const code = ref('')
</script>

<template>
    <div class="input-otp-states">
        <div class="input-otp-states__item">
            <span class="input-otp-states__label">字母数字</span>
            <CaomeiInputOtp
                model-value="A1B2"
                label="字母数字验证码"
                :length="4"
                type="alphanumeric"
            />
        </div>
        <div class="input-otp-states__item">
            <span class="input-otp-states__label">校验失败</span>
            <CaomeiInputOtp
                model-value="1234"
                label="校验失败的验证码"
                :length="4"
                invalid
            />
        </div>
        <div class="input-otp-states__item">
            <span class="input-otp-states__label">禁用</span>
            <CaomeiInputOtp
                model-value="123456"
                label="禁用的验证码"
                disabled
            />
        </div>
        <div class="input-otp-states__item">
            <span class="input-otp-states__label">只读</span>
            <CaomeiInputOtp
                model-value="123456"
                label="只读的验证码"
                readonly
            />
        </div>
        <div class="input-otp-states__item">
            <span class="input-otp-states__label">小尺寸</span>
            <CaomeiInputOtp
                v-model="code"
                label="小尺寸验证码"
                :length="4"
                size="sm"
            />
        </div>
    </div>
</template>

<style scoped>
.input-otp-states {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-4);
}

.input-otp-states__item {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-1);
    max-width: 24rem;
}

.input-otp-states__label {
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>
