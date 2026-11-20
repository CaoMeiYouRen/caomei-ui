<script setup lang="ts">
import { CaomeiButton } from '@/components/button'
import { CaomeiEmpty } from '@/components/empty'
</script>

<template>
    <CaomeiEmpty
        title="还没有任何项目"
        description="创建第一个项目后，它会出现在这里。"
    >
        <template #action>
            <CaomeiButton size="sm">
                新建项目
            </CaomeiButton>
        </template>
    </CaomeiEmpty>
</template>
