# 批次 2（阴影 / 遮罩 token）与批次 3（禁用态不透明度 token）值等价浏览器验证

- 日期：2026-09-17
- 范围：批次 2（`--caomei-shadow-xs/sm/md`、`--caomei-color-mask` / `--caomei-shadow-lg` 消费迁移）与批次 3（`--caomei-disabled-opacity: 0.6` 迁移 18 处）的**值等价**验证，以及批次 1 的空 `label` 转发契约抽检
- 依据：[主题与样式设计](../../design/theming.md)、[测试规范 §5 / §5.1](../../standards/testing.md)
- 被测对象：`src/styles/theme.css`、`src/components/**`（批次 3 工作区 diff 的 18 个 `.vue`）

## 范围（scope）

| 维度 | 取值 |
| --- | --- |
| 被测 revision | 批次 2 基线 `c51eef8`；批次 3 为**工作区未提交 diff**（`src/**` 源码 mtime 2026-09-17 12:22，验证期间（12:34 起）未再改动源码） |
| 入口 / 产物 | 临时夹具 dev `http://127.0.0.1:4611`（Vite 直读 `src/`，非构建产物）；文档站 dev `http://localhost:5173`（VitePress 直读 `src/`） |
| 页面（中文） | 夹具单页（覆盖 18 个迁移点 + 浮层）；文档站 `/components/button`、`/components/card`、`/components/input`、`/components/dialog` |
| 页面（英文） | 未覆盖（本次为计算样式等价，语言不影响 token；批次 3 无文案改动） |
| 示例 | 夹具 `data-case` 逐项受控；文档站取对应组件页首个示例（disabled / elevated / dialog basic） |
| 断点 | 桌面 1440×900、平板 834×1024、移动 390×844（仅作无横向溢出与禁用态稳定性抽检） |
| 主题 | 亮 / 暗（夹具 `html.dark`；文档站 `emulateMedia({ colorScheme:'dark' })` + `localStorage` appearance + `html.dark`），另加 `data-preset="caomei"` 暗色预设 |
| 动效 | 不适用（无动画 / 过渡改动） |

- 结论：**通过**（夹具核对 122 项，失败 0，观察项 2；文档站交叉核对 19 项，失败 0；宿主稳定性 12 项，失败 0，观察项 1；console error / pageerror / HTTP ≥ 400 全为 0）。
- 复现方式：

  ```bash
  # 前置：清 4611 端口，启动夹具（临时目录，gitignored）
  pnpm exec vite --config test-results/tmp/b2b3/vite.config.ts --force
  node test-results/b2b3-validate.mjs            # 122 项值等价
  node test-results/b2b3-stability.mjs           # 三档视口 + Dialog 模态稳定性

  # 文档站交叉取证（另一终端）
  pnpm docs:dev
  node test-results/b2b3-docs-crosscheck.mjs     # 19 项
  ```

  > 夹具与脚本位于 `test-results/tmp/b2b3/`（`test-results/` 被 `.gitignore` 忽略）。复跑前必须先 `--force` 重启 Vite：本 session 遇到 dev server 对 `app.vue` 返回**陈旧 transform**（已删除的 `useToast()` 仍被服务），未重启会把旧产物当成新源码断言。

## 1. token 原始值（与历史字面量逐字对照）

`getComputedStyle(document.documentElement).getPropertyValue(...)`，夹具与文档站两处一致：

| token | 期望（迁移前字面量） | 实测 |
| --- | --- | --- |
| `--caomei-shadow-xs` | `0 1px 2px rgb(0 0 0 / 0.2)` | 同左 |
| `--caomei-shadow-sm` | `0 4px 12px rgb(0 0 0 / 0.08)` | 同左 |
| `--caomei-shadow-md` | `0 8px 24px rgb(0 0 0 / 0.12)` | 同左 |
| `--caomei-shadow-lg` | `0 12px 32px rgb(0 0 0 / 0.18)` | 同左 |
| `--caomei-color-mask` | `rgb(0 0 0 / 0.45)` | 同左 |
| `--caomei-disabled-opacity` | `0.6` | 同左 |
| `--caomei-skeleton-highlight` | `rgb(255 255 255 / 0.6)` | 同左 |

## 2. 批次 3：禁用态根控件（选择器 → 期望 → 实测）

