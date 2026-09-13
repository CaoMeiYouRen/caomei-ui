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
            Disabled
        </CaomeiDropdownMenuTrigger>
        <CaomeiDropdownMenuContent>
            <CaomeiDropdownMenuItem>Unreachable item</CaomeiDropdownMenuItem>
        </CaomeiDropdownMenuContent>
    </CaomeiDropdownMenu>
</template>
