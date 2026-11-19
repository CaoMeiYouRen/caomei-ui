# 移动端体验与下一阶段范围评估（第二十二轮）

> 创建时间：2026-11-20
> 触发：用户指令「caomei-todo 接下来存在一定的手机端组件需求，期望接下来一段时间以优化手机端体验为主；开始做评估，并评估下阶段待办与进入 Backlog 的内容」。
> 性质：**评估记录，不构成阶段登记**。本轮只做候选盘点、逐条判定、主线草案与决策点；用户裁定后另行登记 `todo.md` / `roadmap.md`（[规划规范 §3](../../standards/planning.md)）。落点为 [Backlog](../../plan/backlog.md) 候选与本记录 §6。

## 1. 现状读数（2026-11-20）

| 面 | 读数 |
|:---|:---|
| 仓库 | `master` = `bc2f2cd`，读取时工作区干净（落笔前）；Phase 37 已归档，`todo.md` 无进行中阶段 |
| 版本 | `latest` = **`1.3.0`**（2026-11-14 经 CI 发布） |
| Issue / PR | open issue **0** / open PR **0** |
| 安全告警 | Dependabot open **0**；Code Scanning open **0** |
| CI | 最近一次 `master` push（`bc2f2cd`）Test（run `44561659682`）/ CodeQL / Security Alerts / Deploy Pages 全绿 |
| 长期任务 | 第 41 轮门槛复核（2026-11-19，Phase 37 收口）：待执行 0 / 条件触发 1 维持 / 不纳入 5 维持 |
| wisdom | **16 条活跃（< 阈值 20）**；`pnpm distill:wisdom --check` 输出 `WISDOM_OK: 16 active entries (threshold 20)` |
| 下游锁定版本 | 取各仓 `pnpm-lock.yaml` 解析值（2026-11-20）：dependfix **`1.2.0`** / caomei-auth **`1.3.0`** / momei **`1.3.0`**（前次 2026-11-16 为 `1.2.0`）；最近兼容 run `43590922508`（2026-11-14，被测 `1.3.0`）success，本轮未触发新 run |
| 新下游 | **caomei-todo**：立项文件 v2.2 / 需求与架构 v1.2（2026-11-19），**代码尚未创建**；计划 Windows / Android / Web 硬性验收、iOS 尽力 |

`todo.md` 的下游版本指针是 2026-11-16 快照（momei 记 `1.2.0`），本轮读数见上表；按[规划规范 §9](../../standards/planning.md) 的时点快照口径不回改。

## 2. 下游诉求读数（caomei-todo）

caomei-todo 按 2026-11-20 文档面核对，是本仓在册下游中目前唯一把移动壳写进立项与架构的下游：平台验收三端硬性（iOS 尽力）、移动策略为「应用层移动壳 + 上游优先」，并把「移动端刚需组件应反馈上游、不先自建」写入 ADR。其上游判定三条标准（[caomei-todo 架构 §11.5，外部仓库，2026-11-20 读取]）：① 桌面形态在触屏上明显不可用；② 没有现成替代；③ 在本应用至少 2 个高频页面复用。

| # | UI 触点 | caomei-todo 依据 | 当前可组合的能力 | 缺口 |
|:-:|:---|:---|:---|:---|
| 1 | 移动底部主导航（我的一天 / 列表 / 搜索 / 设置） | 架构 §11.4、里程碑 §3 | `Toolbar` / `Tabs` / `Menu` | tabbar 语义（`aria-current`、固定底栏、安全区） |
| 2 | 任务行 / 清单行 / 设置行（设置行为本仓推断） | 需求 FR-TASK-01 / 02 / 05、里程碑 §4 | `DataView layout="list"`、`Card`、列表组合 | 行语义（标题 / 描述 / 右值 / 进入态）与按压态 |
| 3 | 任务操作底部弹层 | 架构 §11.4 / §11.5 | `Drawer position="bottom"` + `Menu` | 取消项、分组、危险项、焦点回退契约 |
| 4 | 空列表 / 空搜索 / 回收站 | 需求 FR-TASK-01 / 07 / 11 | `DataView` 的 `emptyText` | 图标 / 说明 / 行动按钮的空态 |
| 5 | 安全区（刘海 / home indicator） | 架构 §11.4 | 无库内承接 | token / 工具类 / 固定定位件避让 |
| 6 | 关键操作触摸目标 ≥44×44 | 需求 NFR-09、里程碑 M4-A4 | 24px 不可见命中区；`data-density="touch"` 控件高 44 | 44 的达成路径与相邻目标间距口径 |
| 7 | 到期 / 提醒时间选择 | 需求 FR-TASK-02 / FR-REM-01、架构 §11.5 | `DatePicker` / `TimePicker` | 滚轮形态（先用既有件，真机后再评估） |
| 8 | 搜索入口 | 需求 FR-TASK-07 | `Input` / `InputGroup` / `Button` | 搜索栏组合配方 |

