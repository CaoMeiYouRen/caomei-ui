<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiToggleButton } from '@/components/toggle-button'

const on = ref(true)
const off = ref(false)
const disabled = ref(false)
</script>

<template>
    <div class="demo-row">
        <CaomeiToggleButton
            v-model="on"
            label="Pressed"
        >
            Pressed
        </CaomeiToggleButton>
        <CaomeiToggleButton
            v-model="off"
            label="Not pressed"
        >
            Not pressed
        </CaomeiToggleButton>
        <CaomeiToggleButton
            v-model="disabled"
            disabled
            label="Disabled"
        >
            Disabled
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
