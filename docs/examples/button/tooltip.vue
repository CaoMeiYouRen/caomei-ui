<script setup lang="ts">
import { Settings, Trash2, Download } from '@lucide/vue'
import { CaomeiButton } from '@/components/button'
</script>

<template>
    <div class="demo-section">
        <h4>纯图标：始终显示</h4>
        <p class="demo-hint">
            纯图标按钮没有可见文本，提示默认始终显示，内容取 label（即可访问名）。
        </p>
        <div class="demo-row">
            <CaomeiButton
                icon-only
                label="设置"
                tooltip
            >
                <template #icon>
                    <Settings />
                </template>
            </CaomeiButton>
            <CaomeiButton
                variant="secondary"
                icon-only
                label="删除"
                tooltip
            >
                <template #icon>
                    <Trash2 />
                </template>
            </CaomeiButton>
            <CaomeiButton
                variant="ghost"
                icon-only
                label="下载"
                tooltip
            >
                <template #icon>
                    <Download />
                </template>
            </CaomeiButton>
        </div>
    </div>

    <div class="demo-section">
        <h4>文本截断：仅在装不下时显示</h4>
        <p class="demo-hint">
            tooltip 为 true 时，文本按钮只在文字被截断时显示提示，内容取可见文本；文案未超宽时不出现提示。
        </p>
        <div class="demo-row">
            <CaomeiButton
                class="demo-truncate"
                tooltip
            >
                这是一段很长很长的按钮文案，超出宽度后会被截断
            </CaomeiButton>
            <CaomeiButton
                class="demo-truncate"
                variant="secondary"
                tooltip
            >
                这段文案可以完整显示
            </CaomeiButton>
        </div>
    </div>

    <div class="demo-section">
        <h4>显式内容：始终显示</h4>
        <p class="demo-hint">
            传入字符串或 { content } 代表作者明确要展示这条提示，默认不再受截断限制。
        </p>
        <div class="demo-row">
            <CaomeiButton tooltip="保存当前修改并关闭面板">
                保存
            </CaomeiButton>
            <CaomeiButton
                variant="secondary"
                :tooltip="{content: '仅在提供内容时生效的补充说明'}"
            >
                补充说明
            </CaomeiButton>
        </div>
    </div>

    <div class="demo-section">
        <h4>禁用态</h4>
        <p class="demo-hint">
            禁用按钮仍可悬停查看提示：触发器就是按钮本身（as-child），disabled 不阻止指针事件。
        </p>
        <div class="demo-row">
            <CaomeiButton
                disabled
                tooltip="提交前请先补全必填项"
            >
                提交
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
