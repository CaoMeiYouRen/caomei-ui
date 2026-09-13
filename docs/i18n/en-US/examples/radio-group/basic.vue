<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiRadioButton, CaomeiRadioGroup } from '@/components/radio-group'

const plan = ref('standard')
</script>

<template>
    <div class="demo-col">
        <CaomeiRadioGroup
            v-model="plan"
            label="Subscription plan"
        >
            <CaomeiRadioButton
                value="free"
                text="Free"
            />
            <CaomeiRadioButton
                value="standard"
                text="Standard"
            />
            <CaomeiRadioButton
                value="pro"
                text="Pro"
            />
        </CaomeiRadioGroup>
        <p class="demo-state">
            Current plan: {{ plan }}
        </p>
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.demo-state {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: 14px;
}
</style>
