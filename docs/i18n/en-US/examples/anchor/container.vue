<script setup lang="ts">
import { CaomeiAnchor } from '@/components/anchor'

const items = [
    { key: 'anchor-container-a', title: 'Section one' },
    { key: 'anchor-container-b', title: 'Section two' },
    { key: 'anchor-container-c', title: 'Section three' },
]
</script>

<template>
    <div class="anchor-demo">
        <CaomeiAnchor
            container="#anchor-demo-scroller"
            :items="items"
            :hash-sync="false"
        />
        <div
            id="anchor-demo-scroller"
            class="anchor-demo__scroller"
        >
            <h3 id="anchor-container-a">
                Section one
            </h3>
            <div class="anchor-demo__space" />
            <h3 id="anchor-container-b">
                Section two
            </h3>
            <div class="anchor-demo__space" />
            <h3 id="anchor-container-c">
                Section three
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
