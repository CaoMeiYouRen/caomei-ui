<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiCountdown } from '@/components/countdown'

/** Target time for the demo: each click pushes it 65.5 seconds ahead. */
const deadline = ref(Date.now() + 65_500)
const finished = ref(false)

function restart(): void {
    deadline.value = Date.now() + 65_500
    finished.value = false
}
</script>

<template>
    <div class="demo-column">
        <CaomeiCountdown
            :target="deadline"
            label="Time remaining"
            @finish="finished = true"
        />
        <CaomeiCountdown
            :target="deadline"
            format="DD d HH h mm m ss s"
        />
        <p class="demo-hint">
            Status: {{ finished ? 'Finished' : 'Running' }} (each click adds 65.5 seconds)
        </p>
        <CaomeiButton
            variant="secondary"
            @click="restart"
        >
            Restart
        </CaomeiButton>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
    width: 100%;
}

.demo-hint {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>
