<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiTreeSelect } from '@/components/tree-select'

const items = [
    {
        id: 'basic',
        label: '基础组件',
        children: [
            { id: 'button', label: 'Button 按钮' },
            { id: 'input', label: 'Input 输入框' },
        ],
    },
    {
        id: 'display',
        label: '数据展示',
        children: [
            { id: 'data-table', label: 'DataTable 表格' },
            { id: 'tree', label: 'Tree 树形控件' },
        ],
    },
    { id: 'disabled', label: '暂不可用', disabled: true },
]

const value = ref<string[]>(['input'])
</script>

<template>
    <div class="demo-section">
        <p class="demo-hint">
            单选：点击字段展开面板，方向键移动焦点，按 Enter / Space 或点击选中后自动收起并回显；clearable 提供清空。
        </p>
        <CaomeiTreeSelect
            v-model="value"
            label="所属模块"
            placeholder="请选择模块"
            clearable
            :items="items"
        />
        <p class="demo-hint">
            当前值：{{ value.join(', ') || '空' }}
        </p>
    </div>
</template>

<style scoped>
.demo-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 20rem;
}

.demo-hint {
    margin: 0;
    font-size: 13px;
    color: var(--caomei-color-text-muted);
}
</style>
