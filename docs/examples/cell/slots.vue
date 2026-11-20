<script setup lang="ts">
import { CaomeiCell, CaomeiCellGroup } from '@/components/cell'
import { CaomeiIcon, internalIcons } from '@/icons'
import { Settings } from '@lucide/vue'
</script>

<template>
    <CaomeiCellGroup class="demo-cell-group">
        <CaomeiCell title="设置">
            <template #prefix>
                <CaomeiIcon :icon="Settings" />
            </template>
            <template #suffix>
                <CaomeiIcon :icon="internalIcons.chevronRight" />
            </template>
        </CaomeiCell>
        <CaomeiCell
            as="button"
            title="打开操作"
            @click="() => {}"
        />
        <CaomeiCell
            as="a"
            href="#empty-basic"
            title="查看指南"
            arrow
        />
    </CaomeiCellGroup>
</template>

<style scoped>
.demo-cell-group {
    max-width: 420px;
}
</style>
