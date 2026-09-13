<script setup lang="ts">
import {
    CaomeiPopover,
    CaomeiPopoverContent,
    CaomeiPopoverTrigger,
} from '@/components/popover'

const placements = [
    { side: 'top', align: 'center', label: 'Top' },
    { side: 'right', align: 'center', label: 'Right' },
    { side: 'bottom', align: 'center', label: 'Bottom' },
    { side: 'left', align: 'center', label: 'Left' },
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
                Placement: {{ placement.side }}
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
