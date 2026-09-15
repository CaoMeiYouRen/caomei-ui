<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiColorPicker } from '@/components/color-picker'

const hex = ref('#e63946')
const rgb = ref('#3b82f6')
const inline = ref('#22c55e')

const swatches = ['#e63946', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#111827']
</script>

<template>
    <div class="demo-column">
        <div class="demo-row">
            <CaomeiColorPicker
                v-model="hex"
                format="hex"
                label="hex format"
            />
            <span class="demo-text">{{ hex }}</span>
        </div>

        <div class="demo-row">
            <CaomeiColorPicker
                v-model="rgb"
                format="rgb"
                label="rgb format"
            />
            <span class="demo-text">{{ rgb }}</span>
        </div>

        <div class="demo-row">
            <CaomeiColorPicker
                v-model="inline"
                inline
                :swatches="swatches"
                label="Inline panel"
            />
        </div>

        <div class="demo-row">
            <CaomeiColorPicker
                v-model="hex"
                disabled
                label="Disabled"
            />
            <CaomeiColorPicker
                v-model="rgb"
                invalid
                label="Invalid"
            />
        </div>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
}

.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}

.demo-text {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>
