<script setup lang="ts">
import { CaomeiAlert } from '@/components/alert'
</script>

<template>
    <CaomeiAlert
        tone="warning"
        title="Environment notice"
        description="This is a sandbox environment; data is never written to production."
    />
</template>