**取证边界**：caomei-todo **尚无代码、无页面级用量、无真机记录**；上表的「≥2 页面复用」是规划值，不是实测值。本记录据此只做**形态级**判定，不把规划值当作已命中用量门槛。

## 3. caomei-ui 现状读数（移动面）

| 能力 | 读数 | 取证位置 |
|:---|:---|:---|
| 组件库存 | 60 个组件目录（不含 `_shared`） | `src/components/` |
| 触摸密度轴 | `data-density="touch"`：控件高 36 / 44 / 52，字号 14 / 16 / 18 | `src/styles/theme.css` |
| 不可见命中区 | `--caomei-hit-target-min: 24px` + `.caomei-hit-target`；P0 / P1 / P2 三批已交付 | `src/styles/index.css`、[响应式设计 §3](../responsive.md) #16 |
| 视口回归 | 390 / 768 / 1280 全量 + 320 / 900 定向；受检面下界 20 | [响应式设计 §4](../responsive.md) |
| 窄屏收敛 | 浮层宽度、Dialog / Drawer、Tabs / Paginator / Toolbar、ButtonGroup / SplitButton | [响应式设计 §3](../responsive.md) |
| 底部弹层 | `Drawer position="bottom"`，`height: min(90vh, size)`，body 区可滚动 | `src/components/drawer/drawer.vue` |
| 空态 | `DataView` 的 `emptyText` / `loading` 与 `list` / `grid` 插槽 | `src/components/data-view/types.ts` |
| 安全区 | `src/` 内 `env(safe-area-inset-*)` **0 处** | `rg -n "safe-area" src/` |
| 动态视口 | `90vh`（Drawer）、`85vh`（Dialog）、`100vh`（Toast）、`90vh`（Image preview）；无 `dvh` / `svh` | `rg -n "vh" src/components/{drawer,dialog,toast,image}` |
| 软键盘 | `visualViewport` **0 处** | `rg -n "visualViewport" src/` |
| 固定定位件 | **6 个组件文件**：Drawer / Dialog / ConfirmDialog / Toast / BackTop / Image preview | `rg -l "position: fixed" src/components` |
| 移动壳组件 | **均无**：Cell / CellGroup / Tabbar / NavBar / ActionSheet / Empty / Picker | `ls src/components/` |

**结论**：caomei-ui 的移动下限已有基础（密度轴、24px 命中区、五档视口、浮层收敛），缺的是**壳层语义与固定件避让**，不是手势体系或移动优先组件库。

## 4. 候选判定

### 4.1 判定口径

- **三条标准**取自 caomei-todo 架构 §11.5（见 §2）；`A` = 触屏明显不可用，`B` = 无现成替代，`C` = ≥2 高频页面复用。**`C` 的取值为 caomei-todo 文档声明的规划值（无代码 / 无页面级用量取证）**。
- **库边界**：移动端独立包、手势交互、基于 JS 的视口分支、容器查询、`DataTable` 卡片化、通过放大视觉尺寸提升触摸目标，均属[响应式设计 §1](../responsive.md) 的非目标；本轮不因下游需求推翻这些边界。
- **判定档**：`A✓ B✓ C✓` → 直接缺口，阶段候选；`A ~ + B ✗ + C ✓` → 下游当前不放上游，本仓提前承担属**主动扩界**，仅可作薄层候选并须用户裁定；`B✗` 且无真实复用 → Backlog 或配方；既有 P0 组件缺口（非移动专属）→ 由组件缺口驱动，不受三条标准约束；政策 / 文档类 → 决策项 + 主线；与库边界冲突 → [Backlog §3](../../plan/backlog.md) 不纳入。

### 4.2 逐条判定

