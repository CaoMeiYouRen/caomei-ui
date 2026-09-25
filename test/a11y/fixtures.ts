import { Bold } from '@lucide/vue'
import { defineComponent, h, ref } from 'vue'
import {
    CaomeiAccordion,
    CaomeiAccordionItem,
    CaomeiAutoComplete,
    CaomeiAvatar,
    CaomeiBadge,
    CaomeiButton,
    CaomeiButtonGroup,
    CaomeiCalendar,
    CaomeiCard,
    CaomeiCheckbox,
    CaomeiCheckboxGroup,
    CaomeiColorPicker,
    CaomeiConfirmDialog,
    CaomeiDataTable,
    CaomeiDataView,
    CaomeiDatePicker,
    CaomeiDialog,
    CaomeiDivider,
    CaomeiDrawer,
    CaomeiDropdownMenu,
    CaomeiDropdownMenuCheckboxItem,
    CaomeiDropdownMenuContent,
    CaomeiDropdownMenuGroup,
    CaomeiDropdownMenuItem,
    CaomeiDropdownMenuLabel,
    CaomeiDropdownMenuRadioGroup,
    CaomeiDropdownMenuRadioItem,
    CaomeiDropdownMenuSeparator,
    CaomeiDropdownMenuTrigger,
    CaomeiFileUpload,
    CaomeiFloatLabel,
    CaomeiIcon,
    CaomeiImage,
    CaomeiInput,
    CaomeiInputGroup,
    CaomeiInputNumber,
    CaomeiMessage,
    CaomeiMultiSelect,
    CaomeiPaginator,
    CaomeiPassword,
    CaomeiPopover,
    CaomeiPopoverArrow,
    CaomeiPopoverClose,
    CaomeiPopoverContent,
    CaomeiPopoverTrigger,
    CaomeiProgressBar,
    CaomeiProgressSpinner,
    CaomeiRadioButton,
    CaomeiRadioGroup,
    CaomeiSelect,
    CaomeiSelectButton,
    CaomeiSelectGroup,
    CaomeiSkeleton,
    CaomeiSlider,
    CaomeiSplitButton,
    CaomeiStepper,
    CaomeiStepperDescription,
    CaomeiStepperIndicator,
    CaomeiStepperItem,
    CaomeiStepperList,
    CaomeiStepperSeparator,
    CaomeiStepperTitle,
    CaomeiStepperTrigger,
    CaomeiSwitch,
    CaomeiTabContent,
    CaomeiTabList,
    CaomeiTabTrigger,
    CaomeiTabs,
    CaomeiTag,
    CaomeiTagsInput,
    CaomeiTextarea,
    CaomeiToastProvider,
    CaomeiToggleButton,
    CaomeiToolbar,
    CaomeiToolbarButton,
    CaomeiToolbarLink,
    CaomeiToolbarSeparator,
    CaomeiToolbarToggleGroup,
    CaomeiToolbarToggleItem,
    useConfirm,
    useToast,
} from '../../src/index'

/** 夹具数据（选项 / 表格列）。 */
const options = [
    { label: '甲', value: 'a' },
    { label: '乙', value: 'b' },
]

const columns = [
    { key: 'name', header: '名称' },
    { key: 'type', header: '类型' },
]
/** 行分组夹具数据：`type` 为分组字段，A 组两行 / B 组一行，折叠 toggle 随分组渲染 */
const rows = [
    { name: '甲', type: 'A' },
    { name: '乙', type: 'A' },
    { name: '丙', type: 'B' },
]

/** Toast 需在 Provider 后代中触发，故拆为「Provider 外壳 + 后代种子」。 */
const ToastSeed = defineComponent({
    setup() {
        const toast = useToast()
        toast.show({ title: '提示', description: '内容', duration: 3_600_000 })
        return () => h('span')
    },
})

const ToastHost = defineComponent({
    render: () => h(CaomeiToastProvider, { duration: 3_600_000 }, { default: () => h(ToastSeed) }),
})

