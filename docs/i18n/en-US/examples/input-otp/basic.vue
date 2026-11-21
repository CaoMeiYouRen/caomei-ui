<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiInputOtp } from '@/components/input-otp'

const code = ref('')
const completed = ref(false)

function onComplete(): void {
    // The example does not print the code itself, only the fill state.
    completed.value = true
}
</script>

<template>
    <div class="input-otp-demo">
        <CaomeiInputOtp
            v-model="code"
            label="Verification code"
            :length="6"
            @complete="onComplete"
        />
        <p class="input-otp-demo__hint">
            {{ completed ? 'The code is complete and ready to submit.' : 'Enter the 6-digit code.' }}
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