| # | 候选 | 来源 | 判定 | 落点 |
|:-:|:---|:---|:---|:---|
| C1 | 滚动容器键盘聚焦「无条件完整可见」 | §1.5 | 非本轮触发（Chromium 焦点滚动限制，已登记） | 维持 Backlog |
| C2 | Toolbar 769–1023px 容器收敛档 | §1.5 | 响应式缺口，非移动壳；无真实溢出用例 | 维持 Backlog |
| C3 | Picker（滚轮选择器） | §1.5 / caomei-todo 架构 §11.5 | A 未取证（`DatePicker` 面板可用）、B ✗、C — | Backlog，触发 = iOS 真机反馈 |
| C4 | ActionSheet | §1.5 / caomei-todo 架构 §11.4 / §11.5 | A ~（`Drawer` + `Menu` 可用，缺取消项 / 分组 / 危险项 / 焦点回退）、B ✗（§11.5 处置为先用 `Drawer` + 菜单）、C ✓（任务操作 + 批量操作） | **阶段候选 M3（主动扩界，D1 裁定）** |
| C5 | Cell / CellGroup | §1.5 / caomei-todo 需求 FR-TASK-01 / 02 / 05 | A ~（`Card` / 列表组合可用，缺行语义）、B ✗（§11.5 处置为 `Card` / 列表组合）、C ✓（任务 / 清单；设置 / 搜索为本仓推断） | **阶段候选 M2（主动扩界，D1 裁定）** |
| C6 | SafeArea + 动态视口（固定定位件） | §1.5 / caomei-todo 架构 §11.4 / §11.5 | A ✓、B ✓（0 处 `env`、6 个固定件未避让；§11.5 明写「建议上游补工具类或文档」）、C ✓（所有移动页） | **阶段候选 M1** |
| C7 | Sticky 吸顶工具 | §1.5 | A ✗（原生可用）、B ✗ | Backlog（配方） |
| C8 | Tabbar（presentational） | §1.5 / caomei-todo 架构 §11.4 | A ~（`Toolbar` / `Tabs` 可拼，缺 tabbar 语义）、B ✗（§11.5 处置为应用层布局）、C ✓（4 个根页） | **阶段候选 M2（主动扩界，D1 裁定）** |
| C9 | NavBar（路由级页头） | §1.5 / 本仓推断（§11.5 未单列 NavBar） | A ~（`Toolbar` + `Button` 可拼）、B ✗ | Backlog |
| C10 | 移动端适配指南 | §1.5 / caomei-todo 架构 §11.4 | 政策 / 文档类，不套 A/B/C | **阶段候选 M4** |
| C11 | Empty | §1.11 / caomei-todo 需求 FR-TASK-01 / 07 / 11 | 既有 P0 组件缺口（非移动专属）；B ✗（`DataView` 空文案可替）、C ✓（空列表 / 搜索 / 回收站） | **阶段候选 M3** |
| C12 | 触摸目标 44×44 可选档 | 本轮新增 / caomei-todo 需求 NFR-09 | 政策类，不套 A/B/C；关键操作 44、现有替代为 `size="lg"` / touch 密度 | 决策 D2 + M4 政策 |
| C13 | 软键盘遮挡 | 本轮新增 / [调研记录](./2026-11-18-i18n-component-and-mobile-research.md) §5.4 第 4 条 | 未取证（无真机；caomei-todo 文档未提出该诉求） | Backlog，触发 = 真机反馈 |
| C14 | Search 栏组合件 | 本轮新增 / 需求 FR-TASK-07 + 本仓推断（搜索栏形态） | A ~、B ✗（`Input` 可拼）、C ✓（搜索页；选择器筛选为本仓推断） | Backlog（配方优先） |
| C15 | 手势交互型移动件 | 本轮新增 / caomei-todo 架构 §11.5 | 与库边界冲突；下游应用层实现 + 可见按钮兜底 | [Backlog §3](../../plan/backlog.md) 不纳入 |
| C16 | NumberKeyboard | 本轮新增 | 一期无金额 / 验证码专用键盘需求 | [Backlog §3](../../plan/backlog.md) 不纳入 |

**候选覆盖声明**：§1.5 更新后 **13 行**（原 8 行；`SafeArea / Sticky` 与 `NavBar / Tabbar` 各拆为 2 行，新增 44 轴 / 软键盘 / Search 栏 3 行）+ §1.11 **1 行**（Empty）+ §3 新增 **2 条**（C15 / C16）= **16 项**，与 C1 ~ C16 逐条一一对应。**逐条均有落点，无静默豁免。**

