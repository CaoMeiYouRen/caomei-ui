<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiTreeVirtualizer } from '@/components/tree-virtualizer'
import type { TreeNode } from '@/components/tree'

/** 200 个根节点、每个 20 个子节点：共 4200 个节点，DOM 只渲染可视区附近的行 */
const items: TreeNode[] = Array.from({ length: 200 }, (_, index) => ({
    id: `group-${index}`,
    label: `分组 ${index + 1}`,
    children: Array.from({ length: 20 }, (_, childIndex) => ({
        id: `group-${index}-item-${childIndex}`,
        label: `条目 ${index + 1}-${childIndex + 1}`,
    })),
}))

const expanded = ref<string[]>(['group-0', 'group-1'])
</script>

<template>
    <div class="tree-virtualizer-demo">
        <CaomeiTreeVirtualizer
            v-model:expanded="expanded"
            :items="items"
            label="大数据列表"
            height="16rem"
            :overscan="6"
        />
        <p class="tree-virtualizer-demo__hint">
            {{ items.length }} 个分组 / 共 {{ items.reduce((sum, item) => sum + (item.children?.length ?? 0), 0) }} 个子节点；展开 {{ expanded.length }} 组
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
