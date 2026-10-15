<script setup lang="ts">
import { CaomeiBreadcrumb, CaomeiBreadcrumbItem } from '@/components/breadcrumb'
</script>

<template>
    <div class="demo-stack">
        <CaomeiBreadcrumb
            label="面包屑（斜杠）"
            separator="/"
        >
            <CaomeiBreadcrumbItem href="#breadcrumb-separator">
                首页
            </CaomeiBreadcrumbItem>
            <CaomeiBreadcrumbItem current>
                设置
            </CaomeiBreadcrumbItem>
        </CaomeiBreadcrumb>
        <CaomeiBreadcrumb
            label="面包屑（箭头）"
            separator="›"
        >
            <CaomeiBreadcrumbItem href="#breadcrumb-separator">
                首页
            </CaomeiBreadcrumbItem>
            <CaomeiBreadcrumbItem href="#breadcrumb-separator">
                设置
            </CaomeiBreadcrumbItem>
            <CaomeiBreadcrumbItem current>
                通知
            </CaomeiBreadcrumbItem>
        </CaomeiBreadcrumb>
    </div>
</template>

<style scoped>
.demo-stack {
    display: grid;
    gap: 12px;
}
</style>
