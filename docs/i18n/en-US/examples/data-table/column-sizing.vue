<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiButtonGroup } from '@/components/button-group'
import { CaomeiDataTable } from '@/components/data-table'
import type { DataTableColumn } from '@/components/data-table'

interface Row {
    id: number
    name: string
    city: string
    note: string
}

const columns: DataTableColumn<Row>[] = [
    { key: 'name', header: 'Name', width: '120px' },
    { key: 'city', header: 'City', width: '120px' },
    { key: 'note', header: 'Note' },
]

const data: Row[] = [
    { id: 1, name: 'Alice', city: 'Hangzhou', note: 'Active' },
    { id: 2, name: 'Bob', city: 'Shanghai', note: 'Reviewed quarterly' },
]

/** 由使用方自持的列宽（px）；真实项目可存到 localStorage / 用户偏好 */
const columnSizing = ref<Record<string, number>>({ name: 200, city: 120, note: 260 })
const preset = ref<'default' | 'compact'>('default')

function applyPreset(value: 'default' | 'compact'): void {
    preset.value = value
    columnSizing.value = value === 'compact'
        ? { name: 120, city: 100, note: 180 }
        : { name: 200, city: 120, note: 260 }
}
</script>

<template>
    <div class="demo-stack">
        <CaomeiButtonGroup>
            <CaomeiButton
                :variant="preset === 'default' ? 'primary' : 'secondary'"
                size="sm"
                @click="applyPreset('default')"
            >
                Default widths
            </CaomeiButton>
            <CaomeiButton
                :variant="preset === 'compact' ? 'primary' : 'secondary'"
                size="sm"
                @click="applyPreset('compact')"
            >
                Compact widths
            </CaomeiButton>
        </CaomeiButtonGroup>
        <CaomeiDataTable
            :data="data"
            :columns="columns"
            :column-sizing="columnSizing"
            caption="Controlled column widths"
        />
    </div>
</template>

<style scoped>
.demo-stack {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-3);
}
</style>
