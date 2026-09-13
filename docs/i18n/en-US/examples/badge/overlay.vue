<script setup lang="ts">
import { CaomeiBadge } from '@/components/badge'
import { CaomeiButton } from '@/components/button'
</script>

<template>
    <div class="demo-row">
        <CaomeiBadge :value="3">
            <CaomeiButton variant="secondary">
                Messages
            </CaomeiButton>
        </CaomeiBadge>
        <CaomeiBadge
            :value="120"
            :max="99"
            tone="primary"
        >
            <CaomeiButton variant="secondary">
                Notifications
            </CaomeiButton>
        </CaomeiBadge>
        <CaomeiBadge
            dot
            label="New messages"
            tone="success"
        >
            <CaomeiButton variant="secondary">
                Status
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
