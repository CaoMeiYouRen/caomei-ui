<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
    CaomeiAutoComplete,
    CaomeiBadge,
    CaomeiButton,
    CaomeiButtonGroup,
    CaomeiColorPicker,
    CaomeiDataTable,
    CaomeiDatePicker,
    CaomeiDialog,
    CaomeiDrawer,
    CaomeiFloatLabel,
    CaomeiInput,
    CaomeiInputGroup,
    CaomeiInputNumber,
    CaomeiMessage,
    CaomeiMultiSelect,
    CaomeiRadioButton,
    CaomeiRadioGroup,
    CaomeiSelect,
    CaomeiSelectButton,
    CaomeiSplitButton,
    CaomeiTag,
    CaomeiTextarea,
} from '@/index'

/*
 * 计算样式等价夹具：为样式治理改动（档位归一化 / 声明去重 / 触发器收敛 / token 归并）
 * 提供可复现的被测形态，采样面与运行器口径见测试规范 §4 与
 * docs/design/governance/ 下的采集装置记录。
 *
 * 覆盖范围只含**声明式样式面**：尺寸档位 / 变体与语气 / 状态与几何 / 触发器结构 /
 * 局部层叠 / 浮层尺寸档位。需交互或不稳定时序的采样面（浮层面板 z-index、toast
 * 瞬时颜色、小屏媒体查询档位）不在本夹具内，登记见采集装置记录。
 *
 * `data-cap` 标记与运行器的采样键一一对应：新增 / 重命名标记必须同步运行器的
 * 采样面声明，否则采集的「受检面不变量」自检直接失败。
 */
const sizes = ['sm', 'md', 'lg'] as const
const tones = ['neutral', 'primary', 'success', 'warning', 'danger'] as const
const buttonVariants = ['primary', 'secondary', 'ghost'] as const
const buttonTones = ['none', 'neutral', 'primary', 'success', 'warning', 'danger'] as const
const messageVariants = ['soft', 'solid', 'outline', 'simple'] as const
const boxVariants = ['soft', 'solid', 'outline'] as const

const options = [
    { label: '选项一', value: 'a' },
    { label: '选项二', value: 'b' },
    { label: '选项三', value: 'c' },
]

const selectValue = ref<string | null>(null)
const multiValue = ref<string[]>([])
const autoValue = ref<string>()
const segmentValue = ref<string>('a')
const floatValue = ref('')
const inputValue = ref('')
const numberValue = ref<number | undefined>(2)
const colorValue = ref('#2563eb')
const dateValue = ref<Date | null>(null)

/** 浮层默认关闭：开合状态由采样脚本经 `window.__ui` 驱动，避免模态遮罩拦截后续交互采样。 */
const drawerOpen = reactive({ sm: false, md: false, lg: false })
const dialogOpen = reactive({ sm: false, md: false, lg: false })

const dropItems = [{ label: '菜单项一' }, { label: '菜单项二' }]

const tableRows = [
    { name: '草稿一', qty: 1, note: '备注一' },
    { name: '草稿二', qty: 2, note: '备注二' },
]
const tableColumns = [
    { key: 'name', header: '名称', width: '160px', frozen: 'left' as const },
    { key: 'qty', header: '数量' },
    { key: 'note', header: '备注', width: '160px', frozen: 'right' as const },
]

onMounted(() => {
    ;(window as unknown as { __ui: unknown }).__ui = {
        setDrawer: (size: 'sm' | 'md' | 'lg', open: boolean) => {
            drawerOpen[size] = open
        },
        setDialog: (size: 'sm' | 'md' | 'lg', open: boolean) => {
            dialogOpen[size] = open
        },
    }
})
</script>

