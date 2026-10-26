<script setup lang="ts">
import { defineComponent, h, ref } from 'vue'
import { Settings } from '@lucide/vue'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import {
    CaomeiAccordion,
    CaomeiAccordionItem,
    CaomeiAlert,
    CaomeiAutoComplete,
    CaomeiButton,
    CaomeiButtonGroup,
    CaomeiCalendar,
    CaomeiChart,
    CaomeiCheckbox,
    CaomeiCol,
    CaomeiColorPicker,
    CaomeiConfirmDialog,
    CaomeiDataTable,
    CaomeiDatePicker,
    CaomeiDialog,
    CaomeiDrawer,
    CaomeiDropdownMenu,
    CaomeiDropdownMenuContent,
    CaomeiDropdownMenuTrigger,
    CaomeiFileUpload,
    CaomeiInput,
    CaomeiInputGroup,
    CaomeiInputNumber,
    CaomeiMessage,
    CaomeiMultiSelect,
    CaomeiPaginator,
    CaomeiPassword,
    CaomeiPopover,
    CaomeiPopoverContent,
    CaomeiPopoverTrigger,
    CaomeiRadioButton,
    CaomeiRadioGroup,
    CaomeiRow,
    CaomeiSelect,
    CaomeiSelectButton,
    CaomeiSlider,
    CaomeiSplitButton,
    CaomeiStepper,
    CaomeiStepperIndicator,
    CaomeiStepperItem,
    CaomeiStepperList,
    CaomeiStepperSeparator,
    CaomeiStepperTitle,
    CaomeiStepperTrigger,
    CaomeiSwitch,
    CaomeiTagsInput,
    CaomeiTabs,
    CaomeiTabList,
    CaomeiTabTrigger,
    CaomeiTabContent,
    CaomeiTag,
    CaomeiTextarea,
    CaomeiToggleButton,
    CaomeiToolbar,
    CaomeiToolbarButton,
    CaomeiToolbarLink,
    CaomeiTooltip,
    CaomeiTooltipContent,
    CaomeiTooltipProvider,
    CaomeiTooltipTrigger,
    CaomeiBreadcrumb,
    CaomeiBreadcrumbItem,
    CaomeiMenu,
    CaomeiMenuItem,
    CaomeiSubMenu,
    useConfirm,
} from '@/index'

/*
 * E2E 夹具：为响应式设计 §4 的断言提供可复现的被测形态。
 * 用例口径见 test/e2e/responsive.e2e.ts；标签取现实 UI 文案长度，
 * 不引入响应式设计 §3 矩阵 #8 登记的超长选项边界（单个约 35 字）。
 *
 * 新增 section 一律追加在末尾：`ScrollCase.entryFrom` 依赖 DOM 顺序（ButtonGroup 之前
 * 紧邻 Dialog 触发器），中间插入会破坏键盘用例。
 */

/**
 * 浮层面板用例：触发器定宽（section 的 `width: min(20rem, 100%)`，与组件的
 * `--caomei-select-max-width` 一致），选项文本**短于**触发器。
 *
 * 该组合是 `expectPanelNotNarrowerThanTrigger` 的判别场景：面板宽度由
 * `min-width: min(触发器宽, 可用宽)` 决定，规则失效（如 Reka 可用宽变量重命名导致
 * `var()` 计算值无效、回落到 `min-width: auto`）时面板会退化为内容宽（≈160px），断言即失败。
 */
const panelOptions = [
    { label: '按创建时间倒序排列', value: 'created-desc' },
    { label: '按最后更新时间排序', value: 'updated-desc' },
    { label: '按浏览量从高到低', value: 'views-desc' },
    { label: '按点赞数量从高到低', value: 'likes-desc' },
    { label: '按评论数量从高到低', value: 'comments-desc' },
    { label: '按标题拼音首字母排序', value: 'title-asc' },
]

const selectValue = ref<string | null>(null)
const multiSelectValue = ref<string[]>([])
const autoCompleteValue = ref<string>()

/** 换行类用例：成员总宽在 390 / 768 下明确超出容器可用宽（留出可判定的余量） */
const toolbarActions = [
    '新建文章并保存为草稿',
    '编辑当前选中的文章内容',
    '复制为新的草稿副本',
    '移动到回收站文件夹中',
    '批量导出所选文章数据',
    '删除所选文章内容',
]

const selectButtonOptions = [
    { label: '按创建时间排序', value: 'created' },
    { label: '按更新时间排序', value: 'updated' },
    { label: '按浏览量排序', value: 'views' },
    { label: '按点赞数量排序', value: 'likes' },
    { label: '按评论数量排序', value: 'comments' },
]

const segmentValue = ref<string>('created')

const dialogFooterActions = [
    '取消此次发布操作',
    '仅保存为草稿',
    '保存并继续编辑内容',
    '保存并立即发布上线',
]

const dialogOpen = ref(false)

/** 滚动类用例：内容总宽明确超出 390 / 768 的容器可用宽，桌面（1280）放得下 */
const versionActions = [
    '查看当前文章的变更历史记录',
    '对比当前版本与上一版本的差异',
    '还原到选中的历史版本并发布',
    '导出为纯文本文件并下载',
    '分享给协作者查看详情',
    '删除这一条历史版本记录',
]

const splitButtonItems = [
    { label: '导出为 Markdown' },
    { label: '导出为纯文本' },
]

/**
 * 含日历面板用例（响应式设计 §3 矩阵 #6）：DatePicker 的 portal 面板内容定宽（`width: max-content`），
 * 内联 Calendar 为内容驱动宽度。触发器/容器同样定宽，用于观察面板与触发的相对几何。
 */
const datePickerValue = ref<Date | null>(null)
const datePickerEdgeValue = ref<Date | null>(null)
const calendarValue = ref<Date | null>(null)

/**
 * 浮层断点宽度用例（响应式设计 §3 矩阵 #17）：断点键取迁移期实测值（1199 / 575），
 * 三档验收视口分别命中「不命中 / 1199 档 / 575 档」三条路径。
 */
const dialogBreakpointsOpen = ref(false)
const dialogBreakpoints = { '1199px': '85vw', '575px': '95vw' }

/** 栅格断点夹具：列 B 在 lg 档的完整覆盖（`span` + `offset` + `order` 三字段齐备，offset 取非 0 使运行时也判别 offset 覆盖） */
const gridColumnBLg = { span: 12, offset: 12, order: 2 }

/** 无头部用例：`showHeader=false` 时头部与关闭按钮不渲染，标题转为视觉隐藏的可访问名 */
const dialogHeaderlessOpen = ref(false)

/**
 * Textarea 字段几何用例：`rows` 决定字段高度，内部控件必须完整落在边框内。
 * `overflowText` 在 `20rem` 容器下必然折行超过 2 行，用于验证滚动条出现在框内而非越出边框。
 */
