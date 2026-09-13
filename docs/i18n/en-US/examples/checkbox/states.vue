<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiCheckbox } from '@/components/checkbox'

const indeterminate = ref<boolean | 'indeterminate'>('indeterminate')
</script>

<template>
    <div class="demo-col">
        <CaomeiCheckbox :model-value="true" text="Checked" />
        <CaomeiCheckbox :model-value="false" text="Unchecked" />
        <CaomeiCheckbox v-model="indeterminate" text="Indeterminate (click to check)" />
        <CaomeiCheckbox
            :model-value="true"
            disabled
            text="Disabled · checked"
        />
        <CaomeiCheckbox
            :model-value="false"
            disabled
            text="Disabled · unchecked"
        />
        <CaomeiCheckbox
            :model-value="false"
            invalid
            text="Invalid"
        />
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
</style>
