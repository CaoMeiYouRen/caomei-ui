<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiRadioButton, CaomeiRadioGroup } from '@/components/radio-group'

const align = ref<string | number>('left')
</script>

<template>
    <div class="demo-col">
        <CaomeiRadioGroup
            v-model="align"
            orientation="horizontal"
            label="Text alignment"
        >
            <CaomeiRadioButton
                value="left"
                text="Left"
            />
            <CaomeiRadioButton
                value="center"
                text="Center"
            />
            <CaomeiRadioButton
                value="right"
                text="Right"
            />
        </CaomeiRadioGroup>
        <p class="demo-state">
            Current value: {{ align }}
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
