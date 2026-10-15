<script setup lang="ts">
import { CaomeiAlert } from '@/components/alert'
import { ref } from 'vue'

const visible = ref(true)
</script>

<template>
    <div class="demo-stack">
        <CaomeiAlert
            tone="primary"
            variant="soft"
            title="Scheduled maintenance"
            description="Writes are paused on Sunday 02:00–04:00."
        />
        <CaomeiAlert
            tone="success"
            variant="solid"
            title="Check passed"
            description="All dependencies are on their latest patched versions."
        />
        <CaomeiAlert
            v-if="visible"
            tone="danger"
            variant="outline"
            title="High-severity alerts"
            description="3 repositories have unfixed high-severity dependency advisories."
            closable
            @close="visible = false"
        />
    </div>
</template>

<style scoped>
.demo-stack {
    display: grid;
    gap: 12px;
}
</style>
