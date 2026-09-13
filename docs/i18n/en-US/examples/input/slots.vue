<script setup lang="ts">
import { Search } from '@lucide/vue'
import { ref } from 'vue'
import { CaomeiInput } from '@/components/input'
import { CaomeiIcon } from '@/icons'

const keyword = ref('')
const account = ref('')
</script>

<template>
    <div class="demo-column">
        <CaomeiInput v-model="keyword" placeholder="Search">
            <template #prefix>
                <CaomeiIcon :icon="Search" />
            </template>
        </CaomeiInput>
        <CaomeiInput
            v-model="account"
            type="password"
            placeholder="Password"
        >
            <template #suffix>
                @example.com
            </template>
        </CaomeiInput>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}
</style>
