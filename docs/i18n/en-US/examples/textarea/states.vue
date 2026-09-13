<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiTextarea } from '@/components/textarea'

const value = ref('Read-only content')
const empty = ref('')
</script>

<template>
    <div class="demo-column">
        <CaomeiTextarea
            v-model="value"
            disabled
            :rows="2"
            placeholder="Disabled"
        />
        <CaomeiTextarea
            v-model="value"
            readonly
            :rows="2"
            placeholder="Read-only"
        />
        <CaomeiTextarea
            v-model="empty"
            invalid
            :rows="2"
            placeholder="Invalid"
        />
        <CaomeiTextarea
            v-model="empty"
            resize="none"
            :rows="2"
            placeholder="Resize disabled"
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
