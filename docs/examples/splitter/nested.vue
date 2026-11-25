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
                    <CaomeiSplitterPanel>左上</CaomeiSplitterPanel>
                    <CaomeiSplitterResizeHandle />
                    <CaomeiSplitterPanel>左下</CaomeiSplitterPanel>
                </CaomeiSplitter>
            </CaomeiSplitterPanel>
            <CaomeiSplitterResizeHandle />
            <CaomeiSplitterPanel>
                右侧
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
