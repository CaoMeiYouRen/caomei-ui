<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiTextarea } from '@/components/textarea'

const value = ref('只读内容')
const empty = ref('')
</script>

<template>
    <div class="demo-column">
        <CaomeiTextarea
            v-model="value"
            disabled
            :rows="2"
            placeholder="禁用"
        />
        <CaomeiTextarea
            v-model="value"
            readonly
            :rows="2"
            placeholder="只读"
        />
        <CaomeiTextarea
            v-model="empty"
            invalid
            :rows="2"
            placeholder="校验失败"
        />
        <CaomeiTextarea
            v-model="empty"
            resize="none"
            :rows="2"
            placeholder="禁止调整尺寸"
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
