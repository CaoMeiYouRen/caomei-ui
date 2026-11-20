<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiActionSheet, type ActionSheetGroup } from '@/components/action-sheet'
import { CaomeiButton } from '@/components/button'

const open = ref(false)
const selected = ref('')

const groups: ActionSheetGroup[] = [
    {
        items: [
            { label: '分享给成员', value: 'share' },
            { label: '复制链接', value: 'copy' },
            { label: '删除项目', value: 'delete', danger: true, description: '不可撤销' },
        ],
    },
]
</script>

<template>
    <CaomeiButton @click="open = true">
        打开操作面板
    </CaomeiButton>
    <p class="demo-hint">
        最近选择：{{ selected || '—' }}
    </p>

    <CaomeiActionSheet
        v-model:open="open"
        title="更多操作"
        description="选择要执行的操作"
        :groups="groups"
        @select="(value) => {
            selected = String(value ?? '')
        }"
    />
</template>

<style scoped>
.demo-hint {
    margin: var(--caomei-space-2) 0 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>
