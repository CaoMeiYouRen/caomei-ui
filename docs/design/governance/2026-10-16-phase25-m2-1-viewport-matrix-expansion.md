# Phase 25 M2-1：视口矩阵扩面与形态口径收敛

> 阶段 / 条目：Phase 25 M2-1（移动端与响应式优化——移动端形态口径收敛 + 视口矩阵扩面）。
> 验收口径依据：[Phase 25 登记批次记录](./2026-10-16-phase25-registration.md) §2；单一事实源 = [响应式设计](../../design/responsive.md)。
> 用户决策（2026-10-16）：① 扩面形态取 **320px + 900px 两个定向档**（原 390 / 768 / 1280 三档保持全量）；② `gap-900` 档暴露的 ButtonGroup 空档取**实现补齐到 ≤1024px**（而非改口径或改夹具）。

## 1. 背景与触发

Phase 25 M2-1 要求「移动端形态口径收敛 + 视口矩阵扩面（**设受检面下界，不做全矩阵**）」。原矩阵为 3 档（mobile 390×844 / tablet 768×1024 / desktop 1280×800），存在两处覆盖缺口：

- **档内内部点无覆盖**：窄档只在断点**端点**（640 / 768 / 1024）被驱动，`responsive.e2e.ts` 的栅格断点表按 `setViewportSize` 逐档比较，端点之外的宽度（如 320 / 900）无断言——「按精确宽度或反向方向（`min-width`）误写」的规则不会在该表上失败；
- **§2 明示的「769–1023px 无档可用」区间无验收**：该区间维持桌面形态，但从未有档位实际驱动该宽度。

同时 M2-1 的「形态口径收敛」在扩面取证中暴露一处**口径 ↔ 实现不一致**：矩阵 #7 的「平板（641–1023）」列承诺 ButtonGroup / SplitButton「组内横向滚动」，而实现按 md 档（`@media (width <= 768px)`）收敛 ⇒ 769–1023px 实为空档（见 §2.2）。

## 2. 交付内容

### 2.1 矩阵扩面（两个定向档）

- `playwright.config.ts`：新增 `mobile-320`（设备 `Galaxy S9+`、viewport 320×568）与 `gap-900`（设备 `Galaxy Tab S4`、viewport 900×1024）；两者带 `only: 'responsive'` ⇒ `testMatch` 收窄到 `responsive.e2e.ts`，**只放大响应式用例、不放大其余 E2E 用例**（全量档仍为 3 条）。
- **设备描述符口径**：手机 / 平板形态描述符 + viewport 覆盖（沿用 3 档既有做法，UA / 触摸 / DPR 与形态一致）。**首跑教训**：`iPhone SE` 描述符自带 `defaultBrowserType: webkit`，用其作 `use` 会把该 project 的浏览器切到未安装的 WebKit（首跑 19 例全部 `browserType.launch` 失败）⇒ 改用 Android 手机描述符 `Galaxy S9+`（`chromium`），与既有 mobile 档（Pixel 5）同族。
- **配置侧单点定义 + 装置侧漂移守卫**：矩阵视口在 `playwright.config.ts` 收敛为 `MATRIX_VIEWPORTS`（展开为 `PROJECTS`）；装置侧**不跨项目 import**（composite 的 `tsconfig.node.json` 会触发 TS6305），改为新增「**矩阵档口径**」用例——运行时读回 `test.info().config.projects`，对账两个扩面档的档名 / 视口宽度与全量档名单，使「手写重复」变成机检失败而非静默漂移。
- **自驱视口探针的承载口径**：用例内 `setViewportSize` 到 200px 宽 / 420px 高 的两个探针**只随全量档运行**（`FULL_MATRIX_PROJECTS`）——其视口由用例自身设定、不随矩阵档变化，重复承载只会引入 DPR 取整的刀刃差异（该用例注释本已声明「刀刃敏感」，实测在 `Galaxy S9+` 的 DPR 4.5 下出现 `239.0000038 ≥ 239` 的并列读数）。

### 2.2 形态口径收敛：ButtonGroup / SplitButton 收敛档 md → lg（≤1024px）

