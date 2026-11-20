# Phase 38 M2–M4 交付记录：移动壳、操作 / 空态与验收扩面

> 创建时间：2026-11-20
> 范围与验收口径的唯一载体：[Phase 38 登记批次](./2026-11-20-phase38-registration.md) §2（M2-1 ~ M4-3）。本记录只承载实现机制、验证证据与 Review Gate，不重述验收口径。
> 本记录覆盖 9 条原子条目：M2-1 / M2-2 / M2-3 / M3-1 / M3-2 / M3-3 / M4-1 / M4-2 / M4-3。

## 1. 实现

### M2-1 Cell / CellGroup

- `src/components/cell/`：`cell.vue` + `cell-group.vue` + `types.ts` + `index.ts` + `cell.test.ts`。
- Cell 以 `as`（`div` / `button` / `a`）承载宿主语义，`button` 默认 `type="button"`、`a` 透传 `href` / `target`；标题 / 描述 / 右值与 `#prefix` / `#title` / `#description` / `#value` / `#suffix` 一一对应；`arrow` 渲染装饰性箭头（`aria-hidden`）。
- 行高下限复用 `--caomei-control-height-lg`（桌面 44px / `data-density="touch"` 52px），整行即命中区；窄屏只做单行截断，不改变行结构。
- CellGroup 以 `role="group"` 承载分组；带标题时用 `useId()` 生成 `aria-labelledby`，分隔线由容器统一绘制于相邻行之间。

### M2-2 Tabbar / TabbarItem

- `src/components/tabbar/`：`tabbar.vue` + `tabbar-item.vue` + `context.ts`（内部 provide/inject，不进公共 barrel） + `types.ts` + `index.ts` + `tabbar.test.ts`。
- `v-model` 维护单值；选中条目输出 `aria-current="page"`，任一时刻至多一个；`items` 数据驱动与默认插槽二选一，`#item` / `#icon` 作用域插槽分别替换文案与图标。
- 角标复用 `CaomeiBadge`；条目高度下限取 `--caomei-control-height-lg`；底部内边距叠加 `--caomei-safe-area-bottom`；`fixed` 可选吸底（层级 `--caomei-z-sticky`）。
- **不接 vue-router、不做页面切换**；导航由使用方在条目点击后自行处理。

### M2-3 M2 的 10 语、台账与文档

- 新增 `tabbar.label` 可访问名键，10 语同步；`check:locale-keys` 基线由 31 命名空间 / 92 条更新为 33 / 95（含 M3-1 的 `actionSheet`）。
- 中英 `locale` 台账新增 `actionSheet` / `tabbar` 两行，`dataView` 消费组件补 `Empty`，消费组件数 34 → 35。
- 中英组件页、侧栏、总览、设计登记、Tier 2 清单、画廊回扫同批落地；示例与英文镜像齐备。

### M3-1 ActionSheet

- `src/components/action-sheet/`：以 `CaomeiDrawer position="bottom"` 组合，不新增 primitive；`groups` 支持分组标题 / 说明 / 危险项 / 禁用项，默认插槽可替换内容区。
- 选择抛出 `select(value, item)` 且默认关闭（`closeOnSelect` 可关）；取消项文案取 `cancelLabel` 或 `locale.actionSheet.cancel`，抛出 `cancel` 并关闭。
- 焦点由底层 Dialog 语义在关闭后归还触发器；正文 `overflow: auto`，面板高度 `min(90dvh, 420px)`，取消项常驻。
- Drawer 新增可选 `label` prop：无可见标题时作为可访问名回退（`title > label > locale.drawer.label`），既有调用零变化。
- 分组在有 `label` 时输出 `role="group"` + `aria-labelledby` 指向可见标题。

### M3-2 Empty

