<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiPassword } from '@/components/password'

const value = ref('secret')
</script>

<template>
    <div class="demo-column">
        <CaomeiPassword
            v-model="value"
            clearable
            placeholder="Clearable"
        />
        <CaomeiPassword
            model-value="secret"
            disabled
            placeholder="Disabled"
        />
        <CaomeiPassword
            model-value="secret"
            invalid
            placeholder="Invalid"
        />
        <CaomeiPassword
            autocomplete="new-password"
            placeholder="autocomplete=new-password for sign-up"
        />
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
