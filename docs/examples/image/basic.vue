<script setup lang="ts">
import { withBase } from 'vitepress'
import { CaomeiImage } from '@/components/image'

/*
 * 源图为 1:1 方图，容器为 16:9：只有源图与容器比例不同，才能看出 `fit` 的差异
 * —— cover 会裁掉上下，contain 则完整显示并在左右留白。
 * 示例使用站点内置的本地占位图（无外链依赖）。
 */
const src = withBase('/demo/image-square.svg')
</script>

<template>
    <div class="demo-row">
        <div class="demo-item">
            <CaomeiImage
                :src="src"
                alt="cover 填充：图片裁切后铺满容器"
                ratio="16 / 9"
                class="demo-image"
            />
            <span class="demo-label">cover（默认）：裁切铺满</span>
        </div>
        <div class="demo-item">
            <CaomeiImage
                :src="src"
                alt="contain 填充：完整显示图片并在留白处露出容器背景"
                ratio="16 / 9"
                fit="contain"
                class="demo-image demo-image--contain"
            />
            <span class="demo-label">contain：完整显示，两侧留白</span>
        </div>
    </div>
</template>

<style scoped>
.demo-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}

.demo-item {
    display: flex;
    flex: 1 1 220px;
    flex-direction: column;
    gap: 8px;
    max-width: 320px;
}

.demo-image {
    width: 100%;
    border-radius: 8px;
}

/* 仅为让 contain 的留白区域在文档里可见；同时演示 --caomei-image-bg 可覆盖 */
.demo-image--contain {
    --caomei-image-bg: var(--vp-c-brand-soft);
}

.demo-label {
    font-size: 12px;
    color: var(--vp-c-text-2);
}
</style>
