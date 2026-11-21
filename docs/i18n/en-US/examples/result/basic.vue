<script setup lang="ts">
import { CaomeiButton } from '@/components/button'
import { CaomeiResult } from '@/components/result'
</script>

<template>
    <CaomeiResult
        status="success"
        title="Order submitted"
        description="We received your order. You can track its progress in the order list."
    >
        <template #extra>
            <CaomeiButton size="sm">
                View order
            </CaomeiButton>
            <CaomeiButton
                size="sm"
                variant="ghost"
            >
                Back to home
            </CaomeiButton>
        </template>
    </CaomeiResult>
</template>
