<script setup lang="ts">
import {
    CaomeiDropdownMenu,
    CaomeiDropdownMenuContent,
    CaomeiDropdownMenuItem,
    CaomeiDropdownMenuTrigger,
} from '@/components/dropdown-menu'
</script>

<template>
    <CaomeiDropdownMenu modal>
        <CaomeiDropdownMenuTrigger>模态菜单</CaomeiDropdownMenuTrigger>
        <CaomeiDropdownMenuContent>
            <CaomeiDropdownMenuItem>条目一</CaomeiDropdownMenuItem>
            <CaomeiDropdownMenuItem>条目二</CaomeiDropdownMenuItem>
        </CaomeiDropdownMenuContent>
    </CaomeiDropdownMenu>
</template>
