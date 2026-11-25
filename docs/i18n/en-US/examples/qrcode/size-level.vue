<script setup lang="ts">
import { CaomeiQRCode } from '@/components/qrcode'
</script>

<template>
    <div class="qr-demo">
        <CaomeiQRCode
            value="https://caomei.example.com/small"
            :size="96"
            label="Small QR code"
        />
        <CaomeiQRCode
            value="https://caomei.example.com/default"
            label="Default-size QR code"
        />
        <CaomeiQRCode
            value="https://caomei.example.com/dark"
            :size="160"
            :margin="4"
            color="#12326e"
            background="#f7f9ff"
            label="Custom-colored QR code"
        />
        <CaomeiQRCode
            value="https://caomei.example.com/level"
            :size="120"
            level="L"
            label="Low correction QR code"
        >
            Level L (~7%)
        </CaomeiQRCode>
        <CaomeiQRCode
            value="https://caomei.example.com/level"
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
