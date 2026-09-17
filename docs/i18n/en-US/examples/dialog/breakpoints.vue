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
            Breakpoint dialog
        </CaomeiButton>

        <CaomeiDialog
            v-model:open="open"
            title="Breakpoint width"
            size="lg"
            :breakpoints="breakpoints"
        >
            <p class="demo-text">
                At viewports ≤1199px the panel is 85vw wide, ≤575px it is 95vw; when several breakpoints match
                the narrowest wins, regardless of key order.
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