- **取证**（900px 档首跑）：`section#scroll-button-group` 容器 `clientWidth=852` / `scrollWidth=967` 且 `overflow-x: visible` ⇒ 末位成员 `right=991` ⇒ **页面横向溢出 991 > 900**。连带：移动仿真下页面溢出使 `window.innerWidth` 外扩为 991，同 spec 的「日历可用宽 / 高上限探针」失去判别力、`Dialog.breakpoints` 读到「视口 991」。
- **归因**：`src/components/button-group/button-group.vue` 的 `max-width: 100%` + `overflow: auto hidden` 位于 md 档（≤768px）；769–1023px 无档 ⇒ 桌面形态（单行、`overflow: visible`）⇒ 成员越出容器并撑宽页面。按[响应式设计 §1](../../design/responsive.md)，「多成员布局的换行或滚动」属**库内职责**，故矩阵 #7 平板列的承诺才是期望形态。
- **处置（用户裁定）**：收敛档改为 lg 档 `@media (width <= 1024px)`（1024 在 §2 字面量白名单内），按 §2「如需覆盖须显式登记理由」在 §2 与矩阵 #7 登记；**桌面（>1024px）契约不变**（`inline-flex` 单行、不滚动）。
- **实现-装置对齐**：`responsive.e2e.ts` 的 `ScrollCase` 新增 `convergeAt`（= 该容器实现的收敛档上限），原按全局 `MD_BREAKPOINT` 判定「窄屏/桌面」的 `isNarrowViewport` 改为 `isWithinConverge(case.convergeAt)`——**装置不再硬编码「窄屏 = ≤768」，而是跟随每个容器的收敛档**。

### 2.3 受检面下界

`responsive.e2e.ts` 新增 `MIN_SECTIONS`（§4 断言 1 的 section 清单下界）：取值为**当前受检面长度本身（贴身下界）**，语义只覆盖「清单被整体删项 / 解析失效 ⇒ 循环跑 0 次仍变绿」这一类静默收窄，不追求余量；配合逐 section 的「存在且唯一」断言，补上「夹具 section 被移除」方向。

### 2.4 栅格断点表的档内内部点

`GRID_BREAKPOINT_EXPECTATIONS` 增补 **900**（断言 769–1023 空档仍取 lg 档取值）与 **320**（断言 sm 档内部点取值与 640px 一致）两行——两值均与 `playwright.config.ts` 的定向档一致（`GAP_900_WIDTH` / `NARROW_320_WIDTH`，单一事实源式引用）。

### 2.5 夹具自身溢出源修复

320px 档首跑报「页面横向溢出 344 > 320」，探针（排除被祖先滚动容器吸收的溢出后）定位到**夹具自身**：`test/e2e/fixtures/app.vue` 的 `#alert-contrast` 用 `repeat(auto-fit, minmax(20rem, 1fr))`，20rem = 320px 宽于该档下 section 的 272px 内宽 ⇒ 网格轨道被撑开。**组件侧无此问题**（`CaomeiMessage` 实测 min-content 远小于可用宽）。处置 = 轨道最小宽写 `min(20rem, 100%)`（与夹具既有约定一致：避免夹具自身成为页面溢出的来源）。**该修复对 3 个全量档几何零变化**（320 < 各档可用宽 ⇒ `min()` 取 20rem）。

## 3. 实测证据与判别力

### 3.1 首跑失败的取证链（每步均为实测）

| # | 现象 | 取证 | 处置 |
|:-:|:---|:---|:---|
| 1 | `mobile-320` 19 例全部 `browserType.launch` 失败 | 描述符自带 `defaultBrowserType: webkit` | 描述符改 `Galaxy S9+`（chromium） |
| 2 | `gap-900` 5 例失败（页面溢出 991 / 探针失去判别力 / 视口读数 991） | 探针按「排除被祖先滚动容器吸收的溢出」定位到 `#scroll-button-group` | §2.2 档改 ≤1024 |
| 3 | `mobile-320` 5 例失败（页面溢出 344） | 探针定位到夹具 `#alert-contrast` 轨道最小宽 | §2.5 夹具修复 |
| 4 | 2 例失败（**极矮探针并列读数** / **键盘前置状态不可构造**） | 前者 = 定向档设备描述符 `Galaxy S9+` 的 DPR 4.5 取整刀刃（`mobile-320` 档）；后者 = `gap-900` 档可滚动量 115px < 首个成员宽 150px（探针同批实测；320 档几何上可构造） | §2.1 探针限全量档 + 键盘用例按「严格分支几何可构造性」分档 |

