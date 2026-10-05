<script setup lang="ts">
import { Search, Settings, Menu, Bell, User, Plus, ArrowRight } from '@lucide/vue'
import { CaomeiButton } from '@/components/button'
</script>

<template>
    <div class="demo-section">
        <h4>基础用法</h4>
        <div class="demo-row">
            <CaomeiButton icon-only label="搜索">
                <template #icon>
                    <Search />
                </template>
            </CaomeiButton>
            <CaomeiButton icon-only label="设置">
                <template #icon>
                    <Settings />
                </template>
            </CaomeiButton>
            <CaomeiButton icon-only label="菜单">
                <template #icon>
                    <Menu />
                </template>
            </CaomeiButton>
            <CaomeiButton icon-only label="通知">
                <template #icon>
                    <Bell />
                </template>
            </CaomeiButton>
            <CaomeiButton icon-only label="用户">
                <template #icon>
                    <User />
                </template>
            </CaomeiButton>
        </div>
    </div>

    <div class="demo-section">
        <h4>不同变体</h4>
        <div class="demo-row">
            <CaomeiButton
                variant="primary"
                icon-only
                label="主要"
            >
                <template #icon>
                    <Plus />
                </template>
            </CaomeiButton>
            <CaomeiButton
                variant="secondary"
                icon-only
                label="次要"
            >
                <template #icon>
                    <ArrowRight />
                </template>
            </CaomeiButton>
            <CaomeiButton
                variant="ghost"
                icon-only
                label="幽灵"
            >
                <template #icon>
                    <Settings />
                </template>
            </CaomeiButton>
        </div>
    </div>

    <div class="demo-section">
        <h4>不同语义色调</h4>
        <div class="demo-row">
            <CaomeiButton
                tone="primary"
                icon-only
                label="主要色调"
            >
                <template #icon>
                    <Plus />
                </template>
            </CaomeiButton>
            <CaomeiButton
                tone="success"
                icon-only
                label="成功色调"
            >
                <template #icon>
                    <Plus />
                </template>
            </CaomeiButton>
            <CaomeiButton
                tone="warning"
                icon-only
                label="警告色调"
            >
                <template #icon>
                    <ArrowRight />
                </template>
            </CaomeiButton>
            <CaomeiButton
                tone="danger"
                icon-only
                label="危险色调"
            >
                <template #icon>
                    <Plus />
                </template>
            </CaomeiButton>
            <CaomeiButton
                tone="neutral"
                icon-only
                label="中性色调"
            >
                <template #icon>
                    <Settings />
                </template>
            </CaomeiButton>
        </div>
    </div>

    <div class="demo-section">
        <h4>不同尺寸</h4>
        <div class="demo-row">
            <CaomeiButton
                size="sm"
                icon-only
                label="小"
            >
                <template #icon>
                    <Plus />
                </template>
            </CaomeiButton>
            <CaomeiButton
                size="md"
                icon-only
                label="中"
            >
                <template #icon>
                    <Plus />
                </template>
            </CaomeiButton>
            <CaomeiButton
                size="lg"
                icon-only
                label="大"
            >
                <template #icon>
                    <Plus />
                </template>
            </CaomeiButton>
        </div>
    </div>

    <div class="demo-section">
        <h4>组合状态</h4>
        <div class="demo-row">
            <CaomeiButton
                icon-only
                label="禁用"
                disabled
            >
                <template #icon>
                    <Settings />
                </template>
            </CaomeiButton>
            <CaomeiButton
                icon-only
                label="加载中"
                loading
            >
                <template #icon>
                    <Settings />
                </template>
            </CaomeiButton>
            <CaomeiButton
                icon-only
                label="圆角"
                rounded
            >
                <template #icon>
                    <Plus />
                </template>
            </CaomeiButton>
        </div>
    </div>

    <div class="demo-section">
        <h4>语义色调组合（iconOnly）</h4>
        <div class="demo-row">
            <CaomeiButton
                variant="primary"
                tone="primary"
                icon-only
                label="主色"
            >
                <template #icon>
                    <Plus />
                </template>
            </CaomeiButton>
            <CaomeiButton
                variant="secondary"
                tone="danger"
                icon-only
                label="危险描边"
            >
                <template #icon>
                    <Plus />
                </template>
            </CaomeiButton>
            <CaomeiButton
                variant="ghost"
                tone="success"
                icon-only
                label="成功幽灵"
            >
                <template #icon>
                    <ArrowRight />
                </template>
            </CaomeiButton>
        </div>
    </div>
</template>

<style scoped>
.demo-section {
    margin-bottom: 24px;
}

.demo-section h4 {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 600;
    color: var(--caomei-color-text);
}

.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}
</style>
