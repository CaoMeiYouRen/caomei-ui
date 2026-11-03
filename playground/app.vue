<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import {
    CaomeiBadge,
    CaomeiButton,
    CaomeiCheckboxGroup,
    CaomeiDialog,
    CaomeiForm,
    CaomeiFormItem,
    CaomeiIcon,
    CaomeiInput,
    CaomeiInputNumber,
    CaomeiSelect,
    CaomeiSwitch,
    CaomeiTag,
    CaomeiTextarea,
    useTheme,
} from '@/index'
import { Check, Settings } from '@lucide/vue'

const open = ref(false)
const checked = ref(true)
const loading = ref(false)
const keyword = ref('')
const remark = ref('')
const quantity = ref<number | null>(2)
const invalidValue = ref('')
const fruit = ref<string>('apple')
const fruitOptions = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '樱桃', value: 'cherry' },
]

/** 表单编排演示：文本 / 选择 / 组型 / 开关各一，覆盖三种继承面与 Switch 例外 */
const formName = ref('')
const formFruit = ref<string>('apple')
const formRoles = ref<string[]>(['reader'])
const formNotify = ref(true)
const formSubmitted = ref(false)
const formNameError = computed(() => (formSubmitted.value && !formName.value.trim() ? '名称不能为空' : ''))
const roleOptions = [
    { label: '读者', value: 'reader' },
    { label: '编辑', value: 'editor' },
]

function onSubmitForm(): void {
    formSubmitted.value = true
}
const { mode, isDark, setMode } = useTheme('light')

watchEffect(() => {
    document.documentElement.classList.toggle('dark', isDark.value)
})

async function triggerLoading(): Promise<void> {
    loading.value = true
    await new Promise((resolve) => setTimeout(resolve, 1200))
    loading.value = false
}
</script>

