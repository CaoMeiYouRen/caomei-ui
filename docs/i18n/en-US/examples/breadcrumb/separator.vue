<script setup lang="ts">
import { CaomeiBreadcrumb, CaomeiBreadcrumbItem } from '@/components/breadcrumb'
</script>

<template>
    <div class="demo-stack">
        <CaomeiBreadcrumb
            label="Breadcrumb (slash)"
            separator="/"
        >
            <CaomeiBreadcrumbItem href="#breadcrumb-separator">
                Home
            </CaomeiBreadcrumbItem>
            <CaomeiBreadcrumbItem current>
                Settings
            </CaomeiBreadcrumbItem>
        </CaomeiBreadcrumb>
        <CaomeiBreadcrumb
            label="Breadcrumb (chevron)"
            separator="›"
        >
            <CaomeiBreadcrumbItem href="#breadcrumb-separator">
                Home
            </CaomeiBreadcrumbItem>
            <CaomeiBreadcrumbItem href="#breadcrumb-separator">
                Settings
            </CaomeiBreadcrumbItem>
            <CaomeiBreadcrumbItem current>
                Notifications
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