## 5. 主线草案（待用户裁定）

> 本节是**唯一**的候选 → 主线映射口径；阶段编号在授权时取「已有最大编号 + 1」，本节不写定值。条目为草案，不构成登记。

| 主线 | 候选 | 原子条目（草案） |
|:---|:---|:---|
| M1 移动端基础层（安全区 / 动态视口） | C6 | M1-1 安全区 token 与工具类；M1-2 固定定位件接入 |
| M2 移动壳组件（Cell / Tabbar） | C5、C8 | M2-1 Cell / CellGroup；M2-2 Tabbar；M2-3 locale / 台账 / 文档 |
| M3 操作与空态（ActionSheet / Empty） | C4、C11 | M3-1 ActionSheet；M3-2 Empty；M3-3 locale / 台账 / 文档 |
| M4 口径与验收（指南 / 44px / 回归） | C10、C12 | M4-1 移动端适配指南；M4-2 44px 政策与回归扩面 |
| M5 发布收口（条件） | — | M5-1 `1.4.0` 发布 |

**构成对账**：2 + 3 + 3 + 2 + 1 = **11 条原子条目**（M1 2 / M2 3 / M3 3 / M4 2 / M5 1）。

**驱动分类**：M1（C6）是唯一同时满足三条标准的直接缺口；Empty（C11）是既有 P0 组件缺口；M4 是口径与验收。**M2（C5 / C8）与 ActionSheet（C4）属主动扩界**——caomei-todo 架构 §11.5 对这三项的处置均为应用层先行，本仓提前承担须经 D1 授权，不能写成「下游已达标」。若 D1 排除扩界项，M2 与 M3-1 不纳入，条目数相应减少。

### M1 移动端基础层

- **范围**：`--caomei-safe-area-{top,right,bottom,left}` 默认 `env(safe-area-inset-*, 0px)`；`.caomei-safe-area-*` 工具类；Drawer（四向 / 底部）、Dialog / ConfirmDialog、Toast、BackTop、Image preview 接入安全区；Drawer / Dialog / Toast / Image preview 的高度上限补 `dvh` 回退。
- **非目标**：不做 `visualViewport` 监听、不做按视口自动切换密度、不改桌面几何。
- **验收下限**：`env()` 为 0 时桌面计算样式与视觉基线零差异；夹具把 token 覆盖为 **34px** 时可测量生效（E2E 断言 padding / offset）；Drawer 底部内容可滚到底；Toast 上下位置、BackTop 右下角避让；三条关闭路径不回归。
- **条目**：M1-1 安全区 token 与工具类（含演示与文档）；M1-2 固定定位件接入与 `dvh` 回退（含 `capture:styles` 采样）。

### M2 移动壳组件

- **范围**：`CaomeiCell` / `CaomeiCellGroup`（标题 / 描述 / 右值 / 前后插槽 / 进入态；`as` 为 `div` / `button` / `a`，点击语义由宿主承载）；`CaomeiTabbar` / `CaomeiTabbarItem`（`v-model`、`aria-current`、图标 / 文案 / 角标、安全区、≥44 高）。均为**展示层**，不依赖 vue-router。
- **非目标**：不做 SwipeCell、不做页面切换 / 路由守卫、不做手势、不做底部弹层。
- **验收下限**：键盘可达、焦点可见、`aria-current` 单值；320 视口无横向溢出；暗色与预设；`data-density="touch"` 档位；10 语可访问名；单测 + E2E。
- **条目**：M2-1 Cell / CellGroup；M2-2 Tabbar；M2-3 locale / 台账 / 组件页与设计清单同步。

### M3 操作与空态

- **范围**：`CaomeiActionSheet` 以 `Drawer position="bottom"` 组合（标题 / 说明 / 分组 / 危险项 / 取消项 / 选择后关闭 / 焦点回退）；`CaomeiEmpty`（图标或图片、标题、说明、`#action`、尺寸档）。
- **非目标**：不新增 primitive、不做手势、不做全屏 Dialog、不复制 `DataView` 的空态插槽。
- **验收下限**：取消项恒在末位且可聚焦；选择后关闭与焦点回退；危险项语义与色板；Empty 在 320 下不裁切；与 `DataView` 空态的关系在文档中单点声明。
- **条目**：M3-1 ActionSheet；M3-2 Empty；M3-3 locale / 台账 / 文档与 `DataView` 关系说明。

