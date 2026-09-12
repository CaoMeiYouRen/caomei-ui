<script setup lang="ts">
import { CaomeiButton } from '@/components/button'
import { CaomeiCard } from '@/components/card'
import { CaomeiTag } from '@/components/tag'
</script>

<template>
    <div class="demo-grid">
        <CaomeiCard hoverable>
            <template #title>
                <span class="demo-title">
                    自定义标题
                    <CaomeiTag tone="primary" size="sm">
                        新建
                    </CaomeiTag>
                </span>
            </template>
            <template #extra>
                <CaomeiButton variant="ghost" size="sm">
                    更多
                </CaomeiButton>
            </template>
            <p class="demo-text">
                通过 title 与 extra 插槽定制头部。
            </p>
        </CaomeiCard>

        <CaomeiCard>
            <template #header>
                <div class="demo-header">
                    完全自定义头部
                </div>
            </template>
            <p class="demo-text">
                header 插槽会整体替换默认头部。
            </p>
            <template #footer>
                <CaomeiButton variant="secondary" size="sm">
                    取消
                </CaomeiButton>
                <CaomeiButton size="sm">
                    确定
                </CaomeiButton>
            </template>
        </CaomeiCard>

        <CaomeiCard title="仅标题与底部">
            <template #footer>
                <CaomeiButton variant="secondary" size="sm">
                    取消
                </CaomeiButton>
                <CaomeiButton size="sm">
                    保存
                </CaomeiButton>
            </template>
        </CaomeiCard>
    </div>
</template>

<style scoped>
.demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
}

.demo-title {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.demo-header {
    font-weight: 600;
}

.demo-text {
    margin: 0;
}

.demo-text + * {
    margin-top: 12px;
}
</style>
