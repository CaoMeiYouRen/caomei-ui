<script setup lang="ts">
import { CaomeiButton } from '@/components/button'
import { CaomeiResult } from '@/components/result'
</script>

<template>
    <CaomeiResult
        status="success"
        title="订单已提交"
        description="我们已收到你的订单，稍后可在订单列表查看进度。"
    >
        <template #extra>
            <CaomeiButton size="sm">
                查看订单
            </CaomeiButton>
            <CaomeiButton
                size="sm"
                variant="ghost"
            >
                返回首页
            </CaomeiButton>
        </template>
    </CaomeiResult>
</template>
