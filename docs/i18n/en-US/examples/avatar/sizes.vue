<script setup lang="ts">
import { withBase } from 'vitepress'
import { CaomeiAvatar } from '@/components/avatar'

// The same avatar is used to compare sizes and shapes so the difference is visible
// (built-in local placeholder, no external dependency)
const portrait = withBase('/demo/avatar.svg')
</script>

<template>
    <div class="demo-col">
        <div class="demo-row">
            <CaomeiAvatar
                :src="portrait"
                alt="Small avatar"
                size="sm"
            />
            <CaomeiAvatar
                :src="portrait"
                alt="Medium avatar"
                size="md"
            />
            <CaomeiAvatar
                :src="portrait"
                alt="Large avatar"
                size="lg"
            />
        </div>
        <div class="demo-row">
            <CaomeiAvatar
                :src="portrait"
                alt="Circle avatar"
                shape="circle"
            />
            <CaomeiAvatar
                :src="portrait"
                alt="Square avatar"
                shape="square"
            />
        </div>
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.demo-row {
    display: flex;
    align-items: center;
    gap: 16px;
}
</style>