/** ConfirmDialog 同理：`useConfirm` 必须在 `<CaomeiConfirmDialog>` 后代中调用。 */
const ConfirmSeed = defineComponent({
    setup() {
        const confirm = useConfirm()
        void confirm.open({ title: '确认', description: '内容' })
        return () => h('span')
    },
})

const ConfirmHost = defineComponent({
    render: () => h(CaomeiConfirmDialog, null, { default: () => h(ConfirmSeed) }),
})

/**
 * 受检面声明：受检单位是**审计单元**——默认（关闭）态的组件族根组件（`src/components/<dir>` 的对外主组件
 * + `CaomeiIcon`）各一个最小可用夹具（`A11Y_FIXTURES`），以及**展开态审计单元**（面板内导出以稳定可驱动的
 * 形态挂载：受控 `open` / `force-mount` / 独立渲染；逐项可驱动性判定见治理记录）。夹具名取该单元的主受检
 * 导出名（展开态单元取面板根导出），使导出穷尽性登记保持单一命名轴。
 *
 * 为什么取全量而非「挑几个关键组件」：a11y 违规与组件能力面不成正比（本轮实测命中的是
 * toast 的焦点哨兵与 calendar 的 `aria-label` 落点），按主观清单取舍等于给受检面开静默豁免口子。
 *
 * **对外导出的穷尽性**由 `a11y.test.ts` 对 `src/nuxt/components.ts` 的 `caomeiComponents` 机检：
 * 每个对外导出必须落在下列四组之一——夹具根组件（`A11Y_FIXTURES`）/ 由夹具组合渲染
 * （`COVERED_BY_FIXTURE`，运行期断言）/ 不可稳定驱动、维持登记 + 触发点（`INTERACTION_ONLY_EXPORTS`）/
 * 不渲染自有 DOM（`EXCLUDED_COMPONENTS`）。
 */
export interface A11yFixture {
    /** 组件族名（与对外导出名一致；展开态审计单元取该单元的主受检导出名） */
    name: string
    /** 该夹具的根组件：运行期断言「夹具确实渲染了它」，避免夹具漏渲染却仍打印清单 */
    root: unknown
    /** VTU 挂载定义（选项对象或组件）；保持宽松类型以容纳泛型 SFC（其 props 推断由组件自身单测承担） */
    definition: unknown
    /** 夹具必须渲染出的关键元素选择器（如内部交互控件 / 面板部件），使新增受检面进入审计 DOM 的事实可断言 */
    requiredSelectors?: string[]
}

