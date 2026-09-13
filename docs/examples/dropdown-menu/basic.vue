<script setup lang="ts">
import {
    CaomeiDropdownMenu,
    CaomeiDropdownMenuContent,
    CaomeiDropdownMenuGroup,
    CaomeiDropdownMenuItem,
    CaomeiDropdownMenuLabel,
    CaomeiDropdownMenuSeparator,
    CaomeiDropdownMenuTrigger,
} from '@/components/dropdown-menu'
</script>

<template>
    <CaomeiDropdownMenu>
        <CaomeiDropdownMenuTrigger>操作</CaomeiDropdownMenuTrigger>
        <CaomeiDropdownMenuContent>
            <CaomeiDropdownMenuLabel>编辑</CaomeiDropdownMenuLabel>
            <CaomeiDropdownMenuGroup>
                <CaomeiDropdownMenuItem shortcut="⌘E">
                    编辑
                </CaomeiDropdownMenuItem>
                <CaomeiDropdownMenuItem shortcut="⌘D">
                    复制
                </CaomeiDropdownMenuItem>
            </CaomeiDropdownMenuGroup>
            <CaomeiDropdownMenuSeparator />
            <CaomeiDropdownMenuGroup>
                <CaomeiDropdownMenuItem shortcut="⌫">
                    删除
                </CaomeiDropdownMenuItem>
                <CaomeiDropdownMenuItem disabled>
                    归档（无权限）
                </CaomeiDropdownMenuItem>
            </CaomeiDropdownMenuGroup>
        </CaomeiDropdownMenuContent>
    </CaomeiDropdownMenu>
</template>