- `src/components/empty/`：`icon` / `image` / `imageAlt` / `title` / `description` / `size`（`sm` / `md` / `lg`）/ `as`（`div` / `section` / `article`）。
- 标题缺省复用 `dataView.empty`；`#icon` / `#image` / `#title` / `#description` / `#action` 插槽齐备；未提供媒体时渲染装饰性默认图标。
- 与 `DataView` 的分工在组件页单点声明：DataView 负责容器内空态，Empty 负责页面 / 区块空态，可放入 DataView 的 `#empty` 插槽复用文案。

### M3-3 M3 的 10 语、台账与文档

- 新增 `actionSheet.label` / `actionSheet.cancel`，10 语同步（与 M2-3 同批提交，符合「10 语整批」例外）。
- 中英组件页、`DataView` 关系说明、台账与计数器回扫同批落地。

### M4-1 移动端适配指南

- `docs/guide/mobile.md` 与英文镜像新增「移动端布局配方」：bottom sheet、吸顶头部（`--caomei-z-sticky`）、固定底部操作条、软键盘与 `dvh`、五条下限判据、44px 三条达成路径；回链响应式设计 §2 / §3。
- 自测清单视口补充 360×800 / 414×896 / 1536×960 / 1920×1080。

### M4-2 44px 政策与回归扩面

- 维持 24 下限（WCAG 2.5.8）；44 由 `size="lg"` / `data-density="touch"` / 使用层包装达成，不默认放大。
- `test/e2e/mobile-shell.e2e.ts`：CellGroup 语义与宿主元素、Tabbar `aria-current` 单值与条目高度 / 轴距、ActionSheet 开合 / 选择 / 取消 / 焦点回退 / 内容滚动、Empty 不裁切；三档全量运行。
- 相邻目标轴距直接复用生产判据 `minHitTargetDistance`（`HIT_BOX = 24`）；负向对照注入 0 / 4px 间距的两对 20px 按钮，实测中心距 20 / 24，边界两侧均有判别力。
- `#cell-group` / `#tabbar` / `#action-sheet` / `#empty` 进入 `responsive.e2e.ts` 受检面，`MIN_SECTIONS` 21 → 25；`capture:styles` 与视觉基线复跑均无差异。

### M4-3 验收视口扩面

- `playwright.config.ts` 新增 4 个定向档：`mobile-360` 360×800 / `mobile-414` 414×896 / `wide-1536` 1536×960 / `desktop-1920` 1920×1080，均 `only: 'responsive'`；定向档总数 6。
- `responsive.e2e.ts` 的矩阵守卫由两档硬编码改为 `DIRECTED_VIEWPORTS` 清单对账；全量档名单改为「配置全集 − 定向档」求差。
- 极窄探针在 `setViewportSize(200)` 前隐藏除日期面板外的 section，并在运行时断言布局视口确实跟随探针宽度——避免夹具最小内容宽把移动端布局视口撑到 264，使可用宽上限断言失去判别力。
- `docs/design/responsive.md` §4 视口表与口径句同步；矩阵新增 #19–#21（移动端列表壳 / 底部操作面板 / 空态）。

## 2. 验证

- `pnpm lint:check` / `pnpm lint:css:check` / `pnpm lint:md:check` → 通过。
- `pnpm typecheck` → 通过；`pnpm test` → **182 文件 / 3553 例全部通过**（含新增组件单测与 a11y 76 例）。
- `pnpm exec playwright test test/e2e/mobile-shell.e2e.ts --project=mobile --project=tablet --project=desktop` → **27 / 27 通过**（9 例 × 3 档）。
- `pnpm exec playwright test test/e2e/responsive.e2e.ts`（9 档）→ 见 §2.1 复跑读数。
- `pnpm capture:styles` → **0 差异（399 项）**；`pnpm test:visual` → **48 / 48 通过**（既有基线零差异）。
- `pnpm verify` → **exit 0**（lint / lint:css / lint:md / typecheck / typecheck:docs / test / build / check:build / check:resolver / check:nuxt / docs:build / docs:check:i18n-routing / governance:check 全链通过）。
- `pnpm docs:check` / `pnpm governance:check` → 通过；`docs:check:structure` 报「7 组 / 64 个组件条目符合 §11 登记」，`check:locale-ledger` 报「33 命名空间」。
- `check:design` / `check:class-prefix` / `check:overlay-z-index` → 通过。

