<script setup lang="ts">
import {
    CaomeiPopover,
    CaomeiPopoverContent,
    CaomeiPopoverTrigger,
} from '@/components/popover'

const placements = [
    { side: 'top', align: 'center', label: '上方' },
    { side: 'right', align: 'center', label: '右侧' },
    { side: 'bottom', align: 'center', label: '下方' },
    { side: 'left', align: 'center', label: '左侧' },
] as const
</script>

<template>
    <div class="demo-row">
        <CaomeiPopover
            v-for="placement in placements"
            :key="placement.label"
        >
            <CaomeiPopoverTrigger>{{ placement.label }}</CaomeiPopoverTrigger>
            <CaomeiPopoverContent
                :side="placement.side"
                :align="placement.align"
                :avoid-collisions="false"
            >
                弹出方向：{{ placement.side }}
            </CaomeiPopoverContent>
        </CaomeiPopover>
    </div>
</template>

<style scoped>
.demo-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
}
</style>
