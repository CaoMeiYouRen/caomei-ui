<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiPassword } from '@/components/password'

const password = ref('')
</script>

<template>
    <CaomeiPassword
        v-model="password"
        feedback
        label="Password"
        placeholder="Type a password to see its strength"
    />
</template>
