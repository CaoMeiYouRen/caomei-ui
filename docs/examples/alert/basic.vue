<script setup lang="ts">
import { CaomeiAlert } from '@/components/alert'
</script>

<template>
    <CaomeiAlert
        tone="warning"
        title="环境提示"
        description="当前为沙箱环境，数据不会写入生产库。"
    />
</template>
