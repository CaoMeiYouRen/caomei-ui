# Phase 20 M1-4：文档站浮层泄漏的常驻浏览器断言

> 创建时间：2026-10-07
> 关联条目：[待办事项](../../plan/todo.md) Phase 20 **M1-4**（测试装置与覆盖扩面）
> 依据：Phase 19 M3-2 登记的边界——声明层契约（`test/contracts/docs-theme-prose-isolation.test.ts`）只校验 CSS 文本，**无法感知 VitePress 选择器 / 特异性漂移**（[2026-10-06 下拉留白修复](./2026-10-06-phase19-m3-2-rich-text-editor-dropdown-indent-fix.md) §4）；本轮新建候选 B32
> 快照：本仓工作区（`test:e2e:gallery` 11 passed、`pnpm verify` exit 0）；**未推送**

---

## 1. 结论

- 把 Phase 19 M3-2 的**一次性真实 Chromium 探针**转为**常驻浏览器断言**：新增 Playwright 规格 `test/e2e/docs-theme-isolation.e2e.ts`，跑在 `docs:build` 产物上，断言 `md-editor-v3` 工具条下拉菜单子树的**计算样式**（隔离规则生效形态）。
- 接入文档站浏览器回归管线（`playwright.gallery.config.ts` 的 `testMatch` 扩面）并纳入**每周回归 CI**（`regression-weekly.yml` 新增 `test:e2e:gallery` 步骤，非阻断），使 VitePress 升级 / 主题改动后泄漏可被感知。
- **判别力自证**：两轮负向对照——① 菜单隔离规则降为 0-1-0（不再压过 `.vp-doc ul` 0-1-1）→ **1 failed**（`padding-left` 非 `0px`）；② 单变量降级 `md-editor-menu-item` 隔离规则 → **1 failed**（第二项 `margin-top` 非 `0px`）；还原后均全绿。
- 本批零 `src/**` 改动、零组件库行为变更。

---

## 2. 断言内容

| 观测量 | 期望 | 失守含义 |
|:---|:---|:---|
| `inProse`（`.md-editor-menu` 是否在 `.vp-doc` 内） | `true` | 前置守卫：菜单移出正文则本用例失去判别力（fail-closed） |
| `.md-editor-menu` `padding-left` / `padding-right` | `0px` | 文档站正文列表 `padding-left: 1.25rem` 泄漏（0-1-1 压过内核 0-1-0） |
| `.md-editor-menu` `padding-top` / `padding-bottom` / `margin-top` / `margin-bottom` | `0px` | 正文列表纵向外边距泄漏 |
| `.md-editor-menu` `list-style-type` | `none` | 列表样式未被隔离复位 |
| `.md-editor-menu-item` 数量 | `≥ 2` | 「相邻项间距」断言的前提（`li + li` 只作用于第二个起） |
| `.md-editor-menu-item`（**第二个**）`margin-top` | `0px` | `.vp-doc li + li`（8px）泄漏（首项不受该规则影响，故取样第二项） |

- **打开路径稳定**：点击工具条「标题」项（`md-editor-v3` 内建 dropdown），取 `:visible` 的 `.md-editor-menu`。
- **为什么是计算样式**：泄漏的成因是「宿主后代选择器特异性压过内核规则」，只有真实浏览器层叠结果才能证明隔离规则仍生效；声明层契约对选择器 / 特异性漂移无感知。
- **前置守卫的判别力边界**：`inProse` 只封堵「菜单被子树移出 `.vp-doc`（teleport / 重构）导致静默通过」，**不封堵**「VitePress 取消正文列表样式本身」——后者发生时各断言仍通过，属有意不纳入（§4）。

---

## 3. 载体改动

| 文件 | 改动 |
|:---|:---|
| `test/e2e/docs-theme-isolation.e2e.ts` | 新增常驻规格（1 用例，含前置守卫 + 7 项计算样式断言） |
| `playwright.gallery.config.ts` | `testMatch` 由单文件扩为 `[gallery, docs-theme-isolation]`；注释改述为「文档站浏览器回归」 |
| `playwright.config.ts` | `testIgnore` 由单文件扩为数组（夹具 project 同时排除两个文档站规格） |
| `.github/workflows/regression-weekly.yml` | 新增 `Run docs site browser regression` 步骤（`pnpm test:e2e:gallery`，`continue-on-error: true`，与同 job 的 E2E 步骤同口径） |

---

## 4. 未纳入面与边界（显式）

- **只覆盖当前策展页** `/components/rich-text-editor` **的首个编辑器实例**（该页含基础 / 上传两个 demo，各带一个工具栏；本用例取 `.first()`）：其他宿主排版体系（下游应用）、内核其余下拉（如「插入」菜单）未逐一实测；泄漏判据同源，如需可复用同一断言形态扩面。
- **不感知 VitePress 内部实现变化本身**，只感知「计算样式是否仍为隔离形态」——若 VitePress 不再产生正文列表样式，断言仍通过（属期望，属有意不纳入）。
- **依赖 `docs:build`**（单次约 1 分钟），故该规格不进 `pnpm test:e2e`（夹具套件），随 `test:e2e:gallery` 独立运行；gallery 复用本地已运行 preview 服务的产物新鲜度边界沿用既有登记。

