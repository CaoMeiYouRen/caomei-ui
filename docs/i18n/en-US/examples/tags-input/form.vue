<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiFloatLabel } from '@/components/float-label'
import { CaomeiTagsInput } from '@/components/tags-input'

const requiredTags = ref<string[]>(['Important'])
const invalidTags = ref<string[]>(['Needs fix'])
</script>

<template>
    <form
        class="demo-stack"
        @submit.prevent
    >
        <CaomeiFloatLabel>
            <CaomeiTagsInput
                id="tags-required"
                v-model="requiredTags"
                name="tags"
                required
            />
            <label for="tags-required">Watched tags (required, floats when filled)</label>
        </CaomeiFloatLabel>
        <CaomeiTagsInput
            v-model="invalidTags"
            label="Invalid and disabled"
            invalid
            disabled
            size="sm"
        />
    </form>
</template>

<style scoped>
.demo-stack {
    display: grid;
    gap: 16px;
    max-width: 320px;
}
</style>
