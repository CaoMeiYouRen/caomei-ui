<script setup lang="ts">
import { CaomeiContextMenu, CaomeiContextMenuContent, CaomeiContextMenuTrigger } from '@/components/context-menu'

const items = [
    { label: '查看详情' },
    { label: '无权限操作', disabled: true },
    { label: '批量导出', disabled: true },
]
</script>

<template>
    <div class="cm-demo">
        <CaomeiContextMenu>
            <CaomeiContextMenuTrigger>
                <div class="cm-demo__target">
                    右键查看禁用项
                </div>
            </CaomeiContextMenuTrigger>
            <CaomeiContextMenuContent :model="items" />
        </CaomeiContextMenu>
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
