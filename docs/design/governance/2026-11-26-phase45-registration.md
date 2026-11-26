# Phase 45 登记批次：新组件第二批（轮播、水印与菜单交互）

> 创建时间：2026-11-26
> 触发：用户指令「开始规划下阶段待办」；随后就第三十轮评估的 D1–D5 逐项裁定（D1 取 A：5 个新组件；D2 取 `embla-carousel-vue@8.6.0`；D3 不并入可选 peer 改进；D4 本阶段不发布；D5 保留 Watermark）。
> 性质：**阶段登记批次记录**（含取证与决策）；范围与验收口径的唯一载体。
> 基线：`master` = `407ef374`（第三十轮评估提交）；阶段编号按[规划规范 §4](../../standards/planning.md#_4-阶段与条目命名)取「已有最大编号 + 1」= **Phase 45**。
> 前置条件：Phase 43 / 44 两次收口在发生时点均未留门槛复核记录（既成事实，不追溯补轮）。Phase 43 / 44 收口轮**记为未执行（缺口保留，不补造记录）**；2026-11-26 第 48 轮为一次**逾期补测**（同一门槛、同一取证基线、期间无发布），**不追认**上述两个历史义务，仅保证当前门槛有最新取证。依据与读数见 [长期任务](../../plan/recurring.md) §3；如需改为逐轮补记，另立治理条目。

## 1. 取向与证据

### 1.1 取向

- **新组件优先**：按[规划规范 §3.1](../../standards/planning.md#_3-1-优先级双轴评估与排期-2026-11-25-用户裁定)的快速开发期取向与用户 2026-11-26 裁定，本阶段只做**新组件**。
- **不发布**：D4 裁定本阶段不发布；`1.5.0` 发布收口继续留在 [Backlog §1.6](../../plan/backlog.md)「已决策待窗口」，2026-11-29 之前不列入规划。
- **不做工期估算**：容量按条目与验收口径计量。

### 1.2 组件用量取证（2026-11-26）

| 组件 | 依据 | 取向分（重要 / 紧急） |
|:---|:---|:-:|
| Carousel | csv-token-analytics `src/components/ui/carousel.tsx` + `embla-carousel-react@^8.6.0`（无页面引用）；快速开发期新组件方向 | 4 / 2（排期） |
| Watermark | 库间对齐（Element Plus / TDesign / Vant / Varlet）；momei 无组件用量 | 4 / 2（排期） |
| Menubar | Reka `Menubar*` 原语现成；csv-token-analytics 有同名 shadcn 文件（无页面引用） | 4 / 2（排期） |
| NavigationMenu | Reka `NavigationMenu*` 原语现成；同上 | 4 / 2（排期） |
| HoverCard | Reka `HoverCard*` 原语现成；同上 | 4 / 2（排期） |

- 取证方式：`gh search code`（2026-11-26，`--owner CaoMeiYouRen`）+ 本地 `require('reka-ui')` 导出探测（2.11.0）。
- 取向分口径：重要 4 = 用户指定的快速开发期新组件方向（无真实下游用量，按方向计）；紧急 2 = 无硬时点。**象限只决定顺序，不构成计划外授权**。
- 与[第三十轮评估](../governance/2026-11-26-next-stage-scope-evaluation-30.md)的关系：评估推荐 A 案，用户 2026-11-26 采纳。

### 1.3 依赖决策

- **Carousel 引入 `embla-carousel-vue@8.6.0`**，声明为**运行时 `dependencies`（第 6 个，非可选 peer）**。
  - **现状清单**：`dependencies` 现有 5 个（`reka-ui`、`@internationalized/date`、`@lucide/vue`、`@tanstack/vue-table`、`@vavt/cm-extension`），本阶段后为 6 个。
  - **许可证与传递依赖**（`pnpm view embla-carousel-vue@8.6.0`，2026-11-26）：`license = MIT`；`dependencies = embla-carousel@8.6.0` + `embla-carousel-reactive-utils@8.6.0`（一次安装引入 3 个同版本包，须一并登记 `THIRD-PARTY-LICENSES`）。
  - **构建与发布面**：`tsdown.config.ts` 列入 external（不内联）、`pnpm-lock.yaml` 同提交、`pnpm check:licenses` 与 `pnpm check:build` 为验收门。
  - **消费方影响**：新增依赖会进入全部下游安装树；`vue` peer 为 `^3.2.37`，与本库 `peerDependencies.vue = ^3.5.0` 兼容。组件仅在 `onMounted` 后初始化 embla（SSR / Nuxt 服务端不执行 DOM 初始化），文档写明客户端边界与 tree-shaking 口径。
  - **与可选 peer 的区分**：本项是**必装运行时依赖**（与 `reka-ui` 同类），不适用「可选 peer 未安装降级」口径；D3 的「可选 peer 结构改进不并入」不影响本项。

## 2. 条目与验收口径

**6 条主线 / 15 条原子条目**。拆分口径：单条核心文件 ≤ 10（[规划规范 §5](../../standards/planning.md#_5-任务粒度约束)）；`src/locale/*` 的 10 个文案文件按[规划规范 §5](../../standards/planning.md#_5-任务粒度约束)的粒度注记不单独计数；文档条目 12 文件在该注记允许的 8–12 内。

- **取向分（排序留痕）**：六条主线均为「重要 4 / 紧急 2 → 排期」。
- **共用登记面（M1-3 ~ M5-3 均含）**：§11（`documentation-site.md`）、中英侧栏（`config.ts`）、中英总览（2）、组件设计 §5（1）共 5 处；机检为 `check-docs-structure` / `check-components-overview` / `check-design-catalog`。
- **示例双语两套**：`docs/examples/<name>/*` 与 `docs/i18n/en-US/examples/<name>/*` 必须同时建立。
- **归属约定（防重复计）**：
  - **locale**：仅 Carousel 新增 `carousel.prev` / `carousel.next` / `carousel.slide`，随 **M1-1** 交付；Menubar / NavigationMenu / HoverCard 复用菜单族既有键，Watermark 默认装饰性 `aria-hidden`——三者**不新增 locale**。
  - **导出与 a11y**：`src/index.ts`、`src/nuxt/components.ts`、`test/a11y/fixtures.ts` 统一在 **M6-1**（文档的 `ComponentApi` 与子路径导入不依赖包根导出）。
  - **浮层档位与 E2E 清单**：三条浮层主线的档位声明（`--caomei-<comp>-z-index`，默认 `--caomei-z-dropdown`）与 `overlay-panels.json`、`app.vue` 夹具、`overlay-stacking.e2e.ts`、`check-overlay-z-index.test.mjs` 计数**单独成条（Mx-2）**，紧随实现条目；实现条目只交付组件本体（不声明浮层档位），避免 T10 中间态红门。

### M1 Carousel 轮播（3 条）

| 条目 | 验收口径 | 文件面 | 依赖 |
|:---|:---|:---|:---|
| M1-1 依赖与 locale 基础 | `embla-carousel-vue@8.6.0` 为运行时 `dependencies`（5 → 6）、`tsdown` external、lockfile、`THIRD-PARTY-LICENSES`（含传递依赖）；`carousel.prev` / `next` / `slide` 三键（10 语 + 台账 + 基线）；`check:licenses` / `check:locale-keys` / `typecheck` 绿 | `package.json`、`pnpm-lock.yaml`、`tsdown.config.ts`、`THIRD-PARTY-LICENSES`、`src/locale/types.ts`、`src/locale/*`（不单独计数）、两份 locale 台账、`check-locale-keys.test.mjs` | `embla-carousel-vue` |
| M1-2 组件实现与测试 | 水平 / 垂直、`loop`、`slidesPerView` / `gap`、`v-model:index`、上一张 / 下一张 / 指示点、键盘与拖拽；容器 `role="region"` + `aria-roledescription="carousel"`，每页 `aria-roledescription="slide"` 与「第 n 张 / 共 m 张」；仅 `onMounted` 初始化；单测覆盖索引边界与受控同步 | `src/components/carousel/*`（`carousel.vue` / `carousel-slide.vue` / `types.ts` / `index.ts` / `carousel.test.ts`） | M1-1 |
| M1-3 文档、示例与回归 | 中英组件页 + 双语示例（基础 / 多图）；组件测试 + E2E（拖拽、键盘、索引回写、当前项播报）；共用登记面与示例同步后 `pnpm docs:check` / `pnpm governance:check` 绿 | 中英组件页（2）、中英示例（4）、`test/e2e/carousel.e2e.ts`、§2 共用登记面（5） | M1-2 |

### M2 Watermark 水印（2 条）

| 条目 | 验收口径 | 文件面 | 依赖 |
|:---|:---|:---|:---|
| M2-1 实现与测试 | 文本 / 图片、旋转、透明度、间距、偏移、层级、覆盖容器；`MutationObserver` 可观测项 = 节点删除 / 属性改写 / 尺寸变化后下一帧重建、`disconnect` 后不重建；**canvas 像素篡改排除**；`aria-hidden="true"` **只落水印遮罩 / canvas**，根与插槽保留可访问性；单测覆盖参数与重建 | `src/components/watermark/*`（`watermark.vue` / `types.ts` / `index.ts` / `watermark.test.ts`） | 自建（canvas） |
| M2-2 文档与回归 | 中英组件页 + 双语示例（文本 / 图片）；文档写明装饰性语义与「像素篡改不覆盖」；组件测试 + E2E（暗色、删除后重建、卸载后不重建、插槽正文可访问） | 中英组件页（2）、中英示例（4）、`test/e2e/watermark.e2e.ts`、§2 共用登记面（5） | M2-1 |

### M3 Menubar 菜单栏（3 条）

| 条目 | 验收口径 | 文件面 | 依赖 |
|:---|:---|:---|:---|
| M3-1 组件实现与测试 | 封装 Reka `Menubar*`：菜单栏 / 菜单 / 触发器 / 内容 / 条目；方向键、Home / End、Esc 与焦点归还；受控 `open`；**本条不声明浮层档位**（由 M3-2 接线）；单测覆盖键盘与禁用项 | `src/components/menubar/*`（`menubar.vue` / `menubar-menu.vue` / `menubar-trigger.vue` / `menubar-content.vue` / `menubar-item.vue` / `types.ts` / `index.ts` / `menubar.test.ts`） | Reka `Menubar*` |
| M3-2 浮层档位与 E2E 清单 | 内容样式补 `--caomei-menubar-z-index`（默认 `--caomei-z-dropdown`）；`overlay-panels.json` 登记 case、`app.vue` 模态内夹具、`overlay-stacking.e2e.ts` 受检清单与 `MIN_PANEL_CASES` 递增、`check-overlay-z-index.test.mjs` 计数同步；`check:overlay-z-index` 与 overlay-stacking E2E 绿 | `src/components/menubar/menubar-content.vue`（样式）、`test/e2e/fixtures/overlay-panels.json`、`test/e2e/fixtures/app.vue`、`test/e2e/overlay-stacking.e2e.ts`、`scripts/governance/check-overlay-z-index.test.mjs` | M3-1 |
| M3-3 文档、示例与回归 | 中英组件页 + 双语示例（基础 / 分组）；组件测试 + E2E（键盘、Esc）；共用登记面与示例同步后 `docs:check` / `governance:check` 绿 | 中英组件页（2）、中英示例（4）、`test/e2e/menubar.e2e.ts`、§2 共用登记面（5） | M3-2 |

### M4 NavigationMenu 导航菜单（3 条）

| 条目 | 验收口径 | 文件面 | 依赖 |
|:---|:---|:---|:---|
| M4-1 组件实现与测试 | 封装 Reka `NavigationMenu*`：根 / 触发器 / 内容 / 链接；悬停与聚焦开合、方向键、Esc；受控 `open`；**本条不声明浮层档位**；单测覆盖开合与键盘 | `src/components/navigation-menu/*`（`navigation-menu.vue` / `navigation-menu-trigger.vue` / `navigation-menu-content.vue` / `navigation-menu-link.vue` / `types.ts` / `index.ts` / `navigation-menu.test.ts`） | Reka `NavigationMenu*` |
| M4-2 浮层档位与 E2E 清单 | `--caomei-navigation-menu-z-index`（默认 `--caomei-z-dropdown`）；`overlay-panels.json` / `app.vue` / `overlay-stacking.e2e.ts` / `check-overlay-z-index.test.mjs` 同步；`check:overlay-z-index` 与 overlay-stacking E2E 绿 | `src/components/navigation-menu/navigation-menu-content.vue`（样式）、`test/e2e/fixtures/overlay-panels.json`、`test/e2e/fixtures/app.vue`、`test/e2e/overlay-stacking.e2e.ts`、`scripts/governance/check-overlay-z-index.test.mjs` | M4-1 |
| M4-3 文档、示例与回归 | 中英组件页 + 双语示例（基础 / 内容面板）；组件测试 + E2E（悬停 / 键盘、Esc、面板定位）；共用登记面与示例同步后 `docs:check` / `governance:check` 绿 | 中英组件页（2）、中英示例（4）、`test/e2e/navigation-menu.e2e.ts`、§2 共用登记面（5） | M4-2 |

### M5 HoverCard 悬停卡片（3 条）

| 条目 | 验收口径 | 文件面 | 依赖 |
|:---|:---|:---|:---|
| M5-1 组件实现与测试 | 封装 Reka `HoverCard*`：触发器 / 内容 / 箭头、延迟、`side` / `align` / `sideOffset`；悬停与聚焦开合、Esc；受控 `open`；**本条不声明浮层档位**；单测覆盖延迟与开合 | `src/components/hover-card/*`（`hover-card.vue` / `hover-card-trigger.vue` / `hover-card-content.vue` / `hover-card-arrow.vue` / `types.ts` / `index.ts` / `hover-card.test.ts`） | Reka `HoverCard*` |
| M5-2 浮层档位与 E2E 清单 | `--caomei-hover-card-z-index`（默认 `--caomei-z-dropdown`）；`overlay-panels.json` / `app.vue` / `overlay-stacking.e2e.ts` / `check-overlay-z-index.test.mjs` 同步；`check:overlay-z-index` 与 overlay-stacking E2E 绿 | `src/components/hover-card/hover-card-content.vue`（样式）、`test/e2e/fixtures/overlay-panels.json`、`test/e2e/fixtures/app.vue`、`test/e2e/overlay-stacking.e2e.ts`、`scripts/governance/check-overlay-z-index.test.mjs` | M5-1 |
| M5-3 文档、示例与回归 | 中英组件页 + 双语示例（基础 / 延迟）；locale 复用既有键；组件测试 + E2E（悬停 / 聚焦、延迟、Esc、浮层层级）；共用登记面与示例同步后 `docs:check` / `governance:check` 绿 | 中英组件页（2）、中英示例（4）、`test/e2e/hover-card.e2e.ts`、§2 共用登记面（5） | M5-2 |

### M6 导出与 a11y 登记（1 条）

| 条目 | 验收口径 | 文件面 | 依赖 |
|:---|:---|:---|:---|
| M6-1 包根导出与 a11y 受检面 | 五个组件进入 `src/index.ts` 与 `src/nuxt/components.ts`；`test/a11y/fixtures.ts` 登记根组件 / 子部件与预算；`pnpm test` / `check:resolver` / `check:nuxt` 绿 | `src/index.ts`、`src/nuxt/components.ts`、`test/a11y/fixtures.ts` | M1-2、M2-1、M3-1、M4-1、M5-1 |

## 3. 非目标

- **发布**：不执行 `1.5.0` 发布收口；`latest` 维持 `1.4.0`，`release.yml` 不触发。
- **依赖**：除 `embla-carousel-vue` 外不新增运行时依赖；不引入 Tailwind / UnoCSS。
- **可选 peer 结构改进、`glob` 跨 major、真机验收、国际化二期 / RTL、`xl` 断点、质量与治理存量**：均维持 Backlog / 长期任务，不在本阶段处理。
- **破坏性 API**、自动发布、`2.0`。

## 4. 容量与排序

- 规模：**6 条主线 / 15 条原子条目**，在[规划规范 §6](../../standards/planning.md#_6-阶段容量)的 3–6 主线 / 10–15 条区间内；全部为「排期」象限（4 / 2）。
- 排序：M1 → M2 → M3 → M4 → M5 → M6；主线内先实现后文档与回归；M6 在五个组件实现完成后收口导出与 a11y 受检面。
- 计量：条目与验收口径为准，**不写人日**。当前 15 条与 6 条主线同时处于建议区间上界，执行期任何追加都会越过 §6 的建议值，须按[规划规范 §3 第 9 条](../../standards/planning.md#_3-新需求处理原则-hard-requirement)回扫并在登记记录说明。

## 5. 载体同步

- `docs/plan/todo.md`：登记当前阶段、6 列进度表与 15 条条目表；保留既有「未完成项汇总」跨阶段状态指针（不新增条目、不复写阶段内容）。
- `docs/plan/roadmap.md`：§1 阶段进度句改为当前进行中阶段；阶段表追加本阶段行。
- `docs/plan/backlog.md`：迁出 §1.11 的 Carousel / Watermark / Menubar·NavigationMenu·HoverCard 三行；该组改为「本组暂无在册候选」。
- `docs/design/governance/index.md`：登记本记录。
- `docs/plan/recurring.md`：第 48 轮门槛复核行已随本批次写入（前置条件）。

## 6. Review Gate

- **R1**（2026-11-26，`standard`，时间盒 ≤ 10 分钟）：**Reject** —— 1 blocker / 6 warning（blocker：§1.3 运行时依赖事实错误（「第二个运行时依赖」实为第 6 个）且供应链边界不全；warning：浮层主线缺伴随登记面、`todo.md` 描述与载体相反、门槛复核合并缺授权、Watermark 防篡改不可判定、`.session` 阶段名不一致）。
- **R2**（2026-11-26，`quick`，时间盒 ≤ 5 分钟）：**Reject** —— 1 blocker / 3 warning（blocker：伴随面叠加使实现条目达 15–19 文件，超 §5 阈值；warning：W1 归属残留、W3 授权/口径、W4 `aria-hidden` 落点）。
- **R3**（2026-11-26，`quick`，时间盒 ≤ 5 分钟）：**Reject** —— 1 blocker / 3 warning（blocker：治理索引摘要仍写 5 / 10，与 6 / 15 矛盾；warning：文档条目 12 文件依据引用点时记录、W3 授权未落定、§6 缺 R2 结论行）。
- **收束（按 [AI 协作规范 §3.5](../../standards/ai-collaboration.md)）**：R3 blocker 为单行计数回填（索引摘要改 6 / 15）——已修正；W2 的粒度依据迁入[规划规范 §5](../../standards/planning.md#_5-任务粒度约束)（活载体）；W3 改为「Phase 43 / 44 收口轮记为未执行（缺口保留），第 48 轮为逾期补测、不追认历史义务」，不再以未来条件句悬置；§6 回填 R1–R3。收束不再开第 4 轮，范围冻结于上述修复点。

**执行期偏差（2026-11-27，M3-3）**：实际交付 16 文件，超出文档条目 12 文件上限：新增 `test/e2e/fixtures/app.vue` 的 `#menubar` 段（E2E 夹具与用例不可分割）、水印图片示例改站点内置占位图（`cb5e16b9` 的 data URI 命中 `check-demo-external-images`，属必修红门）及其 `docs/public/demo/watermark-logo.svg` 资产。水印修正另拆 `fix(docs)` 提交单独走 Gate，M3-3 主体回到文档 + 示例 + 夹具口径。

**执行期澄清（2026-11-27，M3-2）**：menubar 为非模态浮层（Reka `MenubarMenu` 固定 `modal: false`），**不接入**打开态整页隔离；点击外部或切换触发器即关闭，背景保持可交互。M3-2 的 E2E 只覆盖档位与命中，不覆盖隔离。

**执行期偏差（2026-11-26，M1-2）**：`src/nuxt/components.ts`、`src/index.ts` 与 `test/a11y/fixtures.ts` 中 Carousel 两名随 M1-2 落地，而非按 §2「归属约定」等 M6-1。原因：`src/nuxt/components.test.ts` 以组件目录 barrel 为基准、`test/a11y/a11y.test.ts` 以对外导出清单为基准，新增组件目录即红门；`src/index.ts` 若不同步，Nuxt 端会注册一个包根解析不到的组件名。Watermark 随 M2-1、其余三个组件的导出与 a11y 登记仍在 M6-1 收口，M6-1 须补 `<CaomeiCarousel>` / `<CaomeiWatermark>` 的真实 Nuxt 渲染用例（`check:nuxt` 当前不覆盖新组件，窗口期无门禁）。
