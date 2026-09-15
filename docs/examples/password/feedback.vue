<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiPassword } from '@/components/password'

const password = ref('')
</script>

<template>
    <CaomeiPassword
        v-model="password"
        feedback
        label="密码"
        placeholder="输入密码查看强度"
    />
</template>
