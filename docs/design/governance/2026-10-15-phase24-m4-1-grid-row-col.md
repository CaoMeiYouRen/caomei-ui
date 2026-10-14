# Phase 24 M4-1：栅格与布局族（`CaomeiRow` / `CaomeiCol`）

> 创建时间：2026-10-15
> 阶段条目：Phase 24 M4-1（主线 M4 组件缺口补齐）
> 范围依据：[Phase 24 范围扩展评估](./2026-10-13-phase24-scope-extension-evaluation.md) §10.1 **D2**（组件缺口补齐取 **P0 + P1 四项**）与 §10.2 登记；P0① 依据 = 活跃仓 `rss-impact-web` 内栅格族为第一高频（`el-row` 7 / `el-col` 15，合计 22 次，超过第二名 `el-icon` 15），且三仓 `@media` 用量均为 0（响应式由所用 UI 库的栅格体系承载）。
> 边界声明：本条目**零新增依赖**（纯 CSS Grid）；**零破坏性变更**（新增组件族，不改既有组件的 props / 事件 / 插槽）。

## 1. 结论摘要

新增 `CaomeiRow` / `CaomeiCol` 栅格族（24 栏，CSS Grid 实现），补齐下游响应式排版的地基：

| 面 | 结论 |
|:---|:---|
| 组件与 API | 两个组件 + 类型 + 导出齐备；`gutter` / `align` / `span` / `offset` / `order` / 断点 `sm` / `md` / `lg` 落地（§2） |
| 实现形态 | 行 = 24 条等宽轨道的 grid 容器，`gutter` 走 `gap`；列 = `grid-column` + `order` 由 CSS 变量驱动，三条 `@media` 按宽→窄源序覆盖（§3） |
| 注册面 | §11 登记表 / §5 组件清单 / 中英侧栏 / 中英总览页 / 画廊登记表 / Nuxt 组件清单六处同步（§4） |
| 验证与判别力 | 单测 + a11y 夹具 + 计算样式采样面（含**两条负向对照**）+ 构建产物三项冒烟（§5） |
| 载体同步 | 文档站分区表、组件设计清单、响应式设计文档一处**口径更正**（见 §6 第 3 项） |

## 2. 组件与 API

### 2.1 `CaomeiRow`（`src/components/row/`）

| Prop | 类型 | 默认 | 说明 |
|:---|:---|:---|:---|
| `gutter` | `number \| [number, number]` | — | 单值 = 横向间距；元组 = `[横向, 纵向]` |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline'` | `'stretch'` | 交叉轴对齐，映射 CSS `align-items` |
| `as` | `string` | `'div'` | 根元素标签 |

### 2.2 `CaomeiCol`（`src/components/col/`）

| Prop | 类型 | 默认 | 说明 |
|:---|:---|:---|:---|
| `span` | `number` | `24` | 默认（最宽视口）占列数 |
| `offset` | `number` | `0` | 左侧偏移列数 |
| `order` | `number` | `0` | 视觉次序，映射 CSS `order` |
| `sm` / `md` / `lg` | `number \| { span, offset, order }` | — | 视口上限 640 / 768 / 1024px 时的覆盖配置 |
| `as` | `string` | `'div'` | 根元素标签 |

- **有意不暴露 `justify`**：24 栏等宽轨道恒铺满容器，`justify-content` 无实际效果，暴露会造出「设了不生效」的骗人 prop（对照表见组件页）。
- **断点语义**：`width <=` 上限、桌面优先、窄档覆盖宽档三点与[响应式设计 §2](../../design/responsive.md) 一致；**档位命名方向须显式区分**——本组件的 `lg` 是「≤1024px 的**覆盖档**」，而 §2 上表的 `lg` 是「≥1024px 的**默认形态**」，两者绑定同一数值的不同方向（「未传断点 = 桌面取值」正对应上表 lg 档）。该消费侧断点 props 例外已于本批登记进 §2 与 §1 非目标例外清单（与 `Dialog.breakpoints` 同档）。
- **断点对象不做逐档级联**：对象只声明要覆盖的字段，其余字段回退到**基础档（最宽视口）取值**；`span` 有效范围 1–24 亦写入类型 JSDoc 与组件页。

