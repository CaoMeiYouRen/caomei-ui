<script setup lang="ts">
import { CaomeiResult } from '@/components/result'
</script>

<template>
    <div class="result-statuses">
        <CaomeiResult
            status="403"
            title="Access denied"
            description="Ask an administrator for access and try again."
        />
        <CaomeiResult
            status="404"
            title="Page not found"
            description="The link may be outdated. Please go back."
        />
        <CaomeiResult
            status="500"
            title="Service unavailable"
            description="Try again later; contact support if it persists."
        />
    </div>
</template>

<style scoped>
.result-statuses {
    display: grid;
    gap: var(--caomei-space-4);
    grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr));
}
</style>
