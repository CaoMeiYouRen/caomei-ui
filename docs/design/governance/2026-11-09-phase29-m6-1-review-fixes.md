# Phase 29 M6-1 复核反馈修复：导航对齐与动效审查页

> 创建时间：2026-11-09
> 触发：M6-1 人工复核反馈（录屏观感差 / 文档站动效疑似被压平；面包屑、导航菜单明显错位）。
> 依据：[M6-1 验收记录](./2026-11-09-phase29-m6-1-motion-acceptance.md) §5；[动效体系评估](./2026-11-08-motion-system-evaluation.md) §6。

## 1. 现象与根因

| 现象 | 根因 | 判定 |
|:---|:---|:---|
| 文档站动画「稀烂」、过渡几乎不可见 | VitePress 默认主题在 `prefers-reduced-motion: reduce` 下注入 `* { transition-duration: 0s !important; animation-duration: 1ms !important }`；`docs/.vitepress/theme/motion.css` 只按组件恢复部分 `animation`，**不恢复 transition**；系统开启「减少动态效果」时最明显 | 无障碍行为，不是渲染缺陷 |
| 录屏看不出动效 | 素材取自文档站 / 受系统偏好影响，且 webm 帧率低 | 取证方式问题 |
| 面包屑首项比其余项高约 4px | 宿主文档的 `li + li { margin-top: 8px }`（`.vp-doc` / `.prose`）未被组件复位；首项无前置分隔符，项高相同但外边距不同 | 组件缺陷 |
| 子菜单触发器比普通菜单项矮、无内边距 | `.caomei-menu__item` 外观声明在 `menu-item.vue` 的 scoped 样式里；`sub-menu.vue` 的触发器只带类名，跨组件 scoped 选择器不命中，只剩 `justify-content` | 组件缺陷 |
| 菜单项垂直间距偏大 | 同样是宿主 `li + li` 外边距叠加在 `gap` 之上 | 组件缺陷 |

## 2. 修复

1. **面包屑**：`.caomei-breadcrumb__item` 增加 `margin-block: 0`，复位宿主相邻项间距。
2. **菜单项外观共享**：`.caomei-menu__item` 外观从 `menu-item.vue` 的 scoped 块移到 `menu.vue` 的非 scoped 块，并以 `.caomei-menu .caomei-menu__item` 前缀保持特异性 0,2,0——宿主 `.vp-doc a` / `.prose a`（0,1,1）否则会压过单类选择器，把菜单链接变成下划线 + 品牌色（Review Gate R1 实测）。MenuItem 与 SubMenu 触发器共用同一组声明；`:hover` 态显式声明 `color`（宿主 `.vp-doc a:hover` 0,2,1 会压过基础规则）；`menu-item-wrapper` / `submenu` 补 `margin-block: 0`。
3. **独立审查页**：新增 `playground/motion.html` + `motion-review.vue`（`pnpm review:motion` → 端口 4401），并提供 `pnpm review:build` 产出可直接双击的单文件 `artifacts/motion-review/site/motion-review.html`（IIFE 内联 JS/CSS，file:// 可运行；构建期断言无模块脚本 / 外链资源 / `process.` 残留）。页头显示系统动效偏好、13 token 与「减少动效」警告；`no-preference` 下打开自动演示一轮，用户首次操作即中止，`reduce` 下只展示警告，不加载文档站样式；页头显示系统动效偏好、13 个 token 实测值与轴切换 / 模拟 reduce 开关，覆盖 Dialog / Popover / DropdownMenu / Tooltip / Toast / Accordion / Tabs / Menu / Breadcrumb / Button。
4. **文档说明**：`docs/design/theming.md` §5.3 补「文档站与审查页」段落，解释 VitePress 压平属无障碍行为，目视审查改用独立页面并关闭系统 / DevTools 的 reduce 模拟。
5. **回归**：夹具新增 `#component-alignment`（用**非 scoped** 宿主 CSS 复刻 `li + li`、`a` 与 `a:hover` 规则）与 `component-alignment.e2e.ts`（面包屑顶端 / `margin-top` 一致、菜单项与子菜单触发器同高、`li` 间距复位、菜单链接静置 / hover 不被宿主 `a` 样式劫持）。已做负向对照：把选择器降回单类后该用例失败，确认判别力。

