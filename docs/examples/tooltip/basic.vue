<script setup lang="ts">
import { CaomeiButton } from '@/components/button'
import {
    CaomeiTooltip,
    CaomeiTooltipContent,
    CaomeiTooltipProvider,
    CaomeiTooltipTrigger,
} from '@/components/tooltip'
</script>

<template>
    <CaomeiTooltipProvider>
        <CaomeiTooltip>
            <CaomeiTooltipTrigger as-child unstyled>
                <CaomeiButton
                    variant="secondary"
                    size="sm"
                >
                    悬停或聚焦查看
                </CaomeiButton>
            </CaomeiTooltipTrigger>
            <CaomeiTooltipContent>
                保存并关闭当前草稿。
            </CaomeiTooltipContent>
        </CaomeiTooltip>
    </CaomeiTooltipProvider>
</template>
