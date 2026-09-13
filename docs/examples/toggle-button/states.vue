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
            label="已按下"
        >
            已按下
        </CaomeiToggleButton>
        <CaomeiToggleButton
            v-model="off"
            label="未按下"
        >
            未按下
        </CaomeiToggleButton>
        <CaomeiToggleButton
            v-model="disabled"
            disabled
            label="禁用"
        >
            禁用
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
