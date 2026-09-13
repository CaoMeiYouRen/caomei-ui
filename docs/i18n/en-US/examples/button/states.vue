<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'

const loading = ref(false)

async function onClick(): Promise<void> {
    loading.value = true
    await new Promise((resolve) => setTimeout(resolve, 1200))
    loading.value = false
}
</script>

<template>
    <div class="demo-column">
        <div class="demo-row">
            <CaomeiButton disabled>
                Disabled
            </CaomeiButton>
            <CaomeiButton
                :loading="loading"
                @click="onClick"
            >
                {{ loading ? 'Loading…' : 'Click to load' }}
            </CaomeiButton>
        </div>
        <CaomeiButton block>
            Block button
        </CaomeiButton>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}

.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}
</style>
