<script setup lang="ts">
// 不显式 import：验证组件与 composables 自动导入
const { mode } = useTheme('auto')
const count = ref(0)
</script>

<template>
    <main class="caomei-root">
        <p data-testid="theme-mode">
            {{ mode }}
        </p>
        <p data-testid="count">
            {{ count }}
        </p>
        <CaomeiButton
            data-testid="counter"
            variant="primary"
            @click="count++"
        >
            Hello Caomei
        </CaomeiButton>
        <CaomeiTag tone="success">
            ok
        </CaomeiTag>
    </main>
</template>
