/**
 * `caomei-ui` 对外导出的组件名清单。
 *
 * 与 `src/components/<name>/index.ts`、`src/icons/index.ts` 中
 * `export { default as CaomeiX } from './x.vue'` 的导出名保持一致，
 * 供 Nuxt 模块通过 `addComponent` 注册自动导入。
 *
 * 新增或删除组件时必须同步维护，`components.test.ts` 会对源码导出做漂移校验。
 */
export const CAOMEI_COMPONENT_EXPORT_PREFIX = 'Caomei'

export const caomeiComponents = [
    'CaomeiAccordion',
    'CaomeiAccordionItem',
    'CaomeiAutoComplete',
    'CaomeiAvatar',
    'CaomeiBadge',
    'CaomeiButton',
    'CaomeiButtonGroup',
    'CaomeiCard',
    'CaomeiCheckbox',
    'CaomeiConfirmDialog',
    'CaomeiDataTable',
    'CaomeiDialog',
    'CaomeiDivider',
    'CaomeiDropdownMenu',
    'CaomeiDropdownMenuCheckboxItem',
    'CaomeiDropdownMenuContent',
    'CaomeiDropdownMenuGroup',
    'CaomeiDropdownMenuItem',
    'CaomeiDropdownMenuLabel',
    'CaomeiDropdownMenuRadioGroup',
    'CaomeiDropdownMenuRadioItem',
    'CaomeiDropdownMenuSeparator',
    'CaomeiDropdownMenuTrigger',
    'CaomeiFileUpload',
    'CaomeiFloatLabel',
    'CaomeiIcon',
    'CaomeiImage',
    'CaomeiInput',
    'CaomeiInputGroup',
    'CaomeiInputNumber',
    'CaomeiMessage',
    'CaomeiMultiSelect',
    'CaomeiPaginator',
    'CaomeiPassword',
    'CaomeiPopover',
    'CaomeiPopoverArrow',
    'CaomeiPopoverClose',
    'CaomeiPopoverContent',
    'CaomeiPopoverTrigger',
    'CaomeiProgressBar',
    'CaomeiProgressSpinner',
    'CaomeiRadioButton',
    'CaomeiRadioGroup',
    'CaomeiSelect',
    'CaomeiSelectButton',
    'CaomeiSkeleton',
    'CaomeiSlider',
    'CaomeiStepper',
    'CaomeiStepperDescription',
    'CaomeiStepperIndicator',
    'CaomeiStepperItem',
    'CaomeiStepperList',
    'CaomeiStepperSeparator',
    'CaomeiStepperTitle',
    'CaomeiStepperTrigger',
    'CaomeiSwitch',
    'CaomeiTabContent',
    'CaomeiTabList',
    'CaomeiTabTrigger',
    'CaomeiTabs',
    'CaomeiTag',
    'CaomeiTextarea',
    'CaomeiToastProvider',
    'CaomeiToggleButton',
    'CaomeiToolbar',
    'CaomeiToolbarButton',
    'CaomeiToolbarLink',
    'CaomeiToolbarSeparator',
    'CaomeiToolbarToggleGroup',
    'CaomeiToolbarToggleItem',
] as const

export type CaomeiComponentName = (typeof caomeiComponents)[number]

/**
 * 将组件导出名映射为 Nuxt 自动导入名。
 *
 * 默认前缀下 `CaomeiButton` → `CaomeiButton`；自定义前缀（如 `Ui`）得到 `UiButton`。
 */
export function resolveComponentName(prefix: string, exportName: string): string {
    const base = exportName.startsWith(CAOMEI_COMPONENT_EXPORT_PREFIX)
        ? exportName.slice(CAOMEI_COMPONENT_EXPORT_PREFIX.length)
        : exportName
    return `${prefix}${base}`
}
