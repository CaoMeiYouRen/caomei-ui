# 开发规范

本文档定义 caomei-ui 的技术栈、编码风格、组件 API 设计与目录结构约定。

## 1. 技术栈

| 类别 | 选型 | 说明 |
|------|------|------|
| 语言 | TypeScript（严格模式） | 禁止 `any` 逃逸，优先 `unknown` + 类型收窄 |
| 框架 | Vue 3.5.x + Composition API + `<script setup>` | 单文件组件 |
| 底层 primitives | Reka UI | 无样式、无障碍 |
| 样式 | CSS variables + 原生 CSS/SCSS | **禁止 Tailwind / UnoCSS** |
| 构建 | tsdown | 库产物（ESM + 类型声明 + CSS） |
| 表格 | @tanstack/vue-table | headless |
| 图标 | @lucide/vue | 不造图标 |
| 测试 | Vitest + Playwright | 见 [测试规范](./testing.md) |
| 发布 | semantic-release | 见 [发布指南](../guide/release.md) |

> `@tanstack/vue-table` v9 为 feature-based API：用 `tableFeatures({})` + `useTable({ features, columns, data })`（v8 的 `getCoreRowModel` 已移除），渲染用 `FlexRender`；特性集抽为模块级常量共享。

## 2. 目录结构

```
src/
├─ components/<name>/     # 单个组件（kebab-case 目录 + kebab-case.vue + types.ts + index.ts）
├─ composables/           # useToast / useConfirm / useDialog / useTheme
├─ locale/                # 组件内建文案（zh-CN / en-US）
├─ styles/                # tokens 与基础样式
├─ icons/                 # 图标封装
├─ resolver/              # unplugin-vue-components resolver
├─ nuxt/                  # Nuxt 模块（子路径导出）
├─ types.ts
└─ index.ts
playground/               # 本地开发/演示环境（不发布）
docs/                     # VitePress 文档站
examples/                 # 集成示例（不发布）
test/                     # 单元与 E2E 测试
```

## 3. 命名约定

- 目录与文件：统一 `kebab-case`；组件目录与组件文件均为 kebab-case（如 `components/data-table/data-table.vue`）；文档站主题组件同样遵循（如 `theme/components/component-api.vue`）。
- 组件对外名称：`Caomei` + `PascalCase`（如 `CaomeiButton`、`CaomeiDataTable`）；模板中亦可写作 kebab-case（如 `<caomei-button>`）。
- 常量：`UPPER_SNAKE_CASE`。
- 类型/接口：`PascalCase`，优先 `interface`（联合类型用 `type`）。
- 工具函数：`camelCase`。
- CSS 变量：`--caomei-*`（语义化命名，如 `--caomei-color-primary`）。

## 4. TypeScript 准则

- 开启 `strict`，禁止 `any`；对外 API 的所有 props / emits / slots 必须有显式类型。
- 优先 `interface` 定义 props/emits；用 `defineProps<Props>()` 泛型写法。
- 使用 `withDefaults` 或默认值语法为可选 props 提供默认值。
- 不导出未使用的类型；`src/index.ts` 只导出公共 API。
- 类型导入使用 `import type`。

## 5. Vue 组件准则

