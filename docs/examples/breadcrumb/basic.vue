<script setup lang="ts">
import { CaomeiBreadcrumb, CaomeiBreadcrumbItem } from '@/components/breadcrumb'
</script>

<template>
    <CaomeiBreadcrumb label="面包屑">
        <CaomeiBreadcrumbItem href="#breadcrumb-basic">
            首页
        </CaomeiBreadcrumbItem>
        <CaomeiBreadcrumbItem href="#breadcrumb-basic">
            内容管理
        </CaomeiBreadcrumbItem>
        <CaomeiBreadcrumbItem current>
            文章详情
        </CaomeiBreadcrumbItem>
    </CaomeiBreadcrumb>
</template>
