<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiDrawer } from '@/components/drawer'

const open = ref(false)
const customWidthOpen = ref(false)
</script>

<template>
    <div class="demo-row">
        <CaomeiButton variant="secondary" @click="open = true">
            自定义头部
        </CaomeiButton>
        <CaomeiButton variant="secondary" @click="customWidthOpen = true">
            自定义宽度
        </CaomeiButton>

        <CaomeiDrawer
            v-model:open="open"
            title="会话"
            description="头部插槽可替换标题区域，关闭按钮仍保留。"
        >
            <template #header>
                <div class="demo-header">
                    <span class="demo-header__title">会话</span>
                    <span class="demo-header__badge">3</span>
                </div>
            </template>
            列表内容
        </CaomeiDrawer>

        <CaomeiDrawer
            v-model:open="customWidthOpen"
            title="自定义宽度"
            description="宽度经 style 覆盖为 600px。"
            :style="{width: '600px'}"
        >
            内容
        </CaomeiDrawer>
    </div>
</template>

<style scoped>
.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}

.demo-header {
    display: flex;
    align-items: center;
    gap: 8px;
}

.demo-header__title {
    font-weight: 600;
}

.demo-header__badge {
    padding: 0 6px;
    border-radius: var(--caomei-radius-full);
    background: color-mix(in srgb, var(--caomei-color-primary) 12%, transparent);
    color: var(--caomei-color-primary);
    font-size: var(--caomei-font-size-sm);
}
</style>
