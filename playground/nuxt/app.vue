<script setup lang="ts">
// 不显式 import：验证组件与 composables 自动导入
const { mode } = useTheme('auto')
const count = ref(0)
</script>

<template>
    <main class="caomei-root">
        <p data-testid="theme-mode">
            {{ mode }}
        </p>
        <p data-testid="count">
            {{ count }}
        </p>
        <CaomeiButton
            data-testid="counter"
            variant="primary"
            @click="count++"
        >
            Hello Caomei
        </CaomeiButton>
        <CaomeiTag tone="success">
            ok
        </CaomeiTag>
        <CaomeiCarousel
            label="冒烟轮播"
            style="max-width: 320px"
        >
            <CaomeiCarouselSlide>第一页</CaomeiCarouselSlide>
            <CaomeiCarouselSlide>第二页</CaomeiCarouselSlide>
        </CaomeiCarousel>
        <CaomeiWatermark content="nuxt-smoke">
            <span>水印宿主</span>
        </CaomeiWatermark>
        <CaomeiMenubar>
            <CaomeiMenubarMenu value="file">
                <CaomeiMenubarTrigger>文件</CaomeiMenubarTrigger>
                <CaomeiMenubarContent>
                    <CaomeiMenubarItem>新建</CaomeiMenubarItem>
                </CaomeiMenubarContent>
            </CaomeiMenubarMenu>
        </CaomeiMenubar>
        <CaomeiNavigationMenu aria-label="冒烟导航">
            <CaomeiNavigationMenuTrigger value="docs">
                文档
                <template #content>
                    <CaomeiNavigationMenuContent>
                        <CaomeiNavigationMenuLink href="#a">
                            链接
                        </CaomeiNavigationMenuLink>
                    </CaomeiNavigationMenuContent>
                </template>
            </CaomeiNavigationMenuTrigger>
        </CaomeiNavigationMenu>
        <CaomeiHoverCard>
            <CaomeiHoverCardTrigger>悬停</CaomeiHoverCardTrigger>
            <CaomeiHoverCardContent>卡片</CaomeiHoverCardContent>
        </CaomeiHoverCard>
    </main>
</template>
