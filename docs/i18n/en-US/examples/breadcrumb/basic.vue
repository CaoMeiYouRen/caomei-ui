<script setup lang="ts">
import { CaomeiBreadcrumb, CaomeiBreadcrumbItem } from '@/components/breadcrumb'
</script>

<template>
    <CaomeiBreadcrumb label="Breadcrumb">
        <CaomeiBreadcrumbItem href="#breadcrumb-basic">
            Home
        </CaomeiBreadcrumbItem>
        <CaomeiBreadcrumbItem href="#breadcrumb-basic">
            Content
        </CaomeiBreadcrumbItem>
        <CaomeiBreadcrumbItem current>
            Articles详情
        </CaomeiBreadcrumbItem>
    </CaomeiBreadcrumb>
</template>