## 3. 实现要点

1. **行**：`grid-template-columns: repeat(24, minmax(0, 1fr))`；`gutter` 走 `gap`（`gap: <row> <column>`）——间距只出现在相邻项之间，无需 Element Plus 的负外边距补偿。
2. **列**：`grid-column: calc(var(--caomei-col-offset, 0) + 1) / span var(--caomei-col-span, 24)` 与 `order`；`Sm` / `md` / `lg` 变量由实例内联 style 写入。
3. **断点源序**：三条媒体查询按 `1024 → 768 → 640` 书写——窄视口同时命中时靠源序让**最窄档最终生效**，无需 `min-width`。
4. **样式约束合规**：基类只消费带默认回退值的覆盖钩子（不声明默认值）；变体选择器用 `:where()` 归零特异性；无原始色值 / 无数字 `z-index`（`check:design` / `check:class-prefix` 通过）。
5. **`minmax(0, 1fr)`**：防长内容撑破轨道（与 `min-width: 0` 同向）。
6. **横向间距的容器约束（有意取舍）**：`gap` 不参与收缩，故**横向间距总宽 `23 × gutter` 必须小于容器宽**，否则栅格会撑出横向溢出。**刻意不做 CSS 侧收敛**：`min(gutter, 100%/24)` 使 `column-gap` 在计算样式里保持**百分比形态**（`getComputedStyle` 不解析为 px），会破坏 `capture:styles` 的逐属性基线，而该装置在周级 CI 中是**阻断**步骤；容器查询（`cqw`）属[响应式设计 §1](../../design/responsive.md) 明列非目标。替代方案（Element Plus 的「列内边距 + 行负外边距」）以**牺牲外边距对齐 / 依赖父容器内边距**为代价，本批不采用。约束已写入类型 JSDoc、组件页与夹具注释。

## 4. 注册面同步（六处）

| 面 | 载体 |
|:---|:---|
| 组件分区单一事实源 | `docs/design/documentation-site.md` §11 表「基础与布局」追加 `Col` / `Row` |
| 组件设计清单 | `docs/design/components.md` §5 追加 `Row / Col` 行（自建，标「已实现」） |
| 中英侧栏 | `docs/.vitepress/config.ts` 两处 sidebar（组内英文名字母序：Card → Col → Divider；Image → Row → SplitButton） |
| 中英总览页 | `docs/components/index.md`、`docs/i18n/en-US/components/index.md` |
| 画廊登记表 | `docs/.vitepress/showcase-registry.json` 追加 `Row`（组内字母序 Card → Row → Tag） |
| Nuxt / 包导出 | `src/nuxt/components.ts`（`CaomeiCol` / `CaomeiRow`）+ 根 barrel `src/index.ts` 汇总导出 |

> resolver 为**前缀式通用解析**，无需逐组件登记；`src/nuxt/components.test.ts` 对源码导出做零漂移校验。

## 5. 验证与判别力

- **单测**：`src/components/row/row.test.ts` / `col/col.test.ts`（默认形态 / 变量写入 / 断点归一 / 插槽 / `as` / attrs 合并）。
- **a11y 夹具**：`test/a11y/fixtures.ts` 追加 `CaomeiRow` / `CaomeiCol` 两个单元，夹具预算常量 `A11Y_FIXTURE_BUDGET` 随增量（+2）同步上调；`pnpm test:a11y` 通过。
- **计算样式采样面**：`test/capture/fixture/app.vue` 新增 `grid:basic` / `grid:tracks` 两个 `data-cap` 用例；`test/capture/capture.mjs` 新增 5 个采样键（`grid.row` / `grid.col.first` / `grid.col.offset` / `grid.col.order` / `grid.tracks`），采样面预算常量 `DECLARED_KEY_BUDGET` 随增量（+5）同步上调；基线**重冻结**，复跑**零差异**。
  - **保守取面**：`grid-template-columns` 单列一档（无 gutter + 定宽 480px → 24 × 20px 整数轨道），**规避百分比派生亚像素的跨版本 flaky**；带 gutter 形态另测 `column-gap` / `row-gap`（精确 px）。