期望 `opacity = 0.6`、`cursor = not-allowed`；带禁用背景的组件 `background-color` 须等于 `--caomei-color-bg-elevated`（亮色 `rgb(247, 247, 248)`）。

| 迁移点 | 选择器 | opacity | cursor | background |
| --- | --- | --- | --- | --- |
| button | `.caomei-button:disabled` | 0.6 | not-allowed | — |
| input | `.caomei-input--disabled` | 0.6 | not-allowed | `rgb(247, 247, 248)` |
| textarea | `.caomei-textarea--disabled` | 0.6 | not-allowed | `rgb(247, 247, 248)` |
| select | `.caomei-select--disabled` | 0.6 | not-allowed | `rgb(247, 247, 248)` |
| multi-select | `.caomei-multi-select--disabled` | 0.6 | not-allowed | `rgb(247, 247, 248)` |
| auto-complete | `.caomei-auto-complete--disabled` | 0.6 | not-allowed | `rgb(247, 247, 248)` |
| input-number | `.caomei-input-number--disabled` | 0.6 | not-allowed | `rgb(247, 247, 248)` |
| date-picker | `.caomei-date-picker--disabled` | 0.6 | not-allowed | `rgb(247, 247, 248)` |
| switch | `.caomei-switch--disabled` | 0.6 | not-allowed | — |
| checkbox | `.caomei-checkbox--disabled` | 0.6 | not-allowed | — |
| radio-button | `.caomei-radio-button[data-disabled]` | 0.6 | not-allowed | — |
| tag | `.caomei-tag--disabled` | 0.6 | not-allowed | — |
| file-upload 拖放区 | `.caomei-file-upload__dropzone:disabled` | 0.6 | not-allowed | — |
| color-picker 触发器 | `.caomei-color-picker__trigger:disabled` | 0.6 | not-allowed | — |
| color-picker 色块（直接挂载面板） | `.caomei-color-picker__swatch:disabled` | 0.6 | not-allowed | — |
| calendar 根 | `.caomei-calendar[data-disabled]` | 0.6 | （无 cursor 规则） | — |
| slider 根 / thumb | `.caomei-slider--disabled` / `.caomei-slider__thumb` | 0.6 | thumb = not-allowed | — |
| time-input 时段按钮 | `.caomei-time-input__period:disabled` | 0.6 | not-allowed | `rgb(247, 247, 248)` |

覆盖批次 3 全部 18 处。两处需替代取证（正常交互路径不可达，均已在运行期命中）：

- `color-picker__swatch:disabled`：`disabled` 时 ColorPicker 面板无法打开（`:disabled="disabled"` 恒真），故在夹具中**直接挂载未导出的 `color-picker-panel.vue`**（`disabled` + `swatches`）验证。
- `time-input__period:disabled`：`DatePicker` 启用但 `model` 为空时 `TimeInput :disabled="disabled || !model"` 为真，打开一个**启用且无值**的 `show-time` DatePicker 即可命中（面板可正常打开）。

## 3. 批次 3：0.5 档位未被误伤

| 选择器 | 期望 | 实测 |
| --- | --- | --- |
| `.caomei-dropdown-menu__item[data-disabled]` | 0.5 | 0.5 |
| `.caomei-select__item[data-disabled]` | 0.5 | 0.5 |
| `.caomei-multi-select__item[data-disabled]` | 0.5 | 0.5 |
| `.caomei-auto-complete__item[data-disabled]` | 0.5 | 0.5 |
| `.caomei-dropdown-menu__trigger[data-disabled]` | 0.5 | 0.5 |
| `.caomei-popover__trigger:disabled` | 0.5 | 0.5 |
| `.caomei-toggle-button[data-disabled]` | 0.5 | 0.5 |
| `.caomei-calendar__day[data-disabled]` | 0.5 | 0.5 |
| `.caomei-calendar__nav:disabled` | 0.5 | 0.5 |
| `.caomei-input-number__button:disabled` | 0.5 | 0.5 |
| `.caomei-file-upload__remove:disabled` | 0.5 | 0.5 |

