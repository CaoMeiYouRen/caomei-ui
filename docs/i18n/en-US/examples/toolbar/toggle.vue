<script setup lang="ts">
import { Bold, Italic } from '@lucide/vue'
import { ref } from 'vue'
import { CaomeiIcon } from '@/icons'
import {
    CaomeiToolbar,
    CaomeiToolbarSeparator,
    CaomeiToolbarToggleGroup,
    CaomeiToolbarToggleItem,
} from '@/components/toolbar'

const format = ref<(string | number)[]>(['bold'])
</script>

<template>
    <CaomeiToolbar label="Text formatting">
        <CaomeiToolbarToggleGroup
            v-model="format"
            type="multiple"
            label="Text formatting"
        >
            <CaomeiToolbarToggleItem
                value="bold"
                label="Bold"
            >
                <CaomeiIcon :icon="Bold" />
            </CaomeiToolbarToggleItem>
            <CaomeiToolbarToggleItem
                value="italic"
                label="Italic"
            >
                <CaomeiIcon :icon="Italic" />
            </CaomeiToolbarToggleItem>
        </CaomeiToolbarToggleGroup>
        <CaomeiToolbarSeparator />
        <span class="demo-state">{{ format.join(' / ') || 'None' }}</span>
    </CaomeiToolbar>
</template>

<style scoped>
.demo-state {
    padding: 0 8px;
    color: var(--caomei-color-text-muted);
    font-size: 13px;
}
</style>
