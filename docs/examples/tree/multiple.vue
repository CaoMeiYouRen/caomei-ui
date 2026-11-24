<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiTree } from '@/components/tree'

const items = [
    {
        id: 'form',
        label: '表单',
        children: [
            { id: 'checkbox', label: 'Checkbox 复选框' },
            { id: 'select', label: 'Select 选择器' },
            { id: 'slider', label: 'Slider 滑块' },
        ],
    },
    {
        id: 'feedback',
        label: '反馈',
        children: [
            { id: 'message', label: 'Message 消息' },
            { id: 'toast', label: 'Toast 轻提示' },
        ],
    },
]

const selected = ref<string[]>(['select', 'message'])
const expanded = ref<string[]>(['form', 'feedback'])
</script>

<template>
    <div class="demo-section">
        <p class="demo-hint">
            多选：选中集合按顺序回写；自定义 <code>#label</code> 插槽可拿到节点上下文（层级 / 展开 / 选中）。
        </p>
        <CaomeiTree
            v-model="selected"
            v-model:expanded="expanded"
            multiple
            label="组件多选"
            :items="items"
            class="demo-tree"
        >
            <template #label="{item, level}">
                <span class="demo-label">{{ level > 1 ? '· ' : '' }}{{ item.label }}</span>
            </template>
        </CaomeiTree>
        <p class="demo-hint">
            已选 {{ selected.length }} 项
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
    max-width: 20rem;
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
}

.demo-label {
    font-size: 13px;
}
</style>
