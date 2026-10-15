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
                    Hover or focus to view
                </CaomeiButton>
            </CaomeiTooltipTrigger>
            <CaomeiTooltipContent>
                Saves and closes the current draft.
            </CaomeiTooltipContent>
        </CaomeiTooltip>
    </CaomeiTooltipProvider>
</template>
