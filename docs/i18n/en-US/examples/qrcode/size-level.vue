<script setup lang="ts">
import { CaomeiQRCode } from '@/components/qrcode'
</script>

<template>
    <div class="qr-demo">
        <CaomeiQRCode
            value="SMALL-96"
            :size="96"
            label="Small QR code"
        />
        <CaomeiQRCode
            value="DEFAULT-160"
            label="Default-size QR code"
        />
        <CaomeiQRCode
            value="CUSTOM-COLOR-160"
            :size="160"
            :margin="4"
            color="#12326e"
            background="#f7f9ff"
            label="Custom-colored QR code"
        />
        <CaomeiQRCode
            value="LEVEL-120"
            :size="120"
            level="L"
            label="Low correction QR code"
        >
            Level L (~7%)
        </CaomeiQRCode>
        <CaomeiQRCode
            value="LEVEL-120"
            :size="120"
            level="H"
            label="High correction QR code"
        >
            Level H (~30%)
        </CaomeiQRCode>
    </div>
</template>

<style scoped>
.qr-demo {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 16px;
}
</style>
