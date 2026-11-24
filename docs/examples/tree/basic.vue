<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiTree } from '@/components/tree'

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

const selected = ref<string[]>(['button'])
const expanded = ref<string[]>(['basic'])
</script>

<template>
    <div class="demo-section">
        <p class="demo-hint">
            受控用法：v-model 承载选中键、v-model:expanded 承载展开键；点击节点同时切换展开与选中。
        </p>
        <CaomeiTree
            v-model="selected"
            v-model:expanded="expanded"
            label="组件目录"
            :items="items"
            class="demo-tree"
        />
        <p class="demo-hint">
            当前选中：{{ selected.join(', ') || '无' }}
        </p>
    </div>
</template>

<style scoped>
.demo-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.demo-hint {
    margin: 0;
    font-size: 13px;
    color: var(--caomei-color-text-muted);
}

.demo-tree {
    max-width: 18rem;
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
}
</style>
