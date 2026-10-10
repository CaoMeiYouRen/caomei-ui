<script setup lang="ts">
import { withBase } from 'vitepress'
import { CaomeiAvatar } from '@/components/avatar'

// 同一个头像用于对比尺寸与形状，便于看出差异（本地占位图，无外链依赖）
const portrait = withBase('/demo/avatar.svg')
</script>

<template>
    <div class="demo-col">
        <div class="demo-row">
            <CaomeiAvatar
                :src="portrait"
                alt="小尺寸头像"
                size="sm"
            />
            <CaomeiAvatar
                :src="portrait"
                alt="中尺寸头像"
                size="md"
            />
            <CaomeiAvatar
                :src="portrait"
                alt="大尺寸头像"
                size="lg"
            />
        </div>
        <div class="demo-row">
            <CaomeiAvatar
                :src="portrait"
                alt="圆形头像"
                shape="circle"
            />
            <CaomeiAvatar
                :src="portrait"
                alt="方形头像"
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
