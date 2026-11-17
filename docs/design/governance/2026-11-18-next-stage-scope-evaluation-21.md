# 下一阶段范围评估（第二十一轮）

> 创建时间：2026-11-18
> 触发：用户指令「开始下一阶段规划」（Phase 36 已于 2026-11-18 归档）。
> 性质：**评估记录，不构成阶段登记**。用户决策后另行登记 `todo.md` / `roadmap.md`（[规划规范 §3](../../standards/planning.md)）。

## 1. 现状读数（2026-11-18）

| 面 | 读数 |
|:---|:---|
| 仓库 | `master` = `86d09a7`，工作区干净；Phase 36 已归档，`todo.md` 无进行中阶段 |
| 版本 | `latest` = **`1.3.0`**（2026-11-14 经 CI 发布） |
| Issue / PR | open issue **0** / open PR **0** |
| 安全告警 | Dependabot open **0**（fixed 70 / auto_dismissed 1，`glob`）；Code Scanning open **0** |
| CI | 最近一次 `master` push（`86d09a7`）Test / CodeQL / Security Alerts / Deploy Pages 全绿 |
| 长期任务 | 第 40 轮门槛复核（2026-11-18，Phase 36 收口）：待执行 0 / 条件触发 1 维持 / 不纳入 5 维持；`capture:styles` 399 项 0 差异 |
| wisdom | 16 条活跃（< 阈值 20） |

**下游锁定版本复核**（取各仓 `pnpm-lock.yaml` 解析值；仓库 HEAD 同日）：

| 下游 | 仓 HEAD | 声明 | 锁定版本 | 前次读数（2026-11-16） |
|:---|:---|:---|:---|:---|
| dependfix（`apps/platform`） | `666b95a5` | `1.2.0` | **`1.2.0`** | `1.2.0` |
| caomei-auth | `8590df3` | `1.3.0` | **`1.3.0`** | `1.3.0` |
| momei | `96609b83` | `^1.2.0` | **`1.2.0`** | `1.2.0` |

**结论**：三仓锁定版本与 2026-11-16 一致，无兼容红；`1.3.0` 仍仅 caomei-auth 采用，momei 页面级反馈仍未提供（「等待外部反馈」维持）。

## 2. 候选盘点

### 2.1 Phase 36 执行期观察项（新增候选来源）

| # | 候选 | 来源 | 触发条件 / 状态 |
|:--|:---|:---|:---|
| O1 | 虚拟滚动落地 | [M2-2 评估](./2026-11-17-phase36-m2-2-virtual-scroll-evaluation.md) | 结论「可行（有条件）」；触发 = 单页 > 200 行（经验值，须实测校准）或用户裁定；需新增 `@tanstack/vue-virtual`（18.8 KB） |
| O2 | 列宽拖拽残余补齐 | [M2-1 记录](./2026-11-18-phase36-m2-1-column-resize-handle.md) §4 | 冻结列吸边像素级几何断言、`min` / `step` 可配置、resize 结束事件 |
| O3 | 浮层隔离残余补齐 | [M1-4](./2026-11-18-phase36-m1-4-overlay-regression.md) / [M1-5](./2026-11-17-phase36-m1-5-dropdown-popover-inert.md) | DropdownMenu E2E 夹具锚点、页面级非模态 Popover 三视口 Tab 用例、`pointerdown` 在 `disableOutsidePointerEvents` 下的窗口 |
| O4 | 隔离工具下沉复用 | M1-2 / M1-5 Review Gate suggest | `useOpenStateIsolation` 已在 `_shared`；Select / DatePicker / ColorPicker / Combobox 四组件仍是逐份接线 |

### 2.2 在册候选（[Backlog](../../plan/backlog.md) §1 全部在册项）

| 优先级 | 载体 | 候选（逐条） | 触发条件 / 状态 |
|:---|:---|:---|:---|
| 中 | §1.1 | Select 家族空串选项值 opt-in | 下游哨兵绕行（caomei-auth `__browser__`、momei `__all__` / `__never__`）；形态 `allowEmptyValue` / `emptyValues`，连带 `hasValue` / `data-filled` / `showClear` 须一并裁定 |
| 中 | §1.6 | CI 运行器镜像迁移检测（`ubuntu-26.04`） | 待触发检测义务：周级 `e2e` 的 `Set up job` 出现 `ubuntu-26.04` 后按重冻结 5 步执行 |
| 低 | §1.1 | Rating 半星以外形态 / 表单集成 | 出现十分制 / 自定义图标集或 `CaomeiForm` 字段契约需求 |
| 低 | §1.2 | Sidebar；ScrollPanel 型滚动面板 | Sidebar：出现 Drawer 语义不适配用例；ScrollPanel：出现视口检测 / 滚动条定制 / 虚拟滚动等原生无法覆盖的用例（否则维持不自研） |
| 低 | §1.4 | 二期语言矩阵（`it` / `nl` / `pl` / `tr` / `vi` / `th` / `id`）；RTL | 语言集扩容决策 / RTL 立项 |
| 低 | §1.5 | 滚动容器键盘聚焦「无条件完整可见」；Toolbar 769–1023px 容器收敛档 | 前者：下游无障碍审计提出；后者：出现真实溢出用例或用户裁定同档位补齐 |
| 低 | §1.6 | 文档站多版本托管；ui-validator 资产 follow-up；Tailwind preset；Storybook；`conventional-changelog` 8；示例外链守卫漏判面扩展；`typescript` 7；`glob` 跨 major 覆盖；dev 形态 hydration 守护；选择器哨兵 / 迁移口径统一 | 逐条触发条件见 Backlog §1.6（多版本 = 同时维护 ≥2 对外版本；外链守卫 = 出现合法非图片外链；changelog 8 = preset 发布 > 3.0.0 且兼容 writer 9；TS 7 = `vue-tsc` / `tsdown` 声明并实测支持；`glob` = 上游支持 ≥ 14.0.2 且本仓三项全绿；hydration = 首页结构 / 主题层新增客户端状态；选择器哨兵 = P1 决策落地或下一次文档批次） |
| 低 | §1.7 | 通用对话框服务 `useDialog` | 出现非组件上下文的命令式弹窗用例 |
| 等待外部反馈 | §1.8 | momei 侧迁移执行 | 执行主体为 momei；本仓等待反馈（维持） |
| 低 | §1.9 | I5 可选运行时 `@iconify/vue` peer | 出现「必须运行时按字符串加载」的下游用例 |
| — | §1.3 / §1.10 | 暂无在册候选 | — |

