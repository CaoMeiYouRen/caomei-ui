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
    { key: 'name', header: '姓名', width: '120px' },
    { key: 'city', header: '城市', width: '120px' },
    { key: 'note', header: '备注' },
]

const data: Row[] = [
    { id: 1, name: '张三', city: '杭州', note: '长期有效' },
    { id: 2, name: '李四', city: '上海', note: '按季度复核' },
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
                默认列宽
            </CaomeiButton>
            <CaomeiButton
                :variant="preset === 'compact' ? 'primary' : 'secondary'"
                size="sm"
                @click="applyPreset('compact')"
            >
                紧凑列宽
            </CaomeiButton>
        </CaomeiButtonGroup>
        <CaomeiDataTable
            :data="data"
            :columns="columns"
            :column-sizing="columnSizing"
            caption="受控列宽"
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
