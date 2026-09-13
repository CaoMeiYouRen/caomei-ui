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
    <CaomeiToolbar label="文本格式">
        <CaomeiToolbarToggleGroup
            v-model="format"
            type="multiple"
            label="文本格式"
        >
            <CaomeiToolbarToggleItem
                value="bold"
                label="加粗"
            >
                <CaomeiIcon :icon="Bold" />
            </CaomeiToolbarToggleItem>
            <CaomeiToolbarToggleItem
                value="italic"
                label="斜体"
            >
                <CaomeiIcon :icon="Italic" />
            </CaomeiToolbarToggleItem>
        </CaomeiToolbarToggleGroup>
        <CaomeiToolbarSeparator />
        <span class="demo-state">{{ format.join(' / ') || '无' }}</span>
    </CaomeiToolbar>
</template>

<style scoped>
.demo-state {
    padding: 0 8px;
    color: var(--caomei-color-text-muted);
    font-size: 13px;
}
</style>
