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
        <CaomeiDropdownMenuTrigger>Actions</CaomeiDropdownMenuTrigger>
        <CaomeiDropdownMenuContent>
            <CaomeiDropdownMenuLabel>Edit</CaomeiDropdownMenuLabel>
            <CaomeiDropdownMenuGroup>
                <CaomeiDropdownMenuItem shortcut="⌘E">
                    Edit
                </CaomeiDropdownMenuItem>
                <CaomeiDropdownMenuItem shortcut="⌘D">
                    Duplicate
                </CaomeiDropdownMenuItem>
            </CaomeiDropdownMenuGroup>
            <CaomeiDropdownMenuSeparator />
            <CaomeiDropdownMenuGroup>
                <CaomeiDropdownMenuItem shortcut="⌫">
                    Delete
                </CaomeiDropdownMenuItem>
                <CaomeiDropdownMenuItem disabled>
                    Archive (no permission)
                </CaomeiDropdownMenuItem>
            </CaomeiDropdownMenuGroup>
        </CaomeiDropdownMenuContent>
    </CaomeiDropdownMenu>
</template>
