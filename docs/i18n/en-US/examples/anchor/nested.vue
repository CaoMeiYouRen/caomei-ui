<script setup lang="ts">
import { CaomeiAnchor } from '@/components/anchor'

const items = [
    { key: 'anchor-nested-overview', title: 'Overview' },
    {
        key: 'anchor-nested-guide',
        title: 'Guide',
        children: [
            { key: 'anchor-nested-install', title: 'Install' },
            { key: 'anchor-nested-usage', title: 'Usage' },
        ],
    },
    { key: 'anchor-nested-faq', title: 'FAQ' },
]
</script>

<template>
    <div class="anchor-demo">
        <CaomeiAnchor
            container="#anchor-nested-scroller"
            :items="items"
            :hash-sync="false"
        />
        <div
            id="anchor-nested-scroller"
            class="anchor-demo__scroller"
        >
            <h3 id="anchor-nested-overview">
                Overview
            </h3>
            <div class="anchor-demo__space" />
            <h3 id="anchor-nested-guide">
                Guide
            </h3>
            <div class="anchor-demo__space" />
            <h3 id="anchor-nested-install">
                Install
            </h3>
            <div class="anchor-demo__space" />
            <h3 id="anchor-nested-usage">
                Usage
            </h3>
            <div class="anchor-demo__space" />
            <h3 id="anchor-nested-faq">
                FAQ
            </h3>
            <div class="anchor-demo__space" />
        </div>
    </div>
</template>

<style scoped>
.anchor-demo {
    display: grid;
    grid-template-columns: 10rem minmax(0, 1fr);
    gap: 16px;
}

.anchor-demo__scroller {
    height: 240px;
    padding: 12px;
    overflow: auto;
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
}

.anchor-demo__space {
    height: 320px;
}

.anchor-demo__scroller h3 {
    margin: 0;
}
</style>
