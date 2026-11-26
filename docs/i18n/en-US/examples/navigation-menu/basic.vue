<script setup lang="ts">
import {
    CaomeiNavigationMenu,
    CaomeiNavigationMenuContent,
    CaomeiNavigationMenuLink,
    CaomeiNavigationMenuTrigger,
} from '@/components/navigation-menu'
</script>

<template>
    <CaomeiNavigationMenu aria-label="Site navigation">
        <CaomeiNavigationMenuTrigger value="docs">
            Docs
            <template #content>
                <CaomeiNavigationMenuContent>
                    <CaomeiNavigationMenuLink
                        href="#guide"
                        active
                    >
                        Getting started
                    </CaomeiNavigationMenuLink>
                    <CaomeiNavigationMenuLink href="#api">
                        Component API
                    </CaomeiNavigationMenuLink>
                    <CaomeiNavigationMenuLink href="#faq">
                        FAQ
                    </CaomeiNavigationMenuLink>
                </CaomeiNavigationMenuContent>
            </template>
        </CaomeiNavigationMenuTrigger>
        <CaomeiNavigationMenuTrigger value="blog">
            Blog
            <template #content>
                <CaomeiNavigationMenuContent>
                    <CaomeiNavigationMenuLink href="#latest">
                        Latest posts
                    </CaomeiNavigationMenuLink>
                    <CaomeiNavigationMenuLink href="#archive">
                        Archive
                    </CaomeiNavigationMenuLink>
                </CaomeiNavigationMenuContent>
            </template>
        </CaomeiNavigationMenuTrigger>
    </CaomeiNavigationMenu>
</template>
