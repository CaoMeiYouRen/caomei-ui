<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiTreeVirtualizer } from '@/components/tree-virtualizer'
import type { TreeNode } from '@/components/tree'

const items: TreeNode[] = [
    {
        id: 'docs',
        label: '文档',
        children: [
            { id: 'docs-guide', label: '指南' },
            { id: 'docs-api', label: 'API' },
        ],
    },
    { id: 'playground', label: '演练场' },
    { id: 'changelog', label: '更新日志' },
]

const expanded = ref<string[]>(['docs'])
const selected = ref<string[]>([])
</script>

<template>
    <div class="tree-virtualizer-demo">
        <CaomeiTreeVirtualizer
            v-model="selected"
            v-model:expanded="expanded"
            :items="items"
            label="站点目录"
            height="9rem"
        />
        <p class="tree-virtualizer-demo__hint">
            已选：{{ selected.length ? selected[0] : '无' }}；展开：{{ expanded.length ? expanded.join('、') : '无' }}
        </p>
    </div>
</template>

<style scoped>
.tree-virtualizer-demo {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-2);
}

.tree-virtualizer-demo__hint {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>
