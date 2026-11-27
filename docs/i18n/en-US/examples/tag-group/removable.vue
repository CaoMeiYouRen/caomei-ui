<script setup lang="ts">
import { ref } from 'vue'
import { X } from '@lucide/vue'
import { CaomeiIcon } from '@/icons'
import {
    CaomeiTagGroup,
    CaomeiTagGroupItem,
    CaomeiTagGroupItemDelete,
    CaomeiTagGroupItemText,
} from '@/components/tag-group'

const filters = ref(['Last week', 'Unread', 'Has attachment'])

function onRemove(value: string): void {
    filters.value = filters.value.filter((item) => item !== value)
}
</script>

<template>
    <div class="tag-group-demo">
        <CaomeiTagGroup
            :model-value="filters"
            aria-label="Active filters"
            @remove="onRemove"
        >
            <CaomeiTagGroupItem
                v-for="filter in filters"
                :key="filter"
                :value="filter"
            >
                <CaomeiTagGroupItemText>{{ filter }}</CaomeiTagGroupItemText>
                <CaomeiTagGroupItemDelete :label="`Remove ${filter}`">
                    <CaomeiIcon :icon="X" />
                </CaomeiTagGroupItemDelete>
            </CaomeiTagGroupItem>
        </CaomeiTagGroup>
        <p class="tag-group-demo__hint">
            {{ filters.length ? `${filters.length} filter(s) left` : 'All filters cleared' }}
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