### M4 口径与验收

- **范围**：移动端适配指南（bottom sheet、安全区、吸顶、固定底部操作条、软键盘可见性、五条下限判据）；44×44 的达成路径与间距口径；新组件纳入 `responsive.e2e.ts`、视觉基线与 `capture:styles`，受检面下界同步上调；[响应式设计](../responsive.md) §1 / §3 回链。
- **非目标**：不把 44 设为默认、不放大视觉尺寸、不引入视口监听。
- **验收下限**：指南中英双页同构；四组新组件（Cell / CellGroup、Tabbar、ActionSheet、Empty）在 320 / 390 / 768 / 900 / 1280 五档的断言；`pnpm test:e2e`、视觉基线、`capture:styles` 全绿。
- **条目**：M4-1 移动端适配指南；M4-2 44px 政策与回归扩面。

### M5 发布收口（条件）

- **范围**：`1.4.0` 经 CI 发布；发布后校验与版本句同步。
- **前置**：当周周回归为绿 + 用户明确授权。
- **非目标**：不自动发布、不进入 2.0、不重指 tag。
- **条目**：M5-1 发布与发布后同步。

## 6. 推荐组合与决策点

**推荐「核心 + 主动扩界」两段**：核心 = **M1 + Empty + M4**（直接由缺口驱动）；主动扩界 = **M2 + ActionSheet**（caomei-todo 架构 §11.5 当前置于应用层，本仓提前承担须 D1 明确授权）。理由：M1 是唯一同时满足三条标准的直接缺口（`env` 0 处、6 个固定件未避让）；Empty 是既有 P0 组件缺口；M4 把口径落到可机检。M2 与 ActionSheet 是移动壳层里复用面最大的部分，符合用户「以移动端体验为主」的目标，但**不能以「下游已达标」为由自动纳入**；4 组新组件均为展示 / 组合层，不新增运行时依赖、不接路由、不碰手势。

- **D0 阶段取向**：① **核心 + 主动扩界全取**（推荐，匹配「以移动端体验为主」）｜② 仅核心（M1 + Empty + M4）｜③ 仅 M1 + M4（基础层与口径，零新组件）｜④ 暂不启动（全部维持 Backlog）
- **D1 主动扩界范围（D0 取 ① 时生效）**：① Cell / CellGroup + Tabbar + ActionSheet（推荐）｜② Cell / CellGroup + Tabbar｜③ 仅 ActionSheet｜④ 全部留 Backlog
- **D2 触摸目标 44**：① 维持 24 下限 + 文档口径（推荐）｜② 新增可选 `data-hit-target="comfortable"` 轴（44，需同步间距守卫）｜③ `data-density="touch"` 默认 44
- **D3 空态范围**：① 仅 Empty（推荐）｜② Empty + Result｜③ 不纳入（`DataView` 空文案够用）
- **D4 发布**：① 阶段末发 `1.4.0`（推荐，新组件需要可消费版本）｜② 不发布（`latest` 维持 `1.3.0`）

## 7. 风险与前置

| 项 | 风险 / 前置 | 处置 |
|:---|:---|:---|
| 新组件 API | 1.x 公共 API 一旦发布难改 | 先出 API 草案（命名 / 插槽 / 事件 / 是否 `asChild`）再实现；只保留必要 props |
| 安全区与 `dvh` | 触及 6 个固定定位件的几何 | 先落桌面零差异基线，再改；以 token 覆盖 34px 的夹具取证 |
| Tabbar 边界 | 下游可能要求 `to` / 路由守卫 | 文档写明「展示层，不接 vue-router」；路由由使用方插槽承载 |
| 44px 默认化 | 相邻 24px 命中区会重叠（值片行距仅 +2px） | 维持 opt-in；若新增轴，必须同批给间距守卫与负向用例 |
| Empty 双载体 | 与 `DataView` 空态并存会产生两套口径 | 文档指定唯一关系：`DataView` 负责容器空态，`Empty` 负责页面 / 区块空态 |
| 下游无代码 | 组件可能按规划过度设计 | slot 优先、props 最小；caomei-todo 实施反馈后再扩 |
| 主动扩界 | Cell / Tabbar / ActionSheet 在 caomei-todo §11.5 均为应用层先行，本仓提前承担缺少下游实测复用 | D1 显式裁定；实现保持薄层与插槽优先，下游落地后按实际反馈再扩 |
| 计数器 | 新增组件触发总览页 / 设计清单 / locale 台账 / README 计数 | 每条实现条目把计数回扫列入验收，不后置 |
| 发布 | 依赖当周周回归为绿 | D4 选发布时，阶段末先跑周回归 |

