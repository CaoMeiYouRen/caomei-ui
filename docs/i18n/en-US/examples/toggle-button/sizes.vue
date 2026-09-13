<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiToggleButton } from '@/components/toggle-button'

const sm = ref(false)
const md = ref(true)
const lg = ref(false)
</script>

<template>
    <div class="demo-row">
        <CaomeiToggleButton
            v-model="sm"
            size="sm"
            label="Small"
        >
            Small
        </CaomeiToggleButton>
        <CaomeiToggleButton
            v-model="md"
            size="md"
            label="Medium"
        >
            Medium
        </CaomeiToggleButton>
        <CaomeiToggleButton
            v-model="lg"
            size="lg"
            label="Large"
        >
            Large
        </CaomeiToggleButton>
    </div>
</template>

<style scoped>
.demo-row {
    display: flex;
    align-items: center;
    gap: 8px;
}
</style>
