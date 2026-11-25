<script setup lang="ts">
import { CaomeiSplitter, CaomeiSplitterPanel, CaomeiSplitterResizeHandle } from '@/components/splitter'
</script>

<template>
    <div class="splitter-demo">
        <CaomeiSplitter style="height: 240px">
            <CaomeiSplitterPanel :default-size="50">
                <CaomeiSplitter
                    direction="vertical"
                    style="height: 100%"
                >
                    <CaomeiSplitterPanel>Top left</CaomeiSplitterPanel>
                    <CaomeiSplitterResizeHandle />
                    <CaomeiSplitterPanel>Bottom left</CaomeiSplitterPanel>
                </CaomeiSplitter>
            </CaomeiSplitterPanel>
            <CaomeiSplitterResizeHandle />
            <CaomeiSplitterPanel>
                Right
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
