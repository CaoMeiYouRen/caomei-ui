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
    { key: 'project', header: '项目' },
    { key: 'title', header: '任务' },
]

const data: Task[] = [
    { id: 1, project: '前端', title: '组件库文档' },
    { id: 2, project: '前端', title: '样式治理' },
    { id: 3, project: '后端', title: '接口联调' },
    { id: 4, project: '后端', title: '数据迁移' },
]

/** 未传 v-model:expandedRowGroups 时为自持模式：缺省全部收起 */
const lastEvent = ref('')

function onRowGroupExpand(event: DataTableRowGroupEvent): void {
    lastEvent.value = `展开：${event.data}`
}

function onRowGroupCollapse(event: DataTableRowGroupEvent): void {
    lastEvent.value = `收起：${event.data}`
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
            caption="任务（可折叠分组）"
            @rowgroup-expand="onRowGroupExpand"
            @rowgroup-collapse="onRowGroupCollapse"
        />
        <p class="demo-hint">
            {{ lastEvent || '分组缺省全部收起，点击分组标题前的按钮展开' }}
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
