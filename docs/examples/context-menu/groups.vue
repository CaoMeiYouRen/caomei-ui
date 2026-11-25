<script setup lang="ts">
import {
    CaomeiContextMenu,
    CaomeiContextMenuContent,
    CaomeiContextMenuGroup,
    CaomeiContextMenuItem,
    CaomeiContextMenuLabel,
    CaomeiContextMenuSeparator,
    CaomeiContextMenuTrigger,
} from '@/components/context-menu'
</script>

<template>
    <div class="cm-demo">
        <CaomeiContextMenu>
            <CaomeiContextMenuTrigger>
                <div class="cm-demo__target">
                    右键查看分组与快捷键
                </div>
            </CaomeiContextMenuTrigger>
            <CaomeiContextMenuContent>
                <CaomeiContextMenuGroup>
                    <CaomeiContextMenuLabel>编辑</CaomeiContextMenuLabel>
                    <CaomeiContextMenuItem shortcut="⌘C">
                        复制
                    </CaomeiContextMenuItem>
                    <CaomeiContextMenuItem shortcut="⌘V">
                        粘贴
                    </CaomeiContextMenuItem>
                </CaomeiContextMenuGroup>
                <CaomeiContextMenuSeparator />
                <CaomeiContextMenuGroup>
                    <CaomeiContextMenuLabel>危险操作</CaomeiContextMenuLabel>
                    <CaomeiContextMenuItem danger>
                        删除
                    </CaomeiContextMenuItem>
                </CaomeiContextMenuGroup>
            </CaomeiContextMenuContent>
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
