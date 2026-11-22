<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiInput } from '@/components/input'
import { CaomeiInputGroup } from '@/components/input-group'

const keyword = ref('')
const submitted = ref('')
const state = ref<'idle' | 'empty' | 'done'>('idle')

function submit(): void {
    const text = keyword.value.trim()
    if (!text) {
        state.value = 'empty'
        submitted.value = ''
        return
    }
    state.value = 'done'
    submitted.value = text
}

function clear(): void {
    keyword.value = ''
    state.value = 'idle'
    submitted.value = ''
}

function cancel(): void {
    clear()
}

/** 输入变化即回到初始态：避免空态提示 / 旧结果与当前关键词矛盾 */
watch(keyword, () => {
    state.value = 'idle'
    submitted.value = ''
})

const showCancel = computed(() => keyword.value.trim().length > 0)
</script>

<template>
    <div
        class="search-demo"
        data-density="touch"
    >
        <div class="search-demo__bar">
            <CaomeiInputGroup>
                <CaomeiInput
                    v-model="keyword"
                    clearable
                    placeholder="Search"
                    label="Search keyword"
                    @clear="clear"
                    @enter="submit"
                />
                <CaomeiButton
                    variant="secondary"
                    @click="submit"
                >
                    Search
                </CaomeiButton>
            </CaomeiInputGroup>
            <CaomeiButton
                v-if="showCancel"
                variant="ghost"
                @click="cancel"
            >
                Cancel
            </CaomeiButton>
        </div>
        <p
            v-if="state === 'empty'"
            class="search-demo__hint"
            role="status"
        >
            Enter a keyword before searching
        </p>
        <p
            v-else-if="state === 'done'"
            class="search-demo__hint"
            role="status"
        >
            Searching: {{ submitted }}
        </p>
    </div>
</template>

<style scoped>
.search-demo {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-2);
    width: 100%;
    max-width: 420px;
}

.search-demo__bar {
    display: flex;
    align-items: center;
    gap: var(--caomei-space-2);
}

.search-demo__bar > :first-child {
    flex: 1;
    min-width: 0;
}

.search-demo__hint {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>
