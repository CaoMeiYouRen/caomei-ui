<script setup lang="ts">
import {
    CaomeiDropdownMenu,
    CaomeiDropdownMenuContent,
    CaomeiDropdownMenuItem,
    CaomeiDropdownMenuTrigger,
} from '@/components/dropdown-menu'
</script>

<template>
    <CaomeiDropdownMenu>
        <CaomeiDropdownMenuTrigger disabled>
            已停用
        </CaomeiDropdownMenuTrigger>
        <CaomeiDropdownMenuContent>
            <CaomeiDropdownMenuItem>不可达条目</CaomeiDropdownMenuItem>
        </CaomeiDropdownMenuContent>
    </CaomeiDropdownMenu>
</template>
