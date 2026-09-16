<script setup lang="ts">
import { ref } from 'vue'
import {
    CaomeiAutoComplete,
    CaomeiButton,
    CaomeiButtonGroup,
    CaomeiCalendar,
    CaomeiDatePicker,
    CaomeiDialog,
    CaomeiMultiSelect,
    CaomeiSelect,
    CaomeiSelectButton,
    CaomeiSplitButton,
    CaomeiToolbar,
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
</style>
