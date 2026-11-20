<script setup lang="ts">
import { CaomeiCell, CaomeiCellGroup } from '@/components/cell'
</script>

<template>
    <CaomeiCellGroup title="Notifications" class="demo-cell-group">
        <CaomeiCell title="System notifications" value="On" />
        <CaomeiCell title="Marketing emails" value="Off" />
        <CaomeiCell title="Security alerts" value="Forced" />
    </CaomeiCellGroup>
</template>

<style scoped>
.demo-cell-group {
    max-width: 420px;
}
</style>
