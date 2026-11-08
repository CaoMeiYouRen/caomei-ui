<script setup lang="ts">
import { Heart, Star } from '@lucide/vue'
import { CaomeiIcon, provideIconRegistry } from '@/icons'

// 按请求注入：SSR 下每个请求独立，不写模块级单例
provideIconRegistry({
    star: Star,
    heart: Heart,
})
</script>

<template>
    <div class="demo-column">
        <div class="demo-row">
            <CaomeiIcon
                name="star"
                label="收藏"
            />
            <CaomeiIcon
                name="heart"
                label="喜欢"
            />
            <CaomeiIcon
                name="star"
                size="20"
            />
        </div>
        <p class="demo-text">
            前两枚图标通过 <code>name</code> 从注册表解析，<code>label</code> 提供可访问名；第三枚为装饰性图标，默认
            <code>aria-hidden="true"</code>。
        </p>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
    font-size: 20px;
}

.demo-text {
    margin: 0;
    color: var(--vp-c-text-2);
    font-size: 13px;
}
</style>
