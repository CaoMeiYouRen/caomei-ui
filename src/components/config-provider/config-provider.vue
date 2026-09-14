<script setup lang="ts">
import { provideLocale } from '../../composables/use-locale'
import { defaultLocale } from '../../locale'
import type { ConfigProviderProps } from './types'

// 渲染无 DOM 的 provider：关闭 attrs 继承，避免 fragment 根导致的 dev 告警
defineOptions({ name: 'CaomeiConfigProvider', inheritAttrs: false })

const props = withDefaults(defineProps<ConfigProviderProps>(), {
    locale: defaultLocale,
})

provideLocale({
    locale: () => props.locale,
    messages: () => props.messages,
})
</script>

<template>
    <slot />
</template>