export const A11Y_FIXTURES: A11yFixture[] = [
    { name: 'CaomeiAccordion', root: CaomeiAccordion, definition: { components: { CaomeiAccordion, CaomeiAccordionItem }, template: '<CaomeiAccordion><CaomeiAccordionItem title="一">内容</CaomeiAccordionItem></CaomeiAccordion>' } },
    { name: 'CaomeiAutoComplete', root: CaomeiAutoComplete, definition: { components: { CaomeiAutoComplete }, template: '<CaomeiAutoComplete label="搜索" :options="options" />', setup: () => ({ options }) } },
    { name: 'CaomeiAvatar', root: CaomeiAvatar, definition: { components: { CaomeiAvatar }, template: '<CaomeiAvatar label="甲" />' } },
    { name: 'CaomeiBadge', root: CaomeiBadge, definition: { components: { CaomeiBadge }, template: '<CaomeiBadge :value="5" />' } },
    { name: 'CaomeiButton', root: CaomeiButton, definition: { components: { CaomeiButton }, template: '<CaomeiButton>确定</CaomeiButton>' } },
    { name: 'CaomeiButtonGroup', root: CaomeiButtonGroup, definition: { components: { CaomeiButtonGroup, CaomeiButton }, template: '<CaomeiButtonGroup><CaomeiButton>一</CaomeiButton><CaomeiButton>二</CaomeiButton></CaomeiButtonGroup>' } },
    { name: 'CaomeiCalendar', root: CaomeiCalendar, definition: { components: { CaomeiCalendar }, template: '<CaomeiCalendar label="日历" />' } },
    { name: 'CaomeiCard', root: CaomeiCard, definition: { components: { CaomeiCard }, template: '<CaomeiCard title="卡片">内容</CaomeiCard>' } },
    { name: 'CaomeiCheckbox', root: CaomeiCheckbox, definition: { components: { CaomeiCheckbox }, template: '<CaomeiCheckbox label="同意" />' } },
    { name: 'CaomeiCheckboxGroup', root: CaomeiCheckboxGroup, definition: { components: { CaomeiCheckboxGroup }, template: '<CaomeiCheckboxGroup label="多选" :options="options" />', setup: () => ({ options }) } },
    { name: 'CaomeiColorPicker', root: CaomeiColorPicker, definition: { components: { CaomeiColorPicker }, template: '<CaomeiColorPicker label="颜色" />' } },
    { name: 'CaomeiConfirmDialog', root: CaomeiConfirmDialog, definition: ConfirmHost },
    { name: 'CaomeiDataTable', root: CaomeiDataTable, definition: { components: { CaomeiDataTable }, template: '<CaomeiDataTable :columns="columns" :data="rows" row-key="name" row-group-mode="subheader" group-rows-by="type" expandable-row-groups />', setup: () => ({ columns, rows }) }, requiredSelectors: ['.caomei-data-table__row-group-toggle'] },
    { name: 'CaomeiDataView', root: CaomeiDataView, definition: { components: { CaomeiDataView }, template: '<CaomeiDataView :items="[1, 2]"><template #list="{ items }"><p>{{ items.length }}</p></template></CaomeiDataView>' } },
    { name: 'CaomeiDatePicker', root: CaomeiDatePicker, definition: { components: { CaomeiDatePicker }, template: '<CaomeiDatePicker label="日期" />' } },
    { name: 'CaomeiDialog', root: CaomeiDialog, definition: { components: { CaomeiDialog }, template: '<CaomeiDialog :open="true" title="对话框"><p>内容</p></CaomeiDialog>' } },
    { name: 'CaomeiDivider', root: CaomeiDivider, definition: { components: { CaomeiDivider }, template: '<CaomeiDivider />' } },
    { name: 'CaomeiDrawer', root: CaomeiDrawer, definition: { components: { CaomeiDrawer }, template: '<CaomeiDrawer :open="true" title="抽屉"><p>内容</p></CaomeiDrawer>' } },
    { name: 'CaomeiDropdownMenu', root: CaomeiDropdownMenu, definition: { components: { CaomeiDropdownMenu, CaomeiDropdownMenuTrigger, CaomeiDropdownMenuContent }, template: '<CaomeiDropdownMenu><CaomeiDropdownMenuTrigger>菜单</CaomeiDropdownMenuTrigger><CaomeiDropdownMenuContent :model="[{ label: \'一\' }]" /></CaomeiDropdownMenu>' } },
    /*
     * 展开态审计单元：受控 `open` 驱动（实测展开后 500ms 内稳定保持）。覆盖面板内 8 个导出；
     * 分组内带 `CaomeiDropdownMenuLabel`（分组无标签时的悬空 `aria-labelledby` 为已登记同类缺陷，
     * 见治理记录，不在本夹具内重复暴露）。
     * 不渲染触发器：触发器已由关闭态夹具覆盖，而 axe 对「`aria-haspopup` + `aria-controls`」
     * 恒判 needsReview（`controlsWithinPopup`，无法判定引用是否存在于页面），与取值正确与否无关。
     */
    {
        name: 'CaomeiDropdownMenuContent',
        root: CaomeiDropdownMenuContent,
        definition: {
            components: { CaomeiDropdownMenu, CaomeiDropdownMenuContent, CaomeiDropdownMenuGroup, CaomeiDropdownMenuItem, CaomeiDropdownMenuCheckboxItem, CaomeiDropdownMenuRadioGroup, CaomeiDropdownMenuRadioItem, CaomeiDropdownMenuLabel, CaomeiDropdownMenuSeparator },
            template: `<CaomeiDropdownMenu v-model:open="open">
              <CaomeiDropdownMenuContent>
                <CaomeiDropdownMenuLabel>标题</CaomeiDropdownMenuLabel>
                <CaomeiDropdownMenuItem>一</CaomeiDropdownMenuItem>
                <CaomeiDropdownMenuSeparator />
                <CaomeiDropdownMenuGroup>
                  <CaomeiDropdownMenuLabel>分组</CaomeiDropdownMenuLabel>
                  <CaomeiDropdownMenuCheckboxItem :model-value="true">勾选</CaomeiDropdownMenuCheckboxItem>
                </CaomeiDropdownMenuGroup>
                <CaomeiDropdownMenuRadioGroup model-value="a">
                  <CaomeiDropdownMenuLabel>单选组</CaomeiDropdownMenuLabel>
                  <CaomeiDropdownMenuRadioItem value="a">甲</CaomeiDropdownMenuRadioItem>
                  <CaomeiDropdownMenuRadioItem value="b">乙</CaomeiDropdownMenuRadioItem>
                </CaomeiDropdownMenuRadioGroup>
              </CaomeiDropdownMenuContent>
            </CaomeiDropdownMenu>`,
            setup: () => ({ open: ref(true) }),
        },
        requiredSelectors: ['[role="menu"]', '[role="menuitem"]', '[role="menuitemcheckbox"]', '[role="menuitemradio"]'],
    },
    { name: 'CaomeiFileUpload', root: CaomeiFileUpload, definition: { components: { CaomeiFileUpload }, template: '<CaomeiFileUpload label="上传" />' } },
    { name: 'CaomeiFloatLabel', root: CaomeiFloatLabel, definition: { components: { CaomeiFloatLabel, CaomeiInput }, template: '<CaomeiFloatLabel><CaomeiInput id="a11y-float" /><label for="a11y-float">名称</label></CaomeiFloatLabel>' } },
    { name: 'CaomeiIcon', root: CaomeiIcon, definition: { components: { CaomeiIcon }, template: '<CaomeiIcon :icon="Bold" />', setup: () => ({ Bold }) } },
    { name: 'CaomeiImage', root: CaomeiImage, definition: { components: { CaomeiImage }, template: '<CaomeiImage src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="占位" />' } },
    { name: 'CaomeiInput', root: CaomeiInput, definition: { components: { CaomeiInput }, template: '<CaomeiInput label="姓名" placeholder="姓名" />' } },
    { name: 'CaomeiInputGroup', root: CaomeiInputGroup, definition: { components: { CaomeiInputGroup, CaomeiInput }, template: '<CaomeiInputGroup><CaomeiInput label="组合" /></CaomeiInputGroup>' } },
    { name: 'CaomeiInputNumber', root: CaomeiInputNumber, definition: { components: { CaomeiInputNumber }, template: '<CaomeiInputNumber label="数量" :model-value="2" controls />' } },
    { name: 'CaomeiMessage', root: CaomeiMessage, definition: { components: { CaomeiMessage }, template: '<CaomeiMessage title="提示" />' } },
    { name: 'CaomeiMultiSelect', root: CaomeiMultiSelect, definition: { components: { CaomeiMultiSelect }, template: '<CaomeiMultiSelect label="城市" :options="options" />', setup: () => ({ options }) } },
    { name: 'CaomeiPaginator', root: CaomeiPaginator, definition: { components: { CaomeiPaginator }, template: '<CaomeiPaginator :total="30" :rows="10" :page="1" />' } },
    { name: 'CaomeiPassword', root: CaomeiPassword, definition: { components: { CaomeiPassword }, template: '<CaomeiPassword label="密码" />' } },
    { name: 'CaomeiPopover', root: CaomeiPopover, definition: { components: { CaomeiPopover, CaomeiPopoverTrigger, CaomeiPopoverContent }, template: '<CaomeiPopover><CaomeiPopoverTrigger>打开</CaomeiPopoverTrigger><CaomeiPopoverContent>面板</CaomeiPopoverContent></CaomeiPopover>' } },
    /*
     * 展开态审计单元：受控 `open` 在 happy-dom 下初始化即自关闭、不可稳定驱动（真实浏览器可开合），
     * 改以公开属性 `force-mount` 稳定渲染面板内容；面板三导出由此进入受检面（逐项判定见治理记录）。
     */
    {
        name: 'CaomeiPopoverContent',
        root: CaomeiPopoverContent,
        definition: {
            components: { CaomeiPopover, CaomeiPopoverTrigger, CaomeiPopoverContent, CaomeiPopoverArrow, CaomeiPopoverClose },
            template: `<CaomeiPopover>
              <CaomeiPopoverTrigger>打开</CaomeiPopoverTrigger>
              <CaomeiPopoverContent force-mount>
                <CaomeiPopoverArrow :width="8" :height="4" />
                面板
                <CaomeiPopoverClose>关闭</CaomeiPopoverClose>
              </CaomeiPopoverContent>
            </CaomeiPopover>`,
        },
        requiredSelectors: ['.caomei-popover__content'],
    },
    { name: 'CaomeiProgressBar', root: CaomeiProgressBar, definition: { components: { CaomeiProgressBar }, template: '<CaomeiProgressBar :value="40" />' } },
    { name: 'CaomeiProgressSpinner', root: CaomeiProgressSpinner, definition: { components: { CaomeiProgressSpinner }, template: '<CaomeiProgressSpinner />' } },
    { name: 'CaomeiRadioGroup', root: CaomeiRadioGroup, definition: { components: { CaomeiRadioGroup, CaomeiRadioButton }, template: '<CaomeiRadioGroup label="单选" model-value="a"><CaomeiRadioButton value="a">甲</CaomeiRadioButton><CaomeiRadioButton value="b">乙</CaomeiRadioButton></CaomeiRadioGroup>' } },
    { name: 'CaomeiSelect', root: CaomeiSelect, definition: { components: { CaomeiSelect }, template: '<CaomeiSelect label="城市" :options="options" />', setup: () => ({ options }) } },
    { name: 'CaomeiSelectButton', root: CaomeiSelectButton, definition: { components: { CaomeiSelectButton }, template: '<CaomeiSelectButton label="分段" :options="options" model-value="a" />', setup: () => ({ options }) } },
    /*
     * 展开态审计单元：Select 面板在 happy-dom 下无法稳定展开（点击不展开、无 `force-mount` 透传），
     * 但该导出可独立稳定渲染 → 以独立形态受检（逐项判定见治理记录）。
     */
    {
        name: 'CaomeiSelectGroup',
        root: CaomeiSelectGroup,
        definition: {
            components: { CaomeiSelectGroup },
            template: '<CaomeiSelectGroup label="热门">内容</CaomeiSelectGroup>',
        },
        requiredSelectors: ['.caomei-select-group'],
    },
    { name: 'CaomeiSkeleton', root: CaomeiSkeleton, definition: { components: { CaomeiSkeleton }, template: '<CaomeiSkeleton />' } },
    { name: 'CaomeiSlider', root: CaomeiSlider, definition: { components: { CaomeiSlider }, template: '<CaomeiSlider label="滑块" :model-value="3" />' } },
    { name: 'CaomeiSplitButton', root: CaomeiSplitButton, definition: { components: { CaomeiSplitButton }, template: '<CaomeiSplitButton label="操作" :items="[{ label: \'一\' }]" />' } },
    { name: 'CaomeiStepper', root: CaomeiStepper, definition: { components: { CaomeiStepper, CaomeiStepperList, CaomeiStepperItem, CaomeiStepperTrigger, CaomeiStepperIndicator, CaomeiStepperTitle, CaomeiStepperDescription, CaomeiStepperSeparator }, template: '<CaomeiStepper :model-value="1"><CaomeiStepperList><CaomeiStepperItem :step="1"><CaomeiStepperTrigger><CaomeiStepperIndicator>1</CaomeiStepperIndicator><CaomeiStepperTitle>账户</CaomeiStepperTitle><CaomeiStepperDescription>填写登录信息</CaomeiStepperDescription></CaomeiStepperTrigger><CaomeiStepperSeparator /></CaomeiStepperItem><CaomeiStepperItem :step="2"><CaomeiStepperTrigger><CaomeiStepperIndicator>2</CaomeiStepperIndicator><CaomeiStepperTitle>资料</CaomeiStepperTitle><CaomeiStepperDescription>补充个人资料</CaomeiStepperDescription></CaomeiStepperTrigger></CaomeiStepperItem></CaomeiStepperList></CaomeiStepper>' } },
    { name: 'CaomeiSwitch', root: CaomeiSwitch, definition: { components: { CaomeiSwitch }, template: '<CaomeiSwitch label="开关" />' } },
    { name: 'CaomeiTabs', root: CaomeiTabs, definition: { components: { CaomeiTabs, CaomeiTabList, CaomeiTabTrigger, CaomeiTabContent }, template: '<CaomeiTabs model-value="a"><CaomeiTabList><CaomeiTabTrigger value="a">甲</CaomeiTabTrigger></CaomeiTabList><CaomeiTabContent value="a">内容</CaomeiTabContent></CaomeiTabs>' } },
    { name: 'CaomeiTag', root: CaomeiTag, definition: { components: { CaomeiTag }, template: '<CaomeiTag>标签</CaomeiTag>' } },
    { name: 'CaomeiTagsInput', root: CaomeiTagsInput, definition: { components: { CaomeiTagsInput }, template: '<CaomeiTagsInput label="标签" :model-value="tags" />', setup: () => ({ tags: ['React'] }) } },
    { name: 'CaomeiTextarea', root: CaomeiTextarea, definition: { components: { CaomeiTextarea }, template: '<CaomeiTextarea label="备注" placeholder="备注" />' } },
    { name: 'CaomeiToastProvider', root: CaomeiToastProvider, definition: ToastHost },
    { name: 'CaomeiToggleButton', root: CaomeiToggleButton, definition: { components: { CaomeiToggleButton }, template: '<CaomeiToggleButton label="固定">固定</CaomeiToggleButton>' } },
    { name: 'CaomeiToolbar', root: CaomeiToolbar, definition: { components: { CaomeiToolbar, CaomeiToolbarButton, CaomeiToolbarLink, CaomeiToolbarSeparator, CaomeiToolbarToggleGroup, CaomeiToolbarToggleItem, CaomeiIcon }, template: '<CaomeiToolbar label="格式"><CaomeiToolbarButton label="加粗"><CaomeiIcon :icon="Bold" /></CaomeiToolbarButton><CaomeiToolbarSeparator /><CaomeiToolbarLink href="/guide/getting-started" label="帮助">帮助</CaomeiToolbarLink><CaomeiToolbarToggleGroup v-model="format" type="multiple" label="文本格式"><CaomeiToolbarToggleItem value="bold" label="加粗"><CaomeiIcon :icon="Bold" /></CaomeiToolbarToggleItem></CaomeiToolbarToggleGroup></CaomeiToolbar>', setup: () => ({ Bold, format: ref(['bold']) }) } },
]