- **负向对照（判别力自证，两条，隔离执行）**：
  1. 夹具 `:gutter="[16, 8]"` → `[20, 8]` ⇒ `capture:styles` 报 `grid.row | column-gap | 基线=16px | 当前=20px`（**1 处差异**）；
  2. 夹具 `:offset="4"` → `0` ⇒ 报 `grid.col.offset | grid-column-start | 基线=5 | 当前=1`（**1 处差异**）。
  - 两处均**还原后复跑零差异**，证明采样面对 gutter 与 offset 具备判别力、非空转。
- **构建产物冒烟**：`pnpm build` + `check:build`（exports 产物齐全 / 入口可加载）+ `check:resolver`（按需样式与基础层各一份）+ `check:nuxt`（Nuxt 4 自动导入 / 样式注入 / SSR）**均通过**。
- **窄视口运行侧验证（浏览器）**：`test/e2e/responsive.e2e.ts` 新增「栅格断点：窄档覆盖宽档」用例——夹具 `#grid-breakpoint` 两列按 `span` + `lg` / `md` / `sm` 声明，用例以 `setViewportSize` **由宽到窄**逐档（1280 / 1024 / 768 / 640）读计算样式 `grid-column-start` / `grid-column-end` / `order`，证明取值随断点被**覆盖**且**最窄档最终生效**；其中 `md` 档断言列 B 的 `order` 回到基础值 `0`（而非沿用 `lg` 的 `2`），锁死「不做逐档级联」契约。`#grid-breakpoint` 同批纳入 §4 断言 1 的容器清单（无横向溢出）。
  - **首跑暴露的夹具约束（已按设计取舍处置）**：夹具初版取 `gutter="[16, 8]"`，移动端档（390px 视口 / 页面内边距 16px ⇒ 容器 358px）下 `23 × 16 = 368 > 358` ⇒ **页面横向溢出**，并连带击穿同 spec 的 3 条视口敏感断言（`极窄视口` 探针 / `Dialog.breakpoints` 面板宽 / 页面无溢出）。根因是 §3.6 声明的容器约束（`gap` 不收缩）而非组件缺陷；夹具 gutter 改为 8（`23 × 8 = 184 < 358`）后**全 spec 通过**。该约束的 CSS 侧收敛已评估并**有意不采用**（理由见 §3.6）。
- **文档守卫**：`docs:check`（含侧栏不变式 / 总览页对账 / 画廊登记表 / 示例引用 / 中英对账）全绿。

## 6. 载体同步

1. **新增载体**：`src/components/row/**`、`src/components/col/**`、`docs/components/{row,col}.md`、`docs/i18n/en-US/components/{row,col}.md`、`docs/examples/{row,col}/*.vue`、`docs/i18n/en-US/examples/{row,col}/*.vue`、本记录。
2. **修改载体**：§4 六处注册面 + `test/a11y/fixtures.ts` + `test/capture/{fixture/app.vue,capture.mjs,capture.test.mjs,baseline.json}` + `test/e2e/{fixtures/app.vue,responsive.e2e.ts}`。
3. **口径更正（重要）**：`docs/design/responsive.md` **§1 使用方职责**原写「库不内建页面级栅格」——本条目落地后该断言**不再成立**，已更正为「栅格原语（`CaomeiRow` / `CaomeiCol`）已内建，但具体分栏 / 堆叠决策与断点驱动显隐仍由使用方编写」；同批在 **§2** 追加「栅格消费侧断点 props（例外）」条（含与 §2 上表 `lg` 命名方向的区分、不逐档级联口径）、§1 非目标例外清单补该项，并在 §3 窄屏行为矩阵追加 **#18 栅格布局**行、§5「不纳入」清单为该词条加注（页面级栅格已由组件原语内建，不属适配批次）。
4. **未改**：`docs/plan/roadmap.md`（阶段表 Phase 24 行已登记 M4 内容主线，§1 现状句在阶段收口时统一重写）；`docs/plan/todo.md` 的 M4-1 状态行（本批次收口时回填）。

