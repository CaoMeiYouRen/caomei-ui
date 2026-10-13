# Phase 23 M1-2：视觉基线受检面扩面（视口 / 预设 / 日期 / 浮层形态轴）

> 创建时间：2026-10-13
> 阶段条目：Phase 23 M1-2（主线 M1 视觉基线收口）
> 前序：[Phase 22 M1-2 记录](./2026-10-12-phase22-m1-2-visual-baseline-first-ci-run.md) §4.3 的「受检面扩面」再评估触发；[M1-1 记录](./2026-10-13-phase23-m1-1-visual-font-path-expansion.md)（字体路径轴）

## 1. 结论摘要

- **交付**：视觉基线受检面在 M1-1 的 11 面（8 组件 + 3 字体路径）× 亮暗 = 22 张之上，新增**四条形态轴**各 1 个代表形态 × 亮暗 = **8 张新基线**（合计 **30 张**）：
  - **视口轴** `viewport-768-wrap-row`：`#ds-viewport-row`（宽 100% + 折行行）在 **768×800** 下的比例布局与折行；
  - **预设轴** `preset-momei-button`：`#ds-button-default` 在 **`data-preset="momei"`**（非缺省预设；缺省为 `minimal`）下的 token 路径；
  - **日期轴** `date-calendar-fixed`：`#calendar-inline` 在**固定时钟**（2026-01-15T09:30+08:00）下的日历网格与「今日」高亮；
  - **浮层轴** `overlay-dialog-open`：点击 `#dialog-open` 后的 `.caomei-dialog__content`（portal + 模态遮罩的合成路径）。
- **门槛（纳入判据，写入装置注释与本节）**：① 渲染结果**可确定化**（无实时日期 / 无随机 / 无网络；日期轴用 `page.clock.setFixedTime` 固定）；② 覆盖**既有面未覆盖的渲染路径**；③ **每批 ≤ 8 张新基线**。未纳入的形态见 §6。
- **判别力已自证**（两类对照，见 §3）：① 常驻结构性对照（`VISUAL_NEGATIVE_CONTROL=1`）**30 / 30 采样面失败**（注入样式覆盖三类目标：`.fixture__state` / `#calendar-inline` / `.caomei-dialog__content`，可从仓库直接复算）；② **逐轴定向对照**（四个轴各自的扰动同时注入）**8 / 8 形态轴面失败、22 / 22 既有面通过** → 每轴判别力成立且互不串扰。
- **过程中修正一处无判别力的轴设计**：视口轴初版取 `ds-button-default`（固定 15rem 宽、元素裁剪截图）→ 768 与 700 视口渲染**逐像素相同**（视口不影响该元素自身像素），对照不失败；改为**宽 100% + 折行行**并在用例内加**折行前置守卫**后转为失败（详见 §3.2）。

## 2. 受检面与装置变更

| 轴 | 基线名 | 目标元素 | 形态 | 覆盖的路径 |
|:---|:---|:---|:---|:---|
| 视口 | `viewport-768-wrap-row` | `#ds-viewport-row` | 768×800 | 视口比例布局（宽 100%）+ 折行 |
| 预设 | `preset-momei-button` | `#ds-button-default` | `data-preset="momei"` | 非缺省预设的 token 解析 |
| 日期 | `date-calendar-fixed` | `#calendar-inline` | 固定时钟 | 日历网格 + 「今日」高亮（时间相关渲染） |
| 浮层 | `overlay-dialog-open` | `.caomei-dialog__content` | 打开态 | portal + 模态遮罩合成 |

- 夹具：新增 `#visual-viewport` 段（`#ds-viewport-row`：12 个 3 字按钮 + 折行规则），追加在模板末尾；**其余三轴复用既有夹具段**（`#ds-button-default` / `#calendar-inline` / `#overlay-interaction` 的 `#dialog-open`），不新增 DOM。
- 装置：`test/visual/components.visual.ts` 新增 `FORM_AXIS_CASES`（4 项）+ `MIN_FORM_AXIS = 4` 下界 + `prepareFormAxis()`（按轴设置时钟 / 视口 / 预设 / 打开浮层）；常驻负向对照抽出 `NEGATIVE_CONTROL_CSS`（三类目标，见 §3.1），两处用例共用；既有 11 面 × 亮暗的用例与基线**零改动**。
- **附带（.gitignore）**：`*.tsbuildinfo`（`tsc -p tsconfig.node.json` 产生的本地增量构建信息）此前未被忽略，已加入 `.gitignore`；同时删除工作区中已生成的该文件。
- **基线 diff 纪律**：`test:visual:update` 后只出现 **8 个新增 PNG**，既有 22 张零改动（沿用 M1-1 纪律）。