> 「标签触发器」无 0.5 档位：`CaomeiTag` 禁用态即批次 3 迁移的 0.6（见 §2），仓库内不存在 `.caomei-tag` 的 0.5 规则。本节为 `0.5` 档**抽样（11/19）**，其余 8 处选择器见「未覆盖边界」。`toggle-button` 未纳入批次 3 的 `0.6` 收敛范围（是否归并待台账裁决）。

## 4. 批次 2：阴影 / 遮罩计算值（选择器 → 期望 → 实测）

期望值由浏览器用**迁移前字面量**造探针元素取规范序列化后对照（避免手写格式差异造成假阴性）。

| 迁移点 | 选择器 | 期望 | 实测 |
| --- | --- | --- | --- |
| Dialog 遮罩 | `.caomei-dialog__overlay` | `rgba(0, 0, 0, 0.45)` | 同左 |
| Dialog 面板 | `.caomei-dialog__content` | `rgba(0, 0, 0, 0.18) 0px 12px 32px 0px` | 同左 |
| ConfirmDialog 遮罩 | `.caomei-confirm-dialog__overlay` | `rgba(0, 0, 0, 0.45)` | 同左 |
| ConfirmDialog 面板 | `.caomei-confirm-dialog__content` | `rgba(0, 0, 0, 0.18) 0px 12px 32px 0px` | 同左 |
| Card elevated | `.caomei-card--elevated` | `rgba(0, 0, 0, 0.08) 0px 4px 12px 0px` | 同左 |
| DropdownMenu 面板 | `.caomei-dropdown-menu__content` | `rgba(0, 0, 0, 0.12) 0px 8px 24px 0px` | 同左 |
| Popover 面板 | `.caomei-popover__content` | `rgba(0, 0, 0, 0.12) 0px 8px 24px 0px` | 同左 |
| Select 面板 | `.caomei-select__content` | `rgba(0, 0, 0, 0.12) 0px 8px 24px 0px` | 同左 |
| MultiSelect 面板 | `.caomei-multi-select__content` | `rgba(0, 0, 0, 0.12) 0px 8px 24px 0px` | 同左 |
| Toast 面板 | `.caomei-toast` | `rgba(0, 0, 0, 0.12) 0px 8px 24px 0px` | 同左 |
| Slider thumb | `.caomei-slider__thumb` | `rgba(0, 0, 0, 0.2) 0px 1px 2px 0px` | 同左 |
| Skeleton wave 高光 | `.caomei-skeleton--wave .caomei-skeleton__line::after` | 渐变含 `rgba(255, 255, 255, 0.6)` | `linear-gradient(90deg, rgba(0, 0, 0, 0), rgba(255, 255, 255, 0.6), rgba(0, 0, 0, 0))` |

文档站交叉（真实文档页 demo）：Button disabled、Input disabled、Card elevated、Dialog 遮罩 / 面板共 19 项一致。

## 5. 暗色 / 预设复验

- `html.dark` 下 `--caomei-shadow-xs/sm/md/lg`、`--caomei-color-mask`、`--caomei-skeleton-highlight`、`--caomei-disabled-opacity` 原始值均未被覆写；§4 全部面板 / 遮罩 / card / slider / skeleton 计算值**逐项与亮色一致**（含 Dialog、Toast、四个下拉面板）。
- `[data-preset="caomei"]` + `html.dark` 下 `--caomei-color-primary` 变为 `#ff6b6b`（证明预设生效），但上述阴影 / 遮罩 token 原始值与 card / slider / skeleton 计算值仍不变。
- 文档站 `emulateMedia({ colorScheme:'dark' })` + appearance 后 §4 的 Dialog 遮罩 / 面板仍为期望值，`--caomei-color-bg` 变为 `#0b0b0d`（证明暗色生效）。
- 暗色下带禁用背景的控件（如 `time-input__period`）背景取自暗色 `--caomei-color-bg-elevated` = `rgb(23, 23, 26)`，符合 token 语义而非固定亮色值。

## 6. 批次 1：空 `label` / 透传 `aria-label`

| 用例 | 选择器 | 期望 | 实测 |
| --- | --- | --- | --- |
| Button `label=""` | `.caomei-button` | 无 `aria-label` 属性 | 无 |
| Button `label="" + aria-label="透传按钮名"` | `.caomei-button` | `aria-label="透传按钮名"` | 同左 |
| Input `label=""` | `.caomei-input__control` | 无 `aria-label` 属性 | 无 |
| Input `label="" + aria-label="透传输入名"` | `.caomei-input__control` | `aria-label="透传输入名"` | 同左 |
| Input `label="显式输入名" + aria-label="透传输入名"` | `.caomei-input__control` | `aria-label="显式输入名"` | 同左 |