const textareaRows2 = ref('')
const textareaRows4 = ref('')
const textareaOverflow = ref(
    '这是一段足够长的多行文本，用于验证内容折行超过可见行数时，内部控件及滚动条仍完整落在字段边框内，不会溢出圆角范围。',
)

/**
 * 字段族溢出扫描用例（见 `test/e2e/field-overflow.e2e.ts`）：以「内容高度可超过单行」的
 * 压力内容驱动各字段组件，验证组件边框内不出现越界的 in-flow 内容。
 * `fieldLongLabel` 用于 Select 的值截断路径（长文本须由 ellipsis 裁切、而非越出边框）。
 */
const fieldOptions = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '樱桃', value: 'cherry' },
    { label: '榴莲', value: 'durian' },
    { label: '接骨木', value: 'elderberry' },
    { label: '无花果', value: 'fig' },
    { label: '葡萄', value: 'grape' },
    { label: '蜜瓜', value: 'honeydew' },
    { label: '猕猴桃', value: 'kiwi' },
    { label: '柠檬', value: 'lemon' },
]
const fieldLongLabel = '这是一段足够长的选中文本，用于验证超长取值在字段内被省略号截断而不是越出边框范围。'
const fieldLongOptions = [{ label: fieldLongLabel, value: 'long' }, ...fieldOptions]
const fieldMultiTags = ref(fieldOptions.slice(0, 8).map((item) => item.value))
const fieldAutoMultiple = ref(fieldOptions.slice(0, 8).map((item) => item.value))
const fieldTags = ref(fieldOptions.map((item) => item.value))
const fieldSelectLong = ref<string>('long')
const fieldInputLong = ref(fieldLongLabel)
const fieldGroupInput = ref('输入')
const fieldGroupSelect = ref<string>('apple')
const fieldGroupTextarea = ref(textareaOverflow)

/**
 * 模态内浮层用例（见 `test/e2e/overlay-stacking.e2e.ts`）：在 Dialog 内部打开的浮层面板
 * 必须渲染在模态内容之上。**全部 7 个 portal 浮层面板**（Select / MultiSelect / AutoComplete /
 * ColorPicker / DatePicker / Popover / DropdownMenu）同列为受检面——它们同源（Reka 的 popper
 * 包裹层承载面板 z-index），任一类回退到遮罩层档位都会被模态内容盖住。
 */
const overlayDialogOpen = ref(false)
const overlaySelectValue = ref<string | null>(null)
const overlayMultiValue = ref<string[]>([])
const overlayAutoValue = ref<string>()
const overlayColorValue = ref('#60a5fa')
const overlayDateValue = ref<Date | null>(null)
const overlayMenuItems = [{ label: '仅报告' }, { label: '修复并建 PR' }]

/*
 * 图表内核的按需注册（使用方职责）：只注册受检用例用到的渲染器 / 图表类型 / 组件，
 * 以此证明封装层不代注册、也不把全量内核带进产物。用例见 `test/e2e/chart.e2e.ts`。
 *
 * SVG 渲染器不在本夹具注册：需要它的轴标签文本用例走独立入口 `/chart-theme.html`
 * （见 `chart-theme-app.vue`），以免通用夹具的渲染器注册被无关用例改变。
 */
use([CanvasRenderer, BarChart, GridComponent, TooltipComponent])

const chartOption = ref({
    xAxis: { type: 'category', data: ['一月', '二月', '三月'] },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: [12, 20, 15] }],
})

/* 对比度受检面：5 色调 × 3 变体（见 `test/e2e/alert-contrast.e2e.ts`）。 */
const alertTones = ['neutral', 'primary', 'success', 'warning', 'danger'] as const
const alertVariants = ['soft', 'solid', 'outline'] as const
const alertCombos = alertTones.flatMap((tone) => alertVariants.map((variant) => ({ tone, variant })))

/**
 * 内联 ColorPicker 用例（见 `test/e2e/overlay-stacking.e2e.ts` 第二个用例）：`inline` 形态是
 * 页面内的静态 flex item，`z-index` 对其同样生效，必须**不参与**浮层层叠（不得被基类带上档位）。
 */
const inlineColorValue = ref('#60a5fa')

/**
 * DataTable 排序图标列宽用例（见 `test/e2e/data-table-sort-width.e2e.ts`）：三列均 `sortable`、
 * 内容短于表头可用宽，使列宽由内容决定（`table-layout: auto`）——排序指示条（图标 + 多列序号）
 * 必须在**未排序态也占位**，否则点击排序会让该列变宽、其余列被压缩。
 */
interface SortWidthRow {
    dept: string
    name: string
    score: number
}

const sortWidthColumns = [
    { key: 'dept', header: '部门', sortable: true },
    { key: 'name', header: '姓名', sortable: true },
    { key: 'score', header: '评分', sortable: true, align: 'right' as const },
]

const sortWidthData: SortWidthRow[] = [
    { dept: '研发', name: '张三', score: 88 },
    { dept: '研发', name: '李四', score: 92 },
    { dept: '设计', name: '王五', score: 75 },
    { dept: '设计', name: '赵六', score: 81 },
]

/**
 * DataTable 根滚动容器键盘可达用例（见 `test/e2e/data-table-keyboard-scroll.e2e.ts`）：
 * 8 列窄表配合夹具侧的 `min-width: 720px`，使 375px 视口下根容器必然横向溢出——
 * 断言 `tabindex="0"` 可 Tab 进入、方向键可横向滚动，且 `caption` 同时作为容器可访问名。
 */
const keyboardScrollColumns = Array.from({ length: 8 }, (_, index) => ({
    key: `column${index + 1}`,
    header: `列 ${index + 1}`,
}))

const keyboardScrollData = Array.from({ length: 3 }, (_, rowIndex) =>
    Object.fromEntries(
        keyboardScrollColumns.map((column, columnIndex) => [
            column.key,
            `R${rowIndex + 1}C${columnIndex + 1}`,
        ]),
    ),
)

/**
 * 禁用态尺寸不变用例（见 `test/e2e/disabled-size.e2e.ts`）：默认态与禁用态成对，
 * 档位 / 内容 / 宽度宿主完全一致，仅 `disabled` 不同——两者的外盒几何必须逐值相等。
 */
const dsInput = ref('')
const dsSelect = ref<string | null>(null)
const dsTextarea = ref('')
const dsNumber = ref<number | null>(2)
const dsCheckbox = ref(false)
const dsSwitch = ref(false)
const dsOptions = [{ label: '选项一', value: 'a' }, { label: '选项二', value: 'b' }]
/** 禁用态几何扩面的预置状态：默认 / 禁用两侧同档位、同内容、同宿主，仅 disabled 不同。 */
const dsSegment = ref('a')
const dsRadio = ref('a')
const dsSlider = ref(40)
const dsMulti = ref<string[]>([])
const dsAuto = ref<string>()
const dsTags = ref<string[]>([])
const dsDate = ref<Date | null>(new Date(2026, 0, 15))
const dsPassword = ref('')

