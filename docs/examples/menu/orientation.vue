<script setup lang="ts">
import { CaomeiMenu, CaomeiMenuItem, CaomeiSubMenu } from '@/components/menu'
import { ref } from 'vue'

const open = ref(true)
</script>

<template>
    <CaomeiMenu
        label="横向导航"
        orientation="horizontal"
        class="demo-menu"
    >
        <CaomeiMenuItem href="#menu-orientation">
            首页
        </CaomeiMenuItem>
        <CaomeiSubMenu
            v-model:open="open"
            label="工作台"
        >
            <CaomeiMenuItem href="#menu-orientation">
                我的任务
            </CaomeiMenuItem>
            <CaomeiMenuItem
                href="#menu-orientation"
                disabled
            >
                归档（禁用）
            </CaomeiMenuItem>
        </CaomeiSubMenu>
    </CaomeiMenu>
</template>

<style scoped>
.demo-menu {
    display: inline-flex;
}
</style>
