<script setup lang="ts">
import { CaomeiMenu, CaomeiMenuItem, CaomeiSubMenu } from '@/components/menu'
import { ref } from 'vue'

const open = ref(true)
</script>

<template>
    <CaomeiMenu
        label="Horizontal navigation"
        orientation="horizontal"
        class="demo-menu"
    >
        <CaomeiMenuItem href="#menu-orientation">
            Home
        </CaomeiMenuItem>
        <CaomeiSubMenu
            v-model:open="open"
            label="Workspace"
        >
            <CaomeiMenuItem href="#menu-orientation">
                My tasks
            </CaomeiMenuItem>
            <CaomeiMenuItem
                href="#menu-orientation"
                disabled
            >
                Archive (disabled)
            </CaomeiMenuItem>
        </CaomeiSubMenu>
    </CaomeiMenu>
</template>

<style scoped>
.demo-menu {
    display: inline-flex;
}
</style>
