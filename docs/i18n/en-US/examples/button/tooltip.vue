<script setup lang="ts">
import { Settings, Trash2, Download } from '@lucide/vue'
import { CaomeiButton } from '@/components/button'
</script>

<template>
    <div class="demo-section">
        <h4>Icon-only: always shown</h4>
        <p class="demo-hint">
            An icon-only button has no visible text, so the tooltip is always shown and takes the label (the accessible name) as content.
        </p>
        <div class="demo-row">
            <CaomeiButton
                icon-only
                label="Settings"
                tooltip
            >
                <template #icon>
                    <Settings />
                </template>
            </CaomeiButton>
            <CaomeiButton
                variant="secondary"
                icon-only
                label="Delete"
                tooltip
            >
                <template #icon>
                    <Trash2 />
                </template>
            </CaomeiButton>
            <CaomeiButton
                variant="ghost"
                icon-only
                label="Download"
                tooltip
            >
                <template #icon>
                    <Download />
                </template>
            </CaomeiButton>
        </div>
    </div>

    <div class="demo-section">
        <h4>Text truncation: only when it does not fit</h4>
        <p class="demo-hint">
            With tooltip set to true, a text button shows the tooltip only when the text is truncated and uses the visible text as content; text that fits shows nothing.
        </p>
        <div class="demo-row">
            <CaomeiButton
                class="demo-truncate"
                tooltip
            >
                This is a very long button label that gets truncated once it exceeds the width
            </CaomeiButton>
            <CaomeiButton
                class="demo-truncate"
                variant="secondary"
                tooltip
            >
                This label fits completely
            </CaomeiButton>
        </div>
    </div>

    <div class="demo-section">
        <h4>Explicit content: always shown</h4>
        <p class="demo-hint">
            A string or { content } means the author explicitly wants this hint, so it is no longer limited by truncation.
        </p>
        <div class="demo-row">
            <CaomeiButton tooltip="Save the current changes and close the panel">
                Save
            </CaomeiButton>
            <CaomeiButton
                variant="secondary"
                :tooltip="{content: 'A supplementary note that only applies when content is provided'}"
            >
                More info
            </CaomeiButton>
        </div>
    </div>

    <div class="demo-section">
        <h4>Disabled state</h4>
        <p class="demo-hint">
            A disabled button can still show the tooltip on hover: the trigger is the button itself (as-child), and disabled does not block pointer events.
        </p>
        <div class="demo-row">
            <CaomeiButton
                disabled
                tooltip="Fill in the required fields before submitting"
            >
                Submit
            </CaomeiButton>
        </div>
    </div>
</template>

<style scoped>
.demo-section {
    margin-bottom: 24px;
}

.demo-section h4 {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--caomei-color-text);
}

.demo-hint {
    margin: 0 0 12px;
    font-size: 13px;
    color: var(--caomei-color-text-muted);
}

.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}

/*
  1.4.0 起 Button 的两条分支在 vnode 层都是多根（Fragment）：父级 scope id 没有落点，
  `.demo-truncate` 的父级 scoped 规则因此不命中按钮元素，按钮按 `nowrap` 内容撑开，
  窄屏下把文档撑出横向滚动。用 `:deep()` 从示例容器下钻到按钮，保留页面级作用域。
*/
.demo-row :deep(.demo-truncate) {
    max-width: 220px;
}
</style>