## 3. 判别力（两类负向对照）

### 3.1 常驻结构性对照

`VISUAL_NEGATIVE_CONTROL=1 pnpm test:visual` → 注入 `NEGATIVE_CONTROL_CSS`（**三类目标各一条规则**）：

| 目标 | 规则 | 覆盖的面 |
|:---|:---|:---|
| `#app .fixture__state` | `padding: 24px` | 8 组件面 + 3 字体路径面 + 视口轴面 + 预设轴面 |
| `#calendar-inline` | `padding: 24px` | 日期轴面（该段是 `fixture__case`，**不含** `.fixture__state`） |
| `.caomei-dialog__content` | `padding: 0` | 浮层轴面（portal 挂 `document.body`，**在 `#app` 之外**） |

**实测：30 / 30 采样面失败 + 3 个守卫用例通过（exit 1）**。

- **修正记录（本批 Review Gate 判出的 blocker）**：初版常驻对照只注入 `.fixture__state` 一条规则，实测 **26 failed / 7 passed**（日期 / 浮层两轴面**不在** `#app .fixture__state` 内 → 不报差异），而记录却写成「30 / 30」——属**定量声明与装置不符**。处置：把常驻对照扩为三类目标（上表），复跑得 **30 / 30**，声明与装置一致且**可从仓库直接复算**（不再依赖 §3.2 的一次性扰动）。

### 3.2 逐轴定向对照（一次性；注入规则已移除，不可从仓库直接复算）

一次性把四个轴**各自**的扰动同时注入（扰动按轴作用域隔离，故失败可逐轴归因）：

| 轴 | 扰动 | 期望 | 实测 |
|:---|:---|:---|:---|
| 视口 | `NARROW_VIEWPORT` 768 → **700** | 该面失败 | ✘（light / dark） |
| 预设 | `NON_DEFAULT_PRESET` `momei` → **`caomei`** | 该面失败 | ✘（light / dark） |
| 日期 | `FIXED_CLOCK` 2026-01-15 → **2026-01-16** | 该面失败 | ✘（light / dark） |
| 浮层 | 注入 `.caomei-dialog__content { padding: 0 }` | 该面失败 | ✘（light / dark） |

**结果：8 failed / 25 passed**（失败面恰为 4 轴 × 亮暗；22 个既有面 + 3 个守卫全部通过）→ 每轴判别力成立、互不串扰。取证后移除扰动并复跑 **33 passed（0 差异）**，`git diff` 复核仅剩本条目预期改动。

### 3.3 无判别力设计的修正（视口轴）

- 初版视口轴取 `#ds-button-default`（`.fixture__state` 固定 `15rem` 宽），对照把视口 768 → 700 后**该面仍通过**：元素裁剪截图的像素只取决于元素自身几何，视口宽度不改变它 → **该面对视口轴无判别力**（「基线稳定」不等于「面有判别力」）。
- 修正：改为**宽 100% + 折行行**（`#ds-viewport-row`，12 个 3 字按钮的自然宽介于 768 与 1280 可用宽之间），并在用例内加**折行前置守卫**——`#ds-viewport-row > *` 的 `getBoundingClientRect().top` 去重后须 **≥ 2 行**，否则该面同样无判别力（夹具一变即静默恒过）。
- 复验：同一 700 视口扰动下该面转为失败（§3.2）。

## 4. V 阶段取证（2026-10-13）

- 装置口径沿用 M1-2 前序记录：固定环境（chromium / DPR 1 / `zh-CN` / `Asia/Shanghai` / `reducedMotion: reduce`）+ 双轴容差（`threshold: 0.1` / `maxDiffPixels: 100`）+ 串行 `workers: 1` / `retries: 0`。
- **日期轴确定化**：`page.clock.setFixedTime('2026-01-15T09:30:00+08:00')`（Playwright 时钟 API 在导航前安装，页面内 `Date` 与「今日」派生值随之固定）；判别力由 §3.2 的「+1 天」扰动证明（该面确实渲染了固定日期，而非恒定的空网格）。
- **视口轴前置守卫**：768 下 `#ds-viewport-row` 子元素 `top` 去重 ≥ 2 行（实测通过）；1280（主视口）下为单行——该差异即基线内容。
- 渲染侧无视觉通道，全部为机检 / 定量证据（与 M1-2 前序同口径）。