### 2.1 复跑与判别力

- `responsive.e2e.ts` 9 档复跑：**186 passed / 12 skipped**（跳过来自 6 个定向档上的 2 条自驱视口探针，共 12 例）。修复前 mobile / tablet 的极窄探针 2 例失败（布局视口被夹具最小内容宽撑到 264），隐藏非日期面板 section 并补布局视口断言后恢复；定向复跑 2 / 2 通过。
- 相邻目标间距的判别力由负向对照承担：注入 0 / 4px 间距的两对 20px 按钮，直接调用生产判据 `minHitTargetDistance`，实测中心距 20 / 24，分别落在 24px 判据的两侧。

## 3. Review Gate

**结论：Pass**（分区审查 + R2 delta + R3 复核；`standard` 首轮 + `quick` 复核）。因变更面跨运行时 / 文档 / 测试三区，按模块并发发起 3 个 `@code-reviewer` 任务；时间盒按 `standard` ≤10 分钟 / `quick` ≤5 分钟声明。精确耗时未逐轮记录（并发 subagent 一轮完成），属本批证据缺口。

### 3.1 R1（standard）

| 分区 | 结论 | blocker | warning | suggest |
| :--- | :--- | :-: | :-: | :-: |
| 运行时 | Pass | 0 | 3 | 8 |
| 文档 / 登记 | Reject | 1 | 5 | 7 |
| 测试 / 验收 | Reject | 3 | 4 | 4 |

- **RG-B01（文档）**：`<ComponentApi name="cell-group" />` 指向不存在的元数据键（生成器按目录主 SFC 取名）→ 删除该行，改为正文 API 表；中英同构。
- **RG-B02（测试）**：`DIRECTED_VIEWPORTS` 的窄化推断导致 `pnpm typecheck` TS2345 → `directedNames: readonly string[]`。
- **RG-B03（测试）**：`mobile-shell.e2e.ts` 的 `Array<T>` 触发 `@typescript-eslint/array-type` → 改 `T[]`，并改用生产 helper。
- **RG-B04（测试）**：夹具手写按钮 class 顺序触发 `vue/static-class-names-order` → 改用 `<CaomeiButton>`。
- **RG-W01（运行时）**：ActionSheet 覆写 Drawer 内部类与 scoped 规则同特异性 → 提升为 `.caomei-action-sheet.caomei-action-sheet ...`。
- **RG-W02（运行时）**：Tabbar 内部上下文 key 从公共 barrel 导出 → 移除，仅保留内部导入。
- **RG-W03（运行时）**：Empty 的 `description` 用 `<p>` 承载插槽会产生非法嵌套 → 改 `<div>`。
- **RG-W04（文档）**：locale 台账 `dataView` 行漏 `Empty` → 补登并同步 34 → 35。
- **RG-W05（文档）**：5 对新页章节顺序与 §4 模板相反 → 统一为「无障碍 → 样式定制 → `ComponentApi` / 手写 API 表收尾」（cell-group 无生成元数据，以 `## API` 表收尾）。
- **RG-W06（文档）**：移动端指南把 `--caomei-z-pinned-header` 当浮层 token → 改 `--caomei-z-sticky`。
- **RG-W07（文档）**：`version-policy` 的导出 / token / locale 计数过期 → 按复算命令更新为 385 / 483 / 33 / 95，并在冻结面终审追加复算校准注记。
- **RG-W08（文档）**：`testing.md` 仍写「2 档定向」→ 删除陈旧数值，保留 §4 单一事实源。
- **RG-W09（测试）**：负向对照复制几何公式且注释与参数不符 → 改为直接调用 `minHitTargetDistance`，0 / 4px 双侧边界。
- **RG-W10（测试）**：Tabbar 几何用例在条目数为 0 时空转 → 先断言 `toHaveCount(3)`。
- **RG-W11（测试）**：相邻间距判据与 `hit-target.ts` 双实现 → 删除本地 `centerDistance` / `centersOf`，统一走 helper。
- **RG-W12（测试）**：用例名声称 320 档但该 spec 不承载定向档 → 改名并在文件头注明 320 由矩阵用例承担。
- suggest 处置：补齐样式表与 TabbarItem 属性表、Tier 2 分档依据、`theme.css` 注释、Empty `as` 说明；运行时补分组 `aria-labelledby`、headerless 隐藏配方与面板类名回归断言；测试补极窄探针视口断言与边界容差。

