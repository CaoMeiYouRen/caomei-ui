<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiSwitch } from '@/components/switch'

const notifications = ref(true)
const wifi = ref(false)
</script>

<template>
    <div class="demo-col">
        <CaomeiSwitch v-model="notifications" label="Push notifications" />
        <p class="demo-state">
            Push notifications: {{ notifications ? 'On' : 'Off' }}
        </p>
        <CaomeiSwitch v-model="wifi" label="Wi-Fi" />
        <p class="demo-state">
            Wi-Fi: {{ wifi ? 'On' : 'Off' }}
        </p>
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
}

.demo-state {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: 14px;
}
</style>