/**
 * 视觉基线字体路径用例（见 `test/visual/components.visual.ts`）：纯拉丁文本与 CJK + 拉丁混排，
 * 覆盖首批受检面（文本全为 CJK）之外的拉丁字形 / 跨字体回退路径。
 */
const fontLatinInput = ref('')

/** Drawer 收敛用例：`lg` 档（560px）与 90vw / 90vh 取小。 */
const drawerRightOpen = ref(false)
const drawerBottomOpen = ref(false)

/**
 * 焦点可见扩面用例（见 `test/e2e/focus-visible-expansion.e2e.ts`）：静态可驱动组件的预置状态。
 * 覆盖非字段 / 非按钮组件中「无需交互开合即可渲染出焦点目标」的形态；需交互 / 遥测闭包的形态
 * 不在本批（边界见治理记录）。
 */
const fvRadio = ref('a')
const fvSlider = ref(40)
const fvStep = ref(1)
const fvSteps = ['账户', '资料', '完成']
const fvColor = ref('#60a5fa')
const fvPassword = ref('Abcdefg1')
const fvMulti = ref<string[]>(['a'])
const fvAuto = ref<string>('选项一')
const fvTags = ref<string[]>(['苹果'])
const fvSelect = ref<string | null>('a')
const fvMenuItems = [{ label: '菜单项一' }]
const fvFieldOptions = [
    { label: '选项一', value: 'a' },
    { label: '选项二', value: 'b' },
]

/**
 * 浮层交互用例（见 `test/e2e/overlay-interaction.e2e.ts`）：Dialog 与 ConfirmDialog 的焦点落位 /
 * 滚动锁复位。确认框走命令式 `useConfirm()`，驱动按钮渲染在 `<CaomeiConfirmDialog>` 后代内。
 */
const interactionDialogOpen = ref(false)
const interactionDialogInput = ref('')
const ConfirmDriver = defineComponent({
    name: 'E2eConfirmDriver',
    setup() {
        const confirm = useConfirm()
        return () =>
            h(
                'button',
                {
                    id: 'confirm-open',
                    type: 'button',
                    onClick: () => {
                        void confirm.confirm({ title: '确认操作', description: '是否继续？' })
                    },
                },
                '打开确认框',
            )
    },
})
</script>