### 3.2 R2（quick delta）

| 分区 | 结论 | blocker | warning | suggest |
| :--- | :--- | :-: | :-: | :-: |
| 运行时 | Pass | 0 | 1 | 6 |
| 文档 / 登记 | Reject | 1 | 3 | 4 |
| 测试 / 验收 | Pass | 0 | 1 | 5 |

- **RG-B05（文档）**：英文 `version-policy.md` 未同步（仍 345 / 430 / 30 / 89）→ 三处数字与中文同值，并同步冻结面 §2.5 的 33 / 95 增量注记。
- **RG-W13（运行时）**：ActionSheet 覆写依赖 Drawer 的 class 透传约定 → 单测补「面板根同时具备 `caomei-drawer__content` 与 `caomei-action-sheet`」断言。
- **RG-W14（文档）**：新英文页用 `## Styling`，与其余英文页及 §2.4 复算命令不一致 → 统一为 `## Style customization`；重跑复算仍为 193 / 365 / 483 / 交集 75。
- **RG-W15（文档）**：cell-group API 表默认值与 role 措辞不准确 → 默认列改 `—`，措辞改为「始终 `role=group`，带标题补 `aria-labelledby`」。
- **RG-W16（文档）**：冻结面 §2.5 仍停在 30 / 89，与实测 33 / 95 冲突 → 追加 `rating` / `actionSheet` / `tabbar` 增量注记。
- **RG-W17（测试）**：文件头仍写「320 档」→ 改为三档验收视口并注明 320 由矩阵用例承担。

### 3.3 R3（quick 复核）

**结论：Pass**（仅复核 R2 blocker 与结构性 warning）。中英 `version-policy` 数字一致且可复算；冻结面 §2.4 / §2.5 注记与复算命令口径对齐；`docs:check:i18n-parity` / `check:locale-ledger` 通过。

- **RG-W18**：冻结面 §2.4 命令注释的「当前值 381 / 当前 65」与校准值冲突 → 改为历史值 + 2026-11-20 校准值两段表述；§2.5 命令行同步标注时点读数与当前期望值。

## 4. 残留与后续

- 极窄探针的成因修复依赖「隐藏非日期面板 section」；夹具新增高最小内容宽的 section 时仍需保持该前置，已在探针内加布局视口断言守卫。
- 真实设备（iOS safe-area / 软键盘）与 `dvh` 动态差异仍无自动化条目，随阶段末真机验收执行。
- 全量 `pnpm test:e2e` 在本机环境仍有既有失败，已在干净 HEAD（`d1f0e4d`）的临时 worktree（`/tmp/opencode/caomei-head`，`node node_modules/@playwright/test/cli.js test <spec> --project=<档> --workers=1`）逐例复现，与本批无关：`back-top.e2e.ts` 夹具遮挡、`overlay-stacking.e2e.ts` 模态内容后代命中自证、`navigation-motion.e2e.ts` SplitButton chevron、`selector-motion.e2e.ts` 两例（DatePicker 入场 / reduced-motion 压平）、`data-table-scroll.e2e.ts` 行展开区。`back-top` 已在 M1-2 记录；其余作为既有装置失败登记于 [Backlog §1.6](../../plan/backlog.md)，待用户裁定是否排期。
- 本阶段不发布（`latest` 维持 `1.3.0`）；发布动作不在本批范围。
