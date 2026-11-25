<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiSplitter, CaomeiSplitterPanel, CaomeiSplitterResizeHandle } from '@/components/splitter'

const layout = ref([50, 50])

function reset(): void {
    layout.value = [50, 50]
}

function widenLeft(): void {
    layout.value = [70, 30]
}
</script>

<template>
    <div class="splitter-demo">
        <div class="splitter-demo__actions">
            <CaomeiButton
                size="sm"
                @click="reset"
            >
                Split evenly
            </CaomeiButton>
            <CaomeiButton
                size="sm"
                variant="secondary"
                @click="widenLeft"
            >
                Left 70%
            </CaomeiButton>
            <span class="demo-text">layout = [{{ layout.map((value) => value.toFixed(0)).join(', ') }}]</span>
        </div>
        <CaomeiSplitter
            v-model:layout="layout"
            style="height: 160px"
        >
            <CaomeiSplitterPanel>
                Left {{ layout[0]?.toFixed(0) }}%
            </CaomeiSplitterPanel>
            <CaomeiSplitterResizeHandle />
            <CaomeiSplitterPanel>
                Right {{ layout[1]?.toFixed(0) }}%
            </CaomeiSplitterPanel>
        </CaomeiSplitter>
    </div>
</template>

<style scoped>
.splitter-demo {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 8px;
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
}

.splitter-demo__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
}
</style>
