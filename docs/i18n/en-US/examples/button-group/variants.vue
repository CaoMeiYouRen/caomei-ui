<script setup lang="ts">
import { AlignCenter, AlignLeft, AlignRight } from '@lucide/vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiButtonGroup } from '@/components/button-group'
</script>

<template>
    <div class="demo-stack">
        <CaomeiButtonGroup>
            <CaomeiButton variant="ghost" label="Align left">
                <template #icon>
                    <AlignLeft :size="16" />
                </template>
            </CaomeiButton>
            <CaomeiButton variant="ghost" label="Align center">
                <template #icon>
                    <AlignCenter :size="16" />
                </template>
            </CaomeiButton>
            <CaomeiButton variant="ghost" label="Align right">
                <template #icon>
                    <AlignRight :size="16" />
                </template>
            </CaomeiButton>
        </CaomeiButtonGroup>
        <CaomeiButtonGroup orientation="vertical">
            <CaomeiButton variant="secondary">
                Save draft
            </CaomeiButton>
            <CaomeiButton>
                Publish
            </CaomeiButton>
        </CaomeiButtonGroup>
        <CaomeiButtonGroup>
            <CaomeiButton rounded>
                Left
            </CaomeiButton>
            <CaomeiButton rounded>
                Center
            </CaomeiButton>
            <CaomeiButton rounded>
                Right
            </CaomeiButton>
        </CaomeiButtonGroup>
    </div>
</template>

<style scoped>
.demo-stack {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 16px;
}
</style>
