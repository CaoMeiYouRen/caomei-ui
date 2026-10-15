<script setup lang="ts">
import { CaomeiMenu, CaomeiMenuItem, CaomeiSubMenu } from '@/components/menu'
</script>

<template>
    <CaomeiMenu
        label="主导航"
        class="demo-menu"
    >
        <CaomeiMenuItem
            href="#menu-basic"
            current
        >
            概览
        </CaomeiMenuItem>
        <CaomeiSubMenu label="内容管理">
            <CaomeiMenuItem href="#menu-basic">
                文章
            </CaomeiMenuItem>
            <CaomeiMenuItem href="#menu-basic">
                评论
            </CaomeiMenuItem>
        </CaomeiSubMenu>
        <CaomeiMenuItem>退出登录</CaomeiMenuItem>
    </CaomeiMenu>
</template>

<style scoped>
.demo-menu {
    max-width: 240px;
}
</style>
