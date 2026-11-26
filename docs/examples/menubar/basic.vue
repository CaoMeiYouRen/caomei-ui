<script setup lang="ts">
import { CaomeiMenubar, CaomeiMenubarContent, CaomeiMenubarItem, CaomeiMenubarMenu, CaomeiMenubarTrigger } from '@/components/menubar'
</script>

<template>
    <CaomeiMenubar aria-label="文档菜单">
        <CaomeiMenubarMenu value="file">
            <CaomeiMenubarTrigger>文件</CaomeiMenubarTrigger>
            <CaomeiMenubarContent>
                <CaomeiMenubarItem shortcut="⌘N">
                    新建文档
                </CaomeiMenubarItem>
                <CaomeiMenubarItem shortcut="⌘O">
                    打开…
                </CaomeiMenubarItem>
                <CaomeiMenubarItem disabled>
                    保存（只读）
                </CaomeiMenubarItem>
            </CaomeiMenubarContent>
        </CaomeiMenubarMenu>
        <CaomeiMenubarMenu value="edit">
            <CaomeiMenubarTrigger>编辑</CaomeiMenubarTrigger>
            <CaomeiMenubarContent>
                <CaomeiMenubarItem shortcut="⌘Z">
                    撤销
                </CaomeiMenubarItem>
                <CaomeiMenubarItem shortcut="⇧⌘Z">
                    重做
                </CaomeiMenubarItem>
            </CaomeiMenubarContent>
        </CaomeiMenubarMenu>
        <CaomeiMenubarMenu value="help">
            <CaomeiMenubarTrigger>帮助</CaomeiMenubarTrigger>
            <CaomeiMenubarContent>
                <CaomeiMenubarItem>使用文档</CaomeiMenubarItem>
            </CaomeiMenubarContent>
        </CaomeiMenubarMenu>
    </CaomeiMenubar>
</template>