### 3.2 负向对照（判别力自证）

- **收窄档位回落**：把 `button-group.vue` 的档临时改回 `(width <= 768px)` ⇒ `gap-900` 档 **4 例失败**（页面横向溢出 + `ButtonGroup` / `SplitButton` 成员不被裁切 + `Dialog.breakpoints` 视口读数），失败面与 §3.1#2 同源；还原 ⇒ 该档全绿。**结论：新增的 900 档对「空档 = 桌面形态」这一口径具有判别力**。
- **受检面下界**：断言为「清单长度 ≥ 下界 + 逐 section 存在且唯一」的直接实现，无静默路径。

### 3.3 全量回归与 flaky 处置

- 全量 `pnpm test:e2e`：**5 档合计 407 例**（3 全量档 × 123 例 + 2 定向档 × 19 例）；定向档单独复跑 = 34 passed / 4 skipped（自驱探针按 §2.1 口径跳过）。
- **1 例失败为已知并行负载 flaky 类**（`menu-navigation.e2e.ts` 的 Escape 收起子菜单，`tablet` 档）：隔离复跑 8 passed、`--repeat-each=3` 24 passed；该档环境未变、夹具修复在 3 个全量档下几何零变化 ⇒ **非本批引入**，按既有口径登记、不据此改门禁。

## 4. 载体同步

| 载体 | 动作 |
|:---|:---|
| `docs/design/responsive.md` | 文首新增 **2026-10-16 更新**句；§2 新增「档位选择与更宽覆盖档的登记方式」（含 ButtonGroup / SplitButton 登记）；§3 矩阵 #7 平板 / 桌面列口径精确化 + 现状行行号更新；§4 视口表（3 全量 + 2 定向）、矩阵档三项口径、自驱探针承载口径、受检面下界 |
| `docs/standards/testing.md` | §2.1 E2E 夹具段：删去「三个 project」的复述、改指响应式设计 §4 为单一事实源 |
| `playwright.config.ts` | 两个定向档 + `only` 字段 + 注释（矩阵口径 / 成本口径 / 设备描述符约定） |
| `test/e2e/responsive.e2e.ts` | `convergeAt` / `isWithinConverge` / `MIN_SECTIONS` / 栅格内部点两行 / 探针承载口径 / 键盘用例几何可构造性分档 / 「矩阵档口径」漂移守卫用例 |
| `test/e2e/fixtures/app.vue` | `#alert-contrast` 轨道最小宽 `min(20rem, 100%)` |
| `src/components/button-group/button-group.vue` | 收敛档 md → lg（≤1024px）+ 理由注释（指向 §2 / §3 #7） |
| `docs/plan/todo.md` | M2-1 完成态（与 Review Gate 结论同批） |
| `docs/plan/backlog.md` | 新增「Toolbar 769–1023 空档」候选行（§1.5；与 ButtonGroup 同源的 md 档空档，本批未致溢出故不改档位，见 §8） |
| `docs/design/governance/index.md` | 本记录索引条目 |

## 5. 影响面与未覆盖边界

- **行为变更面**：仅 **769–1023px** 区间的 ButtonGroup / SplitButton——由「成员越出容器并撑宽页面」变为「组内横向滚动可达」；桌面（>1024px）与 3 个全量档行为不变。无 API / props / 导出变更。
- **回归读数**（本批终态 revision 实跑）：`capture:styles` **0 差异**（313 项逐属性与冻结基线一致，采样视口 1280×800 > 1024 ⇒ 不受档位变更影响）；`test:visual` exit 0（16 张基线，1280×800）；`test:a11y` exit 0。
- **未覆盖边界**：① 不做全矩阵（未新增 320–640 / 641–768 / 1024–1279 之间的其它内部点）；② 不定向档不改动 `test/e2e/**` 其余 17 个 spec 的承载（仍只跑 3 个全量档）；③ 右侧（RTL）与容器查询不在本批；④ 触摸目标复核属 M2-2、移动端使用指南页属 M2-3。
- **下游影响**：769–1023px（平板横屏 / 小笔记本）下 ButtonGroup 的溢出改为滚动，属**修复型变更**；若下游曾以「溢出可见」为观感依赖，需在下一 minor 版本的 CHANGELOG 记一行（随 M4-1 发布收口处理）。

