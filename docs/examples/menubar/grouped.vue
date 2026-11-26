<script setup lang="ts">
import { CaomeiMenubar, CaomeiMenubarContent, CaomeiMenubarItem, CaomeiMenubarMenu, CaomeiMenubarTrigger } from '@/components/menubar'
</script>

<template>
    <CaomeiMenubar aria-label="文档菜单">
        <CaomeiMenubarMenu value="view">
            <CaomeiMenubarTrigger>视图</CaomeiMenubarTrigger>
            <CaomeiMenubarContent>
                <div
                    class="menubar-group"
                    role="group"
                    aria-label="布局"
                >
                    <CaomeiMenubarItem>侧边栏</CaomeiMenubarItem>
                    <CaomeiMenubarItem>状态栏</CaomeiMenubarItem>
                </div>
                <div
                    class="menubar-divider"
                    role="separator"
                />
                <div
                    class="menubar-group"
                    role="group"
                    aria-label="缩放"
                >
                    <CaomeiMenubarItem shortcut="⌘+">
                        放大
                    </CaomeiMenubarItem>
                    <CaomeiMenubarItem shortcut="⌘-">
                        缩小
                    </CaomeiMenubarItem>
                </div>
            </CaomeiMenubarContent>
        </CaomeiMenubarMenu>
    </CaomeiMenubar>
</template>

<style scoped>
.menubar-group {
    display: flex;
    flex-direction: column;
}

.menubar-divider {
    height: 1px;
    margin: var(--caomei-space-1) 0;
    background: var(--caomei-color-border);
}
</style>
