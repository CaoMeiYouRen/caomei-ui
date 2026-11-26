<script setup lang="ts">
import {
    CaomeiNavigationMenu,
    CaomeiNavigationMenuContent,
    CaomeiNavigationMenuLink,
    CaomeiNavigationMenuTrigger,
} from '@/components/navigation-menu'
</script>

<template>
    <CaomeiNavigationMenu aria-label="Product navigation">
        <CaomeiNavigationMenuTrigger value="products">
            Products
            <template #content>
                <CaomeiNavigationMenuContent>
                    <div class="nav-panel">
                        <div class="nav-panel__group">
                            <p class="nav-panel__title">
                                Components
                            </p>
                            <CaomeiNavigationMenuLink href="#components">
                                Basic components
                            </CaomeiNavigationMenuLink>
                            <CaomeiNavigationMenuLink href="#advanced">
                                Advanced components
                            </CaomeiNavigationMenuLink>
                        </div>
                        <div class="nav-panel__group">
                            <p class="nav-panel__title">
                                Tools
                            </p>
                            <CaomeiNavigationMenuLink href="#cli">
                                CLI
                            </CaomeiNavigationMenuLink>
                            <CaomeiNavigationMenuLink href="#theme">
                                Theme generator
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
