<script setup lang="ts">
import { CaomeiSplitter, CaomeiSplitterPanel, CaomeiSplitterResizeHandle } from '@/components/splitter'
</script>

<template>
    <div class="splitter-demo">
        <CaomeiSplitter style="height: 160px">
            <CaomeiSplitterPanel :default-size="30" :min-size="15">
                Left panel (30%)
            </CaomeiSplitterPanel>
            <CaomeiSplitterResizeHandle />
            <CaomeiSplitterPanel :default-size="70">
                Right panel (70%)
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
