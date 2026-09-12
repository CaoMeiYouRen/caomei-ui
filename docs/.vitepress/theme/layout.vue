<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { CaomeiToastProvider } from '../../../src/components/toast'

const { Layout } = DefaultTheme
</script>

<template>
    <CaomeiToastProvider>
        <Layout />
    </CaomeiToastProvider>
</template>
