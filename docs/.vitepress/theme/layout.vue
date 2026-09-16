<script setup lang="ts">
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { computed } from 'vue'
import { CaomeiConfigProvider } from '../../../src/components/config-provider'
import { CaomeiConfirmDialog } from '../../../src/components/confirm-dialog'
import { CaomeiToastProvider } from '../../../src/components/toast'
import type { CaomeiLocale } from '../../../src/locale'
import ThemePresetSwitcher from './components/theme-preset-switcher.vue'

const { Layout } = DefaultTheme

/** 文档站按页面语言注入组件内建文案（站点仅有 zh-CN / en-US 两种页面语言，其余回落 zh-CN） */
const { lang } = useData()
const locale = computed<CaomeiLocale>(() => (lang.value === 'en-US' ? 'en-US' : 'zh-CN'))
</script>

<template>
    <CaomeiConfigProvider :locale="locale">
        <CaomeiToastProvider>
            <CaomeiConfirmDialog>
                <Layout>
                    <template #nav-bar-content-after>
                        <ThemePresetSwitcher />
                    </template>
                </Layout>
            </CaomeiConfirmDialog>
        </CaomeiToastProvider>
    </CaomeiConfigProvider>
</template>
