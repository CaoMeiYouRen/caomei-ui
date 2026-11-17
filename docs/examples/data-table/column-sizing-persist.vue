<script setup lang="ts">
import { onMounted, ref } from 'vue'
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

/** 存储键与默认值都由使用方决定：库内不写存储，也不提供拖拽手柄 */
const STORAGE_KEY = 'caomei-ui:demo:column-sizing'
const DEFAULT_SIZING: Record<string, number> = { name: 200, city: 120, note: 260 }
const MIN_WIDTH = 60
const MAX_WIDTH = 480

/** 解析失败、越界、类型不符或缺字段一律回退默认值 */
function readStored(): Record<string, number> {
    const fallback = { ...DEFAULT_SIZING }
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) {
            return fallback
        }
        const parsed: unknown = JSON.parse(raw)
        if (typeof parsed !== 'object' || parsed === null) {
            return fallback
        }
        for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
            if (!Object.hasOwn(DEFAULT_SIZING, key) || typeof value !== 'number' || !Number.isFinite(value)) {
                continue
            }
            if (value < MIN_WIDTH || value > MAX_WIDTH) {
                continue
            }
            fallback[key] = Math.round(value)
        }
        return fallback
    } catch {
        return fallback
    }
}

const columnSizing = ref<Record<string, number>>({ ...DEFAULT_SIZING })
const status = ref<'idle' | 'saved' | 'failed'>('idle')

onMounted(() => {
    columnSizing.value = readStored()
})

function applyPreset(kind: 'default' | 'compact'): void {
    columnSizing.value = kind === 'compact'
        ? { name: 120, city: 100, note: 180 }
        : { ...DEFAULT_SIZING }
    status.value = 'idle'
}

function save(): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(columnSizing.value))
        status.value = 'saved'
    } catch {
        status.value = 'failed'
    }
}

function reset(): void {
    columnSizing.value = { ...DEFAULT_SIZING }
    try {
        localStorage.removeItem(STORAGE_KEY)
    } catch {
        // 存储不可用时只重置当前值
    }
    status.value = 'idle'
}
</script>

<template>
    <div class="demo-stack">
        <CaomeiButtonGroup>
            <CaomeiButton
                size="sm"
                variant="secondary"
                @click="applyPreset('default')"
            >
                默认列宽
            </CaomeiButton>
            <CaomeiButton
                size="sm"
                variant="secondary"
                @click="applyPreset('compact')"
            >
                紧凑列宽
            </CaomeiButton>
            <CaomeiButton
                size="sm"
                @click="save"
            >
                保存
            </CaomeiButton>
            <CaomeiButton
                size="sm"
                variant="secondary"
                @click="reset"
            >
                恢复默认
            </CaomeiButton>
        </CaomeiButtonGroup>
        <p v-if="status === 'saved'">
            已写入 localStorage，刷新页面后自动恢复。
        </p>
        <p v-else-if="status === 'failed'">
            当前环境不可用 localStorage，仅保留本次会话的列宽。
        </p>
        <CaomeiDataTable
            :data="data"
            :columns="columns"
            :column-sizing="columnSizing"
            caption="列宽持久化（使用方职责）"
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
