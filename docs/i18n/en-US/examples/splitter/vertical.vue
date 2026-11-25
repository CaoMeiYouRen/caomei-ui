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
                Top panel
            </CaomeiSplitterPanel>
            <CaomeiSplitterResizeHandle />
            <CaomeiSplitterPanel>
                Bottom panel
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