## 6. 质量门

- `pnpm test:e2e` exit 0（5 档；唯一失败例为已知并行负载 flaky 类，隔离复跑全绿）；
- `pnpm capture:styles` exit 0（0 差异）、`pnpm test:visual` exit 0、`pnpm test:a11y` exit 0；
- `pnpm verify`（lint / typecheck / 单测 / build / check:* / docs:check 整链）exit 0；
- `pnpm docs:check` / `pnpm governance:check` exit 0。

## 7. Review Gate

**R1（`standard`，单分区）**：**`Pass`**（0 blocker / 1 warning / 4 suggest）。**实测用时 4 分 3 秒**（宿主计时：发起 `13:39:24`，返回后计时 `13:43:27`），未超 10 分钟时间盒。五条 findings **全部同批收口**：

- **RG-W01**（warning，首次）：矩阵 #7 桌面列新写的「Toolbar 换行（md 档）」不精确——md 档（≤768）在桌面（≥1024）不命中，Toolbar 实为单行；平板列「Toolbar 同手机（md 档 ≤768px）」在 769–1023 子区间同样不成立。**处置**：三列逐档精确化（Toolbar 在 ≤768 子区间换行、**769–1023 维持单行且不设容器约束**；ButtonGroup / SplitButton 走 lg 档含该子区间），并把 Toolbar 的**同源空档**登记为 [Backlog §1.5](../../plan/backlog.md) 候选（本批未致溢出，故不改其档位）。
- **RG-S01**（suggest，首次）：§2.3 称 `MIN_SECTIONS` 为「同数量级保守值」，实为**贴身下界**（= 当前受检面长度）。**处置**：§2.3 改为「贴身下界 + 语义只覆盖静默收窄一类（配合逐 section 存在性断言）」。
- **RG-S02**（suggest，首次）：§3.1 行 4 把两例失败笼统归到 `mobile-320`，而「键盘前置状态不可构造」的成因（可滚动量 115 < 首个成员宽 150）属 `gap-900` 档。**处置**：行 4 逐例标明归属（探针并列读数 → 定向档 DPR 4.5；键盘前置 → `gap-900`）。
- **RG-S03**（suggest，首次）：`NARROW_320_WIDTH` / `GAP_900_WIDTH` / `FULL_MATRIX_PROJECTS` 与 `playwright.config.ts` 为**手写重复字面量**（注释称「单一事实源式引用」实为复制），漂移无门禁可拦。**处置**：`playwright.config.ts` 侧把矩阵视口收敛为单点定义（`MATRIX_VIEWPORTS` → 展开为 `PROJECTS`），装置侧**不跨项目 import**（首次尝试 import `playwright.config.ts` 触发 composite 项目的 **TS6305**，`verify` 判红）改为新增「**矩阵档口径**」用例：运行时读回 `test.info().config.projects`，对账扩面档的档名 / 视口宽度与全量档名单——漂移自此由**用例**拦截。
- **RG-S04**（suggest，首次）：§4 载体同步表未列 `docs/design/governance/index.md`。**处置**：表内补该行（并同步补 Backlog 行）。

**R2（delta，`quick`）**：**`Pass`**（0 blocker / 0 warning / 3 suggest；修复点闭合 **5/5 + 1 项收口新增**；**实测用时 3 分 52 秒**——宿主计时：发起 `14:09:49`，返回后计时 `14:13:41`，未超 5 分钟时间盒）。三条 suggest 均**同批收口**：

