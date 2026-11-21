<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiInputOtp } from '@/components/input-otp'

const code = ref('')
</script>

<template>
    <div class="input-otp-states">
        <div class="input-otp-states__item">
            <span class="input-otp-states__label">Alphanumeric</span>
            <CaomeiInputOtp
                model-value="A1B2"
                label="Alphanumeric verification code"
                :length="4"
                type="alphanumeric"
            />
        </div>
        <div class="input-otp-states__item">
            <span class="input-otp-states__label">Invalid</span>
            <CaomeiInputOtp
                model-value="1234"
                label="Invalid verification code"
                :length="4"
                invalid
            />
        </div>
        <div class="input-otp-states__item">
            <span class="input-otp-states__label">Disabled</span>
            <CaomeiInputOtp
                model-value="123456"
                label="Disabled verification code"
                disabled
            />
        </div>
        <div class="input-otp-states__item">
            <span class="input-otp-states__label">Read-only</span>
            <CaomeiInputOtp
                model-value="123456"
                label="Read-only verification code"
                readonly
            />
        </div>
        <div class="input-otp-states__item">
            <span class="input-otp-states__label">Small</span>
            <CaomeiInputOtp
                v-model="code"
                label="Small verification code"
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
