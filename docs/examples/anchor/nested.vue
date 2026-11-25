<script setup lang="ts">
import { CaomeiAnchor } from '@/components/anchor'

const items = [
    { key: 'anchor-nested-overview', title: '总览' },
    {
        key: 'anchor-nested-guide',
        title: '指南',
        children: [
            { key: 'anchor-nested-install', title: '安装' },
            { key: 'anchor-nested-usage', title: '用法' },
        ],
    },
    { key: 'anchor-nested-faq', title: '常见问题' },
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
                总览
            </h3>
            <div class="anchor-demo__space" />
            <h3 id="anchor-nested-guide">
                指南
            </h3>
            <div class="anchor-demo__space" />
            <h3 id="anchor-nested-install">
                安装
            </h3>
            <div class="anchor-demo__space" />
            <h3 id="anchor-nested-usage">
                用法
            </h3>
            <div class="anchor-demo__space" />
            <h3 id="anchor-nested-faq">
                常见问题
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
