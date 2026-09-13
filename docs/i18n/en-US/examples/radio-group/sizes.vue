<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiRadioButton, CaomeiRadioGroup } from '@/components/radio-group'

const sm = ref<string | number>('sm')
const md = ref<string | number>('md')
const lg = ref<string | number>('lg')
</script>

<template>
    <div class="demo-col">
        <CaomeiRadioGroup
            v-model="sm"
            size="sm"
            label="Small"
        >
            <CaomeiRadioButton
                value="sm"
                text="Small (sm)"
            />
        </CaomeiRadioGroup>
        <CaomeiRadioGroup
            v-model="md"
            size="md"
            label="Medium"
        >
            <CaomeiRadioButton
                value="md"
                text="Medium (md)"
            />
        </CaomeiRadioGroup>
        <CaomeiRadioGroup
            v-model="lg"
            size="lg"
            label="Large"
        >
            <CaomeiRadioButton
                value="lg"
                text="Large (lg)"
            />
        </CaomeiRadioGroup>
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
</style>
