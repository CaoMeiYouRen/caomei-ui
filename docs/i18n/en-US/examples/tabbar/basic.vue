<script setup lang="ts">
import { ref } from 'vue'
import { Bell, Compass, Home, User } from '@lucide/vue'
import { CaomeiTabbar, CaomeiTabbarItem } from '@/components/tabbar'

const active = ref('home')
</script>

<template>
    <CaomeiTabbar
        v-model="active"
        label="Main navigation"
        class="demo-tabbar"
    >
        <CaomeiTabbarItem
            value="home"
            label="Home"
            :icon="Home"
        />
        <CaomeiTabbarItem
            value="explore"
            label="Explore"
            :icon="Compass"
        />
        <CaomeiTabbarItem
            value="notice"
            label="Notices"
            badge="5"
            :icon="Bell"
        />
        <CaomeiTabbarItem
            value="me"
            label="Me"
            :icon="User"
        />
    </CaomeiTabbar>
    <p class="demo-hint">
        Current: {{ active }}
    </p>
</template>

<style scoped>
.demo-tabbar {
    max-width: 480px;
    margin-inline: auto;
}

.demo-hint {
    margin: var(--caomei-space-2) 0 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>