- 统一使用 `<script setup lang="ts">`。
- 组件顺序：`<script setup>` → `<template>` → `<style>`。
- 受控组件使用 `defineModel` 或显式 `modelValue` + `update:modelValue`。
- 组件必须支持 `class` 透传（根元素继承 attrs，必要时 `inheritAttrs: false` + `v-bind="$attrs"`）。
- 状态最小化：组件内优先 `ref` / `computed`，不在组件库引入全局 store。
- 插槽（slots）用于内容定制，props 用于行为控制，CSS variables 用于视觉定制。
- 不在渲染函数中做重计算；大列表/表格使用虚拟滚动（`@tanstack/vue-virtual`）。
- 包装型表单组件（根为 wrapper）使用 `inheritAttrs: false` + `useAttrs()`：`class` / `style` 留在根元素；`name` / `form` / `required` 透传到内层表单控件，`id` / `aria-*` 透传到可聚焦控件（统一复用 `_shared/use-attr-forwarding`），避免语义落到不可聚焦 wrapper 而失效。
- 派生组件（根为另一组件）同样使用 `inheritAttrs: false` + `useAttrs()`，并显式剔除由内部状态管理的保留属性（如 Password 的 `type`），避免外部透传覆盖内部语义。
- 布尔假值不输出到 ARIA：对非 special-boolean 属性使用 `value || undefined`，避免 `:aria-required="false"` 被渲染为 `aria-required="false"`。
- 受控数值输入：聚焦期间不因外部 model 变化回填文本，失焦与步进统一 `clamp(round(value))` 规范化；`step` 非正回退为 1，`precision` 仅非负整数生效。
- 封装 Reka NumberField：显式 `:step-snapping="false"` 以保留「加 step」语义；`precision` 不映射 `formatOptions.maximumFractionDigits`（会先钳制再取整而越界），取整放在包装层；`autocomplete` 需条件绑定（primitive 内建 `off`，显式 `undefined` 会覆盖）。
- Vue 模板同一元素只允许一个无参 `v-bind`；多个需在脚本内合并为单一对象（如 `{ ...rootAttrs, ...controlAttrs }`）再绑定。
- Reka 组件 provide 的状态在子组件卸载时不复位（如 Avatar 图片加载状态）；需要随 `src` 复位时用 `:key` 重挂 Root。
- Reka 内建英文可访问文案（Pagination 翻页按钮、`ComboboxTrigger` 的 `Show popup`）不可本地化；包装层透传 `aria-label` 可经 fallthrough 覆盖，文案统一走 locale。
- Reka `ProgressRoot` 传 `modelValue=null` 时输出 `data-state="indeterminate"` 且不输出 `aria-valuenow`；行内指示器用 `as="span"`。
- live region（`role="status"` / `"alert"`）只包住文本内容，交互控件留在其外，避免控件名并入播报。
- `defineModel()` 与 `defineProps<接口>()` 不得同时声明 `modelValue`：重复声明会让该 prop 失效（`defaultValue` 静默不生效）；对外 props 接口不含 `modelValue`。
- 封装 Reka Combobox 多选时，`required` 必须交 `ComboboxRoot`（空数组时渲染 required 隐藏控件触发原生校验）；`name` 仅在 `<form>` 内生成隐藏控件，数组值命名 `name[index]`。
- Reka `Accordion` / `Collapsible` 在 `unmountOnHide=false` 时以 `hidden="until-found"` 保留收起内容（支持页内查找）；Tabs 收起内容用普通 `hidden`。
- Reka `ToggleGroup` 的 `VisuallyHiddenInput` 会把对象型 `modelValue` 展开为 `name[key]`、数组型为 `name[i]`；以占位对象维持受控时须仅在有效选中时传 `name`，否则占位值进入表单提交。
- Reka `ToggleGroup` 单选点击已选项会返回 `undefined`（允许取消）；实现「必有一选中项」需让 primitive 始终受控并在包装层忽略 `undefined`。
- SSR 直出的 `<img>` 若在水合前已完成加载，`load` 事件不会重放；水合组件需在 `onMounted` 以 `img.complete`（配合 `naturalWidth`）兜底状态。
- Reka `AlertDialogContent` 不屏蔽 `escapeKeyDown`（2.10.4），Esc 仍关闭；`AlertDialogAction` / `Cancel` 的 DialogClose onClick 先于包裹组件自身 click 触发，结算应做顺序无关的意图捕获 + `nextTick` + 请求 id。
- 容器型控件的可访问名须遵守 WCAG 2.5.3：无条件设置 `aria-label` 会覆盖可见文案，应仅在自定义（可能无可见文本）内容时生效。

## 6. 组件 API 设计约定

