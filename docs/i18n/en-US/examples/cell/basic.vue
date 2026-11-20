<script setup lang="ts">
import { CaomeiCell, CaomeiCellGroup } from '@/components/cell'
</script>

<template>
    <CaomeiCellGroup class="demo-cell-group" title="Account">
        <CaomeiCell
            title="Profile"
            description="Avatar, nickname and bio"
            value="Complete"
            arrow
        />
        <CaomeiCell title="Notifications" value="On" />
    </CaomeiCellGroup>
</template>

<style scoped>
.demo-cell-group {
    max-width: 420px;
}
</style>
