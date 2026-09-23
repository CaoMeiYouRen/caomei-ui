<script setup lang="ts">
import { computed, ref } from 'vue'
import { CaomeiDataTable } from '@/components/data-table'
import type { DataTableColumn, DataTableSortMeta } from '@/components/data-table'

interface Member {
    dept: string
    name: string
    score: number
}

const columns: DataTableColumn<Member>[] = [
    { key: 'dept', header: '部门', sortable: true },
    { key: 'name', header: '姓名', sortable: true },
    { key: 'score', header: '评分', sortable: true, align: 'right' },
]

const data: Member[] = [
    { dept: '研发', name: '张三', score: 88 },
    { dept: '研发', name: '李四', score: 92 },
    { dept: '设计', name: '王五', score: 75 },
    { dept: '设计', name: '赵六', score: 81 },
]

/** 受控多列排序：先按部门升序，同部门内按评分降序 */
const multiSortMeta = ref<DataTableSortMeta[]>([
    { field: 'dept', order: 1 },
    { field: 'score', order: -1 },
])

const sortText = computed(() =>
    multiSortMeta.value.length === 0
        ? '未排序'
        : multiSortMeta.value
                .map((meta) => `${meta.field} ${meta.order === 1 ? '升序' : '降序'}`)
                .join(' → '),
)
</script>

<template>
    <div class="demo-stack">
        <CaomeiDataTable
            v-model:multi-sort-meta="multiSortMeta"
            :data="data"
            :columns="columns"
            row-key="name"
            sort-mode="multiple"
            caption="团队成员（多列排序）"
        />
        <p class="demo-hint">
            当前排序：{{ sortText }}（按住 Cmd / Ctrl 点击表头可追加排序键）
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
