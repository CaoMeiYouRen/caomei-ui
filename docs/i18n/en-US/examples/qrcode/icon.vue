<script setup lang="ts">
import { withBase } from 'vitepress'
import { CaomeiQRCode } from '@/components/qrcode'

const icon = withBase('/demo/avatar.svg')
</script>

<template>
    <div class="qr-demo">
        <CaomeiQRCode
            value="PROFILE-CAOMEI-2026"
            level="H"
            :icon="icon"
            label="QR code with icon"
        >
            High correction + centered icon
        </CaomeiQRCode>
    </div>
</template>

<style scoped>
.qr-demo {
    display: flex;
    justify-content: flex-start;
}
</style>