## 3. 验证证据

| 项 | 结果 |
|:---|:---|
| 文档站实测（`vitepress dev`） | 面包屑三项 `y` 均为 474；菜单项 / 触发器均 40px（修复前 478/482/482 与 24 / 40）；菜单链接 `text-decoration: none`、颜色走 token、字重 400 / 600（修复前被 `.vp-doc a` 覆盖为下划线 + `rgb(52,81,178)` + 500） |
| 审查页实测（`/motion.html` 与单文件） | 轴切换：`duration-base` 150ms → 220ms、`distance-md` 0px → 8px；Dialog 入场动画 220ms；无控制台错误；菜单项均 34px（与页面字号一致）；单文件 file:// 打开无 console error，`no-preference` 下 Dialog 入场 220ms，`reduce` 下显示警告且无动画 |
| `pnpm exec playwright test test/e2e/component-alignment.e2e.ts` | **9 passed**（3 例 × 3 project）；负向对照（选择器降回单类）该链接用例**失败** |
| 文档站 hover 态 | 非当前项 hover 走 `--caomei-menu-item-hover-color`（不被 `.vp-doc a:hover` 改色）；当前项 hover 保持 `current-color`；禁用项 hover 不变色 |
| 冻结面 | 新增 `--caomei-menu-item-hover-color` 披露钩子（无默认声明）：有效冻结面 **429 → 430**、消费面 **454 → 455** |
| `pnpm vitest run src/components/breadcrumb src/components/menu` | 26 passed |
| `pnpm capture:styles` | **0 差异**（386 项；组件孤立渲染无变化。注意：该口径**不覆盖宿主级联**，宿主文档下的链接外观由文档站实测与 `component-alignment` 覆盖） |
| `pnpm test:visual` | **42 passed** |
| 审查素材 v2 | `artifacts/motion-review/v2/{videos/{desktop-light,mobile-dark}.webm,frames/*,dialog-enter-sheet.png,still-*.png}`（gitignored） |

## 4. 风险与边界

1. **全局菜单项样式**：`.caomei-menu .caomei-menu__item` 非 scoped，仅命中 `CaomeiMenu` 结构；单独渲染 `CaomeiMenuItem` / `CaomeiSubMenu`（不套 Menu）不会带入共享外观，属文档已声明的组合约束。
2. **文档站压平不变**：本次不改 `motion.css` 的恢复范围——保持「系统 reduce 下演示区尊重偏好」的既有决策；改由独立审查页承担目视复核。
3. **审查页仅开发态**：`playground/` 不随包发布；`pnpm review:motion` 依赖本地 Vite。
4. **未覆盖**：Firefox / WebKit；真实设备低端机流畅度仍交人工。

## 5. Review Gate

- **audit-depth**：R1 `standard`（2 个组件样式修复 + 审查页 + 夹具 / E2E + 文档；≤ 10 分钟）；R2 ~ R4、R5 `quick` delta（≤ 5 分钟）。
- **R1（`standard`）**：`Reject`（1 blocker / 2 warning / 4 suggest；实测约 13 分钟，超 ≤ 10 分钟约 3 分钟）——
  - B1 `.caomei-menu__item` 非 scoped 化后特异性 0,2,0 → 0,1,0，宿主 `.vp-doc a`（0,1,1）压过组件声明（下划线 / 品牌色 / 字重 500）：**已修**——前缀 `.caomei-menu` 恢复 0,2,0，夹具补宿主 `a` 规则与「链接不被劫持」用例。
  - W1 仅断言高度，未覆盖「`li` 间距偏大」：**已修**——补 `margin-top === 0` 断言（面包屑 / 菜单）。
  - W2 用 `capture:styles 0 差异` 推出「默认渲染不变」口径过强：**已修**——记录改为「组件孤立渲染无变化，宿主级联另由文档站实测 + E2E 覆盖」。
  - S1 `package.json` 格式化噪声：**已修**——还原 2 空格缩进，仅保留一行脚本；S2 组合约束：**已记**；S3 `margin-block: 0`：**已采纳**；S4 端口冲突：**已改 4401**。