<template>
    <main class="fixture">
        <section id="panel-select" class="fixture__case">
            <CaomeiSelect
                v-model="selectValue"
                :options="panelOptions"
                placeholder="按创建时间倒序排列"
                label="排序方式"
            />
        </section>

        <section id="panel-multi-select" class="fixture__case">
            <CaomeiMultiSelect
                v-model="multiSelectValue"
                :options="panelOptions"
                placeholder="按创建时间倒序排列"
                label="筛选条件"
            />
        </section>

        <section id="panel-auto-complete" class="fixture__case">
            <CaomeiAutoComplete
                v-model="autoCompleteValue"
                :options="panelOptions"
                placeholder="按创建时间倒序排列"
                label="搜索条件"
            />
        </section>

        <section id="wrap-toolbar" class="fixture__case">
            <CaomeiToolbar label="文章操作">
                <CaomeiButton
                    v-for="action in toolbarActions"
                    :key="action"
                    variant="ghost"
                    size="sm"
                >
                    {{ action }}
                </CaomeiButton>
            </CaomeiToolbar>
        </section>

        <section id="wrap-select-button" class="fixture__case">
            <CaomeiSelectButton
                v-model="segmentValue"
                :options="selectButtonOptions"
                label="排序依据"
            />
        </section>

        <section id="wrap-dialog-footer" class="fixture__case">
            <CaomeiButton @click="dialogOpen = true">
                打开对话框
            </CaomeiButton>
            <CaomeiDialog
                v-model:open="dialogOpen"
                title="发布确认"
                description="用于验证页脚在窄屏下的换行与纵向裁切。"
            >
                <p>发布后文章将立即对读者可见。</p>
                <template #footer>
                    <CaomeiButton
                        v-for="action in dialogFooterActions"
                        :key="action"
                        variant="secondary"
                        size="sm"
                    >
                        {{ action }}
                    </CaomeiButton>
                </template>
            </CaomeiDialog>
        </section>

        <section id="scroll-button-group" class="fixture__case">
            <CaomeiButtonGroup>
                <CaomeiButton
                    v-for="action in versionActions"
                    :key="action"
                    variant="secondary"
                    size="sm"
                >
                    {{ action }}
                </CaomeiButton>
            </CaomeiButtonGroup>
        </section>

        <section id="scroll-split-button" class="fixture__case">
            <CaomeiSplitButton :model="splitButtonItems">
                导出当前版本记录
            </CaomeiSplitButton>
        </section>

        <section id="panel-date-picker" class="fixture__case">
            <CaomeiDatePicker
                v-model="datePickerValue"
                label="发布日期"
                placeholder="请选择发布日期"
            />
        </section>

        <section id="panel-date-picker-edge" class="fixture__case">
            <CaomeiDatePicker
                v-model="datePickerEdgeValue"
                label="截止日期"
                placeholder="截止"
            />
        </section>

        <section id="calendar-inline" class="fixture__case">
            <CaomeiCalendar
                v-model="calendarValue"
                label="内联日历"
            />
        </section>

        <section id="dialog-breakpoints" class="fixture__case">
            <CaomeiButton @click="dialogBreakpointsOpen = true">
                打开断点对话框
            </CaomeiButton>
            <CaomeiDialog
                v-model:open="dialogBreakpointsOpen"
                title="断点宽度"
                size="lg"
                :breakpoints="dialogBreakpoints"
            >
                <p>视口 ≤1199px 时面板宽 85vw，≤575px 时 95vw。</p>
            </CaomeiDialog>
        </section>

        <!--
            栅格断点夹具：断点取值按「宽 → 窄」覆盖，`sm`（≤640）/ `md`（≤768）/ `lg`（≤1024）三档
            在窄视口同时命中时由**最窄档**最终生效；列 B 的 `md` 只声明 `span`，用于回归
            「断点对象部分字段回退到基础档取值」的契约（非逐档级联）。
            gutter 取 8：横向间距总宽 23 × 8 = 184px，窄于移动端档的容器宽，避免夹具自身
            因「`23 × gutter` 宽于容器」而撑出横向溢出（该约束见组件页与类型 JSDoc）。
        -->
        <section id="grid-breakpoint" class="fixture__case">
            <CaomeiRow :gutter="[8, 8]">
                <CaomeiCol
                    id="grid-col-a"
                    :span="24"
                    :lg="12"
                    :md="8"
                    :sm="24"
                >
                    A
                </CaomeiCol>
                <CaomeiCol
                    id="grid-col-b"
                    :span="24"
                    :lg="gridColumnBLg"
                    :md="8"
                    :sm="24"
                >
                    B
                </CaomeiCol>
            </CaomeiRow>
        </section>

        <section id="dialog-headerless" class="fixture__case">
            <CaomeiButton @click="dialogHeaderlessOpen = true">
                打开无头部对话框
            </CaomeiButton>
            <CaomeiDialog
                v-model:open="dialogHeaderlessOpen"
                title="无头部对话框"
                :show-header="false"
                :close-on-overlay="false"
                :close-on-esc="false"
            >
                <p>头部与关闭按钮不渲染，需通过下方按钮关闭。</p>
                <template #footer>
                    <CaomeiButton @click="dialogHeaderlessOpen = false">
                        关闭
                    </CaomeiButton>
                </template>
            </CaomeiDialog>
        </section>

        <section id="textarea-layout" class="fixture__case">
            <div id="textarea-rows-2">
                <CaomeiTextarea
                    v-model="textareaRows2"
                    :rows="2"
                    placeholder="两行文本域"
                    label="两行文本域"
                />
            </div>
            <div id="textarea-rows-4">
                <CaomeiTextarea
                    v-model="textareaRows4"
                    :rows="4"
                    placeholder="四行文本域"
                    label="四行文本域"
                />
            </div>
            <div id="textarea-overflow">
                <CaomeiTextarea
                    v-model="textareaOverflow"
                    :rows="2"
                    label="溢出文本域"
                />
            </div>
        </section>

        <section id="field-overflow" class="fixture__case">
            <div id="field-multiselect">
                <CaomeiMultiSelect
                    v-model="fieldMultiTags"
                    :options="fieldOptions"
                    label="多行多选"
                />
            </div>
            <div id="field-autocomplete">
                <CaomeiAutoComplete
                    v-model="fieldAutoMultiple"
                    :options="fieldOptions"
                    multiple
                    label="多选自动补全"
                />
            </div>
            <div id="field-tags-input">
                <CaomeiTagsInput
                    v-model="fieldTags"
                    label="多标签录入"
                />
            </div>
            <div id="field-select-long">
                <CaomeiSelect
                    v-model="fieldSelectLong"
                    :options="fieldLongOptions"
                    label="超长选中项"
                />
            </div>
            <div id="field-input-long">
                <CaomeiInput
                    v-model="fieldInputLong"
                    label="超长输入"
                />
            </div>
            <div id="field-input-group">
                <CaomeiInputGroup orientation="horizontal">
                    <CaomeiInput
                        v-model="fieldGroupInput"
                        label="组内输入"
                    />
                    <CaomeiSelect
                        v-model="fieldGroupSelect"
                        :options="fieldOptions"
                        label="组内选择"
                    />
                    <CaomeiTextarea
                        v-model="fieldGroupTextarea"
                        :rows="2"
                        label="组内文本域"
                    />
                </CaomeiInputGroup>
            </div>
        </section>

        <section id="overlay-in-dialog" class="fixture__case">
            <CaomeiButton @click="overlayDialogOpen = true">
                打开浮层对话框
            </CaomeiButton>
            <CaomeiDialog
                v-model:open="overlayDialogOpen"
                title="批量扫描"
                description="验证模态内打开的浮层面板是否渲染在模态内容之上。"
            >
                <div class="fixture__overlay-stack">
                    <div id="overlay-select">
                        <CaomeiSelect
                            v-model="overlaySelectValue"
                            :options="panelOptions"
                            placeholder="仅报告"
                            label="扫描模式"
                        />
                    </div>
                    <div id="overlay-multi-select">
                        <CaomeiMultiSelect
                            v-model="overlayMultiValue"
                            :options="panelOptions"
                            placeholder="全部仓库"
                            label="扫描仓库"
                        />
                    </div>
                    <div id="overlay-auto-complete">
                        <CaomeiAutoComplete
                            v-model="overlayAutoValue"
                            :options="panelOptions"
                            placeholder="按仓库名搜索"
                            label="仓库搜索"
                        />
                    </div>
                    <div id="overlay-color-picker">
                        <CaomeiColorPicker
                            v-model="overlayColorValue"
                            label="标记颜色"
                        />
                    </div>
                    <div id="overlay-date-picker">
                        <CaomeiDatePicker
                            v-model="overlayDateValue"
                            placeholder="选择扫描日期"
                            label="扫描日期"
                        />
                    </div>
                    <div id="overlay-popover">
                        <CaomeiPopover>
                            <CaomeiPopoverTrigger>
                                扫描说明
                            </CaomeiPopoverTrigger>
                            <CaomeiPopoverContent>
                                扫描范围为所选仓库的全部开放依赖告警。
                            </CaomeiPopoverContent>
                        </CaomeiPopover>
                    </div>
                    <div id="overlay-dropdown-menu">
                        <CaomeiDropdownMenu>
                            <CaomeiDropdownMenuTrigger>
                                更多操作
                            </CaomeiDropdownMenuTrigger>
                            <CaomeiDropdownMenuContent :model="overlayMenuItems" />
                        </CaomeiDropdownMenu>
                    </div>
                    <!--
                      工具提示用例：**打开走 hover 路径**——Playwright 的 `click()` 会先派发 `pointermove`，
                      Reka 的 `handlePointerMove` → 触发器进入 → 按 `delay-duration` 展开（夹具取 0 ⇒ 立即）；
                      `disable-closing-trigger` 只负责让随后的 click / pointerdown **不关闭**已展开的面板
                      （Reka 缺省为「展开态点击触发器即收起」）。即 click 本身从不开面板，与其余浮层的
                      click 开合用例不同源；其余用例的交互路径不受影响。
                    -->
                    <div id="overlay-tooltip">
                        <CaomeiTooltipProvider>
                            <CaomeiTooltip
                                :delay-duration="0"
                                disable-closing-trigger
                            >
                                <CaomeiTooltipTrigger>
                                    扫描范围
                                </CaomeiTooltipTrigger>
                                <CaomeiTooltipContent>
                                    扫描范围为所选仓库的全部开放依赖告警。
                                </CaomeiTooltipContent>
                            </CaomeiTooltip>
                        </CaomeiTooltipProvider>
                    </div>
                </div>
            </CaomeiDialog>
        </section>

        <!--
          导航骨架用例（见 `test/e2e/menu-navigation.e2e.ts`）：纵向菜单 = 两个顶层项 + 一个含两项的
          子菜单，用于回归方向键导航与子菜单开合；`current` 项用于回归 `aria-current`。
        -->
        <section id="menu-navigation" class="fixture__case">
            <CaomeiMenu label="主导航">
                <CaomeiMenuItem
                    href="#menu-navigation"
                    current
                >
                    概览
                </CaomeiMenuItem>
                <CaomeiSubMenu label="设置">
                    <CaomeiMenuItem href="#menu-navigation">
                        账户
                    </CaomeiMenuItem>
                    <CaomeiMenuItem href="#menu-navigation">
                        通知
                    </CaomeiMenuItem>
                </CaomeiSubMenu>
                <CaomeiMenuItem>退出</CaomeiMenuItem>
            </CaomeiMenu>
            <CaomeiBreadcrumb label="面包屑">
                <CaomeiBreadcrumbItem href="#menu-navigation">
                    首页
                </CaomeiBreadcrumbItem>
                <CaomeiBreadcrumbItem href="#menu-navigation">
                    内容管理
                </CaomeiBreadcrumbItem>
                <CaomeiBreadcrumbItem current>
                    当前页
                </CaomeiBreadcrumbItem>
            </CaomeiBreadcrumb>
        </section>

        <section id="inline-color-picker" class="fixture__case">
            <CaomeiColorPicker
                v-model="inlineColorValue"
                inline
                label="内联颜色"
            />
        </section>

        <!--
          TabList 滚动轴对用例（见 `test/e2e/tabs-list-overflow.e2e.ts`）：容器定宽 `20rem`、
          触发器取现实文案长度，使横向滚动在三档视口下都必然可用；而**纵向不得出现滚动条**
          （触发器 `margin-bottom: -1px` 的越界既不能变成滚动条、也不应被裁掉）。纵向列表同列，
          用于回归 `:where(.caomei-tabs--vertical)` 的 `overflow: visible` 覆盖。
        -->
        <section id="tabs-list-overflow" class="fixture__case">
            <div id="tabs-horizontal">
                <CaomeiTabs model-value="account">
                    <CaomeiTabList aria-label="内容分区">
                        <CaomeiTabTrigger value="account">
                            账户与个人资料设置
                        </CaomeiTabTrigger>
                        <CaomeiTabTrigger value="password">
                            密码与安全验证方式
                        </CaomeiTabTrigger>
                        <CaomeiTabTrigger value="team">
                            团队成员与协作权限
                        </CaomeiTabTrigger>
                        <CaomeiTabTrigger value="notice">
                            通知偏好与订阅管理
                        </CaomeiTabTrigger>
                    </CaomeiTabList>
                    <CaomeiTabContent value="account">
                        账户信息面板
                    </CaomeiTabContent>
                    <CaomeiTabContent value="password">
                        密码信息面板
                    </CaomeiTabContent>
                    <CaomeiTabContent value="team">
                        团队信息面板
                    </CaomeiTabContent>
                    <CaomeiTabContent value="notice">
                        通知信息面板
                    </CaomeiTabContent>
                </CaomeiTabs>
            </div>
            <div id="tabs-vertical">
                <CaomeiTabs
                    model-value="account"
                    orientation="vertical"
                >
                    <CaomeiTabList aria-label="纵向分区">
                        <CaomeiTabTrigger value="account">
                            账户与个人资料设置
                        </CaomeiTabTrigger>
                        <CaomeiTabTrigger value="password">
                            密码与安全验证方式
                        </CaomeiTabTrigger>
                        <CaomeiTabTrigger value="team">
                            团队成员与协作权限
                        </CaomeiTabTrigger>
                    </CaomeiTabList>
                    <CaomeiTabContent value="account">
                        账户信息面板
                    </CaomeiTabContent>
                    <CaomeiTabContent value="password">
                        密码信息面板
                    </CaomeiTabContent>
                    <CaomeiTabContent value="team">
                        团队信息面板
                    </CaomeiTabContent>
                </CaomeiTabs>
            </div>
        </section>
        <!--
          Accordion 触发器可开合用例（见 `test/e2e/accordion-trigger-toggle.e2e.ts`）：
          ① `#trigger` 自定义触发器（图标 + 文字）在 `collapsible` 单开模式下必须**可开可合**——
             用户 2026-10-02 报告的「自定义触发器展开后无法关闭」实为文档示例漏传 `collapsible`；
          ② 同页并列默认单开模式（`collapsible=false`）作为对照：二次点击**保持展开**属既有契约
             （与 PrimeVue single 模式恒可收起的差异已登记），用于把两者区分钉死在测试里。
        -->
        <section id="accordion-trigger-toggle" class="fixture__case">
            <div id="accordion-collapsible-custom">
                <CaomeiAccordion collapsible>
                    <CaomeiAccordionItem value="custom">
                        <template #trigger>
                            <Settings :size="16" />
                            自定义触发器
                        </template>
                        <p class="fixture__note">
                            自定义触发器面板内容。
                        </p>
                    </CaomeiAccordionItem>
                </CaomeiAccordion>
            </div>
            <div id="accordion-single-default">
                <CaomeiAccordion>
                    <CaomeiAccordionItem value="plain" title="默认单开">
                        <p class="fixture__note">
                            默认单开模式下已展开项不可再次收起。
                        </p>
                    </CaomeiAccordionItem>
                </CaomeiAccordion>
            </div>
        </section>

        <!--
          DataTable 排序指示条占位用例（见 `test/e2e/data-table-sort-width.e2e.ts`）：
          三列均可排序、内容短于表头可用宽（列宽由内容决定），断言「未排序 / 升序 / 降序」三态的
          各列宽度逐值一致——缺占位时排序列会因图标 + 序号出现而变宽、其余列被压缩。
        -->
        <section id="data-table-sort-width" class="fixture__case">
            <CaomeiDataTable
                :data="sortWidthData"
                :columns="sortWidthColumns"
                row-key="name"
                sort-mode="multiple"
                caption="排序列宽"
            />
        </section>

        <!--
          DataTable 键盘横向滚动用例（见 `test/e2e/data-table-keyboard-scroll.e2e.ts`）：
          焦点锚点紧邻表格容器之前，便于断言「Tab 的下一站是滚动容器」；表格最小宽见样式块。
        -->
        <section id="data-table-keyboard-scroll" class="fixture__case">
            <button
                id="data-table-keyboard-scroll-before"
                type="button"
            >
                表格前焦点锚点
            </button>
            <CaomeiDataTable
                :data="keyboardScrollData"
                :columns="keyboardScrollColumns"
                caption="键盘横向滚动"
            />
        </section>

        <!-- 禁用态尺寸不变：默认态 / 禁用态成对，档位与内容一致，仅 disabled 不同 -->
        <section id="disabled-size" class="fixture__case">
            <div id="ds-button-default" class="fixture__state">
                <CaomeiButton>提交操作</CaomeiButton>
            </div>
            <div id="ds-button-disabled" class="fixture__state">
                <CaomeiButton disabled>
                    提交操作
                </CaomeiButton>
            </div>
            <div id="ds-input-default" class="fixture__state">
                <CaomeiInput v-model="dsInput" placeholder="请输入内容" />
            </div>
            <div id="ds-input-disabled" class="fixture__state">
                <CaomeiInput
                    v-model="dsInput"
                    disabled
                    placeholder="请输入内容"
                />
            </div>
            <div id="ds-select-default" class="fixture__state">
                <CaomeiSelect
                    v-model="dsSelect"
                    :options="dsOptions"
                    placeholder="请选择"
                />
            </div>
            <div id="ds-select-disabled" class="fixture__state">
                <CaomeiSelect
                    v-model="dsSelect"
                    :options="dsOptions"
                    disabled
                    placeholder="请选择"
                />
            </div>
            <div id="ds-textarea-default" class="fixture__state">
                <CaomeiTextarea
                    v-model="dsTextarea"
                    :rows="3"
                    placeholder="请输入内容"
                />
            </div>
            <div id="ds-textarea-disabled" class="fixture__state">
                <CaomeiTextarea
                    v-model="dsTextarea"
                    :rows="3"
                    disabled
                    placeholder="请输入内容"
                />
            </div>
            <div id="ds-input-number-default" class="fixture__state">
                <CaomeiInputNumber v-model="dsNumber" />
            </div>
            <div id="ds-input-number-disabled" class="fixture__state">
                <CaomeiInputNumber v-model="dsNumber" disabled />
            </div>
            <div id="ds-checkbox-default" class="fixture__state">
                <CaomeiCheckbox v-model="dsCheckbox" label="选项" />
            </div>
            <div id="ds-checkbox-disabled" class="fixture__state">
                <CaomeiCheckbox
                    v-model="dsCheckbox"
                    disabled
                    label="选项"
                />
            </div>
            <div id="ds-switch-default" class="fixture__state">
                <CaomeiSwitch v-model="dsSwitch" />
            </div>
            <div id="ds-switch-disabled" class="fixture__state">
                <CaomeiSwitch v-model="dsSwitch" disabled />
            </div>
            <div id="ds-select-button-default" class="fixture__state">
                <CaomeiSelectButton
                    v-model="dsSegment"
                    :options="dsOptions"
                    label="分段"
                />
            </div>
            <div id="ds-select-button-disabled" class="fixture__state">
                <CaomeiSelectButton
                    v-model="dsSegment"
                    :options="dsOptions"
                    disabled
                    label="分段"
                />
            </div>
            <div id="ds-radio-button-default" class="fixture__state">
                <CaomeiRadioGroup v-model="dsRadio" label="单选">
                    <CaomeiRadioButton value="a">
                        选项一
                    </CaomeiRadioButton>
                    <CaomeiRadioButton value="b">
                        选项二
                    </CaomeiRadioButton>
                </CaomeiRadioGroup>
            </div>
            <div id="ds-radio-button-disabled" class="fixture__state">
                <CaomeiRadioGroup
                    v-model="dsRadio"
                    disabled
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
            <div id="ds-toggle-button-default" class="fixture__state">
                <CaomeiToggleButton>切换</CaomeiToggleButton>
            </div>
            <div id="ds-toggle-button-disabled" class="fixture__state">
                <CaomeiToggleButton disabled>
                    切换
                </CaomeiToggleButton>
            </div>
            <div id="ds-slider-default" class="fixture__state">
                <CaomeiSlider v-model="dsSlider" label="滑块" />
            </div>
            <div id="ds-slider-disabled" class="fixture__state">
                <CaomeiSlider
                    v-model="dsSlider"
                    disabled
                    label="滑块"
                />
            </div>
            <div id="ds-tag-default" class="fixture__state">
                <CaomeiTag>标签</CaomeiTag>
            </div>
            <div id="ds-tag-disabled" class="fixture__state">
                <CaomeiTag disabled>
                    标签
                </CaomeiTag>
            </div>
            <div id="ds-multi-select-default" class="fixture__state">
                <CaomeiMultiSelect
                    v-model="dsMulti"
                    :options="dsOptions"
                    placeholder="多选"
                />
            </div>
            <div id="ds-multi-select-disabled" class="fixture__state">
                <CaomeiMultiSelect
                    v-model="dsMulti"
                    :options="dsOptions"
                    disabled
                    placeholder="多选"
                />
            </div>
            <div id="ds-auto-complete-default" class="fixture__state">
                <CaomeiAutoComplete
                    v-model="dsAuto"
                    :options="dsOptions"
                    placeholder="搜索"
                />
            </div>
            <div id="ds-auto-complete-disabled" class="fixture__state">
                <CaomeiAutoComplete
                    v-model="dsAuto"
                    :options="dsOptions"
                    disabled
                    placeholder="搜索"
                />
            </div>
            <div id="ds-tags-input-default" class="fixture__state">
                <CaomeiTagsInput v-model="dsTags" placeholder="标签" />
            </div>
            <div id="ds-tags-input-disabled" class="fixture__state">
                <CaomeiTagsInput
                    v-model="dsTags"
                    disabled
                    placeholder="标签"
                />
            </div>
            <div id="ds-date-picker-default" class="fixture__state">
                <CaomeiDatePicker v-model="dsDate" />
            </div>
            <div id="ds-date-picker-disabled" class="fixture__state">
                <CaomeiDatePicker v-model="dsDate" disabled />
            </div>
            <div id="ds-password-default" class="fixture__state">
                <CaomeiPassword v-model="dsPassword" placeholder="密码" />
            </div>
            <div id="ds-password-disabled" class="fixture__state">
                <CaomeiPassword
                    v-model="dsPassword"
                    disabled
                    placeholder="密码"
                />
            </div>
            <div id="ds-file-upload-default" class="fixture__state">
                <CaomeiFileUpload />
            </div>
            <div id="ds-file-upload-disabled" class="fixture__state">
                <CaomeiFileUpload disabled />
            </div>
        </section>

        <!-- Button 角标外扩：角标不得改变按钮外盒几何 -->
        <section id="badge-layout" class="fixture__case">
            <div id="badge-plain" class="fixture__state">
                <CaomeiButton>操作</CaomeiButton>
            </div>
            <div id="badge-badged" class="fixture__state">
                <CaomeiButton badge="5">
                    操作
                </CaomeiButton>
            </div>
        </section>

        <!-- Drawer 收敛：lg 档（560px）与 90vw / 90vh 取小；开合 200ms，reduced-motion 关闭动画 -->
        <section id="drawer-convergence" class="fixture__case">
            <CaomeiButton id="drawer-open-right" @click="drawerRightOpen = true">
                打开右侧抽屉
            </CaomeiButton>
            <CaomeiButton id="drawer-open-bottom" @click="drawerBottomOpen = true">
                打开底部抽屉
            </CaomeiButton>
            <CaomeiDrawer
                v-model:open="drawerRightOpen"
                position="right"
                size="lg"
                title="右侧抽屉"
            >
                <p>抽屉内容</p>
            </CaomeiDrawer>
            <CaomeiDrawer
                v-model:open="drawerBottomOpen"
                position="bottom"
                size="lg"
                title="底部抽屉"
            >
                <p>抽屉内容</p>
            </CaomeiDrawer>
        </section>

        <!--
          焦点可见扩面用例（见 `test/e2e/focus-visible-expansion.e2e.ts`）：把「无需交互开合即可
          静态渲染焦点目标」的组件纳入常驻断言（CDP 强制 `:focus-visible`）。需交互开合 / 遥测
          闭包 / box-shadow 焦点环的形态不在本批（边界见治理记录）。
        -->
        <section id="focus-visible-expansion" class="fixture__case">
            <div id="fv-toggle-button">
                <CaomeiToggleButton>切换</CaomeiToggleButton>
            </div>
            <div id="fv-radio">
                <CaomeiRadioGroup v-model="fvRadio" label="单选">
                    <CaomeiRadioButton value="a">
                        选项一
                    </CaomeiRadioButton>
                    <CaomeiRadioButton value="b">
                        选项二
                    </CaomeiRadioButton>
                </CaomeiRadioGroup>
            </div>
            <div id="fv-slider">
                <CaomeiSlider v-model="fvSlider" label="滑块" />
            </div>
            <div id="fv-stepper">
                <CaomeiStepper v-model="fvStep" :linear="false">
                    <template #default="stepperProps">
                        <CaomeiStepperList>
                            <CaomeiStepperItem
                                v-for="(step, index) in fvSteps"
                                :key="step"
                                :step="index + 1"
                            >
                                <CaomeiStepperTrigger>
                                    <CaomeiStepperIndicator>{{ index + 1 }}</CaomeiStepperIndicator>
                                    <CaomeiStepperTitle>{{ step }}</CaomeiStepperTitle>
                                </CaomeiStepperTrigger>
                                <CaomeiStepperSeparator v-if="index < fvSteps.length - 1" />
                            </CaomeiStepperItem>
                        </CaomeiStepperList>
                        <span class="fixture__note">{{ stepperProps.isNextDisabled ? '末尾' : '可前进' }}</span>
                    </template>
                </CaomeiStepper>
            </div>
            <div id="fv-paginator">
                <CaomeiPaginator
                    :total="40"
                    :items-per-page="10"
                    label="分页"
                />
            </div>
            <div id="fv-toolbar">
                <CaomeiToolbar label="工具">
                    <CaomeiToolbarButton>按钮</CaomeiToolbarButton>
                    <CaomeiToolbarLink href="#fv-toolbar">
                        链接
                    </CaomeiToolbarLink>
                </CaomeiToolbar>
            </div>
            <div id="fv-popover">
                <CaomeiPopover>
                    <CaomeiPopoverTrigger>说明</CaomeiPopoverTrigger>
                    <CaomeiPopoverContent>浮层内容</CaomeiPopoverContent>
                </CaomeiPopover>
            </div>
            <div id="fv-dropdown">
                <CaomeiDropdownMenu>
                    <CaomeiDropdownMenuTrigger>更多</CaomeiDropdownMenuTrigger>
                    <CaomeiDropdownMenuContent :model="fvMenuItems" />
                </CaomeiDropdownMenu>
            </div>
            <div id="fv-color-picker">
                <CaomeiColorPicker v-model="fvColor" label="颜色" />
            </div>
            <div id="fv-file-upload-advanced">
                <CaomeiFileUpload label="上传文件" />
            </div>
            <div id="fv-file-upload-basic">
                <CaomeiFileUpload
                    mode="basic"
                    label="上传文件"
                />
            </div>
            <div id="fv-password">
                <CaomeiPassword v-model="fvPassword" label="密码" />
            </div>
            <div id="fv-tags">
                <CaomeiTag closable>
                    可关闭标签
                </CaomeiTag>
                <CaomeiTag selectable>
                    可选择标签
                </CaomeiTag>
            </div>
            <div id="fv-message">
                <CaomeiMessage title="提示" closable />
            </div>
            <div id="fv-tabs-content">
                <CaomeiTabs model-value="a">
                    <CaomeiTabList aria-label="分区">
                        <CaomeiTabTrigger value="a">
                            一
                        </CaomeiTabTrigger>
                    </CaomeiTabList>
                    <CaomeiTabContent value="a">
                        面板
                    </CaomeiTabContent>
                </CaomeiTabs>
            </div>
            <div id="fv-multi-select">
                <CaomeiMultiSelect
                    v-model="fvMulti"
                    :options="fvFieldOptions"
                    show-clear
                    label="多选"
                />
            </div>
            <div id="fv-auto-complete">
                <CaomeiAutoComplete
                    v-model="fvAuto"
                    :options="fvFieldOptions"
                    clearable
                    dropdown
                    label="搜索"
                />
            </div>
            <div id="fv-tags-input">
                <CaomeiTagsInput
                    v-model="fvTags"
                    show-clear
                    label="标签"
                />
            </div>
            <div id="fv-select">
                <CaomeiSelect
                    v-model="fvSelect"
                    :options="fvFieldOptions"
                    show-clear
                    label="选择"
                />
            </div>
        </section>

        <!--
          浮层交互用例（见 `test/e2e/overlay-interaction.e2e.ts`）：Dialog / ConfirmDialog 的
          焦点落位与滚动锁复位。确认框经 `useConfirm()` 命令式打开，驱动按钮在该组件后代内。
        -->
        <section id="overlay-interaction" class="fixture__case">
            <CaomeiButton id="dialog-open" @click="interactionDialogOpen = true">
                打开对话框
            </CaomeiButton>
            <CaomeiDialog
                v-model:open="interactionDialogOpen"
                title="对话框标题"
                description="浮层交互用例。"
            >
                <p>对话框内容</p>
                <CaomeiInput
                    id="dialog-input"
                    v-model="interactionDialogInput"
                    placeholder="对话框输入"
                />
            </CaomeiDialog>
            <CaomeiConfirmDialog>
                <ConfirmDriver />
            </CaomeiConfirmDialog>
        </section>

        <!--
          视觉基线字体路径用例（见 `test/visual/components.visual.ts`）：首批受检面文本全为 CJK，
          拉丁字形与跨字体回退路径零覆盖。三段采样：
          ① `ds-font-latin` 纯拉丁按钮文本；② `ds-font-latin-input` 纯拉丁占位符；
          ③ `ds-font-mixed` 同一文本流内 CJK + 拉丁混排（跨字体回退）。
          追加在模板末尾，不改动既有 DOM 顺序约定（既有用例不按顺序定位）。
        -->
        <section id="visual-font-path" class="fixture__case">
            <div id="ds-font-latin" class="fixture__state">
                <CaomeiButton>Save changes</CaomeiButton>
            </div>
            <div id="ds-font-latin-input" class="fixture__state">
                <CaomeiInput v-model="fontLatinInput" placeholder="Enter your email" />
            </div>
            <div id="ds-font-mixed" class="fixture__state">
                <CaomeiButton>保存 Save changes 取消 Cancel</CaomeiButton>
            </div>
        </section>

        <!--
          视口轴采样（见 `test/visual/components.visual.ts`）：行宽 100%（随视口变化）+ 折行，
          覆盖窄视口（768）下的比例布局与换行路径。12 个 3 字按钮的自然宽介于 768 与 1280
          可用宽之间——768 下折为多行、1280 下为单行（用例内有折行前置守卫）。
        -->
        <section id="visual-viewport" class="fixture__case">
            <div id="ds-viewport-row" class="fixture__state">
                <CaomeiButton>保存</CaomeiButton>
                <CaomeiButton>取消</CaomeiButton>
                <CaomeiButton>删除</CaomeiButton>
                <CaomeiButton>导出</CaomeiButton>
                <CaomeiButton>重试</CaomeiButton>
                <CaomeiButton>提交</CaomeiButton>
                <CaomeiButton>关闭</CaomeiButton>
                <CaomeiButton>重置</CaomeiButton>
                <CaomeiButton>复制</CaomeiButton>
                <CaomeiButton>粘贴</CaomeiButton>
                <CaomeiButton>刷新</CaomeiButton>
                <CaomeiButton>分享</CaomeiButton>
            </div>
        </section>

        <!--
          对比度受检面（见 `test/e2e/alert-contrast.e2e.ts`）：5 色调 × 3 变体 = 15 条 Alert，
          用于在真实 Chromium 中按 WCAG 相对亮度计算「文本 / 实际合成背景」对比度（亮色 + 暗色两档）。
          **置于夹具末尾并采用紧凑网格**：新增受检面不得改变既有用例元素的绝对位置——页面高度
          增长会推移其后元素，使 `overlay-stacking` 等对滚动位置敏感的用例失去几何前置。
        -->
        <section id="alert-contrast" class="fixture__case">
            <CaomeiAlert
                v-for="combo in alertCombos"
                :key="`${combo.tone}-${combo.variant}`"
                :tone="combo.tone"
                :variant="combo.variant"
                title="环境提示"
                description="当前为沙箱环境，数据不会写入生产库。"
                :data-alert-tone="combo.tone"
                :data-alert-variant="combo.variant"
            />
        </section>
        <!--
          图表用例（见 `test/e2e/chart.e2e.ts`）：内核按需加载 + 画布实际绘制 + 容器尺寸变化后的自动 resize。
          与对比度受检面同属「追加在模板末尾」的约定，不改动既有元素绝对位置。
        -->
        <section id="chart" class="fixture__case">
            <div id="chart-resize-host" class="fixture__state">
                <CaomeiChart
                    id="chart-basic"
                    label="月度趋势"
                    :option="chartOption"
                />
            </div>
        </section>
    </main>
