<script setup lang="ts">
import { CaomeiQRCode } from '@/components/qrcode'
</script>

<template>
    <div class="qr-demo">
        <CaomeiQRCode
            value="https://caomei.example.com/invite/8f3c"
            label="Invite link QR code"
        >
            Scan to join
        </CaomeiQRCode>
    </div>
</template>

<style scoped>
.qr-demo {
    display: flex;
    justify-content: flex-start;
}
</style>