<template>
    <main class="playground">
        <h1>caomei-ui playground</h1>

        <section class="playground__section">
            <h2>变体</h2>
            <div class="playground__row">
                <CaomeiButton variant="primary">
                    Primary
                </CaomeiButton>
                <CaomeiButton variant="secondary">
                    Secondary
                </CaomeiButton>
                <CaomeiButton variant="ghost">
                    Ghost
                </CaomeiButton>
            </div>
        </section>

        <section class="playground__section">
            <h2>尺寸</h2>
            <div class="playground__row">
                <CaomeiButton size="sm">
                    Small
                </CaomeiButton>
                <CaomeiButton size="md">
                    Medium
                </CaomeiButton>
                <CaomeiButton size="lg">
                    Large
                </CaomeiButton>
            </div>
        </section>

        <section class="playground__section">
            <h2>状态</h2>
            <div class="playground__row">
                <CaomeiButton disabled>
                    Disabled
                </CaomeiButton>
                <CaomeiButton :loading="loading" @click="triggerLoading">
                    {{ loading ? '加载中' : '点击加载' }}
                </CaomeiButton>
                <CaomeiButton variant="secondary" @click="setMode(isDark ? 'light' : 'dark')">
                    <template #icon>
                        <CaomeiIcon :icon="Settings" />
                    </template>
                    {{ mode }}
                </CaomeiButton>
            </div>
        </section>

        <section class="playground__section">
            <h2>输入框</h2>
            <div class="playground__column">
                <CaomeiInput
                    v-model="keyword"
                    clearable
                    placeholder="请输入内容"
                />
                <CaomeiInput
                    v-model="keyword"
                    size="sm"
                    placeholder="小尺寸"
                />
                <CaomeiInput
                    v-model="keyword"
                    size="lg"
                    disabled
                    placeholder="禁用"
                />
                <CaomeiInput
                    v-model="invalidValue"
                    invalid
                    placeholder="校验失败"
                />
            </div>
        </section>

        <section class="playground__section">
            <h2>多行输入</h2>
            <div class="playground__column">
                <CaomeiTextarea
                    v-model="remark"
                    :rows="3"
                    placeholder="请输入备注"
                />
                <CaomeiTextarea
                    v-model="remark"
                    :rows="2"
                    size="sm"
                    invalid
                    placeholder="校验失败"
                />
            </div>
        </section>

        <section class="playground__section">
            <h2>数字输入</h2>
            <div class="playground__column">
                <CaomeiInputNumber
                    v-model="quantity"
                    :min="0"
                    :max="10"
                />
                <CaomeiInputNumber
                    v-model="quantity"
                    size="sm"
                    :step="0.1"
                    :precision="1"
                    invalid
                />
            </div>
        </section>

        <section class="playground__section">
            <h2>选择器</h2>
            <div class="playground__column">
                <CaomeiSelect
                    v-model="fruit"
                    :options="fruitOptions"
                    placeholder="请选择水果"
                />
                <CaomeiSelect
                    v-model="fruit"
                    :options="fruitOptions"
                    size="sm"
                    invalid
                    placeholder="校验失败"
                />
            </div>
        </section>

        <section class="playground__section">
            <h2>标签与徽标</h2>
            <div class="playground__row">
                <CaomeiTag tone="primary">
                    Vue
                </CaomeiTag>
                <CaomeiTag tone="success" variant="solid">
                    完成
                </CaomeiTag>
                <CaomeiTag tone="danger" variant="outline">
                    警告
                </CaomeiTag>
                <CaomeiBadge :value="5" />
                <CaomeiBadge
                    :value="100"
                    :max="99"
                    tone="primary"
                />
                <CaomeiBadge
                    dot
                    label="在线"
                    tone="success"
                />
            </div>
        </section>

        <section class="playground__section">
            <h2>表单编排</h2>
            <CaomeiForm
                style="max-width: 420px"
                @submit="onSubmitForm"
            >
                <CaomeiFormItem
                    label="名称"
                    name="name"
                    hint="请输入名称"
                    :error="formNameError"
                    required
                >
                    <template #default="{id, name, invalid, ...aria}">
                        <CaomeiInput
                            :id="id"
                            v-model="formName"
                            :name="name"
                            :invalid="invalid"
                            v-bind="aria"
                        />
                    </template>
                </CaomeiFormItem>
                <CaomeiFormItem
                    label="水果"
                    name="fruit"
                    hint="单选选择器"
                >
                    <template #default="{id, name, invalid, ...aria}">
                        <CaomeiSelect
                            :id="id"
                            v-model="formFruit"
                            :name="name"
                            :invalid="invalid"
                            :options="fruitOptions"
                            v-bind="aria"
                        />
                    </template>
                </CaomeiFormItem>
                <CaomeiFormItem
                    label="角色"
                    name="roles"
                    hint="组型控件用 aria-labelledby 关联标签"
                >
                    <template #default="{id, name, invalid, ...aria}">
                        <CaomeiCheckboxGroup
                            :id="id"
                            v-model="formRoles"
                            :name="name"
                            :invalid="invalid"
                            :options="roleOptions"
                            v-bind="aria"
                        />
                    </template>
                </CaomeiFormItem>
                <CaomeiFormItem
                    label="通知"
                    name="notify"
                    hint="Switch 没有校验状态通道，不绑定 invalid"
                >
                    <template #default="{id, name, ...aria}">
                        <CaomeiSwitch
                            :id="id"
                            v-model="formNotify"
                            :name="name"
                            v-bind="aria"
                        />
                    </template>
                </CaomeiFormItem>
                <CaomeiButton type="submit">
                    提交
                </CaomeiButton>
            </CaomeiForm>
        </section>

        <section class="playground__section">
            <h2>其他</h2>
            <div class="playground__row">
                <CaomeiButton variant="secondary" @click="open = true">
                    <template #icon>
                        <CaomeiIcon :icon="Check" />
                    </template>
                    打开对话框
                </CaomeiButton>
                <CaomeiSwitch v-model="checked" />
            </div>
            <CaomeiButton block>
                Block Button
            </CaomeiButton>
        </section>

        <CaomeiDialog
            v-model:open="open"
            title="示例对话框"
            description="用于验证 Portal 与 Teleport 行为。"
        >
            对话框内容
            <template #footer>
                <CaomeiButton variant="secondary" @click="open = false">
                    关闭
                </CaomeiButton>
            </template>
        </CaomeiDialog>
    </main>
</template>

<style scoped>
.playground {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-4);
    min-height: 100vh;
    padding: var(--caomei-space-4);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
}

.playground__section {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-2);
}

.playground__section h2 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
}

.playground__row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--caomei-space-3);
}

.playground__column {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-2);
    max-width: 320px;
}
</style>
