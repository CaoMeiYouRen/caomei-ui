<script setup lang="ts">
import { CaomeiButton } from '@/components/button'
import { CaomeiEmpty } from '@/components/empty'
</script>

<template>
    <CaomeiEmpty
        title="No projects yet"
        description="Create your first project and it will show up here."
    >
        <template #action>
            <CaomeiButton size="sm">
                New project
            </CaomeiButton>
        </template>
    </CaomeiEmpty>
</template>
