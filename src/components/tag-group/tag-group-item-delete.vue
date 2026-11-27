<script setup lang="ts">
import { computed } from 'vue'
import { TagGroupItemDelete } from 'reka-ui'
import type { TagGroupItemDeleteProps } from './types'

defineOptions({ name: 'CaomeiTagGroupItemDelete', inheritAttrs: false })

const props = withDefaults(defineProps<TagGroupItemDeleteProps>(), {
    label: '',
})

/**
 * 传了 `label` 才接管可访问名：Reka 默认用 `aria-labelledby` 指向标签文本（名称 = 标签名），
 * 此时不能再塞可见文字（已实测 axe `label-content-name-mismatch`）；需要自定义名称（如「移除 前端」）
 * 时把 `aria-labelledby` 清空、让 `aria-label` 生效，按钮内容保持图标即可。
 * 未传 `label` 时**不输出任何命名属性**，保留 Reka 的指向关系。
 */
const namingAttrs = computed(() => (props.label
    ? { 'aria-label': props.label, 'aria-labelledby': '' }
    : {}))
</script>

<template>
    <!--
      可访问名有两档：
      - **未传 `label`**：沿用 Reka 的 `aria-labelledby="<自身 id> <标签 id>"`，名称即标签文本；
        此时可见内容必须是装饰性图形（无文本），否则 axe `label-content-name-mismatch` 会命中
        「可见文本不在可访问名内」。
      - **传 `label`**（如「移除 前端」）：把 `aria-labelledby` 清空使其回退到 `aria-label`，
        可见文本建议用其中的共用部分（如「移除」）。
    -->
    <TagGroupItemDelete
        v-bind="{...$attrs, ...namingAttrs}"
        class="caomei-tag-group__delete"
    >
        <slot />
    </TagGroupItemDelete>
</template>

<style scoped>
.caomei-tag-group__delete {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: var(--caomei-hit-target-min, 1.75rem);
    min-height: var(--caomei-hit-target-min, 1.75rem);
    padding: 0;
    border: 0;
    border-radius: var(--caomei-radius-sm);
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
}

.caomei-tag-group__delete:hover {
    background: var(--caomei-color-bg);
}

.caomei-tag-group__delete:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}

.caomei-tag-group__delete[data-disabled] {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}
</style>