</template>

<style scoped>
.fixture {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-4);
    min-height: 100vh;
    padding: var(--caomei-space-4);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
}

/* 对比度受检面：紧凑网格（15 条尽量同屏、降低页面增高幅度） */
#alert-contrast {
    display: grid;
    gap: var(--caomei-space-2);
    /*
      轨道最小宽用 `min(20rem, 100%)` 收敛：`20rem`（320px）在极窄档（如 320px 视口下 section 内宽
      272px）宽于可用宽，会让**夹具自身**成为页面横向溢出源（同 `.fixture__case` 下方注释的约定）；
      组件侧无此问题（`CaomeiMessage` 实测 min-content 远小于可用宽）。
    */
    grid-template-columns: repeat(auto-fit, minmax(min(20rem, 100%), 1fr));
}

/*
  面板类用例的触发器定宽：当 `20rem`（组件自身的 `--caomei-select-max-width`）仍宽于
  可用宽时由 `max-width: 100%` 收敛，避免夹具自身成为页面横向溢出的来源。
*/
.fixture__case {
    box-sizing: border-box;
    max-width: 100%;
}

#panel-select,
#panel-multi-select,
#panel-auto-complete,
#panel-date-picker {
    width: min(20rem, 100%);
}

/*
  右缘窄触发器：面板在视口右侧的换位 / 收敛场景（与浮层面板的右缘用例同构，见
  `docs/design/responsive.md` §3 矩阵 #4 / #6）。触发器贴右缘，面板若不做碰撞收敛会在右侧越界。
*/
#panel-date-picker-edge {
    display: flex;
    justify-content: flex-end;
    width: 100%;
}