/**
 * 由夹具组合渲染、但不作为夹具根组件的对外导出（**运行期断言**：对应夹具确实渲染了该组件，
 * 而非仅在模板里登记名字）。
 */
export const COVERED_BY_FIXTURE: { name: string, component: unknown, fixture: string }[] = [
    { name: 'CaomeiAccordionItem', component: CaomeiAccordionItem, fixture: 'CaomeiAccordion' },
    { name: 'CaomeiRadioButton', component: CaomeiRadioButton, fixture: 'CaomeiRadioGroup' },
    { name: 'CaomeiTabList', component: CaomeiTabList, fixture: 'CaomeiTabs' },
    { name: 'CaomeiTabTrigger', component: CaomeiTabTrigger, fixture: 'CaomeiTabs' },
    { name: 'CaomeiTabContent', component: CaomeiTabContent, fixture: 'CaomeiTabs' },
    { name: 'CaomeiToolbarButton', component: CaomeiToolbarButton, fixture: 'CaomeiToolbar' },
    { name: 'CaomeiToolbarLink', component: CaomeiToolbarLink, fixture: 'CaomeiToolbar' },
    { name: 'CaomeiToolbarSeparator', component: CaomeiToolbarSeparator, fixture: 'CaomeiToolbar' },
    { name: 'CaomeiToolbarToggleGroup', component: CaomeiToolbarToggleGroup, fixture: 'CaomeiToolbar' },
    { name: 'CaomeiToolbarToggleItem', component: CaomeiToolbarToggleItem, fixture: 'CaomeiToolbar' },
    { name: 'CaomeiStepperList', component: CaomeiStepperList, fixture: 'CaomeiStepper' },
    { name: 'CaomeiStepperItem', component: CaomeiStepperItem, fixture: 'CaomeiStepper' },
    { name: 'CaomeiStepperTrigger', component: CaomeiStepperTrigger, fixture: 'CaomeiStepper' },
    { name: 'CaomeiStepperIndicator', component: CaomeiStepperIndicator, fixture: 'CaomeiStepper' },
    { name: 'CaomeiStepperTitle', component: CaomeiStepperTitle, fixture: 'CaomeiStepper' },
    { name: 'CaomeiStepperDescription', component: CaomeiStepperDescription, fixture: 'CaomeiStepper' },
    { name: 'CaomeiStepperSeparator', component: CaomeiStepperSeparator, fixture: 'CaomeiStepper' },
    { name: 'CaomeiDropdownMenuTrigger', component: CaomeiDropdownMenuTrigger, fixture: 'CaomeiDropdownMenu' },
    { name: 'CaomeiPopoverTrigger', component: CaomeiPopoverTrigger, fixture: 'CaomeiPopover' },
    { name: 'CaomeiDropdownMenuGroup', component: CaomeiDropdownMenuGroup, fixture: 'CaomeiDropdownMenuContent' },
    { name: 'CaomeiDropdownMenuItem', component: CaomeiDropdownMenuItem, fixture: 'CaomeiDropdownMenuContent' },
    { name: 'CaomeiDropdownMenuCheckboxItem', component: CaomeiDropdownMenuCheckboxItem, fixture: 'CaomeiDropdownMenuContent' },
    { name: 'CaomeiDropdownMenuRadioGroup', component: CaomeiDropdownMenuRadioGroup, fixture: 'CaomeiDropdownMenuContent' },
    { name: 'CaomeiDropdownMenuRadioItem', component: CaomeiDropdownMenuRadioItem, fixture: 'CaomeiDropdownMenuContent' },
    { name: 'CaomeiDropdownMenuLabel', component: CaomeiDropdownMenuLabel, fixture: 'CaomeiDropdownMenuContent' },
    { name: 'CaomeiDropdownMenuSeparator', component: CaomeiDropdownMenuSeparator, fixture: 'CaomeiDropdownMenuContent' },
    { name: 'CaomeiPopoverArrow', component: CaomeiPopoverArrow, fixture: 'CaomeiPopoverContent' },
    { name: 'CaomeiPopoverClose', component: CaomeiPopoverClose, fixture: 'CaomeiPopoverContent' },
]

/**
 * **不可稳定驱动**、维持登记 + 触发点的对外导出（逐条登记理由，避免静默豁免）。
 *
 * 当前为空：12 个面板内导出已逐项判定可稳定驱动（受控 `open` / `force-mount` / 独立渲染三种形态，
 * 判定与实测证据见治理记录），全部转入夹具受检面。新增此类条目时必须登记理由与触发点。
 */
export const INTERACTION_ONLY_EXPORTS: { name: string, reason: string }[] = []

/** 不渲染自有 DOM 的对外导出（逐条登记理由，避免静默豁免）。 */
export const EXCLUDED_COMPONENTS: { name: string, reason: string }[] = [
    { name: 'CaomeiConfigProvider', reason: '不渲染自有 DOM（仅 provide 上下文并透传插槽），单独挂载时审计对象是插槽内容而非组件本身' },
]

/** 受检审计单元规模（新增 / 删除夹具必须同步此预算，使受检面变化在 diff 中显式可见）。 */
export const A11Y_FIXTURE_BUDGET = 51
