<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiDataTable } from '@/components/data-table'
import type { DataTableColumn, DataTableRowGroupEvent } from '@/components/data-table'

interface Task {
    id: number
    project: string
    title: string
}

const columns: DataTableColumn<Task>[] = [
    { key: 'project', header: 'Project' },
    { key: 'title', header: 'Task' },
]

const data: Task[] = [
    { id: 1, project: 'Frontend', title: 'Component docs' },
    { id: 2, project: 'Frontend', title: 'Style governance' },
    { id: 3, project: 'Backend', title: 'API integration' },
    { id: 4, project: 'Backend', title: 'Data migration' },
]

/** Without v-model:expandedRowGroups this is component-managed: all groups start collapsed */
const lastEvent = ref('')

function onRowGroupExpand(event: DataTableRowGroupEvent): void {
    lastEvent.value = `Expanded: ${event.data}`
}

function onRowGroupCollapse(event: DataTableRowGroupEvent): void {
    lastEvent.value = `Collapsed: ${event.data}`
}
</script>

<template>
    <div class="demo-stack">
        <CaomeiDataTable
            :data="data"
            :columns="columns"
            row-key="id"
            row-group-mode="subheader"
            group-rows-by="project"
            expandable-row-groups
            caption="Tasks (expandable row groups)"
            @rowgroup-expand="onRowGroupExpand"
            @rowgroup-collapse="onRowGroupCollapse"
        />
        <p class="demo-hint">
            {{ lastEvent || 'Groups start collapsed; use the button before a group title to expand' }}
        </p>
    </div>
</template>

<style scoped>
.demo-stack {
    display: grid;
    gap: 12px;
}

.demo-hint {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: 13px;
}
</style>
