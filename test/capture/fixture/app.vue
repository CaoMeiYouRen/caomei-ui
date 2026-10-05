<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Search } from '@lucide/vue'
import {
    CaomeiAutoComplete,
    CaomeiBadge,
    CaomeiButton,
    CaomeiButtonGroup,
    CaomeiCalendar,
    CaomeiCard,
    CaomeiColorPicker,
    CaomeiConfirmDialog,
    CaomeiDataTable,
    CaomeiDatePicker,
    CaomeiDialog,
    CaomeiDrawer,
    CaomeiDropdownMenu,
    CaomeiDropdownMenuContent,
    CaomeiDropdownMenuTrigger,
    CaomeiFloatLabel,
    CaomeiInput,
    CaomeiInputGroup,
    CaomeiInputNumber,
    CaomeiMessage,
    CaomeiMultiSelect,
    CaomeiPassword,
    CaomeiPopover,
    CaomeiPopoverContent,
    CaomeiPopoverTrigger,
    CaomeiRadioButton,
    CaomeiRadioGroup,
    CaomeiSelect,
    CaomeiSelectButton,
    CaomeiSplitButton,
    CaomeiSwitch,
    CaomeiTag,
    CaomeiTextarea,
    CaomeiToastProvider,
} from '@/index'
import { ConfirmDriver, ToastDriver } from './drivers'
import { ui } from './ui'

/*
 * 计算样式等价夹具：为样式治理改动（档位归一化 / 声明去重 / 触发器收敛 / token 归并）
 * 提供可复现的被测形态，采样面与运行器口径见测试规范 §4 与
 * docs/design/governance/ 下的采集装置记录。
 *
 * 覆盖范围只含**声明式样式面**：尺寸档位 / 变体与语气 / 状态与几何 / 触发器结构 /
 * 纯图标按钮几何 / 局部层叠 / 浮层尺寸档位 / Switch 开关 / Toast 语气强调色 /
 * 锚定浮层面板背景·圆角·阴影（浮层视觉契约固化）。需不稳定时序的采样面（浮层面板 z-index、
 * 小屏媒体查询档位）不在本夹具内，登记见采集装置记录。
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
const switchOff = ref(false)
const switchOn = ref(true)
const switchDisabled = ref(false)

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

/** 排序表：锁定表头 / 单元格底边色与排序按钮图标色。 */
const sortRows = [
    { name: '草稿一', qty: 1 },
    { name: '草稿二', qty: 2 },
]
const sortColumns = [
    { key: 'name', header: '名称', sortable: true },
    { key: 'qty', header: '数量', sortable: true },
]

/** 密码强度三档（值分别命中弱 / 中 / 强，见 STRONG/MEDIUM pattern）。 */
const passwordWeak = ref('abc')
const passwordMedium = ref('abcdef1')
const passwordStrong = ref('Abcdefg1')

/** 日历：选中日取当月 1 / 2 日（避开今日，保证 `[data-today]:not([data-selected])` 始终命中）。 */
const calendarToday = new Date()
const calendarSelectedDay = calendarToday.getDate() === 1 ? 2 : 1
const calendarValue = ref(new Date(calendarToday.getFullYear(), calendarToday.getMonth(), calendarSelectedDay))