## 5. 载体同步

- `docs/standards/testing.md` §2.1：受检面构成句由「8 组件面 + 3 字体路径面」更新为**「+ 4 条形态轴面」**（视口 / 预设 / 日期 / 浮层），并登记「形态轴面须带可确定化前置（固定时钟 / 固定视口 / 固定预设）与折行类前置守卫」。
- `docs/plan/todo-archive.md`：M1-2 状态回填（与本节 Review Gate 结论同批）。
- `docs/design/governance/index.md`：本记录登记。
- `test/visual/__screenshots__/components.visual.ts/`：**新增 8 张冻结基线**随仓库提交。
- Backlog：无新增行（「视觉基线受检面扩面」已随 Phase 23 登记迁出，由 M1-1 / M1-2 承载；未纳入形态见 §6 的触发条件，作为本记录内的登记项）。

## 6. 未覆盖边界（显式登记 + 触发条件）

1. **其余视口**（390 移动端 / 1024 / 1440）：触发条件 = 下游报告窄屏布局类回归，或响应式规范矩阵新增档位。
2. **`caomei` 预设**：本轮预设轴取 `momei`（非缺省）作代表；触发条件 = 预设 token 变更批次（届时按同一形态补面并重冻结）。
3. **日期 / 浮层组件的其余形态**：DatePicker **面板**（含时间选择）、Popover / DropdownMenu 面板、Drawer、Toast —— 触发条件 = 上述组件的渲染路径发生变更，或下游报告相关回归。
4. **`system-ui` / `-apple-system` 的具体族解析**：CDP 只报最终命中字体，跨 OS 差异属环境变量（M1-1 §8 同口径）。
5. **字体缺失场景**（移除拉丁 / CJK 字体后的回退）：属环境构造，未纳入常驻面。

## 7. 质量门

- `pnpm verify` **exit 0**（117 文件 / 2301 例）。
- `pnpm test:visual` **33 passed**（22 既有面 + 8 形态轴面 + 3 守卫；0 差异）；`pnpm test:visual:update` 生成 8 张新基线。
- `pnpm test:e2e` **318 passed**（夹具新增段未破坏既有 E2E）。
- `pnpm check:planning-numbers` **0 命中**（本轮首次跑被拦下 2 处：装置注释写了阶段条目编号 → 改为文档路径导航指针后通过）。
- `pnpm lint:md:check` / `pnpm governance:check` exit 0。
- 零 `src/**` 改动（只动夹具 / 视觉装置 / 基线 / 文档）。

## 8. Review Gate

- audit-depth：`standard`（测试装置 + 共享夹具 + 8 张冻结基线）。时间盒：≤ 10 分钟。

### 8.1 结论（2026-10-13）

- **R1 `standard` `Reject`**（**1 blocker / 2 suggest**；实测约 **6 分 03 秒**，未超时间盒）：F1 = 记录称常驻对照「30 / 30 失败」而装置只覆盖 `.fixture__state`（实测 **26 failed / 7 passed**，日期 / 浮层两轴面不在其内）——**定量声明与装置不符**；F2 = 逐轴定向对照不可从仓库复算；F3 = `tsconfig.node.tsbuildinfo` 未忽略。
- **处置（同批收口）**：F1 采「**扩展装置使声明为真**」而非改数——常驻对照抽出 `NEGATIVE_CONTROL_CSS`，三类目标各一条规则（`.fixture__state` / `#calendar-inline` / `.caomei-dialog__content`），复跑 **30 failed / 3 passed**；F2 因之闭合（日期 / 浮层两轴判别力现由常驻对照覆盖且**可从仓库复算**，一次性对照降为「互不串扰」的补充证据）；F3 已加 `.gitignore` 的 `*.tsbuildinfo` 并删除工作区文件。
- **R2 `standard` `Pass`**（**0 blocker / 0 warning / 0 suggest**；R1 三项全闭合；实测约 2 分 54 秒）：审计方独立复跑 `VISUAL_NEGATIVE_CONTROL=1` → 30 failed / 3 passed、常规 `pnpm test:visual` → 33 passed / 0 差异；核对记录 §1 / §3.1 / 索引三处数字与装置一致；`git check-ignore` 命中新规则。
- 审计工件：`artifacts/review-gate/2026-10-13-phase23-m1-2-visual-form-axis-expansion.md`（本地态、gitignored）。
