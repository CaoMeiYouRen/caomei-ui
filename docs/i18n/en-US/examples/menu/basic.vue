<script setup lang="ts">
import { CaomeiMenu, CaomeiMenuItem, CaomeiSubMenu } from '@/components/menu'
</script>

<template>
    <CaomeiMenu
        label="Main navigation"
        class="demo-menu"
    >
        <CaomeiMenuItem
            href="#menu-basic"
            current
        >
            Overview
        </CaomeiMenuItem>
        <CaomeiSubMenu label="Content">
            <CaomeiMenuItem href="#menu-basic">
                Articles
            </CaomeiMenuItem>
            <CaomeiMenuItem href="#menu-basic">
                Comments
            </CaomeiMenuItem>
        </CaomeiSubMenu>
        <CaomeiMenuItem>Sign out</CaomeiMenuItem>
    </CaomeiMenu>
</template>

<style scoped>
.demo-menu {
    max-width: 240px;
}
</style>