#panel-date-picker-edge > * {
    width: min(7.5rem, 100%);
}

/*
  Textarea 几何用例：容器定宽（与 `--caomei-select-max-width` 一致），使长文本必然折行超过
  可见行数，从而覆盖「滚动条出现在框内」的判定路径。
*/
#textarea-layout {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-4);
    width: min(20rem, 100%);
}

/* 字段族溢出扫描：定宽容器使压力内容必然折行 / 触发截断 */
#field-overflow {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-4);
    width: min(20rem, 100%);
}

/* 模态内浮层用例：字段纵向排列，面板向下展开后必然与模态内容区域重叠 */
.fixture__overlay-stack {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-4);
}

/* TabList 轴对用例：定宽容器使长触发器列表在三档视口下都横向溢出（横向滚动必须可用） */
#tabs-list-overflow {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-4);
    width: min(20rem, 100%);
}

/* Accordion 触发器可开合用例：两个面板纵向排列，各自独立定位 */
#accordion-trigger-toggle {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-4);
    width: min(20rem, 100%);
}

.fixture__note {
    margin: 0;
    font-size: var(--caomei-font-size-sm);
}

/*
  禁用态尺寸不变 / 角标用例：成对定宽宿主，使组件外盒由自身决定且两侧可比。
  定宽 15rem 同时也让 `width: 100%` 的字段族（Input / Select / Textarea / InputNumber）获得确定宽度。
*/
#disabled-size,
#badge-layout {
    display: flex;
    flex-wrap: wrap;
    gap: var(--caomei-space-3);
}

