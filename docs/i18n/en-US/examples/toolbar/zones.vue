<script setup lang="ts">
import { Bold, Italic, Save, Underline } from '@lucide/vue'
import { CaomeiIcon } from '@/icons'
import {
    CaomeiToolbar,
    CaomeiToolbarButton,
    CaomeiToolbarSeparator,
} from '@/components/toolbar'
</script>

<template>
    <!-- 工具条默认内容宽度；需要三区铺满容器时由使用方设置宽度（示例用 100% 展示中区居中） -->
    <CaomeiToolbar
        class="demo-toolbar"
        label="Editor toolbar"
    >
        <template #start>
            <CaomeiToolbarButton label="Bold">
                <CaomeiIcon :icon="Bold" />
            </CaomeiToolbarButton>
            <CaomeiToolbarButton label="Italic">
                <CaomeiIcon :icon="Italic" />
            </CaomeiToolbarButton>
            <CaomeiToolbarButton label="Underline">
                <CaomeiIcon :icon="Underline" />
            </CaomeiToolbarButton>
            <CaomeiToolbarSeparator />
        </template>
        <template #center>
            <span class="demo-status">Saved automatically</span>
        </template>
        <template #end>
            <CaomeiToolbarButton label="Save">
                <CaomeiIcon :icon="Save" />
            </CaomeiToolbarButton>
        </template>
    </CaomeiToolbar>
</template>

<style scoped>
.demo-toolbar {
    width: 100%;
}

.demo-status {
    color: var(--vp-c-text-2);
    font-size: 13px;
}
</style>