**候选覆盖声明**（逐小节计数，按 Backlog 键集合枚举）：§1.1 **2** / §1.2 **2** / §1.3 **0** / §1.4 **2** / §1.5 **2** / §1.6 **11** / §1.7 **1** / §1.8 **1** / §1.9 **1** / §1.10 **0** = **22**，与上表逐条落点一致（22 条全部有行）；Phase 36 观察项 O1 ~ O4 见 §2.1。**逐条均有落点，无静默豁免。**

### 2.3 安全与依赖

- open 告警 0；`glob` 的 auto_dismissed 记录（2026-11-02）不构成当前风险；无新增依赖需求（除 O1 若立项）。

## 3. 推荐组合

**推荐 A + B（质量收口 + 选择器空值 opt-in），不新增运行时依赖、不发布**：

- **A｜Phase 36 遗留收口（O2 / O3 / O4）**：把列宽拖拽与浮层隔离的残余证据补齐、隔离接线下沉共享，属「已交付能力的判别力与复用」收口，风险低、可机检。
- **B｜Select 家族空值 opt-in（P1）**：下游真实诉求（两仓哨兵），契约变更需一并裁定 `hasValue` / `data-filled` / `showClear`；只改库内归一化与类型，不新增依赖。
- **可选 C｜文档与迁移口径（P2）**：哨兵统一与 PrimeVue 陷阱，可与 B 同批（B 落地后口径才有意义）。
- **O1 虚拟滚动**：**建议不立项**——触发条件未命中（无 > 200 行实测用例），且需新增运行时依赖。

## 4. 决策点（≤5 项，待用户裁定）

- **D0 阶段取向**：① 推荐组合 A + B（+ C）｜② 只做 A 质量收口｜③ A + B + 虚拟滚动（O1，新增依赖）｜④ 只做文档 / 迁移口径｜⑤ 全取（含长尾组件；等于放弃其触发条件前置要求，长尾候选一律提前纳入）
- **D1 空值 opt-in 形态**：① `allowEmptyValue`（默认 `false`，最小面）｜② `emptyValues`（Element Plus 式，可配多值）｜③ 暂不做（维持现契约）
- **D2 虚拟滚动**：① 本阶段不立项（推荐）｜② 立项并新增 `@tanstack/vue-virtual`｜③ 只补 > 200 行实测基线
- **D3 发布**：① 不发布（推荐，`latest` 维持 `1.3.0`）｜② 阶段末发 `1.4.0`
- **D4 长尾 / 条件触发候选**：① 全部维持 Backlog（推荐）｜② 纳入 CI 镜像检测｜③ 纳入 Rating 表单集成

## 5. 风险与前置

| 项 | 风险 / 前置 | 处置 |
|:---|:---|:---|
| B 空值 opt-in | 改 `hasValue` 语义会牵动 `data-filled`、浮标 label 与清除按钮 | 决策时一并裁定三项口径；先出契约设计再实现 |
| O1 虚拟滚动 | 新增运行时依赖、SSR 回退、行高测量与选择 / 展开 / 冻结列交互 | 未命中触发条件前不立项 |
| O3 浮层残余 | E2E 夹具锚点新增会触及 `overlay-panels.json` 受检集合 | 与 `check:overlay-z-index` 同批登记 |
| D3 发布 | 发布需当周周回归为绿 | 若选发布，阶段末先跑周回归 |

## 6. 声明

- 本记录**只做候选盘点与推荐组合**，不登记阶段、不分配编号、不修改 `todo.md` / `roadmap.md`。
- 候选来源与落点逐条可查：覆盖计数与逐条落点见 §2.2 末的「候选覆盖声明」，本记录不重复断言。
- 用户裁定后按 [规划规范 §4](../../standards/planning.md) 取「已有最大编号 + 1」登记，并同批同步 `todo.md` / `roadmap.md` / 治理索引 / `.session`。

## 7. Review Gate

- **R1（`standard`）**：Reject —— 2 blocker（候选盘点漏 3 条在册项、缺覆盖声明且「无静默豁免」断言失实）/ 1 warning（§1.8 未入表）/ 3 suggest。
- **R2（`quick`）**：Pass —— 两条 blocker 关闭（覆盖计数 22 与逐条落点独立复算一致）；3 条 suggest 同批处理（D0 ⑤ 措辞、§1.6 行内触发、索引 Review Gate 指针）。
- 验证：`lint:md:check` / `docs:check:links` / `governance:check` 全绿；未登记阶段、未分配编号、未改 `todo.md` / `roadmap.md`。
