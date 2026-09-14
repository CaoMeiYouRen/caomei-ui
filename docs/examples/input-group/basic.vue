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
            placeholder="名称"
        />
        <CaomeiButton
            variant="secondary"
            label="AI 生成"
            @click="name = '草梅 UI'"
        >
            <template #icon>
                <Sparkles :size="16" />
            </template>
        </CaomeiButton>
    </CaomeiInputGroup>
</template>
