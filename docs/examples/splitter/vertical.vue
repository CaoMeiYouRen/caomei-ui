<script setup lang="ts">
import { CaomeiSplitter, CaomeiSplitterPanel, CaomeiSplitterResizeHandle } from '@/components/splitter'
</script>

<template>
    <div class="splitter-demo">
        <CaomeiSplitter
            direction="vertical"
            style="height: 220px"
        >
            <CaomeiSplitterPanel :default-size="40">
                上方面板
            </CaomeiSplitterPanel>
            <CaomeiSplitterResizeHandle />
            <CaomeiSplitterPanel>
                下方面板
            </CaomeiSplitterPanel>
        </CaomeiSplitter>
    </div>
</template>

<style scoped>
.splitter-demo {
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    overflow: hidden;
}
</style>
