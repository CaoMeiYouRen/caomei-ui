<script setup lang="ts">
import {
    CaomeiTooltip,
    CaomeiTooltipArrow,
    CaomeiTooltipContent,
    CaomeiTooltipProvider,
    CaomeiTooltipTrigger,
} from '@/components/tooltip'

const sides = ['top', 'right', 'bottom', 'left'] as const
</script>

<template>
    <CaomeiTooltipProvider :delay-duration="0">
        <div class="demo-row">
            <CaomeiTooltip
                v-for="side in sides"
                :key="side"
            >
                <CaomeiTooltipTrigger>
                    {{ side }}
                </CaomeiTooltipTrigger>
                <CaomeiTooltipContent :side="side">
                    <span>{{ side }} 方向</span>
                    <CaomeiTooltipArrow />
                </CaomeiTooltipContent>
            </CaomeiTooltip>
        </div>
    </CaomeiTooltipProvider>
</template>

<style scoped>
.demo-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}
</style>
