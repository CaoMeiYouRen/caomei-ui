<script setup lang="ts">
import { CaomeiBadge } from '@/components/badge'
import { CaomeiButton } from '@/components/button'
</script>

<template>
    <div class="demo-row">
        <CaomeiBadge :value="3">
            <CaomeiButton variant="secondary">
                消息
            </CaomeiButton>
        </CaomeiBadge>
        <CaomeiBadge
            :value="120"
            :max="99"
            tone="primary"
        >
            <CaomeiButton variant="secondary">
                通知
            </CaomeiButton>
        </CaomeiBadge>
        <CaomeiBadge
            dot
            label="有新消息"
            tone="success"
        >
            <CaomeiButton variant="secondary">
                状态
            </CaomeiButton>
        </CaomeiBadge>
    </div>
</template>

<style scoped>
.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 32px;
}
</style>
