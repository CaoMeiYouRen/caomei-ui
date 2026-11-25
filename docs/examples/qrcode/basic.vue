<script setup lang="ts">
import { CaomeiQRCode } from '@/components/qrcode'
</script>

<template>
    <div class="qr-demo">
        <CaomeiQRCode
            value="INVITE-8F3C-2026"
            label="邀请链接二维码"
        >
            扫码加入
        </CaomeiQRCode>
    </div>
</template>

<style scoped>
.qr-demo {
    display: flex;
    justify-content: flex-start;
}
</style>
