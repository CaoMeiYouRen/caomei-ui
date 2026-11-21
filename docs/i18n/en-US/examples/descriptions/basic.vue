<script setup lang="ts">
import { CaomeiDescriptions, CaomeiDescriptionsItem } from '@/components/descriptions'
</script>

<template>
    <CaomeiDescriptions
        :columns="3"
        label-width="6rem"
    >
        <CaomeiDescriptionsItem label="Name">
            CaoMeiYouRen
        </CaomeiDescriptionsItem>
        <CaomeiDescriptionsItem label="Email">
            dev@example.com
        </CaomeiDescriptionsItem>
        <CaomeiDescriptionsItem label="Role">
            Administrator
        </CaomeiDescriptionsItem>
        <CaomeiDescriptionsItem label="Created">
            2026-11-21 09:30
        </CaomeiDescriptionsItem>
        <CaomeiDescriptionsItem label="Last sign-in">
            2026-11-21 09:28
        </CaomeiDescriptionsItem>
        <CaomeiDescriptionsItem label="Status">
            Active
        </CaomeiDescriptionsItem>
    </CaomeiDescriptions>
</template>
