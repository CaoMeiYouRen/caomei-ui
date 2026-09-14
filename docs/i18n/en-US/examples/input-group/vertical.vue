<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiInput } from '@/components/input'
import { CaomeiInputGroup } from '@/components/input-group'

const slug = ref('')
</script>

<template>
    <CaomeiInputGroup orientation="vertical">
        <CaomeiInput
            v-model="slug"
            placeholder="Slug"
        />
        <CaomeiButton block>
            Generate
        </CaomeiButton>
    </CaomeiInputGroup>
</template>
