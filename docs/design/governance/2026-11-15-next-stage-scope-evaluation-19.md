# 下一阶段范围评估（第十九轮）：质量与无障碍收口、DataTable 进阶、Rating

> 创建时间：2026-11-15
> 触发：用户指令「开始下一阶段待办规划」（Phase 34 归档后，当前无进行中阶段）。
> 依据：[规划规范 §3（含第 10 条决策提问纪律）](../../standards/planning.md)（评估 → Backlog → 用户决策 → 登记；编号只在授权启动时分配）。本记录只产出候选与建议，登记见 [Phase 35 登记批次](./2026-11-15-phase35-registration.md)。

## 1. 事实盘点

### 1.1 仓库状态

- `master` HEAD `bf67d19`（Phase 34 归档批次），工作区干净；`latest = 1.3.0`，`v1.3.0..HEAD` 累计 **55** 个提交（写录时点）。
- 对外面：open PR **0** / open issue **0**（`gh pr list` / `gh issue list`，2026-11-15）。
- 质量面：`pnpm verify` `exit 0`；`test:visual` 46 个基线（含 back-top / time-picker 亮暗）；a11y 受检面 64 个夹具；locale 30 命名空间 / 89 条文案；`capture:styles` 399 项 0 差异。
- 长期任务：第 38 轮门槛复核完成——待执行批次 0 / 条件触发 1 / 不纳入 5；wisdom 15 条活跃（< 20）。

### 1.2 候选池（`backlog.md` §1，只计数据行）

| 分组 | 条数 | 说明 |
|:---|:-:|:---|
| §1.1 组件增强 | 0 | — |
| §1.2 长尾组件 | 3 | Sidebar（Drawer 可承接）/ ScrollPanel（不自研）/ Rating（低） |
| §1.3 不纳入自研 | 0 | — |
| §1.4 国际化 | 2 | 二期 8 语 / RTL |
| §1.5 移动端 | 2 | 滚动容器键盘聚焦 / Toolbar 769–1023 |
| §1.6 基建与治理 | 10 | 含多版本托管、Storybook、Tailwind preset、依赖升级条件项等 |
| §1.7 服务层 | 1 | `useDialog`（评估结论：暂不实现） |
| §1.8 下游协同 | 1 | momei 侧迁移（等待反馈） |
| §1.9 图标体系 | 1 | I5 `@iconify/vue` peer（条件触发） |
| §1.10 动效体系 | 0 | A1 ~ A8 已交付 |
| **合计** | **20** | 2026-11-15 读数 |

### 1.3 阶段遗留（F 项）

| 项 | 内容 | 现状 |
|:---|:---|:---|
| F18 | Select 展开时兄弟节点仅 `aria-hidden`、未 `inert`，axe `aria-hidden-focus` 命中 `#app` | 打开态矩阵有意排除该规则，关闭判据已登记 |
| F1 | 可测量盒缺真实布局级持久守卫（`display` 未进 capture 基线 / 无 E2E 对照） | 未交付 |
| F14 | 验证表计数须与逐点清单求和一致，多批以人工核对 | 已两次判 blocker |
| F16 | Menu 项槽被整体包进文本盒，`--caomei-menu-item-gap` 不作用于「图标 + 文本」 | 下一阶段评估 |
| F17 | DataTable 默认单元格逐格一套提示接线，大表为 O(行 × 列)，缺退出开关与规模实测 | 出现性能反馈或大表用例时评估 |

### 1.4 条件触发项

| 项 | 触发条件 | 现状 |
|:---|:---|:---|
| `typescript` 7 | `vue-tsc` / `tsdown` 支持 TS 7 原生 API | 未满足 |
| `glob` 跨 major | 上游支持 `glob ≥ 14.0.2` 且三项门禁全绿 | 未满足 |
| `conventional-changelog` 8 | preset > 3.0.0 且兼容 writer 9 | 未满足 |
| CI 运行器镜像迁移 | 周级 e2e `Image:` 命中 `ubuntu-26.04` | 未命中 |
| 国际化二期 / RTL | 语言集扩容 / RTL 立项 | 未决策 |
| I5 `@iconify/vue` peer | 出现必须运行时按字符串加载的真实用例 | 未出现 |

## 2. 候选逐条评估

