<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiPassword } from '@/components/password'

const value = ref('secret')
</script>

<template>
    <div class="demo-column">
        <CaomeiPassword
            v-model="value"
            clearable
            placeholder="可清除"
        />
        <CaomeiPassword
            model-value="secret"
            disabled
            placeholder="禁用"
        />
        <CaomeiPassword
            model-value="secret"
            invalid
            placeholder="校验失败"
        />
        <CaomeiPassword
            autocomplete="new-password"
            placeholder="注册场景 autocomplete=new-password"
        />
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}
</style>
