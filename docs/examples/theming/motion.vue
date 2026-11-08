<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiAccordion, CaomeiAccordionItem } from '@/components/accordion'
import { CaomeiButton } from '@/components/button'

const expressive = ref(true)
</script>

<template>
    <div class="demo-column">
        <div class="demo-row">
            <CaomeiButton
                variant="secondary"
                @click="expressive = !expressive"
            >
                {{ expressive ? '切到 minimal' : '切到 expressive' }}
            </CaomeiButton>
            <span class="demo-text">当前轴：{{ expressive ? 'expressive' : 'minimal' }}</span>
        </div>
        <div
            class="demo-motion-surface"
            :data-motion="expressive ? 'expressive' : undefined"
        >
            <CaomeiAccordion collapsible>
                <CaomeiAccordionItem
                    value="intro"
                    title="展开 / 收起可对比缓动"
                >
                    <p class="demo-text">
                        高度动画在两种轴下都保留，expressive 会叠加轻微淡入并拉长时长。
                    </p>
                </CaomeiAccordionItem>
            </CaomeiAccordion>
            <div class="demo-row">
                <CaomeiButton>悬停对比按钮反馈</CaomeiButton>
                <CaomeiButton variant="secondary">
                    次要按钮
                </CaomeiButton>
            </div>
        </div>
        <p class="demo-text">
            局部容器只影响其后代；Dialog / Toast 等 Portal 面板需把 <code>data-motion</code> 挂在 <code>html</code> 上。minimal 即移除该属性。
        </p>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}

.demo-text {
    margin: 0;
    color: var(--vp-c-text-2);
    font-size: 14px;
}

.demo-motion-surface {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
}
</style>
