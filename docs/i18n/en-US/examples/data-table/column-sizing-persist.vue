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
    { key: 'name', header: 'Name', width: '120px' },
    { key: 'city', header: 'City', width: '120px' },
    { key: 'note', header: 'Note' },
]

const data: Row[] = [
    { id: 1, name: 'Alice', city: 'Hangzhou', note: 'Long-term' },
    { id: 2, name: 'Bob', city: 'Shanghai', note: 'Quarterly review' },
]

/** The storage key and defaults belong to the consumer: the library neither writes storage nor ships a drag handle */
const STORAGE_KEY = 'caomei-ui:demo:column-sizing'
const DEFAULT_SIZING: Record<string, number> = { name: 200, city: 120, note: 260 }
const MIN_WIDTH = 60
const MAX_WIDTH = 480

/** Parse failures, out-of-range values, wrong types and missing fields all fall back to the defaults */
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
        // When storage is unavailable, only reset the current values
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
                Default widths
            </CaomeiButton>
            <CaomeiButton
                size="sm"
                variant="secondary"
                @click="applyPreset('compact')"
            >
                Compact widths
            </CaomeiButton>
            <CaomeiButton
                size="sm"
                @click="save"
            >
                Save
            </CaomeiButton>
            <CaomeiButton
                size="sm"
                variant="secondary"
                @click="reset"
            >
                Reset
            </CaomeiButton>
        </CaomeiButtonGroup>
        <p v-if="status === 'saved'">
            Saved to localStorage; it is restored after a page reload.
        </p>
        <p v-else-if="status === 'failed'">
            localStorage is unavailable here; widths only last for this session.
        </p>
        <CaomeiDataTable
            :data="data"
            :columns="columns"
            :column-sizing="columnSizing"
            caption="Column sizing persistence (consumer responsibility)"
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
