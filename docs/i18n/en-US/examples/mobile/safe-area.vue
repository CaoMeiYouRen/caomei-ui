<template>
    <div class="safe-area-demo">
        <div class="safe-area-demo__frame">
            <div class="caomei-safe-area-top caomei-safe-area-x safe-area-demo__zone">
                <span class="safe-area-demo__label">Top safe area 34px</span>
            </div>
            <div class="caomei-safe-area-x safe-area-demo__zone safe-area-demo__zone--grow">
                <span class="safe-area-demo__label">Content</span>
            </div>
            <div class="caomei-safe-area-bottom caomei-safe-area-x safe-area-demo__zone">
                <span class="safe-area-demo__label">Bottom bar: safe area 34px</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* On a device these tokens come from env(); the demo pins 34px / 16px so the inset is visible. */
.safe-area-demo__frame {
    --caomei-safe-area-top: 34px;
    --caomei-safe-area-right: 16px;
    --caomei-safe-area-bottom: 34px;
    --caomei-safe-area-left: 16px;

    display: flex;
    flex-direction: column;
    width: min(280px, 100%);
    height: 260px;
    overflow: hidden;

    /* Tint the safe-area band with a light primary mix so it stands out from the white content. */
    background: color-mix(in srgb, var(--caomei-color-primary) 10%, var(--caomei-color-bg));
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-lg);
}

/* `content-box` clipping leaves the padding transparent, revealing the frame tint as the safe-area band. */
.safe-area-demo__zone {
    display: flex;
    background-color: var(--caomei-color-bg);
    background-clip: content-box;
    border-bottom: 1px dashed var(--caomei-color-border);
}

.safe-area-demo__zone--grow {
    flex: 1;
}

.safe-area-demo__label {
    margin: auto;
    padding: var(--caomei-space-1) var(--caomei-space-2);
    font-size: var(--caomei-font-size-sm);
    color: var(--caomei-color-text);
    background: var(--caomei-color-bg);
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-sm);
}
</style>