- **RG-S05**：矩阵 #7 桌面列头「≥1024」与单元格「（>1024px）」在**恰好 1024px** 处冲突（该点实现上命中 lg 档 ⇒ 滚动）。**处置**：单元格显式写明「>1024px；**恰好 1024px 命中 lg 档 ⇒ 组内滚动**」。
- **RG-S06**：漂移守卫盲区——删除定向档 `only: 'responsive'` 不被对账；且配置导出的 `FULL_MATRIX_PROJECT_NAMES` 为**死导出**。**处置**：守卫扩到**承载面**（对两个定向档断言 `testMatch === '**/responsive.e2e.ts'`，删 `only` 即失败）+ 删除死导出。
- **RG-S01 残留措辞**：装置侧 `MIN_SECTIONS` 注释仍写「同数量级保守值 / 不追求贴身」，与「贴身下界」矛盾。**处置**：注释改为「当前受检面长度本身（贴身下界）+ 清单扩项须同步上调」。

> 三条 suggest 收口落地后，另做一次**工件刷新补充确认**（`quick`，只核验「R2 之后的三处修复」与终态门禁读数是否成立）——其结论与核验面以审计工件为准，本记录不复述。

**R2 的独立实证（审计方复跑）**：守卫**非恒真**——正常配置下 `gap-900 --grep 矩阵档口径` = 1 passed；在隔离副本把 `gap-900` 视口改为 **901** ⇒ 1 failed（`Expected 900 / Received 901`）；`--list` 计数（mobile / tablet / desktop 各 124、两定向档各 20）与全量读数自洽。

**放行后同批落盘**：本段 + §4 补行 + `docs/plan/todo.md` 的 M2-1 完成态；随后复跑受影响门禁（`pnpm verify` / `pnpm test:e2e` 定向档 / `pnpm docs:check` / `pnpm governance:check`）。**收口过程中另拦下 2 次**：① RG-S03 的首次处置（跨项目 import 配置）被 `pnpm typecheck` 判 **TS6305** ⇒ 改为运行时对账的「矩阵档口径」用例后 `typecheck` exit 0；② 本记录两处 `[Backlog §1.5](../plan/backlog.md)` **相对链接少一级**（治理目录应为 `../../plan/`）被 `check-links.test.mjs` 的「仓库现状无跨根链接」用例判红（与同日 CI 红的缺陷 A 同类）⇒ 修正后 `check:links` exit 0。

**审计工件**：`artifacts/review-gate/2026-10-16-phase25-m2-1-viewport-matrix-expansion.md`（本地态、git-ignored）。

**未覆盖边界**（R1 时间盒内）：未独立复跑 3 全量档与负向对照（需改动被审产物）；未复跑 `capture:styles` / `test:visual` / `test:a11y` / `verify`（沿用调用方同 revision 读数）；未复现 tablet flaky 归因；未逐 spec 核其余 17 个 spec 的承载。

**复查基线**：`responsive.md`（文首更新句 / §2 登记段 / §3 #7 / §4 视口表）、`testing.md §2.1`、`playwright.config.ts`（`MATRIX_VIEWPORTS` / `PROJECTS` / `only`）、`button-group.vue:59-88`、`responsive.e2e.ts`（`convergeAt` / `MIN_SECTIONS` / 探针 skip / 键盘分档）、`fixtures/app.vue` 的 `#alert-contrast`、本记录 §3.1 / §3.2 / §4 / §8、`docs/plan/todo.md` 的 M2-1 行。

## 8. 已知观察与 follow-up

- **夹具位置敏感用例的既有约定**：新增受检面须追加在模板末尾（`#alert-contrast` / `#chart` 的既有注释），本批只改 `#alert-contrast` 的轨道最小宽、未改动 section 顺序与数量。
- **follow-up（不占条目）**：① 定向档目前只承载响应式 spec；若后续出现「只在某档复现」的缺陷类，再评估把该 spec 的定向承载扩到相关 spec；② 「§2 更宽覆盖档」的登记方式已入 §2——**Toolbar 的 769–1023px 空档属同源缺口**（换行与 `max-width: 100%` 均在 `@media (width <= 768px)` 内），本批夹具内容在该区间可容、未致溢出，故**不改其档位**，已按发现即登记的口径写入 [Backlog §1.5](../../plan/backlog.md)（触发条件 = 出现真实溢出用例或用户裁定同档位补齐）；③ 自驱探针的 DPR 刀刃敏感属装置固有，若后续要在多档承载，须先把探针几何由硬编码改为按内容高派生。
