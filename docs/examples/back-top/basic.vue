<script setup lang="ts">
import { CaomeiBackTop } from '@/components/back-top'
</script>

<template>
    <div class="back-top-demo">
        <p>页面滚动到 200px 后，右下角出现回顶按钮。</p>
        <CaomeiBackTop label="回到顶部" />
    </div>
</template>

<style scoped>
.back-top-demo {
    min-height: 3rem;
}
</style>
