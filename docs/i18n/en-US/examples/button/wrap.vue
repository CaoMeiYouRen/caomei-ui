<script setup lang="ts">
import { CaomeiButton } from '@/components/button'
</script>

<template>
    <div class="demo-section">
        <h4>Long labels in narrow containers</h4>
        <p class="demo-hint">
            Default is single-line truncation: long Japanese / Korean labels end with an ellipsis.
            With wrap the label breaks to the available width and the button grows in height.
        </p>
        <div class="demo-row">
            <div class="demo-cell">
                <CaomeiButton class="demo-narrow">
                    アカウントの設定を開く
                </CaomeiButton>
                <span class="demo-caption">Default (single line)</span>
            </div>
            <div class="demo-cell">
                <CaomeiButton
                    class="demo-narrow"
                    wrap
                >
                    アカウントの設定を開く
                </CaomeiButton>
                <span class="demo-caption">wrap</span>
            </div>
            <div class="demo-cell">
                <CaomeiButton
                    class="demo-narrow"
                    variant="secondary"
                    wrap
                >
                    Continue with account settings
                </CaomeiButton>
                <span class="demo-caption">wrap (long English)</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.demo-section {
    margin-bottom: 24px;
}

.demo-section h4 {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--caomei-color-text);
}

.demo-hint {
    margin: 0 0 12px;
    font-size: 13px;
    color: var(--caomei-color-text-muted);
}

.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 16px;
}

/* Width comes from the container; `.demo-narrow` shows a parent scoped rule hitting the button root. */
.demo-cell {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-width: 13rem;
}

.demo-narrow {
    width: 100%;
}

.demo-caption {
    font-size: 12px;
    color: var(--caomei-color-text-muted);
}
</style>
