<script setup lang="ts">
import { computed, ref } from 'vue'
import { CaomeiPassword } from '@/components/password'

const password = ref('')
const length = computed(() => password.value.length)
</script>

<template>
    <div class="demo-column">
        <CaomeiPassword
            v-model="password"
            label="Password"
            placeholder="Enter your password"
        />
        <span class="demo-text">Length: {{ length }}</span>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}

.demo-text {
    color: var(--caomei-color-text-muted);
    font-size: 14px;
}
</style>
