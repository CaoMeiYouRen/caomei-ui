<script setup lang="ts">
import { CaomeiCell, CaomeiCellGroup } from '@/components/cell'
</script>

<template>
    <CaomeiCellGroup title="账户设置" class="demo-cell-group">
        <CaomeiCell
            title="个人资料"
            description="头像、昵称与简介"
            value="已完善"
            arrow
        />
        <CaomeiCell title="消息通知" value="开启" />
    </CaomeiCellGroup>
</template>

<style scoped>
.demo-cell-group {
    max-width: 420px;
}
</style>
