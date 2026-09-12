<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiTextarea } from '@/components/textarea'

const value = ref('')
</script>

<template>
    <div class="demo-column">
        <CaomeiTextarea
            v-model="value"
            size="sm"
            :rows="2"
            placeholder="小尺寸"
        />
        <CaomeiTextarea
            v-model="value"
            size="md"
            :rows="3"
            placeholder="中尺寸（默认）"
        />
        <CaomeiTextarea
            v-model="value"
            size="lg"
            :rows="4"
            placeholder="大尺寸"
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
