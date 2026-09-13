<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiCheckbox } from '@/components/checkbox'

const agree = ref(false)
const subscribed = ref(true)
const ariaOnly = ref(false)
</script>

<template>
    <div class="demo-col">
        <CaomeiCheckbox v-model="agree" text="I agree to the terms" />
        <CaomeiCheckbox v-model="subscribed">
            <span>
                Subscribe to updates, see
                <a href="#">Terms of Service</a>
            </span>
        </CaomeiCheckbox>
        <p class="demo-state">
            Agreement: {{ agree ? 'agreed' : 'not agreed' }}; Subscription: {{ subscribed ? 'on' : 'off' }}
        </p>
        <div class="demo-inline">
            <span class="demo-hint">Use label for an accessible name when there is no visible text:</span>
            <CaomeiCheckbox v-model="ariaOnly" label="Standalone toggle" />
        </div>
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.demo-inline {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.demo-hint,
.demo-state {
    color: var(--caomei-color-text-muted);
    font-size: 14px;
}

.demo-state {
    margin: 0;
}
</style>