| 候选 | 落点 | 依据 |
|:---|:---|:---|
| F18 Select `inert` | **纳入（推荐）** | 现代 Chromium / Safari / Firefox 均支持 `inert`；关闭判据已由 [Phase 34 M3-1 记录](./2026-11-15-phase34-m3-1-open-state-axe.md) 给出（`select-open-zh` 加回 `aria-hidden-focus` 并翻转单测）。改动集中在 Select 的打开态兄弟处理与 a11y 面，风险可控 |
| F1 布局级守卫 | **纳入（推荐）** | 现有 `capture:styles` 采样不含 `display`，M1-1 的「可测量盒」只能靠单测与一次浏览器取证；补 E2E 对照 + 采样项可防止 `display: inline` 回归 |
| F14 计数机检 | **纳入（推荐）** | 本阶段 M5-1 / M5-3 / 归档批均因「记录内计数 / 文件面」反复驳回，人工核对成本高；将「§1 文件面」「§3 用例数」「索引摘要」纳入机检可结构性消除 |
| F16 Menu 槽约束 | **纳入（推荐）** | 评估 `icon` prop / `#icon` 槽的两种形态，属组件 API 增量；与既有 Menu 文档约束同批 |
| F17 DataTable 性能 | **纳入（推荐）** | 先做规模实测（大表渲染与提示接线开销），再决定默认退出开关（如超过行数阈值不挂提示），避免无依据改默认 |
| DataTable 列可见性 / 顺序 | **纳入（推荐）** | `@tanstack/vue-table` 已提供 `columnVisibilityFeature` / `columnOrderingFeature`，无需新增依赖；受控优先、默认保持现状 |
| DataTable 列宽调整 | **纳入（推荐）** | `columnSizingFeature` 已在依赖内；需定义「受控 + 持久化」契约，避免与现有 `width` 声明冲突 |
| Rating | **纳入（推荐）** | Reka 提供 `RatingRoot` / `RatingItem`；下游存在 1 处 Vue 2 旧用法可作缺口参考；属长尾里唯一有明确原语与低风险的一项 |
| i18n 二期 8 语 / RTL | 维持（未裁定） | 8 语 × 89 键 + RTL 布局审计，规模超过单阶段容量；需单独立项 |
| DataTable 虚拟滚动（池外，Phase 34 非目标） | 维持（条件） | 需新增 `@tanstack/vue-virtual` 运行时依赖，且与行分组 / 展开 / 固定行高相互约束；先以列能力与性能实测为主 |
| Sidebar / ScrollPanel | 维持（无真实用例） | Sidebar 可由 Drawer 承接；ScrollPanel 已判不自研 |
| 滚动容器键盘聚焦「无条件完整可见」 | 维持（条件触发） | Chromium 焦点滚动机制限制；触发条件 = 下游无障碍审计提出 |
| Toolbar 769–1023px 容器收敛档 | 维持（条件触发） | 与 ButtonGroup 同源 md 档空档；触发条件 = 真实溢出用例或用户裁定 |
| ui-validator 资产 follow-up | 维持（待具体化） | 描述未具体化，需先评估再定批次 |
| 文档站示例外链守卫漏判面扩展 | 维持（条件触发） | 现行整文件 fail-closed；触发条件 = 出现合法非图片外链用例 |
| dev 形态 hydration 守护 | 维持（条件触发） | 生产构建静默修补使告警恒为 0；触发条件 = 首页结构 / 主题层新增客户端状态 |
| momei 侧迁移执行 | 维持（等待外部反馈） | 执行主体为 momei 项目 |
| Form 规则引擎（池外，设计文档候选）/ `useDialog` | 维持 | 需新增运行时依赖 / 契约，未获授权 |
| I5 可选运行时 `@iconify/vue` peer | 维持（条件触发） | 未出现必须运行时按字符串加载的真实用例；默认不引入 |
| TS 7 / glob / changelog 8 / CI 镜像 | 维持（条件触发） | 上游未满足 |
| 文档站多版本 / Storybook / Tailwind preset | 维持 | 触发条件未满足 |

> **候选覆盖声明**：§1.1 0 + §1.2 3 + §1.3 0 + §1.4 2 + §1.5 2 + §1.6 10 + §1.7 1 + §1.8 1 + §1.9 1 + §1.10 0 = **20 条，逐条均有落点，无静默豁免**；其中 Rating 为池内行、本批已登记并移出。新增候选（F18 / F1 / F14 / F16 / F17 / DataTable 列能力）为池外来源，单列不计入 20。

## 3. 用户决策（2026-11-15）

| 决策 | 结果 |
|:---|:---|
| D1 主线组合 | **质量收口 + DataTable 进阶** |
| D2 质量债范围 | **F18 / F1 / F14 / F17 / F16 全取** |
| D3 发布节奏 | **本阶段不发布**（`latest` 维持 `1.3.0`） |
| D4 额外新能力 | **长尾 Rating** |

## 4. 建议范围（已按决策收敛）

- **3 条主线 / 10 条原子条目**：
  - M1 质量与无障碍收口 **5**（F18 / F1 / F14 / F17 / F16）；
  - M2 DataTable 进阶 **2**（列可见性与顺序 / 列宽调整）；
  - M3 长尾 **3**（Rating 实现与导出 / locale 与台账 / 文档与测试）。
- **不发布**；虚拟滚动、i18n 二期 / RTL、Form 规则引擎、`useDialog`、Sidebar / ScrollPanel 均为非目标。
- 详细验收口径见 [Phase 35 登记批次](./2026-11-15-phase35-registration.md) §2。