/* 视口轴采样：行宽随视口变化 + 允许折行（窄视口下折为多行） */
#visual-viewport .fixture__state {
    width: 100%;
    flex-wrap: wrap;
    gap: var(--caomei-space-2);
}

/* 字体路径采样：三段纵向排列并定宽，避免混排文本在窄视口撑破页面 */
#visual-font-path {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-3);
}

.fixture__state {
    display: flex;
    box-sizing: border-box;
    width: 15rem;
    max-width: 100%;
}

/* 焦点可见扩面用例：静态可驱动组件纵向排列并定宽，避免长内容在窄视口撑破页面 */
#focus-visible-expansion {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-3);
    width: min(20rem, 100%);
}

/*
  禁用态用例宿主允许收缩（`min-width: 0`）：否则字段族子元素的内禀最小宽会把文档宽度顶到
  视口之外，在移动端模拟的极窄探针视口下会改变布局视口宽度（影响浮层可用宽收敛的判别）。
*/
#disabled-size,
#badge-layout {
    min-width: 0;
}

#disabled-size .fixture__state,
#badge-layout .fixture__state,
#disabled-size .fixture__state > *,
#badge-layout .fixture__state > * {
    min-width: 0;
}

/*
  DataTable 键盘横向滚动用例：把表格最小宽固定为 720px，使 375px 视口下根容器必然横向溢出。
  溢出只发生在组件滚动容器内部，不构成页面级横向溢出。
*/
#data-table-keyboard-scroll :deep(.caomei-data-table__table) {
    min-width: 720px;
}
</style>
