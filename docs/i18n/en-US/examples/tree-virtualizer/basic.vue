<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiTreeVirtualizer } from '@/components/tree-virtualizer'
import type { TreeNode } from '@/components/tree'

const items: TreeNode[] = [
    {
        id: 'docs',
        label: 'Docs',
        children: [
            { id: 'docs-guide', label: 'Guide' },
            { id: 'docs-api', label: 'API' },
        ],
    },
    { id: 'playground', label: 'Playground' },
    { id: 'changelog', label: 'Changelog' },
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
            label="Site outline"
            height="9rem"
        />
        <p class="tree-virtualizer-demo__hint">
            Selected: {{ selected.length ? selected[0] : 'none' }}; expanded: {{ expanded.length ? expanded.join(', ') : 'none' }}
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
