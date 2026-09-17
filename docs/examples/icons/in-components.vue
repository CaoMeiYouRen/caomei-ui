<script setup lang="ts">
import { Check, Ellipsis, Plus, Search } from '@lucide/vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiTag } from '@/components/tag'
import { CaomeiIcon } from '@/icons'
</script>

<template>
    <div class="demo-row">
        <CaomeiButton variant="primary">
            <template #icon>
                <CaomeiIcon :icon="Plus" />
            </template>
            新建
        </CaomeiButton>
        <CaomeiButton
            variant="secondary"
            icon-position="end"
        >
            <template #icon>
                <CaomeiIcon :icon="Search" />
            </template>
            搜索
        </CaomeiButton>
        <CaomeiButton
            variant="ghost"
            label="更多操作"
        >
            <template #icon>
                <CaomeiIcon :icon="Ellipsis" />
            </template>
        </CaomeiButton>
        <CaomeiTag
            tone="success"
            variant="soft"
        >
            <template #icon>
                <CaomeiIcon :icon="Check" />
            </template>
            已发布
        </CaomeiTag>
    </div>
</template>

<style scoped>
.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}
</style>
