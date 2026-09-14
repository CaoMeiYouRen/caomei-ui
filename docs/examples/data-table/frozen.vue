<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiDataTable } from '@/components/data-table'
import type { DataTableColumn } from '@/components/data-table'

interface MemberRow {
    id: number
    name: string
    email: string
    role: string
    department: string
    city: string
    updatedAt: string
    note: string
    actions: string
    status: string
}

const columns: DataTableColumn<MemberRow>[] = [
    { key: 'name', header: '姓名', width: '120px', frozen: 'left' },
    { key: 'email', header: '邮箱', width: '200px' },
    { key: 'role', header: '角色', width: '120px' },
    { key: 'department', header: '部门', width: '140px' },
    { key: 'city', header: '城市', width: '120px' },
    { key: 'note', header: '备注', width: '220px' },
    { key: 'actions', header: '操作', width: '160px' },
    { key: 'updatedAt', header: '更新时间', width: '180px' },
    { key: 'status', header: '状态', width: '100px', align: 'center', frozen: 'right' },
]

const data: MemberRow[] = [
    { id: 1, name: '张三', email: 'zhangsan@example.com', role: '管理员', department: '技术部', city: '杭州', updatedAt: '2026-09-14 10:00', note: '账号已同步', actions: '编辑', status: '启用' },
    { id: 2, name: '李四', email: 'lisi@example.com', role: '编辑', department: '内容部', city: '上海', updatedAt: '2026-09-13 18:30', note: '账号已同步', actions: '编辑', status: '启用' },
    { id: 3, name: '王五', email: 'wangwu@example.com', role: '访客', department: '市场部', city: '北京', updatedAt: '2026-09-12 09:15', note: '账号已同步', actions: '编辑', status: '停用' },
]
const selection = ref<MemberRow[]>([])

</script>

<template>
    <CaomeiDataTable
        v-model:selection="selection"
        :data="data"
        :columns="columns"
        row-key="id"
        selection-mode="multiple"
        caption="冻结首列与末列（横向滚动查看）"
    />
</template>