## 8. 声明与落点

- 本记录**只做评估**：未分配阶段编号、未改 `todo.md` / `roadmap.md`、未改 `src/**`、未新增依赖。
- 本轮 Backlog 变更：[§1.5](../../plan/backlog.md) 8 行 → 13 行（拆分 SafeArea / Sticky 与 NavBar / Tabbar 各 +1，新增 44 轴 / 软键盘 / Search 栏 3 行）；[§1.11](../../plan/backlog.md) 的 Empty 补下游依据并上调优先级；[§3](../../plan/backlog.md) 新增手势交互型移动件与 NumberKeyboard 两条不纳入结论。
- **口径更正**：ActionSheet / Cell / Tabbar 三行不写「三条标准达标」——caomei-todo 架构 §11.5 对三者的处置均为应用层先行，上游提前承担属**主动扩界**，待 D1 裁定；Empty 改记为既有 P0 组件缺口（非移动三条标准驱动）。
- 用户裁定后按[规划规范 §4](../../standards/planning.md) 取「已有最大编号 + 1」登记，并同批同步 `todo.md` / `roadmap.md` / 治理索引 / `.session`。

## 9. Review Gate

- **R1（`standard`，时间盒 ≤ 10 分钟）**：**Reject** —— 2 blocker / 5 warning / 5 suggest。
  - **RG-B01**：C4 / C5 / C8 的判定与 caomei-todo 架构 §11.5 的处置方向相反（来源为「应用层布局 / Card 组合 / 先 Drawer + 菜单」）。已改判 `A ~ + B ✗ + C ✓`，落点改为「主动扩界，D1 裁定」；§5 增加驱动分类，§6 改为「核心 + 主动扩界」，Backlog 三行与索引摘要同步。
  - **RG-B02**：wisdom 读数写 20，脚本实测 16。已改为 16 并附 `WISDOM_OK: 16 active entries (threshold 20)`。
  - warning：`同上` 溯源（W01）、实现形态双写（W02）、引用精度（W03）、§9 悬空（W04）、判定档缺口（W05）。
  - suggest：CI run id、绝对断言、立项 / 架构版本、NumberKeyboard 通配引用、§4.1 复述。
- **R2（`quick`，时间盒 ≤ 5 分钟）**：**Pass** —— blocker 0 / warning 1（RG-W02 残留，同批删除）/ suggest 4。
  - 关闭：RG-B01、RG-B02、RG-W01、RG-W03、RG-W05；RG-W02 的标题残留（「不接路由」）同批删除；RG-W04 由本段回填关闭。
  - 复算：C1 ~ C16 共 16 条；§1.5 13 行；2 + 3 + 3 + 2 + 1 = 11 条原子条目；13 + 1 + 2 = 16 项候选。
  - R2 新增 suggest（RG-R2-S01 ~ S04）同批处理：设置行标注本仓推断、C6 补 §11.5 引文、兼容 run 补 id、工作区读数改为「读取时」。
- **验证**：`pnpm exec lint-md`（3 文件）、`pnpm docs:check:integrity`、`pnpm docs:check:links`、`pnpm check:governance-records`、`pnpm check:governance-counts`、`pnpm check:final-newline` 均通过；`pnpm distill:wisdom --check` → `WISDOM_OK: 16 active entries (threshold 20)`。
- **用时**：R1 / R2 均未在发起前采集宿主时间戳（流程偏差，无法复算 elapsed）；R2 工件落盘时点为 `2026-11-20T00:40:48+08:00`。两轮均按声明档位收敛，未扩张审查范围；后续批次日须先记时点再发起。
- **证据记录**：`artifacts/review-gate/2026-11-20-mobile-evaluation.md`（gitignored，含 R1 / R2 明细）。
