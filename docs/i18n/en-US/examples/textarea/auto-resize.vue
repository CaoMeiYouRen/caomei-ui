<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiTextarea } from '@/components/textarea'

const value = ref('The height grows with the content:\nadd a line and it gets taller.')
</script>

<template>
    <CaomeiTextarea
        v-model="value"
        auto-resize
        :rows="2"
        placeholder="Type multiple lines to try it"
    />
</template>
