<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'

const count = ref(0)
</script>

<template>
    <div class="demo-row">
        <CaomeiButton @click="count += 1">
            Add
        </CaomeiButton>
        <CaomeiButton
            variant="secondary"
            :badge="count > 0 ? String(count) : undefined"
        >
            Notifications
        </CaomeiButton>
        <CaomeiButton
            badge-tone="danger"
            :badge="String(count)"
        >
            Inbox
        </CaomeiButton>
    </div>
</template>

<style scoped>
.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}
</style>
