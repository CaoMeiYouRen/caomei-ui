<script setup lang="ts">
import { CaomeiButton } from '@/components/button'
import { CaomeiButtonGroup } from '@/components/button-group'
</script>

<template>
    <CaomeiButtonGroup>
        <CaomeiButton variant="secondary">
            Copy
        </CaomeiButton>
        <CaomeiButton variant="secondary">
            Cut
        </CaomeiButton>
        <CaomeiButton variant="secondary">
            Paste
        </CaomeiButton>
    </CaomeiButtonGroup>
</template>
