<script setup lang="ts">
import { Bold, Italic, Underline } from '@lucide/vue'
import { ref } from 'vue'
import { CaomeiIcon } from '@/icons'
import { CaomeiToggleButton } from '@/components/toggle-button'

const format = ref({ bold: true, italic: false, underline: false })
</script>

<template>
    <div class="demo-row">
        <CaomeiToggleButton
            v-model="format.bold"
            label="Bold"
        >
            <CaomeiIcon :icon="Bold" />
        </CaomeiToggleButton>
        <CaomeiToggleButton
            v-model="format.italic"
            label="Italic"
        >
            <CaomeiIcon :icon="Italic" />
        </CaomeiToggleButton>
        <CaomeiToggleButton
            v-model="format.underline"
            label="Underline"
        >
            <CaomeiIcon :icon="Underline" />
        </CaomeiToggleButton>
    </div>
</template>

<style scoped>
.demo-row {
    display: flex;
    gap: 4px;
}
</style>
