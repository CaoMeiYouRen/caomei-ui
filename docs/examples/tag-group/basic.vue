<script setup lang="ts">
import { ref } from 'vue'
import {
    CaomeiTagGroup,
    CaomeiTagGroupItem,
    CaomeiTagGroupItemText,
} from '@/components/tag-group'

const skills = ['Vue', 'TypeScript', 'CSS', 'Node.js']
const selected = ref<string[]>(['Vue'])
</script>

<template>
    <div class="tag-group-demo">
        <CaomeiTagGroup
            v-model="selected"
            selection-mode="multiple"
            aria-label="技能标签"
        >
            <CaomeiTagGroupItem
                v-for="skill in skills"
                :key="skill"
                :value="skill"
            >
                <CaomeiTagGroupItemText>{{ skill }}</CaomeiTagGroupItemText>
            </CaomeiTagGroupItem>
        </CaomeiTagGroup>
        <p class="tag-group-demo__hint">
            已选：{{ selected.length ? selected.join('、') : '无' }}
        </p>
    </div>
</template>

<style scoped>
.tag-group-demo {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-2);
}

.tag-group-demo__hint {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>
