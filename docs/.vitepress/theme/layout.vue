<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { CaomeiConfirmDialog } from '../../../src/components/confirm-dialog'
import { CaomeiToastProvider } from '../../../src/components/toast'
import ThemePresetSwitcher from './components/theme-preset-switcher.vue'

const { Layout } = DefaultTheme
</script>

<template>
    <CaomeiToastProvider>
        <CaomeiConfirmDialog>
            <Layout>
                <template #nav-bar-content-after>
                    <ThemePresetSwitcher />
                </template>
            </Layout>
        </CaomeiConfirmDialog>
    </CaomeiToastProvider>
</template>
