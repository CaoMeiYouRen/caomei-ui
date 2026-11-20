<script setup lang="ts">
import { ref } from 'vue'
import { Bell, Compass, Home, User } from '@lucide/vue'
import { CaomeiTabbar, CaomeiTabbarItem } from '@/components/tabbar'

const active = ref('home')
</script>

<template>
    <CaomeiTabbar
        v-model="active"
        label="主导航"
        class="demo-tabbar"
    >
        <CaomeiTabbarItem
            value="home"
            label="首页"
            :icon="Home"
        />
        <CaomeiTabbarItem
            value="explore"
            label="发现"
            :icon="Compass"
        />
        <CaomeiTabbarItem
            value="notice"
            label="通知"
            badge="5"
            :icon="Bell"
        />
        <CaomeiTabbarItem
            value="me"
            label="我的"
            :icon="User"
        />
    </CaomeiTabbar>
    <p class="demo-hint">
        当前选中：{{ active }}
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
