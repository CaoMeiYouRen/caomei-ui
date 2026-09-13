<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiInput } from '@/components/input'

const value = ref('Read-only content')
const empty = ref('')
</script>

<template>
    <div class="demo-column">
        <CaomeiInput
            v-model="value"
            disabled
            placeholder="Disabled"
        />
        <CaomeiInput
            v-model="value"
            readonly
            placeholder="Read-only"
        />
        <CaomeiInput
            v-model="empty"
            invalid
            placeholder="Invalid"
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
