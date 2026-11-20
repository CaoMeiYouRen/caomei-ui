<script setup lang="ts">
import { withBase } from 'vitepress'
import { CaomeiEmpty } from '@/components/empty'

const image = withBase('/demo/image-landscape.svg')
</script>

<template>
    <CaomeiEmpty
        title="这里空空如也"
        description="换个筛选条件，或清空搜索关键词。"
        :image="image"
        image-alt="空态插图"
        size="lg"
    />
</template>
