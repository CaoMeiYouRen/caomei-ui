<script setup lang="ts">
import { CaomeiButton } from '@/components/button'
import { CaomeiCard } from '@/components/card'
</script>

<template>
    <CaomeiCard
        class="demo-card"
        title="Card title"
        subtitle="One sentence describing the card"
    >
        <p class="demo-text">
            Card body content; any element can go here.
        </p>
        <template #footer>
            <CaomeiButton size="sm">
                View details
            </CaomeiButton>
        </template>
    </CaomeiCard>
</template>

<style scoped>
.demo-card {
    max-width: 360px;
}

.demo-text {
    margin: 0;
}
</style>