/** 抽屉 / 对话框开合状态接到共享驱动接口（`ui` 见 `./ui.ts`；无渲染驱动组件见 `./drivers.ts`）。 */
ui.setDrawer = (size, open) => {
    drawerOpen[size] = open
}
ui.setDialog = (size, open) => {
    dialogOpen[size] = open
}
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

        <!-- 8. 纯图标按钮：方形几何契约（宽度等于高度、内边距与间距归零）。
             图标走 `#icon` 插槽——`iconOnly` 不渲染默认插槽内容。 -->
        <section>
            <div
                v-for="size in sizes"
                :key="`icon-only-${size}`"
                class="case"
                :data-cap="`button-icon-only:${size}`"
            >
                <CaomeiButton
                    icon-only
                    :size="size"
                    :label="`纯图标 ${size}`"
                >
                    <template #icon>
                        <Search />
                    </template>
                </CaomeiButton>
            </div>
        </section>

        <!-- 9. 浮层尺寸档位与层级（采样脚本最后开启，避免模态遮罩拦截交互采样） -->
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

        <!-- 10. Switch 开关：轨道与滑块的档位几何 + 回退 token（开 / 关 / 禁用三态） -->
        <section>
            <div class="case" data-cap="switch:off">
                <CaomeiSwitch v-model="switchOff" label="关" />
            </div>
            <div class="case" data-cap="switch:on">
                <CaomeiSwitch v-model="switchOn" label="开" />
            </div>
            <div class="case" data-cap="switch:disabled">
                <CaomeiSwitch
                    v-model="switchDisabled"
                    disabled
                    label="禁用"
                />
            </div>
        </section>

        <!-- 11. Toast：视口层级与各语气强调色（提示由采样脚本经 `window.__ui.showToasts` 末段入队） -->
        <section data-cap="toast:viewport">
            <CaomeiToastProvider>
                <ToastDriver />
            </CaomeiToastProvider>
        </section>

        <!-- 12. 锚定浮层面板：浮层视觉契约的面板背景 / 圆角 / 阴影（由采样脚本逐个开合） -->
        <section>
            <div class="case" data-cap="panel:select">
                <CaomeiSelect
                    v-model="selectValue"
                    :options="options"
                    placeholder="选择"
                    label="选择"
                />
            </div>
            <div class="case" data-cap="panel:multi-select">
                <CaomeiMultiSelect
                    v-model="multiValue"
                    :options="options"
                    placeholder="多选"
                    label="多选"
                />
            </div>
            <div class="case" data-cap="panel:auto-complete">
                <CaomeiAutoComplete
                    v-model="autoValue"
                    :options="options"
                    placeholder="搜索"
                    label="搜索"
                />
            </div>
            <div class="case" data-cap="panel:date-picker">
                <CaomeiDatePicker
                    v-model="dateValue"
                    placeholder="选择日期"
                    label="日期"
                />
            </div>
            <div class="case" data-cap="panel:color-picker">
                <CaomeiColorPicker v-model="colorValue" label="颜色" />
            </div>
            <div class="case" data-cap="panel:popover">
                <CaomeiPopover>
                    <CaomeiPopoverTrigger>说明</CaomeiPopoverTrigger>
                    <CaomeiPopoverContent>面板背景采集。</CaomeiPopoverContent>
                </CaomeiPopover>
            </div>
            <div class="case" data-cap="panel:dropdown-menu">
                <CaomeiDropdownMenu>
                    <CaomeiDropdownMenuTrigger>更多</CaomeiDropdownMenuTrigger>
                    <CaomeiDropdownMenuContent :model="dropItems" />
                </CaomeiDropdownMenu>
            </div>
        </section>

        <!-- 13. 组件设计 §6 P1 约定：Card 三变体 / Tag rounded / Password 强度 / DataTable 排序 -->
        <section>
            <div class="case" data-cap="card:outlined">
                <CaomeiCard variant="outlined" title="卡片">
                    内容
                </CaomeiCard>
            </div>
            <div class="case" data-cap="card:elevated">
                <CaomeiCard variant="elevated" title="卡片">
                    内容
                </CaomeiCard>
            </div>
            <div class="case" data-cap="card:filled">
                <CaomeiCard variant="filled" title="卡片">
                    内容
                </CaomeiCard>
            </div>
            <div class="case" data-cap="tag:rounded">
                <CaomeiTag rounded>
                    圆角
                </CaomeiTag>
            </div>
            <div
                class="case"
                data-cap="password:weak"
                style="width: 240px"
            >
                <CaomeiPassword
                    v-model="passwordWeak"
                    feedback
                    label="弱"
                />
            </div>
            <div
                class="case"
                data-cap="password:medium"
                style="width: 240px"
            >
                <CaomeiPassword
                    v-model="passwordMedium"
                    feedback
                    label="中"
                />
            </div>
            <div
                class="case"
                data-cap="password:strong"
                style="width: 240px"
            >
                <CaomeiPassword
                    v-model="passwordStrong"
                    feedback
                    label="强"
                />
            </div>
            <div class="case" data-cap="data-table:sort">
                <CaomeiDataTable
                    :columns="sortColumns"
                    :data="sortRows"
                    row-key="name"
                />
            </div>
        </section>

        <!-- 14. 登记点名项：Button rounded / Calendar 选中与今日 -->
        <section>
            <div class="case" data-cap="button-rounded">
                <CaomeiButton rounded>
                    圆角按钮
                </CaomeiButton>
            </div>
            <div class="case" data-cap="calendar">
                <CaomeiCalendar v-model="calendarValue" />
            </div>
        </section>

        <CaomeiConfirmDialog>
            <ConfirmDriver />
        </CaomeiConfirmDialog>
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