## 7. 质量门

- `pnpm verify` **exit 0**（含 `lint:check` / `lint:css:check` / `lint:md:check` / `typecheck` / `typecheck:docs` / `test` / `build` / `check:build` / `check:resolver` / `check:nuxt` / `docs:build` / `governance:check`）。
- `pnpm test:e2e` **全绿**（含本批新增的栅格断点用例，三 project 各一遍）。
- `pnpm capture:styles` **0 差异**（重冻结后复跑）；`pnpm test:a11y` 通过。

## 8. 边界（显式声明）

1. **不提供 `Container` / `Spacer`**：范围扩展评估 §3.2 将其列为可选，D2 裁定取 P0 + P1 四项，栅格族落地面为 `Row` / `Col`；如后续下游有真实用量，按规划纪律另行评估。
2. **不提供断点驱动的显示 / 隐藏**（如 `v-show` 断点类）：属使用方页面编排职责（[响应式设计 §1](../../design/responsive.md)）。
3. **不提供 `justify`**（§2.2，语义无效）。
4. **未传断点时不改变形态**：网格随容器压缩、列跨栏数不变——这是**有意契约**（栅格只提供原语，不做自动堆叠；堆叠由使用方通过断点 `span` 声明）。形态变更能力由断点 props 提供，但其**取值由使用方决定**，库不代为决策。
5. **`Row` 的 `align` 未纳入采样面**：其计算值随行高变化，属「随内容驱动」属性，纳入会引入非契约噪声；由单测（变体类）覆盖。
6. **画廊仅登记 `Row`**：`Col` 脱离 `Row` 在画廊单卡内无可视意义，故只登记成对原语中的容器侧。
7. **`span` 不做运行时钳制**：有效范围 1–24 已在类型 JSDoc 与组件页声明；传 0 / 负数会产出非法 CSS `span 0` 并静默回落 `auto`。**有意不钳制**——静默把一个无意义取值改成另一个会产生「设置与结果不符」的隐式魔法；`offset` / `order` 的 0 为合法值（已按 falsy 跳过变量写入）。
8. **断点档位命名方向与响应式设计上表的 `lg` 不同**（§2.2）：不计划改名或改为 `min-width` 语义——与本库「桌面优先 + `width <=` + 字面量白名单」口径一致，且与 `Dialog.breakpoints` 同为消费侧数据例外；该差异已在 `responsive.md §2` 与新组件页显式写清。
9. **横向间距的容器约束（§3.6）**：`23 × gutter` 必须小于容器宽，否则栅格横向溢出。本批**不提供 CSS 侧收敛**（理由见 §3.6），改为文档化约束 + 夹具按约束取值。若下游反馈「窄屏固定大 gutter」为真实痛点，须按规划纪律单独立项评估（替代形态：列内边距方案 / 容器查询），本批不自动登记候选。

## 9. Review Gate

