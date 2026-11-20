<script setup lang="ts">
import { withBase } from 'vitepress'
import { CaomeiEmpty } from '@/components/empty'

const image = withBase('/demo/image-landscape.svg')
</script>

<template>
    <CaomeiEmpty
        title="Nothing here"
        description="Try another filter, or clear the search keywords."
        :image="image"
        image-alt="Illustration of an empty state"
        size="lg"
    />
</template>