<template>
    <main class="fixture">
        <!-- 1. 尺寸档位：既有矩阵（select / select-button / 选项族 / message） -->
        <section>
            <template v-for="size in sizes" :key="`size-${size}`">
                <div class="case" :data-cap="`size:auto-complete:${size}`">
                    <CaomeiAutoComplete
                        v-model="autoValue"
                        :options="options"
                        :size="size"
                        placeholder="搜索"
                        label="搜索"
                    />
                </div>
                <div class="case" :data-cap="`size:multi-select:${size}`">
                    <CaomeiMultiSelect
                        v-model="multiValue"
                        :options="options"
                        :size="size"
                        placeholder="多选"
                        label="多选"
                    />
                </div>
                <div class="case" :data-cap="`size:message:${size}`">
                    <CaomeiMessage
                        :size="size"
                        title="提示"
                        description="内容"
                    />
                </div>
                <div class="case" :data-cap="`size:select:${size}`">
                    <CaomeiSelect
                        v-model="selectValue"
                        :options="options"
                        :size="size"
                        placeholder="选择"
                        label="选择"
                    />
                </div>
                <div class="case" :data-cap="`size:select-button:${size}`">
                    <CaomeiSelectButton
                        v-model="segmentValue"
                        :options="options"
                        :size="size"
                        label="分段"
                    />
                </div>
            </template>
        </section>

        <!-- 2. 尺寸档位归一化矩阵：基类 fallback 消费 + 档位块只声明变量 -->
        <section>
            <template v-for="size in sizes" :key="`tier-${size}`">
                <div class="case" :data-cap="`tier:input:${size}`">
                    <CaomeiInput
                        v-model="inputValue"
                        :size="size"
                        placeholder="输入"
                        label="输入"
                    />
                </div>
                <div class="case" :data-cap="`tier:textarea:${size}`">
                    <CaomeiTextarea
                        v-model="inputValue"
                        :size="size"
                        placeholder="文本域"
                        label="文本域"
                    />
                </div>
                <div class="case" :data-cap="`tier:input-number:${size}`">
                    <CaomeiInputNumber
                        v-model="numberValue"
                        :size="size"
                        controls
                        label="数字"
                    />
                </div>
                <div class="case" :data-cap="`tier:date-picker:${size}`">
                    <CaomeiDatePicker
                        v-model="dateValue"
                        :size="size"
                        label="日期"
                    />
                </div>
                <div class="case" :data-cap="`tier:tag:${size}`">
                    <CaomeiTag :size="size">
                        标签
                    </CaomeiTag>
                </div>
                <div class="case" :data-cap="`tier:badge:${size}`">
                    <CaomeiBadge :value="5" :size="size" />
                </div>
            </template>
            <div class="case" data-cap="tier:badge-dot:md">
                <CaomeiBadge dot size="md" />
            </div>
            <div class="case" data-cap="tier:badge-dot:lg">
                <CaomeiBadge dot size="lg" />
            </div>
        </section>

        <!-- 3. 状态与几何：聚焦 / 非法态的 box-shadow 与边框色 -->
        <section>
            <div class="case" data-cap="state:input:focus">
                <CaomeiInput
                    v-model="inputValue"
                    placeholder="聚焦"
                    label="聚焦"
                />
            </div>
            <div class="case" data-cap="state:input:invalid">
                <CaomeiInput
                    v-model="inputValue"
                    invalid
                    placeholder="非法"
                    label="非法"
                />
            </div>
            <div class="case" data-cap="state:textarea:focus">
                <CaomeiTextarea
                    v-model="inputValue"
                    placeholder="聚焦"
                    label="聚焦"
                />
            </div>
            <div class="case" data-cap="state:textarea:invalid">
                <CaomeiTextarea
                    v-model="inputValue"
                    invalid
                    placeholder="非法"
                    label="非法"
                />
            </div>
            <div class="case" data-cap="state:input-number:focus">
                <CaomeiInputNumber
                    v-model="numberValue"
                    controls
                    label="聚焦"
                />
            </div>
            <div class="case" data-cap="state:input-number:invalid">
                <CaomeiInputNumber
                    v-model="numberValue"
                    controls
                    invalid
                    label="非法"
                />
            </div>
            <div class="case" data-cap="state:select:focus">
                <CaomeiSelect
                    v-model="selectValue"
                    :options="options"
                    placeholder="聚焦"
                    label="聚焦"
                />
            </div>
            <div class="case" data-cap="state:select:invalid">
                <CaomeiSelect
                    v-model="selectValue"
                    :options="options"
                    invalid
                    placeholder="非法"
                    label="非法"
                />
            </div>
        </section>

        <!-- 4. 触发器结构：本库触发器包装（闭合 / 开合两态由采样脚本驱动） -->
        <section>
            <div class="case" data-cap="trigger:date-picker">
                <CaomeiDatePicker
                    v-model="dateValue"
                    label="日期"
                    placeholder="请选择"
                />
            </div>
            <div class="case" data-cap="trigger:color-picker">
                <CaomeiColorPicker v-model="colorValue" label="颜色" />
            </div>
            <div class="case" data-cap="trigger:split-button">
                <CaomeiSplitButton label="操作" :items="dropItems" />
            </div>
        </section>

        <!-- 5. 变体与语气矩阵 -->
        <section>
            <template v-for="tone in tones" :key="`msg-${tone}`">
                <div
                    v-for="variant in messageVariants"
                    :key="`msg-${tone}-${variant}`"
                    class="case"
                    :data-cap="`variant:message:${tone}:${variant}`"
                >
                    <CaomeiMessage
                        :tone="tone"
                        :variant="variant"
                        title="提示"
                    />
                </div>
            </template>
            <template v-for="tone in tones" :key="`badge-${tone}`">
                <div
                    v-for="variant in boxVariants"
                    :key="`badge-${tone}-${variant}`"
                    class="case"
                    :data-cap="`variant:badge:${tone}:${variant}`"
                >
                    <CaomeiBadge
                        :value="5"
                        :tone="tone"
                        :variant="variant"
                    />
                </div>
            </template>
            <template v-for="tone in tones" :key="`tag-${tone}`">
                <div
                    v-for="variant in boxVariants"
                    :key="`tag-${tone}-${variant}`"
                    class="case"
                    :data-cap="`variant:tag:${tone}:${variant}`"
                >
                    <CaomeiTag :tone="tone" :variant="variant">
                        标签
                    </CaomeiTag>
                </div>
            </template>
        </section>

        <!-- 6. 按钮矩阵：变体 × 语气 × 档位（含强制 :focus-visible 的几何与描边） -->
        <section>
            <template v-for="variant in buttonVariants" :key="`btn-${variant}`">
                <template v-for="tone in buttonTones" :key="`btn-${variant}-${tone}`">
                    <div
                        v-for="size in sizes"
                        :key="`btn-${variant}-${tone}-${size}`"
                        class="case"
                        :data-cap="`button:${variant}:${tone}:${size}`"
                    >
                        <CaomeiButton
                            :variant="variant"
                            :tone="tone === 'none' ? undefined : tone"
                            :size="size"
                        >
                            {{ variant }}-{{ tone }}-{{ size }}
                        </CaomeiButton>
                    </div>
                </template>
            </template>
        </section>

        <!-- 7. 局部层叠与被覆盖的边框色 -->
        <section>
            <div class="case" data-cap="stack:radio-group-invalid">
                <CaomeiRadioGroup
                    v-model="segmentValue"
                    invalid
                    label="单选"
                >
                    <CaomeiRadioButton value="a">
                        选项一
                    </CaomeiRadioButton>
                    <CaomeiRadioButton value="b">
                        选项二
                    </CaomeiRadioButton>
                </CaomeiRadioGroup>
            </div>
            <div class="case" data-cap="stack:button-group">
                <CaomeiButtonGroup>
                    <CaomeiButton>一</CaomeiButton>
                    <CaomeiButton>二</CaomeiButton>
                </CaomeiButtonGroup>
            </div>
            <div class="case" data-cap="stack:float-label">
                <CaomeiFloatLabel label="浮层标签">
                    <label>浮层标签</label>
                    <CaomeiInput v-model="floatValue" />
                </CaomeiFloatLabel>
            </div>
            <div class="case" data-cap="stack:input-group">
                <CaomeiInputGroup>
                    <CaomeiInput v-model="inputValue" placeholder="组合输入" />
                </CaomeiInputGroup>
            </div>
            <div class="case" data-cap="stack:data-table">
                <CaomeiDataTable
                    :columns="tableColumns"
                    :data="tableRows"
                    row-key="name"
                />
            </div>
        </section>

        <!-- 8. 浮层尺寸档位与层级（采样脚本最后开启，避免模态遮罩拦截交互采样） -->
        <section>
            <CaomeiDrawer
                v-for="size in sizes"
                :key="`drawer-${size}`"
                v-model:open="drawerOpen[size]"
                :size="size"
                :title="`抽屉 ${size}`"
            >
                <p>抽屉内容</p>
            </CaomeiDrawer>
            <CaomeiDialog
                v-for="size in sizes"
                :key="`dialog-${size}`"
                v-model:open="dialogOpen[size]"
                :size="size"
                :title="`对话框 ${size}`"
            >
                <p>对话框内容</p>
            </CaomeiDialog>
        </section>
    </main>
</template>

<style scoped>
.fixture {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 16px;
    background: var(--caomei-color-bg);
    font-family: var(--caomei-font-sans);
}

.case {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 4px 0;
}

.case > :deep(*) {
    max-width: 100%;
}
</style>
