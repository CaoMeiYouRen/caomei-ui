# M4 测试稳定性与常驻回归补齐交付与验证记录（Phase 16）

> 创建时间：2026-09-28
> 条目：Phase 16 **M4-1 / M4-2**
> 依据：[下一阶段范围评估 §8](./2026-09-28-next-stage-scope-evaluation.md) 的 **D11**（flaky 只处理重复出现，首次出现不立专项）与 M4 主线范围（常驻 E2E 规格 follow-up / 组件画廊回归断言）。
> 快照：本仓 `1af9571`（M3 交付后）。本记录为 M4 两条目的唯一交付口径。

---

## 1. 范围与依据

| 条目 | 动作 | 交付 |
| :--- | :--- | :--- |
| **M4-1** | 常驻 E2E 规格 follow-up | 新增 `test/e2e/focus-and-motion.e2e.ts`（**5 用例 × 3 视口 = 15 tests**） |
| **M4-2** | 组件画廊浏览器回归断言 | 新增 `playwright.gallery.config.ts` + `test/e2e/gallery.e2e.ts`（**8 tests**） |

- **非目标**（D11）：不为覆盖率数字补测；不为**首次出现**的 flaky（`generate-changelog` git fixture）立专项；不做视觉回归基线（截图比对，Backlog 独立候选）。
- **规模分摊**：M4-1 = 1 文件（新 spec `focus-and-motion.e2e.ts`）；M4-2 = 1 配置（`playwright.gallery.config.ts`）+ 1 spec（`gallery.e2e.ts`）+ `playwright.config.ts` **2 行**（注释 + `testIgnore`）+ `package.json` 1 行 + `tsconfig.node.json` 1 行。合计 11 文件（含治理载体），单条目 ≤ 5 文件。

## 2. M4-1 常驻 E2E 规格 follow-up

- **口径澄清（重要）**：登记文本与 [Backlog §1.6](../../plan/backlog.md) 的「常驻 E2E 规格 follow-up」示例写作「滚动容器 / 键盘聚焦等」，但这两类**已在** `test/e2e/responsive.e2e.ts` 覆盖（54 项，含「滚动类容器：成员不被裁切」「滚动类容器：键盘聚焦滚入」两组）。本条目据此补齐**实际未覆盖**的两处：
  1. **日历日格焦点环**：`:focus-visible` 的 `outline: 2px + offset: 1px`（外扩 3px）不得被 DatePicker 面板的 `overflow: auto` 裁切——此前仅在 [M2 第三批日历基线](./2026-09-17-m2-batch3-calendar-baseline.md) 做静态推算，无常驻断言。
  2. **默认动效路径**：本套 E2E 全局以 `reducedMotion: 'reduce'` 运行（几何断言确定性），代价是默认动效路径失去常驻覆盖（`playwright.config.ts` 注释已登记）。新增 `no-preference` 描述块补回该路径，并与 `reduce` 分支做**双向**断言。
- **新增 spec**：`test/e2e/focus-and-motion.e2e.ts`
  - 用例 1「日格焦点环（含外扩）完整落在面板可视区内」：今日日格（`tabindex="0"`）程序化聚焦后**再按键盘方向键**使 `:focus-visible` 生效，读取组件声明的外扩量（不硬编码 2px / 1px）；再以该外扩量对网格首 / 中 / 末日格做**包络 ⊆ 面板 client rect** 的静态几何断言。
  - 用例 2 / 3（`no-preference`）：SelectButton 项 `transition-duration` 非零、DatePicker 面板 `animation-duration` 非零。
  - 用例 4 / 5（项目默认 `reduce`）：同两项被压平为 `0s`（双向覆盖，防止「reduce 分支失效」或「默认动效被误删」）。
- **实测口径记录**：日格为 `div[role=button]`，仅「今日」带 `tabindex="0"`；纯 `element.focus()` **不**命中 `:focus-visible`（需补一次键盘交互）——已写入 spec 注释，避免后续误判为断言失败。

## 3. M4-2 组件画廊浏览器回归断言

- **形态**：画廊是**文档站**页面（`/components/showcase`），不在 E2E 夹具应用内，故与主配置分离：
  - 新增 `playwright.gallery.config.ts`：`webServer` 先 `docs:build` 再 `vitepress preview`（断言**构建产物**，与 V 阶段同口径）；单 project / 单 worker / `reducedMotion: 'reduce'`，四档视口在用例内 `setViewportSize` 切换。
  - 主配置 `playwright.config.ts` 增 `testIgnore: '**/gallery.e2e.ts'`，夹具 project 不误跑。
  - `package.json` 新增 `test:e2e:gallery`。
- **新增 spec**：`test/e2e/gallery.e2e.ts`（**4 用例 × 中英 2 locale = 8 tests**）——事实源为登记表 `showcase-registry.json`（期望卡片数 / 根类名 / 分组标题均**派生**，不在用例另立清单）：
  1. 登记项全部真实渲染（stage 非空）且非浮层组件的根类名存在（`Dialog` 未开启时只渲染触发按钮，由用例 4 覆盖）；分组标题与登记顺序一致。
  2. 四档视口 1440 / 1024 / 768 / 375：`scrollWidth === clientWidth`（0 溢出）且网格列数 **2 / 2 / 2 / 1**。
  3. 卡片链接 locale 前缀正确（`/components/*` 与 `/en-US/components/*`）且逐条 HTTP **200**。
  4. Dialog 卡开启后 `.caomei-dialog__content` 出现且 **Portal 到卡片之外**（`document.body` 内、不在卡片内）。
