<script setup lang="ts">
import { CaomeiDataTable } from '@/components/data-table'
import type { DataTableColumn } from '@/components/data-table'

interface User {
    id: number
    name: string
}

const columns: DataTableColumn<User>[] = [{ key: 'name', header: '姓名' }]
</script>

<template>
    <div class="demo-col">
        <CaomeiDataTable :data="[]" :columns="columns" />

        <CaomeiDataTable :data="[]" :columns="columns">
            <template #empty>
                <span class="demo-empty">暂无成员，点击右上角新增</span>
            </template>
        </CaomeiDataTable>
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.demo-empty {
    color: var(--caomei-color-primary);
}
</style>
