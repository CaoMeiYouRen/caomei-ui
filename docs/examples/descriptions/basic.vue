<script setup lang="ts">
import { CaomeiDescriptions, CaomeiDescriptionsItem } from '@/components/descriptions'
</script>

<template>
    <CaomeiDescriptions
        :columns="3"
        label-width="6rem"
    >
        <CaomeiDescriptionsItem label="姓名">
            草梅友仁
        </CaomeiDescriptionsItem>
        <CaomeiDescriptionsItem label="邮箱">
            dev@example.com
        </CaomeiDescriptionsItem>
        <CaomeiDescriptionsItem label="角色">
            管理员
        </CaomeiDescriptionsItem>
        <CaomeiDescriptionsItem label="创建时间">
            2026-11-21 09:30
        </CaomeiDescriptionsItem>
        <CaomeiDescriptionsItem label="最近登录">
            2026-11-21 09:28
        </CaomeiDescriptionsItem>
        <CaomeiDescriptionsItem label="状态">
            正常
        </CaomeiDescriptionsItem>
    </CaomeiDescriptions>
</template>