- **与登记表守卫的分工**：`docs:check:showcase`（构建期）对账登记表 ↔ 页面 / 示例；本 spec（浏览器）对账**真实渲染**与交互，两者互补、不重复。

## 4. 连续多次运行零失败

| 命令 | 连续运行 | 结果 |
| :--- | :--- | :--- |
| `pnpm test:e2e`（夹具，含既有 54 + 新增 15） | **3 次** | 每次 **69 passed**，零失败 |
| `pnpm test:e2e:gallery`（画廊） | **3 次** | 每次 **8 passed**，零失败 |

## 5. 质量门

- `pnpm verify` **exit 0**（2026-09-28T23:13:43 → 23:17:24）：`lint:check` / `lint:css:check` / `lint:md:check` / `typecheck` / `typecheck:docs` / `test`（**91 文件 / 1885 tests**）/ `build` / `check:build` / `check:resolver` / `check:nuxt` / `docs:build` / `docs:check:i18n-routing` / `governance:check` 全绿。
- `check:planning-numbers`：0 命中（新增 spec / 配置的注释以文档路径代替规划编号）。
- 常驻 E2E：`pnpm test:e2e` × 3 = 每次 69 passed；`pnpm test:e2e:gallery` × 3 = 每次 8 passed（见 §4）。

## 6. Review Gate 记录

- **R1（并发分区，`standard`，时间盒 ≤ 10 分钟）：两分区均 `Pass`**——分区 A（测试装置：2 spec + 2 配置 + `package.json` / `tsconfig.node.json`）**Pass**（0 blocker / 0 warning / 4 suggest）；分区 B（治理与规划载体：M4 记录 / index / 评估记录 / todo / backlog）**Pass**（0 blocker / 2 warning / 2 suggest）。汇总取最严 = **Pass**。
  - 审计方独立复现：`playwright test --list` 主配置 **69 tests / 2 files**（gallery 已被 `testIgnore` 排除）、gallery 配置 **8 tests / 1 file**；`check:governance-records` exit 0；`showcase-registry.json` 13 项与 gallery 派生一致；日格 `:focus-visible` 计算样式 2px + 1px 与面板 padding 12px 核对成立；无新增依赖；编号扫描 0 命中。
  - **A-suggest-1**：gallery `waitUntil: 'networkidle'` 属不推荐就绪信号 → **已同批修正**为 `domcontentloaded`（就绪交给既有 `expect.poll`）。
  - **A-suggest-2**：列数断言失败信息补实测列数 → **已同批修正**。
  - **A-suggest-3**：`reduce` 分支绑死「时长归零」通道 → **已同批修正**为语义断言 `isMotionDisabled`（属性 `none` 或时长全 0，兼容两种实现通道）。
  - **A-suggest-4**：gallery `reuseExistingServer` 本地复用旧服务的产物新鲜度边界 → **已同批登记** §7 边界。
  - **B-warning-1**：§7「见 Backlog」为无载体断言且「未接入 CI」失真（weekly 回归已装 Chromium 并以 `continue-on-error` 运行）→ **已同批修正**为准确表述，去掉无载体指针。
  - **B-warning-2**：`m2-batch3-calendar-baseline.md` §6 与 `todo-archive.md` 归档块仍指向已迁出的 Backlog 候选 → **已同批追加现行口径**（保留历史结论，补交付指针）。
  - **B-suggest-1**：§1 规模分摊把 `playwright.config.ts` 归到 M4-1（与 §3 矛盾）→ **已同批修正**为逐条实际归属。
  - **B-suggest-2**：`playwright.config.ts` 的 reducedMotion 注释过期（指向已移除候选）→ **已同批修正**。
  - 8 条 finding 记为「**已修复未复审**」（两分区均 Pass、无 blocker）。
  - **未覆盖边界（审计方声明）**：仅 Chromium（`:focus-visible` 启发式与 Portal 行为未跨引擎）；常驻 E2E 未接入阻断门禁（本批不改变）；本地 gallery 复用旧服务的产物新鲜度边界；未重跑全量 `pnpm verify` / E2E（采信调用方证据）。
- **实测用时（调用方回填）**：R1 发起 `2026-09-28T23:25:46+08:00`（两分区并发）——**未在返回时点单独取戳**（口径偏差），以修复完成前取戳 `23:31:26` 为上界（≤ 5 分 40 秒，含调用方阅读与修复），**未超** 10 分钟时间盒。
- **留痕**：R1 结论由调用方落盘 `artifacts/review-gate/2026-09-28-phase16-m4-test-regression.md`（本地态、不入库）。

## 7. 边界与未覆盖

- M4-1 未新增「滚动容器 / 键盘聚焦」用例（既有覆盖，避免重复）；未覆盖浮层 Tab 焦点陷阱 / 焦点归还（[Backlog](../../plan/backlog.md) 的「浮层交互 E2E 规格」候选）。
- M4-2 断言构建产物、需先 `docs:build`（单次约 1 分钟，故独立命令、不进 `pnpm test:e2e`）；不做像素级截图比对。
- 常驻 E2E **未接入 `pnpm verify` 阻断门禁**；weekly 回归（`.github/workflows/regression-weekly.yml`）已安装 Chromium 并以 `continue-on-error: true` 运行 `pnpm test:e2e`（**非阻断**）。本批不改变该状态。
- `playwright.gallery.config.ts` 的 `reuseExistingServer: !CI`：本地若已有 docs preview 占用 4173，会复用旧服务并跳过 `docs:build`（产物新鲜度退化）；CI 下强制重建。
- 首次出现的 `generate-changelog` git fixture flaky 按 D11 **不立专项**，维持条件候选观察。
