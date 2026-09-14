<script setup lang="ts">
import { CaomeiButton } from '@/components/button'
import { CaomeiButtonGroup } from '@/components/button-group'
</script>

<template>
    <CaomeiButtonGroup>
        <CaomeiButton variant="secondary">
            复制
        </CaomeiButton>
        <CaomeiButton variant="secondary">
            剪切
        </CaomeiButton>
        <CaomeiButton variant="secondary">
            粘贴
        </CaomeiButton>
    </CaomeiButtonGroup>
</template>