空 / 缺省 `label` 不渲染、不覆盖透传值，契约成立。

## 观察项（OBSERVE）

| 观察 | 归因 | 处置 |
| --- | --- | --- |
| 显式 `label` 与透传 `aria-label` 同时提供时的优先级不一致：Button 渲染 `aria-label="透传按钮名"`（透传胜），Input 渲染 `aria-label="显式输入名"`（`label` 胜） | 既有行为：Button / Badge / ProgressSpinner 依赖自动 attrs fallthrough；Input / Select / MultiSelect 等在模板中把 `labelAttrs(label)` 排在 `$attrs` 之后。批次 1 只改「空 label 不渲染、不覆盖透传值」，未改变该优先级 | 不计为本批问题；建议后续统一「显式 `label` 优先」契约（可在 `@code-reviewer` / 规划阶段裁决） |
| AutoComplete 面板阴影为 `color(srgb 0.101961 … / 0.12) 0px 8px 24px`（暗色为 `0.960784 …`），非 `rgba(0, 0, 0, 0.12)` | 该组件未在批次 2 迁移范围（有意用 `color-mix(in srgb, var(--caomei-color-text) 12%, transparent)` 自适应文本色） | 记录在案，非漂移 |
| Dialog 模态打开时，居中 `in-flow` 容器左移 4px（rootLeft 232.5 → 236.5，滚动条宽 15px，`body.padding-right` 补偿 15px） | 模态锁滚动导致滚动条消失、视口宽变化后居中容器重新居中（theme §5.1 已知预期）；批次 2/3 未触碰滚动锁与任何布局属性 | 记录在案，非问题；in-flow 垂直位移与滚动位置均无变化 |
| dev server 对已编辑的 `app.vue` 返回陈旧 transform（删掉的 `useToast()` 仍被服务），需 `--force` 重启 | Vite 8.2.2 缓存 / 失效时序（本次验证过程观察） | 已写入本记录复现步骤，供后续 V 阶段取证参考 |

## 未覆盖边界

- 文档站仅取 4 个页面做交叉核对（token 属全局，已由夹具全量覆盖 18 处迁移点；未逐页扫全站）。
- 英文站未单独验证（本次无文案 / 路由改动，计算样式与语言无关）。
- 仅 Chromium（Playwright 1.63 / 本机安装版本）；未跑 Firefox / WebKit。
- 视觉美观度未经人工眼检（本模型视觉通道不可用）：本文结论均为 `getComputedStyle` 数值断言与几何断言，未做逐像素视觉比对。截图已留 `test-results/tmp/b2b3/` 供人工复核。
- 未跑构建产物（`pnpm build` + preview）；本次验证对象是 `src/` 源码直读的 dev 页，产物级一致性由既有 CI / `governance:check` 承载。
- `check:design` 已通过（`rgb 警告 0/0 处`），但未纳入本记录的浏览器取证范围。
- `0.5` 档未实测的 8 处选择器（本记录 §3 为 11/19 抽样）：`.caomei-paginator__control:disabled`、`.caomei-accordion__trigger[data-disabled]`、`.caomei-tabs__trigger[data-disabled]`、`.caomei-select-button__item[data-disabled]`、`.caomei-stepper__trigger[data-disabled]`、`.caomei-stepper__indicator`（`[data-disabled]` 后代）、`.caomei-password__toggle:disabled`、`.caomei-toolbar__button:disabled`。

## 截图清单

- `light-top.png` / `light-full.png`：夹具亮色
- `dark-top.png` / `dark-full.png`：夹具暗色
- `preset-dark-top.png`：夹具 `data-preset="caomei"` 暗色
- `docs-button.png` / `docs-card.png` / `docs-input.png`：文档站交叉
- `docs-dialog.png` / `docs-dialog-dark.png`：文档站 Dialog 亮 / 暗
- `stability-desktop.png` / `stability-tablet.png` / `stability-mobile.png`：三档视口
- `stability-dialog-modal.png`：Dialog 模态打开态（真实滚动条）
