<script setup lang="ts">
import { CaomeiBackTop } from '@/components/back-top'
</script>

<template>
    <div class="back-top-demo">
        <p>The back-to-top button appears in the bottom-right corner once the page scrolls past 200px.</p>
        <CaomeiBackTop label="Back to top" />
    </div>
</template>

<style scoped>
.back-top-demo {
    min-height: 3rem;
}
</style>
