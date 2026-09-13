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
        <CaomeiDropdownMenuTrigger>Modal menu</CaomeiDropdownMenuTrigger>
        <CaomeiDropdownMenuContent>
            <CaomeiDropdownMenuItem>Item one</CaomeiDropdownMenuItem>
            <CaomeiDropdownMenuItem>Item two</CaomeiDropdownMenuItem>
        </CaomeiDropdownMenuContent>
    </CaomeiDropdownMenu>
</template>
