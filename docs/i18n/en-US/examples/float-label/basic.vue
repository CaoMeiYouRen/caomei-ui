<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiFloatLabel } from '@/components/float-label'
import { CaomeiInput } from '@/components/input'

const empty = ref('')
const filled = ref('CaoMei UI')
</script>

<template>
    <div class="demo-stack">
        <CaomeiFloatLabel>
            <CaomeiInput id="float-empty" v-model="empty" />
            <label for="float-empty">Name</label>
        </CaomeiFloatLabel>
        <CaomeiFloatLabel>
            <CaomeiInput id="float-filled" v-model="filled" />
            <label for="float-filled">Floats when filled</label>
        </CaomeiFloatLabel>
    </div>
</template>

<style scoped>
.demo-stack {
    display: grid;
    gap: 16px;
    max-width: 320px;
}
</style>
