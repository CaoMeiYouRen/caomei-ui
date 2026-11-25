<script setup lang="ts">
import { CaomeiAnchor } from '@/components/anchor'

const items = [
    { key: 'anchor-basic-intro', title: 'Introduction' },
    { key: 'anchor-basic-usage', title: 'Usage' },
    { key: 'anchor-basic-api', title: 'API' },
]
</script>

<template>
    <div class="anchor-demo">
        <CaomeiAnchor
            :items="items"
            :hash-sync="false"
        />
        <div class="anchor-demo__content">
            <h3 id="anchor-basic-intro">
                Introduction
            </h3>
            <p>Introduction paragraph.</p>
            <h3 id="anchor-basic-usage">
                Usage
            </h3>
            <p>Usage paragraph.</p>
            <h3 id="anchor-basic-api">
                API
            </h3>
            <p>API paragraph.</p>
        </div>
    </div>
</template>

<style scoped>
.anchor-demo {
    display: grid;
    grid-template-columns: 10rem minmax(0, 1fr);
    gap: 16px;
}

.anchor-demo__content h3 {
    margin-top: 24px;
}

.anchor-demo__content h3:first-child {
    margin-top: 0;
}
</style>
