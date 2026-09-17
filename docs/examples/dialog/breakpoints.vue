<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiDialog } from '@/components/dialog'

const open = ref(false)
const breakpoints = { '1199px': '85vw', '575px': '95vw' }
</script>

<template>
    <div class="demo-row">
        <CaomeiButton @click="open = true">
            断点宽度对话框
        </CaomeiButton>

        <CaomeiDialog
            v-model:open="open"
            title="断点宽度"
            size="lg"
            :breakpoints="breakpoints"
        >
            <p class="demo-text">
                视口 ≤1199px 时面板宽 85vw，≤575px 时 95vw；命中多个档位时以最窄档为准，与键顺序无关。
            </p>
        </CaomeiDialog>
    </div>
</template>

<style scoped>
.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}

.demo-text {
    margin: 0;
}
</style>
