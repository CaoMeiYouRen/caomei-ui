<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiContextMenu, CaomeiContextMenuContent, CaomeiContextMenuTrigger } from '@/components/context-menu'

const lastAction = ref('')

const items = [
    { label: '查看详情', command: (): string => (lastAction.value = '查看详情') },
    { label: '复制链接', shortcut: '⌘C', command: (): string => (lastAction.value = '复制链接') },
    { separator: true },
    { label: '删除', danger: true, command: (): string => (lastAction.value = '删除') },
]
</script>

<template>
    <div class="cm-demo">
        <CaomeiContextMenu>
            <CaomeiContextMenuTrigger>
                <div class="cm-demo__target">
                    在此区域右键打开菜单
                </div>
            </CaomeiContextMenuTrigger>
            <CaomeiContextMenuContent :model="items" />
        </CaomeiContextMenu>
        <p class="demo-text">
            {{ lastAction ? `最近操作：${lastAction}` : '右键点击上方区域' }}
        </p>
    </div>
</template>

<style scoped>
.cm-demo {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.cm-demo__target {
    padding: 24px;
    border: 1px dashed var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    color: var(--caomei-color-text-muted);
    text-align: center;
}
</style>