- **R2（`quick` delta）**：`Reject`（1 blocker / 1 warning / 3 suggest；实测约 7 分钟，超 ≤ 5 分钟约 2 分钟）——
  - B1（复发）夹具声称的宿主 `a` 规则未真正写入，「链接不被劫持」用例只与 UA 样式对比、无判别力；治理记录与仓库不符：**已修**——补 `.alignment-prose a` / `a:hover` 规则，静置 + hover 断言，并做负向对照确认降回单类会失败。
  - W1（复发残留）`:hover` 未声明 `color`，宿主 `a:hover`（0,2,1）仍可压过基础规则：**已修**——`:hover` 显式 `color: var(--caomei-menu-item-hover-color, inherit)` + hover 断言。
  - S1 索引「6 例」计数不准：**已修**（删计数）；S2 记录 `margin: 0` 措辞：**已改为 `margin-block: 0`**；S3 夹具注释特异性描述：**已订正**。
- **R3（`quick` delta）**：`Pass`（0 blocker / 1 warning / 1 suggest；实测约 5 分钟，未超）——
  - W1 通用 `:hover` 规则（0,4,0）压过 `[aria-current]`（0,3,0），当前项悬停丢失 `current-color`：**已修**——hover 选择器加 `:not([aria-current])`，E2E 增加「当前项 hover 保持 current-color」断言。
  - S1 新增公开钩子 `--caomei-menu-item-hover-color` 未进组件页「样式定制」：**已修**——中英菜单页补行，冻结面披露 **315 → 316** / 有效冻结面 **429 → 430**（消费面 454 → 455）；同表 `current-color` 默认值订正为 `--caomei-color-primary-text`。
- **R4（`quick` delta）**：`Pass`（0 blocker / 0 warning / 2 suggest；实测约 5 分钟，未超）——
  - S1 禁用链接悬停仍会被宿主 `a:hover` 改色：**已修**——补 `[aria-disabled='true']:not([aria-current]) { color: inherit }`，夹具增加禁用链接项与 hover 断言。
  - S2 冻结面增量注记插在 11-08 批次之前：**已修**——移到 11-08 四条注记之后，内容不变。
  - 复查确认：hover 三态（非当前 / 当前 / 禁用）均保持预期；token 计数 184 / 316 / 430 / 70 / 455 / 139 与三处载体一致。
- **R5（`quick`，免启动单文件与自动演示）**：`Pass`（0 blocker / 1 warning / 4 suggest；实测约 7 分钟，超 ≤ 5 分钟约 2 分钟）——
  - W1 自动演示会覆盖用户操作 / reduce 下仍自动弹窗：**已修**——用户首次 `pointerdown` / `keydown` 即中止演示，`reduce` 下跳过自动演示。
  - S1 记录句子重复：**已修**；S2 移除无效的 `inlineDynamicImports`；S3 产物只按文件清理并转义 `</style`；S4 构建期增加单文件不变量断言（无 `type="module"` / 相对外链 / `process.`）。均已采纳。
- **复查基线**：本记录 §1 ~ §3；`src/components/{breadcrumb/breadcrumb-item.vue,menu/menu.vue,menu/menu-item.vue,menu/sub-menu.vue}`；`playground/motion*`；`test/e2e/component-alignment.e2e.ts`；`test/e2e/fixtures/{app.vue,main.ts,alignment-host.css}`；`docs/design/theming.md` §5.3。

## 6. 未覆盖边界

- 未回归文档站其余 20+ 组件的过渡观感（同源问题已由审查页统一承接）。
- 未改动 `docs/.vitepress/theme/motion.css` 的动画恢复清单。
