<script setup lang="ts">
import { Search, Settings, Menu, Bell, User, Plus, ArrowRight } from '@lucide/vue'
import { CaomeiButton } from '@/components/button'
</script>

<template>
    <div class="demo-section">
        <h4>基础用法</h4>
        <div class="demo-row">
            <CaomeiButton icon-only label="搜索">
                <Search />
            </CaomeiButton>
            <CaomeiButton icon-only label="设置">
                <Settings />
            </CaomeiButton>
            <CaomeiButton icon-only label="菜单">
                <Menu />
            </CaomeiButton>
            <CaomeiButton icon-only label="通知">
                <Bell />
            </CaomeiButton>
            <CaomeiButton icon-only label="用户">
                <User />
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
                <Plus />
            </CaomeiButton>
            <CaomeiButton
                variant="secondary"
                icon-only
                label="次要"
            >
                <ArrowRight />
            </CaomeiButton>
            <CaomeiButton
                variant="ghost"
                icon-only
                label="幽灵"
            >
                <Settings />
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
                <Plus />
            </CaomeiButton>
            <CaomeiButton
                tone="success"
                icon-only
                label="成功色调"
            >
                <Plus />
            </CaomeiButton>
            <CaomeiButton
                tone="warning"
                icon-only
                label="警告色调"
            >
                <ArrowRight />
            </CaomeiButton>
            <CaomeiButton
                tone="danger"
                icon-only
                label="危险色调"
            >
                <Plus />
            </CaomeiButton>
            <CaomeiButton
                tone="neutral"
                icon-only
                label="中性色调"
            >
                <Settings />
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
                <Plus />
            </CaomeiButton>
            <CaomeiButton
                size="md"
                icon-only
                label="中"
            >
                <Plus />
            </CaomeiButton>
            <CaomeiButton
                size="lg"
                icon-only
                label="大"
            >
                <Plus />
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
                <Settings />
            </CaomeiButton>
            <CaomeiButton
                icon-only
                label="加载中"
                loading
            >
                <Settings />
            </CaomeiButton>
            <CaomeiButton
                icon-only
                label="圆角"
                rounded
            >
                <Plus />
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
                <Plus />
            </CaomeiButton>
            <CaomeiButton
                variant="secondary"
                tone="danger"
                icon-only
                label="危险描边"
            >
                <Plus />
            </CaomeiButton>
            <CaomeiButton
                variant="ghost"
                tone="success"
                icon-only
                label="成功幽灵"
            >
                <ArrowRight />
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
