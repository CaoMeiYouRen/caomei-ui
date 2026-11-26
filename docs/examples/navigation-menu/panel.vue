<script setup lang="ts">
import {
    CaomeiNavigationMenu,
    CaomeiNavigationMenuContent,
    CaomeiNavigationMenuLink,
    CaomeiNavigationMenuTrigger,
} from '@/components/navigation-menu'
</script>

<template>
    <CaomeiNavigationMenu aria-label="产品导航">
        <CaomeiNavigationMenuTrigger value="products">
            产品
            <template #content>
                <CaomeiNavigationMenuContent>
                    <div class="nav-panel">
                        <div class="nav-panel__group">
                            <p class="nav-panel__title">
                                组件库
                            </p>
                            <CaomeiNavigationMenuLink href="#components">
                                基础组件
                            </CaomeiNavigationMenuLink>
                            <CaomeiNavigationMenuLink href="#advanced">
                                高级组件
                            </CaomeiNavigationMenuLink>
                        </div>
                        <div class="nav-panel__group">
                            <p class="nav-panel__title">
                                工具
                            </p>
                            <CaomeiNavigationMenuLink href="#cli">
                                命令行
                            </CaomeiNavigationMenuLink>
                            <CaomeiNavigationMenuLink href="#theme">
                                主题生成器
                            </CaomeiNavigationMenuLink>
                        </div>
                    </div>
                </CaomeiNavigationMenuContent>
            </template>
        </CaomeiNavigationMenuTrigger>
    </CaomeiNavigationMenu>
</template>

<style scoped>
.nav-panel {
    display: flex;
    gap: var(--caomei-space-4);
    min-width: 20rem;
}

.nav-panel__group {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-1);
}

.nav-panel__title {
    margin: 0 0 var(--caomei-space-1);
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>
