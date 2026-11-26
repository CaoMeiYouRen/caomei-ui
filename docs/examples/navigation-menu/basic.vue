<script setup lang="ts">
import {
    CaomeiNavigationMenu,
    CaomeiNavigationMenuContent,
    CaomeiNavigationMenuLink,
    CaomeiNavigationMenuTrigger,
} from '@/components/navigation-menu'
</script>

<template>
    <CaomeiNavigationMenu aria-label="站点导航">
        <CaomeiNavigationMenuTrigger value="docs">
            文档
            <template #content>
                <CaomeiNavigationMenuContent>
                    <CaomeiNavigationMenuLink
                        href="#guide"
                        active
                    >
                        快速上手
                    </CaomeiNavigationMenuLink>
                    <CaomeiNavigationMenuLink href="#api">
                        组件 API
                    </CaomeiNavigationMenuLink>
                    <CaomeiNavigationMenuLink href="#faq">
                        常见问题
                    </CaomeiNavigationMenuLink>
                </CaomeiNavigationMenuContent>
            </template>
        </CaomeiNavigationMenuTrigger>
        <CaomeiNavigationMenuTrigger value="blog">
            博客
            <template #content>
                <CaomeiNavigationMenuContent>
                    <CaomeiNavigationMenuLink href="#latest">
                        最新文章
                    </CaomeiNavigationMenuLink>
                    <CaomeiNavigationMenuLink href="#archive">
                        归档
                    </CaomeiNavigationMenuLink>
                </CaomeiNavigationMenuContent>
            </template>
        </CaomeiNavigationMenuTrigger>
    </CaomeiNavigationMenu>
</template>
