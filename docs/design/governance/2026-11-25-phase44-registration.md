# Phase 44 登记批次：新组件批次（引导、二维码与布局交互）

> 创建时间：2026-11-25
> 触发：用户指令「开始规划下阶段待办。本阶段预计不会发布 1.5.0，所以可以先不上收发布计划。（由于实际的开发进度非常快，所以对时间的估算是有问题的，这点可以从历史数据中得出）」
> 性质：**阶段登记批次记录**（含取证与决策）；范围与验收口径的唯一载体。
> 基线：`master` = `c51dac9a` 之后的下一提交（本项目按「已有最大编号 + 1」分配，本阶段编号 **Phase 44**）。

## 1. 取向与证据

### 1.1 取向

- **新功能优先**：按[规划规范 §3.1](../../standards/planning.md#_3-1-优先级双轴评估与排期-2026-11-25-用户裁定)的快速开发期取向与用户 2026-11-25 指令，本阶段只做**新组件**；缺陷修复、测试覆盖率、文档与治理细节不占本阶段条目（安全与已确认回归除外，当前无）。
- **不发布**：用户明确「本阶段预计不会发布 1.5.0」，`1.5.0` 发布收口**不上收**，留在 [Backlog §1.6](../../plan/backlog.md)「已决策待窗口」，2026-11-29 之前不列入规划。
- **不做工期估算**：历史阶段的登记 → 归档实际间隔为 1 天量级（Phase 41 `11-22 → 11-23`、Phase 42 `11-23 → 11-24`、Phase 43 `11-24 → 11-25`），基于天数的估算是失真的；本阶段容量按**条目与验收口径**计量，不写人日。

### 1.2 组件用量取证（2026-11-25）

| 组件 | 下游 / 仓库内证据 | 取向分（重要 / 紧急） |
|:---|:---|:-:|
| Tour | momei `composables/use-onboarding.ts` 自建 onboarding + `app.vue` 监听 `momei:start-tour`；rss-impact-web `src/views/Home.vue` 用第三方 `useShepherd` | 4 / 2（排期） |
| QRCode | caomei-auth `utils/shared/qrcode.ts` 用 `qrcode` 生成 dataURL，`composables/use-security-settings.ts` 调用（安全设置页二维码） | 4 / 2（排期） |
| ContextMenu | 用户自有 csv-token-analytics 采用 Radix `@radix-ui/react-context-menu`（管理端右键菜单形态）；本仓 `DropdownMenu` 已具备菜单项 / 分隔 / 快捷键 / 危险项语义可复用 | 4 / 2（排期） |
| Splitter | 用户自有 csv-token-analytics 采用 `react-resizable-panels`；Reka `SplitterGroup` / `SplitterPanel` / `SplitterResizeHandle` 原语现成 | 4 / 2（排期） |
| Anchor | momei / rss-impact-web / caomei-auth / dependfix / afdian-linker / caomei-todo 六仓检索 `scroll-spy` / `scrollspy` / 锚点导航均无独立组件（momei 的 `use-anchored-popover` 属浮层定位，非导航）；Reka 无对应原语，自研 scroll-spy | 4 / 2（排期） |

- 取证方式：`gh search code <keyword> --owner CaoMeiYouRen`（2026-11-25）+ 本地 `require('reka-ui')` 导出探测。
- 取向分口径：重要 4 = 用户指定的快速开发期新组件方向；紧急 2 = 无硬时点、按节奏推进。**象限只决定顺序，不构成计划外授权**。
- 与[第二十九轮评估](../governance/2026-11-25-next-stage-scope-evaluation-29.md)的关系：该轮对 C21（高级组件）的默认结论为「维持 Backlog（产品驱动）」；本阶段按用户 2026-11-25 新指令改判为**纳入**，属用户改判，不是 AI 自行升级。

## 2. 条目与验收口径

**5 条主线 / 10 条原子条目**。每条主线的执行范围、非目标与最小验收见本节；`todo.md` 只承载编号与状态。

- **取向分（排序留痕）**：五条主线均为「重要 4 / 紧急 2 → 排期」，与 `backlog.md` 登记前的行内分数一致（规范 §3.1 要求登记时写入登记记录 §2）。
- **共用登记面（M1-2 ~ M5-2 均含，各自验收）**：
  - **机检面**（漏填即失败）：英文总览 ↔ 英文组件页（`check-components-overview` 反向校验「英文组件页未列入英文总览」）、locale 台账 ↔ `src/locale/types.ts`（`check-locale-ledger`）、组件设计 §5 ↔ `documentation-site.md` §11（`check-design-catalog`）、侧栏 ↔ §11（`docs:check:structure`）。
  - **唯一边界（人工）**：新增组件页在 §11 / 侧栏 / 中文总览 / 组件设计 §5 **四处均未登记**时不予报错（没有守卫知道该页应存在），须人工确认登记；四处之中任一已登记而其余未登记时由上述机检报错。
  - 路径：`docs/design/documentation-site.md`（§11 分组表）、`docs/.vitepress/config.ts`（中英侧栏）、`docs/components/index.md` 与 `docs/i18n/en-US/components/index.md`（总览）、`docs/design/components.md`（§5 组件清单与「（已实现）」标记）、`docs/components/locale.md` 与 `docs/i18n/en-US/components/locale.md`（locale 台账）。画廊登记表为选录，不强制。
  - **示例双语两套**：英文组件页的 `<demo>` 相对 `docs/i18n/en-US/components/` 解析，故英文示例树 `docs/i18n/en-US/examples/<name>/*` 与中文 `docs/examples/<name>/*` 必须同时建立。
- **粒度注记**：`src/locale/*` 的 10 个文件属文案小改动，不单独计入「≤ 10 文件」拆分判据；文档条目实际文件数约 8–12（含共用登记面），超阈值时按「文档 / 示例 / 登记面」拆分，不合并提交。

### M1 Tour 引导（2 条）

| 条目 | 验收口径 | 文件面 | 依赖 |
|:---|:---|:---|:---|
| M1-1 Tour 核心与定位 | `CaomeiTour` 按 `steps` 渲染；`v-model:current` 受控；上一步 / 下一步 / 跳过 / 完成各 emit 一次；遮罩挖空高亮与目标定位正确，滚动容器滚动与窗口 resize 后重算；Esc 关闭并把焦点归还触发元素；单测覆盖步进边界与重算触发 | `src/components/tour/*`、`src/index.ts`、resolver / Nuxt 模块登记面、`tests/unit/tour*` | Reka 无 Tour 原语，自研；复用既有浮层定位 / 隔离接线 |
| M1-2 Tour 文档、locale 与回归 | 中英组件页 + 示例（基础 / 受控 / 自定义内容 / 关闭遮罩）；10 语 locale 进台账；组件测试 + E2E（滚动跟随、目标缺失时的降级）；共用登记面与示例双语同步后 `pnpm docs:check` / `pnpm governance:check` 绿 | `docs/components/tour.md`、`docs/i18n/en-US/components/tour.md`、`docs/examples/tour/*`、`src/locale/*`、`tests/e2e/tour*`、`docs/i18n/en-US/examples/tour/*`（含 §2 共用登记面） | M1-1 |

### M2 QRCode 二维码（2 条）

| 条目 | 验收口径 | 文件面 | 依赖 |
|:---|:---|:---|:---|
| M2-1 QRCode 实现与可选 peer | `CaomeiQRCode` 支持 `value` / `size` / `level` / `margin` / 前景与背景色 / 图标 / 布局插槽；`qrcode` 声明为**可选 peer**（同 `echarts` / 编辑器族），未安装时渲染明确提示且不抛未捕获异常；导出与 resolver / Nuxt 登记；单测覆盖参数与缺失 peer 路径 | `src/components/qrcode/*`、`package.json`（`peerDependencies` + `peerDependenciesMeta.optional` + `devDependencies` 自测用）、`pnpm-lock.yaml`（生成物，随依赖声明同提交）、`THIRD-PARTY-LICENSES`、`src/index.ts`、resolver / nuxt 模块、`tests/unit/qrcode*` | `qrcode`（可选 peer） |
| M2-2 QRCode 文档、locale 与 peer 说明 | 中英组件页 + 示例（基础 / 带图标 / 尺寸与容错级别）；安装说明写明 peer 与缺失行为（与 `md-editor-v3` 同段）；10 语 locale；组件测试 + 文档站示例构建；共用登记面与示例双语同步后 `pnpm docs:check` / `pnpm governance:check` 绿 | `docs/components/qrcode.md`、`docs/i18n/en-US/components/qrcode.md`、`docs/examples/qrcode/*`、`docs/guide/getting-started.md` 与 `docs/i18n/en-US/guide/getting-started.md`（可选 peer 段落）、`src/locale/*`、`docs/i18n/en-US/examples/qrcode/*`（含 §2 共用登记面） | M2-1 |

### M3 ContextMenu 右键菜单（2 条）

| 条目 | 验收口径 | 文件面 | 依赖 |
|:---|:---|:---|:---|
| M3-1 ContextMenu 实现与浮层接线 | `CaomeiContextMenu` 封装 Reka `ContextMenu*`（右键与触屏长按触发）；菜单项 / 分隔 / 快捷键 / 危险项语义与 `DropdownMenu` 对齐；浮层隔离沿用既有 `inert` / `aria-hidden` 接线；`v-model:open` 受控；键盘导航、Esc 关闭并归还焦点；导出与 resolver 登记 | `src/components/context-menu/*`、`src/index.ts`、resolver / nuxt 模块、`tests/unit/context-menu*` | Reka `ContextMenu*` |
| M3-2 ContextMenu 文档、locale 与回归 | 中英组件页 + 示例（基础 / 分组与快捷键 / 禁用项）；10 语 locale（复用菜单族文案键）；组件测试 + E2E（右键打开、触屏长按、Esc 与焦点归还）；共用登记面与示例双语同步后 `pnpm docs:check` / `pnpm governance:check` 绿 | `docs/components/context-menu.md`、`docs/i18n/en-US/components/context-menu.md`、`docs/examples/context-menu/*`、`src/locale/*`、`tests/e2e/context-menu*`、`docs/i18n/en-US/examples/context-menu/*`（含 §2 共用登记面） | M3-1 |

### M4 Splitter 分栏（2 条）

| 条目 | 验收口径 | 文件面 | 依赖 |
|:---|:---|:---|:---|
| M4-1 Splitter 实现 | `CaomeiSplitter` + `CaomeiSplitterPanel`：水平 / 垂直、受控尺寸、`min` / `max`、吸附与键盘调整可达、嵌套分栏；导出与 resolver 登记；单测覆盖尺寸边界与受控同步 | `src/components/splitter/*`、`src/index.ts`、resolver / nuxt 模块、`tests/unit/splitter*` | Reka `SplitterGroup` / `SplitterPanel` / `SplitterResizeHandle` |
| M4-2 Splitter 文档、locale 与回归 | 中英组件页 + 示例（基础 / 垂直 / 嵌套 / 受控）；10 语（可访问名如「调整面板大小」）；组件测试 + E2E（拖拽与键盘调整）；组件设计 §5 primitive 清单同步；共用登记面与示例双语同步后 `pnpm docs:check` / `pnpm governance:check` 绿 | `docs/components/splitter.md`、`docs/i18n/en-US/components/splitter.md`、`docs/examples/splitter/*`、`docs/design/components.md`、`src/locale/*`、`tests/e2e/splitter*`、`docs/i18n/en-US/examples/splitter/*`（含 §2 共用登记面） | M4-1 |

### M5 Anchor 锚点导航（2 条）

| 条目 | 验收口径 | 文件面 | 依赖 |
|:---|:---|:---|:---|
| M5-1 Anchor 实现 | `CaomeiAnchor` 支持容器内 scroll-spy、`v-model:active` 受控、层级缩进、点击平滑滚动、`offset`、hash 同步；导出与 resolver 登记；单测覆盖激活计算与 `offset` 边界 | `src/components/anchor/*`、`src/index.ts`、resolver / nuxt 模块、`tests/unit/anchor*` | 自研 scroll-spy（无 Reka 原语） |
| M5-2 Anchor 文档、locale 与回归 | 中英组件页 + 示例（基础 / 指定滚动容器 / 嵌套层级）；10 语 locale；组件测试 + E2E（滚动高亮切换、跳转与 hash）；共用登记面与示例双语同步后 `pnpm docs:check` / `pnpm governance:check` 绿 | `docs/components/anchor.md`、`docs/i18n/en-US/components/anchor.md`、`docs/examples/anchor/*`、`src/locale/*`、`tests/e2e/anchor*`、`docs/i18n/en-US/examples/anchor/*`（含 §2 共用登记面） | M5-1 |

## 3. 非目标

- **发布**：不执行 `1.5.0` 发布收口（门槛复核 / 发布 / 发布后校验 / 下游回收），不做 `release.yml` 触发；`latest` 维持 `1.4.0`。
- **组件**：Carousel（需引入 `embla-carousel-vue` 运行时依赖）、Watermark、Menubar / NavigationMenu / HoverCard 均维持 Backlog。
- **依赖**：除 `qrcode` 可选 peer 外不新增运行时依赖；不引入 Tailwind / UnoCSS。
- **质量与治理存量**：`cascader` 面板样式在 portal 下失效、英文总览镜像列表、归档块缺「未覆盖边界」三项按用户取向**只登记 Backlog**，不在本阶段处理。
- **国际化与响应式**：国际化二期 7 语、RTL、`xl` 断点与宽屏视觉基线、真机验收均不在范围内。
- **破坏性 API**、自动发布、`2.0`。

## 4. 容量与排序

- 规模：**5 条主线 / 10 条原子条目**，在[规划规范 §6](../../standards/planning.md#_6-阶段容量)的 3–6 主线 / 10–15 条区间内。
- 排序：M1 → M2 → M3 → M4 → M5；同为主线内 Mx-1（实现）→ Mx-2（文档与回归）。全部为「排期」象限（4 / 2），无「首排」项。
- 计量：条目与验收口径为准，**不写人日**（理由见 §1.1）。

## 5. 载体同步

- `docs/plan/todo.md`：登记当前阶段、6 列进度表与 10 条条目表；不含「未完成项汇总」（状态指针已全部落在 Backlog 与治理记录）。
- `docs/plan/roadmap.md`：§1 阶段进度句改为当前进行中阶段；阶段表追加本阶段行。
- `docs/plan/backlog.md`：迁出 Tour / QRCode / Splitter / Anchor 四行；`ContextMenu / HoverCard / Menubar / NavigationMenu` 一行收窄为「Menubar / NavigationMenu / HoverCard」（剩余未登记部分）；新增三条只登记不执行的遗留候选（`cascader` 面板样式、英文总览镜像列表、Phase 39 归档块缺项）。
- `docs/design/governance/index.md`：登记本记录。

## 6. Review Gate

- **R1**（`standard` / ≤10 分钟）：**Reject**，blocker 0 / warning 4 / suggest 5。warning：五个新组件的**共用登记面**（§11 / 中英侧栏 / 中英总览 / 组件设计 §5 / 中英 locale 台账）未写入文件面且部分守卫存在静默区；M1-2 验收「进台账」与文件面不一致；M2-2 漏英文 getting-started；`.session` 未同步。suggest：取向分应写入 §2、Anchor 证据需点名仓集合、粒度判据、§1.11 提示句漂移面、`cascader` 分数依据。
- **R2**（`quick` delta / ≤5 分钟）：**Reject**，blocker 2 / warning 3 / suggest 1。blocker：M2-2 的英文 getting-started 未真正写入（声明与文件不一致）；§2 前言「缺填不会报错」与被 `check-components-overview` / `check-locale-ledger` 实际覆盖的事实相反。warning：五行「（含 §2 共用登记面）」标记因匹配失败未落地且验收缺命令；M1-2 同行口径矛盾未消；五个 Mx-2 缺英文示例树（英文组件页 `<demo>` 指向不存在文件）。suggest：共用登记面按机检 / 人工分组呈现（已在 §2 落地）。
- **R3**（`quick` delta / ≤5 分钟）：**Pass**，blocker 0 / warning 2 / suggest 1。warning：「人工面」一句仍把已机检的中文侧栏 / §11 / 中文总览列为不报错（已改为「四处均未登记」的唯一边界）；M2-2 文件面漏 `src/locale/*`（已补）。suggest：§6 的 R2 行残留「divider」一词（已删）。三条同批闭合。
