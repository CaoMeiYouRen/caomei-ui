<script setup lang="ts">
import { CaomeiCell, CaomeiCellGroup } from '@/components/cell'
</script>

<template>
    <CaomeiCellGroup title="通知设置" class="demo-cell-group">
        <CaomeiCell title="系统通知" value="已开启" />
        <CaomeiCell title="营销邮件" value="已关闭" />
        <CaomeiCell title="安全提醒" value="强制开启" />
    </CaomeiCellGroup>
</template>

<style scoped>
.demo-cell-group {
    max-width: 420px;
}
</style>