- **分层解耦**：primitive 层（Reka UI）→ 封装 / 自建层（Reka 封装，或原生元素 + 样式 / 变体）→ 复合层（多组件组合）。
- **优先封装 Reka UI**：仅在 Reka UI 缺失对应组件或无法满足设计需要时自建（见[组件设计 §1.1](../design/components.md#_1-1-实现方式决策原则)）。
- 变体通过 `variant` / `size` / `tone` 等受控枚举 props 提供，不通过散落布尔量堆叠。
- `label` 统一表示不可见可访问名（映射 `aria-label`）；可见标签文本使用语义化 prop（如 Checkbox 的 `text`），避免同一 prop 在不同组件语义分叉。该约定仅约束组件对外 props；值对象字段（如 `SelectOption.label`）沿用「显示文本」的生态惯例。
- 默认样式**极简可用**，必须能被 CSS variables 或 `class` 100% 覆盖。
- 公共 API 变更必须考虑向后兼容；破坏性变更走 major 版本。
- 组件 `types.ts` 的 JSDoc 以中文为主，并按需用 `@en` 标签补充英文（供文档站英文 API 表使用，约定见[文档与演示站设计 §10](../design/documentation-site.md)）。

## 7. 样式规范

- 使用 CSS variables 承载设计 token，语义化命名，禁止硬编码品牌色到组件内部。
- 暗色模式通过 `.dark` class 或 `[data-theme="dark"]` 切换；系统跟随为显式开启（根元素 `data-scheme="auto"`），见 [设计规范](../design/design-spec.md)。
- 组件样式与使用方 SCSS(BEM) 共存时，保持低特异性，便于覆盖。
- 响应式由组件内部媒体查询处理，断点约定为 640 / 768 / 1024px（`@media` 不支持 CSS 变量，不使用 token）。
- 禁止引入 Tailwind / UnoCSS；如需 Tailwind 用户适配，另提供可选 preset 文档（不内置依赖）。
- CSS 变量默认值不声明在 scoped 根选择器（`.comp[data-v]` 特异性高于消费方 `.comp`）：基类不预声明默认值、消费处 `var(--x, fallback)`，档位类用 `:where()` 归零特异性；自建布局容器同样遵守。
- 区块间距压缩须覆盖全部合法邻接组合（`header+body` / `body+footer` / `header+footer`）；条件渲染会产生直邻组合，避免仅依赖 `+` 选择器漏判而出现双倍间距。
- 同特异性规则由源码顺序决定胜负：`striped` 与 `hover` 同时命中时，`hover` 必须声明在 `striped` 之后。
- portal / popper 挂载的子组件 scoped `data-v` 落在包裹层，`.comp__content[data-v-x]` 不命中；改用命名空间化的非 scoped 规则。Reka 嵌套子组件（如 `CheckboxIndicator`）不回传父级 scoped `data-v`，可在父级默认插槽内自绘（代价：丢失 `Presence` / `forceMount` 动画）。浮层子部件的共享样式宜集中到 Content 的非 scoped 命名空间块。
- 列表语义容器（如 Toast 视口 `<ol>`）的几何重置用叠加类（`.x.x`）提升特异性，定位 / 布局仍保持单类低特异性；`position: fixed` 元素宽度用 `100%` 而非 `100vw`，避免含滚动条导致左右留边不对称。
- Vue scoped `<style>` 会把 `@keyframes` 名重写为 `name-<hash>`；消费层无法引用被重写的 keyframes，动画开关须由组件暴露 `animation-name` / `animation-duration` / `animation-iteration-count`。
- Stylelint `selector-not-notation: complex` 要求 `:not(a, b)` 而非 `:not(a):not(b)`。
- 组件内列表项需显式重置 `margin`：宿主列表样式（如 VitePress `.vp-doc li + li`）会渗透抬高组件 `li`。

## 8. 构建与产物

- 使用 tsdown 构建：单 ESM bundle + 类型声明 + CSS 抽取（按组件独立 chunk 暂缓，见 [架构设计 §4.1](../design/architecture.md)）。
- `vue` 与 `reka-ui` 必须 external，不打包进产物。
- `package.json` 声明 `sideEffects`（`**/*.css`）以支持 tree-shaking。
- 子路径导出：`caomei-ui`、`caomei-ui/styles.css`、`caomei-ui/resolver`、`caomei-ui/nuxt`（tokens 并入 `styles.css`，暂不单列 `theme.css`）。

## 9. 代码生成准则

- 优先复用项目中已有的工具函数、类型与 composables，不重复实现。
- 最小改动原则：只改必须改的，不做无关重构。
- 显式优于隐式；早返回，少嵌套；不吞异常，不空 catch。
- 新增依赖前确认无功能相近的已有依赖。
- 脚本与测试不得隐式依赖 `.session/`、`temp/` 等 git 忽略目录文件的存在性（本地有、CI 无会导致行为分叉）。

## 10. 质量门

以下检查必须全部通过：

- `pnpm lint`（ESLint 零 error）
- `pnpm lint:css`（Stylelint，涉及样式时）
- `pnpm lint:md`（文档改动时）
- `pnpm typecheck`（`vue-tsc --noEmit` 零 error）
- `pnpm typecheck:docs`（文档站类型检查，`vue-tsc -p docs/tsconfig.json` 零 error）
- `pnpm test`（全部通过）
- `pnpm build`（无报错，发布前对产物冒烟）
