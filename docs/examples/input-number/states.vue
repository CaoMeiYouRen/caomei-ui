<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiInputNumber } from '@/components/input-number'

const value = ref<number | null>(5)
const empty = ref<number | null>(null)
</script>

<template>
    <div class="demo-column">
        <CaomeiInputNumber
            v-model="value"
            disabled
            placeholder="禁用"
        />
        <CaomeiInputNumber
            v-model="value"
            readonly
            placeholder="只读"
        />
        <CaomeiInputNumber
            v-model="empty"
            invalid
            placeholder="校验失败"
        />
        <CaomeiInputNumber
            v-model="value"
            :controls="false"
            placeholder="隐藏增减按钮"
        />
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}
</style>
