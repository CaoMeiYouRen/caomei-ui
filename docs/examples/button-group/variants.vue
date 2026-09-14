<script setup lang="ts">
import { AlignCenter, AlignLeft, AlignRight } from '@lucide/vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiButtonGroup } from '@/components/button-group'
</script>

<template>
    <div class="demo-stack">
        <CaomeiButtonGroup>
            <CaomeiButton variant="ghost" label="左对齐">
                <template #icon>
                    <AlignLeft :size="16" />
                </template>
            </CaomeiButton>
            <CaomeiButton variant="ghost" label="居中">
                <template #icon>
                    <AlignCenter :size="16" />
                </template>
            </CaomeiButton>
            <CaomeiButton variant="ghost" label="右对齐">
                <template #icon>
                    <AlignRight :size="16" />
                </template>
            </CaomeiButton>
        </CaomeiButtonGroup>
        <CaomeiButtonGroup orientation="vertical">
            <CaomeiButton variant="secondary">
                保存草稿
            </CaomeiButton>
            <CaomeiButton>
                发布
            </CaomeiButton>
        </CaomeiButtonGroup>
        <CaomeiButtonGroup>
            <CaomeiButton rounded>
                左
            </CaomeiButton>
            <CaomeiButton rounded>
                中
            </CaomeiButton>
            <CaomeiButton rounded>
                右
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
