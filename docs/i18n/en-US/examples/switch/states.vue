<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiSwitch } from '@/components/switch'

const on = ref(true)
const off = ref(false)
</script>

<template>
    <div class="demo-col">
        <CaomeiSwitch v-model="on" label="On" />
        <CaomeiSwitch v-model="off" label="Off" />
        <CaomeiSwitch
            :model-value="true"
            disabled
            label="Disabled · On"
        />
        <CaomeiSwitch
            :model-value="false"
            disabled
            label="Disabled · Off"
        />
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
}
</style>