- **audit-depth**：两轮均 `standard`（新增组件族的常规业务逻辑 + 模块内改动 + 测试装置 / 文档口径改动；非发布 / 安全 / 依赖 / agent·skill 定义）。单分区（同一交付面，非 ≥2 独立模块）。
- **R1（`standard`）：`Pass`**（**0 blocker / 2 warning / 4 suggest**）。审计方独立读码 + 复跑核验：`grid-column: calc(offset+1)/span span`（offset 4 → 起始线 5，与基线 `grid.col.offset.grid-column-start=5` 一致）、媒体查询源序 `1024 → 768 → 640`（等特异性下由源序决定，最窄档最终生效）、**`gap: <row> <column>` 与 `[横向, 纵向]` 无行列互换**（16 → `column-gap`，负向对照读数同此序）、`Col` 无 `justify` / `Row` 有 `align`、注册面六处交叉一致、中英章节对等。
  - **RG-W01（warning，已关闭）**：`responsive.md §2` 的 `lg`（默认形态 / 769–1023px 无档可用）与 `Col` 的 `@media (width <= 1024px)` 及新增矩阵行 #18 口径冲突；治理记录 §2.2「与 §2 一致」表述不成立；§1 非目标例外清单未登记本组件 → **采纳**：§2 新增「消费侧断点配置（例外）」条并显式区分命名方向与「无档可用」的适用范围、§1 非目标例外清单补 ②、治理记录 §2.2 改写。
  - **RG-W02（warning，已关闭）**：断点媒体查询（本条目核心能力）缺窄视口运行侧验证 → **采纳**：新增 `test/e2e/responsive.e2e.ts` 栅格断点用例（§5）。
  - **RG-S01 / S02 / S03 / S04**：全部采纳（`span` 有效范围声明 / 断点对象回退语义声明 / 英文 gutter 术语统一 / 治理记录表述改正）。
- **R2（`standard`，仅审 R1 修复点）：`Pass`**（**0 blocker / 0 warning / 6 suggest**）。审计方确认 **R1 的 6 条 findings 全部关闭**，并核验了修复的判别力（若媒体查询源序反写或 `lg` 改 `min-width` 语义，用例均会失败；`md` 档列 B `order` 断言确实锁死「不逐档级联」）；对**本轮新增的横向间距容器约束取舍**判「成立」（`gap` 不收缩为 CSS Grid 事实；不采用百分比收敛的真实理由与实际一致；Element 式替代方案的外边距代价成立）；并核验两夹具职责未混淆（capture 夹具仍 `[16, 8]` / 480px 容器 ⇒ 负向对照 1 仍有效）。
  - **RG2-S1 ~ S6**：**全部同批采纳**（`responsive.md` §1 小标题收窄为「库提供原语之外的决策」/ §2 新条补「无档可用」的适用范围限定 / 夹具 lg 档 `offset` 取非 0 并同步期望（运行时亦判别 offset 覆盖）/ `RowGutter` 英文术语统一 / `col.md` 中英「非法 `grid-column`（如 `span 0` / `span -1`）」/ §2 新条区分「断点配置取值 = 使用方数据」与「断点阈值 = 库内常量」）。均属非阻断项，采纳后**不起第 3 轮**。
- **实测用时**：R1 发起前取戳 `2026-10-15T01:42:16+08:00`，返回时点由后续可观测时点 `02:00:09` 界定 ⇒ elapsed ≈ **17 分钟，超 `standard` 的 10 分钟时间盒**（归因：审计方在盒内复跑了 `test:a11y` / `capture:styles` / `governance:check` 等多条重型命令，并按 §3.1 逐项交叉核对 24 项变更；按 [AI 协作规范 §3.3](../../standards/ai-collaboration.md) 仅作**分级校准信号**）。R2 发起前取戳 `02:23:16`，最近可观测后续时点 `02:26:40` ⇒ **未超 6 分钟时间盒**。
- **未覆盖边界（审计方声明）**：① 未复跑完整 `pnpm verify` / 全量 E2E（按证据优先采信调用方读数）；② 非 0 `offset` 在当前用例中亦有变量级覆盖（`col.test.ts`），运行侧为 lg 档单点。
- **零 `src/**` 行为变更之外的范围**：本批全部改动落在新增组件 / 其注册面 / 测试装置 / 文档，未改任何既有组件的 props / 事件 / 插槽 / 样式。
