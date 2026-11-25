<script setup lang="ts">
import { CaomeiAnchor } from '@/components/anchor'

const items = [
    { key: 'anchor-basic-intro', title: '介绍' },
    { key: 'anchor-basic-usage', title: '用法' },
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
                介绍
            </h3>
            <p>介绍段落。</p>
            <h3 id="anchor-basic-usage">
                用法
            </h3>
            <p>用法段落。</p>
            <h3 id="anchor-basic-api">
                API
            </h3>
            <p>API 段落。</p>
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
