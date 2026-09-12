<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiSwitch } from '@/components/switch'

const on = ref(true)
const off = ref(false)
</script>

<template>
    <div class="demo-col">
        <CaomeiSwitch v-model="on" label="开启" />
        <CaomeiSwitch v-model="off" label="关闭" />
        <CaomeiSwitch
            :model-value="true"
            disabled
            label="禁用 · 开启"
        />
        <CaomeiSwitch
            :model-value="false"
            disabled
            label="禁用 · 关闭"
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
