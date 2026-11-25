<script setup lang="ts">
import { CaomeiQRCode } from '@/components/qrcode'
</script>

<template>
    <div class="qr-demo">
        <CaomeiQRCode
            value="SMALL-96"
            :size="96"
            label="小尺寸二维码"
        />
        <CaomeiQRCode
            value="DEFAULT-160"
            label="默认尺寸二维码"
        />
        <CaomeiQRCode
            value="CUSTOM-COLOR-160"
            :size="160"
            :margin="4"
            color="#12326e"
            background="#f7f9ff"
            label="自定义配色二维码"
        />
        <CaomeiQRCode
            value="LEVEL-120"
            :size="120"
            level="L"
            label="低容错级别二维码"
        >
            L 级（约 7%）
        </CaomeiQRCode>
        <CaomeiQRCode
            value="LEVEL-120"
            :size="120"
            level="H"
            label="高容错级别二维码"
        >
            H 级（约 30%）
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
