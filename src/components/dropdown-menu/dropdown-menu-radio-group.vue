<script setup lang="ts">
import { DropdownMenuRadioGroup } from 'reka-ui'

defineOptions({ name: 'CaomeiDropdownMenuRadioGroup', inheritAttrs: false })

const model = defineModel<string | number | undefined>()
</script>

<template>
    <DropdownMenuRadioGroup
        v-bind="$attrs"
        v-model="model"
        class="caomei-dropdown-menu__group"
    >
        <slot />
    </DropdownMenuRadioGroup>
</template>
