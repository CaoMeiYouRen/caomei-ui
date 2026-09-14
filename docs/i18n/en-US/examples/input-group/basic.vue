<script setup lang="ts">
import { Sparkles } from '@lucide/vue'
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiInput } from '@/components/input'
import { CaomeiInputGroup } from '@/components/input-group'

const name = ref('')
</script>

<template>
    <CaomeiInputGroup>
        <CaomeiInput
            v-model="name"
            placeholder="Name"
        />
        <CaomeiButton
            variant="secondary"
            label="Generate with AI"
            @click="name = 'CaoMei UI'"
        >
            <template #icon>
                <Sparkles :size="16" />
            </template>
        </CaomeiButton>
    </CaomeiInputGroup>
</template>
