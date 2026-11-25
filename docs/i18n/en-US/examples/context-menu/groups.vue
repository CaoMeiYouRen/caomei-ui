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
                    Right-click for groups and shortcuts
                </div>
            </CaomeiContextMenuTrigger>
            <CaomeiContextMenuContent>
                <CaomeiContextMenuGroup>
                    <CaomeiContextMenuLabel>Edit</CaomeiContextMenuLabel>
                    <CaomeiContextMenuItem shortcut="⌘C">
                        Copy
                    </CaomeiContextMenuItem>
                    <CaomeiContextMenuItem shortcut="⌘V">
                        Paste
                    </CaomeiContextMenuItem>
                </CaomeiContextMenuGroup>
                <CaomeiContextMenuSeparator />
                <CaomeiContextMenuGroup>
                    <CaomeiContextMenuLabel>Danger zone</CaomeiContextMenuLabel>
                    <CaomeiContextMenuItem danger>
                        Delete
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