---

## 5. 判别力（负向对照）

把 `docs/.vitepress/theme/caomei-demo.css` 的隔离规则选择器由 `.vp-doc .md-editor-menu`（0-2-0）降为 `.md-editor-menu`（0-1-0），使其不再压过 VitePress `.vp-doc ul`（0-1-1）：

| 对照 | 回退内容 | `playwright test --config playwright.gallery.config.ts docs-theme-isolation` 结果 |
|:---|:---|:---|
| ① 菜单隔离失守 | `.vp-doc .md-editor-menu` / `.md-editor-menu-item` → 去掉 `.vp-doc` 前缀 | **1 failed**（「菜单左侧不得出现文档站正文列表的 1.25rem 留白」`padding-left` 非 `0px`） |
| ② 相邻项间距隔离失守（单变量） | 仅 `.vp-doc .md-editor-menu-item` → `.md-editor-menu-item` | **1 failed**（「相邻菜单项不得出现文档站 `.vp-doc li + li` 的 8px 间距」`itemMarginTop` 非 `0px`） |

- 交替还原 `caomei-demo.css` 后复跑 **1 passed**（`docs:build` 重建产物）。
- 对照 ② 为审计方指出的「首项取样恒过」修复后的**单变量判别力自证**（首项不受 `li + li` 影响，故须取第二项）。

---

## 6. 规模、质量门与 Review Gate

- **规模**：4 文件（`test/e2e/docs-theme-isolation.e2e.ts` 新增 / `playwright.gallery.config.ts` +5 −5 / `playwright.config.ts` +2 −2 / `regression-weekly.yml` +6）+ 文档载体（本记录 + 治理索引 + `todo.md` 状态回填）。**零 `src/**` 改动**。
- **质量门（本批实测）**：
  - `pnpm test:e2e:gallery` → **11 passed**（既有 10 + 本批 1）。
  - `pnpm test:e2e --workers=2` → **312 passed**（文档站规格经 `testIgnore` 正确排除）。
  - `pnpm verify` **exit 0**（`lint:check` / `lint:css:check` / `lint:md:check` / `typecheck` / `typecheck:docs` / `test` **110 文件 / 2203 例** / `build` / `check:build` / `check:resolver` / `check:nuxt` / `docs:build` / `docs:check:i18n-routing` / `governance:check` 全绿）。
  - 负向对照 **1 failed**、还原后 1 passed（§5）。
- **V 阶段**：浏览器侧证据由本常驻断言在真实 Chromium（`docs:build` 产物）中承载；未改 `src/**`，不另走 `@ui-validator`。
- **Review Gate**：见 §7；本地留痕 `artifacts/review-gate/2026-10-07-phase20-m1-4-docs-theme-isolation.md`。

## 7. Review Gate 结论

- **R1（第 1 轮，`standard`）`Pass`**：0 blocker / 1 warning / 3 suggest。审计方独立复核：`playwright test --list` 主配置 **312 tests / 13 files**（两个文档站规格均被排除）、gallery 配置 **11 tests / 2 files**；选择器与 `md-editor-v3` 内核 DOM（`ul.md-editor-menu > li.md-editor-menu-item`）及 VitePress `vp-doc.css` 规则（`.vp-doc ul` 0-1-1、`.vp-doc li + li` 0-1-1）逐一取证；`check:planning-numbers` 0 命中；`check:governance-records` 129 记录 / 319 指针；零 `src/**` 改动。
- **实测用时**：派发 `2026-10-07T22:53:08+08:00`；返回时点未单独取戳，以返回后首个写入（规格 W1 修复）`2026-10-07T22:57:33+08:00` 为上界，**≈ 4 分 25 秒**（≤ 10 分钟时间盒，未超）。
- **同批收口（记「已修复未复审」）**：
  - **RG-W1**（`itemMarginTop` 取样首项恒过、对 `.vp-doc li + li` 无判别力）：改为取样**第二个**菜单项（`items[1]`）+ 新增「至少 2 个菜单项」前提守卫；补**单变量负向对照 ②** 证明判别力（§5）。
  - **RG-S1**（前置守卫措辞强于实际）：§2 / §4 收敛为「菜单移出正文则失去判别力」，并显式声明不封堵「VitePress 取消正文列表样式本身」。
  - **RG-S2**（多编辑器仅取首个未登记）：§4 补「首个编辑器实例」边界。
  - **RG-S3**（CI 步骤时间盒上界未实测）：保留非阻断（与同 job E2E 步骤同口径），不改。
- **未覆盖边界**（采信调用方证据）：审计方未复跑 `test:e2e:gallery` / `test:e2e` / `pnpm verify`、未在真实 Chromium 单变量实测（以源码取证判断后由调用方补做对照 ②）、未实测 CI 时长上界。
