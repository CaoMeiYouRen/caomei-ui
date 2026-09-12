<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiInput } from '@/components/input'

const value = ref('只读内容')
const empty = ref('')
</script>

<template>
    <div class="demo-column">
        <CaomeiInput
            v-model="value"
            disabled
            placeholder="禁用"
        />
        <CaomeiInput
            v-model="value"
            readonly
            placeholder="只读"
        />
        <CaomeiInput
            v-model="empty"
            invalid
            placeholder="校验失败"
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
