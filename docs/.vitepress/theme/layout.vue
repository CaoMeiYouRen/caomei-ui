<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { CaomeiConfirmDialog } from '../../../src/components/confirm-dialog'
import { CaomeiToastProvider } from '../../../src/components/toast'

const { Layout } = DefaultTheme
</script>

<template>
    <CaomeiToastProvider>
        <CaomeiConfirmDialog>
            <Layout />
        </CaomeiConfirmDialog>
    </CaomeiToastProvider>
</template>
