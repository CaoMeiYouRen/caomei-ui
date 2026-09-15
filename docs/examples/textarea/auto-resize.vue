<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiTextarea } from '@/components/textarea'

const value = ref('高度随内容自动增长：\n新增一行，高度随之增加。')
</script>

<template>
    <CaomeiTextarea
        v-model="value"
        auto-resize
        :rows="2"
        placeholder="输入多行内容试试"
    />
</template>
