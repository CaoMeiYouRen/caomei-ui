# 下一阶段范围评估（第二十轮）

> 创建时间：2026-11-16
> 触发：用户指令「开始评估下阶段待办」+「等待外部反馈这里重新检查下对应仓库当前使用的版本」。
> 性质：**评估记录，不构成阶段登记**。用户决策后另行登记 `todo.md` / `roadmap.md`（[规划规范 §3](../../standards/planning.md)）。

## 1. 现状读数（2026-11-16）

| 面 | 读数 |
|:---|:---|
| 仓库 | `master` = `50e3380`，工作区干净；Phase 35 已归档，`todo.md` 无进行中阶段 |
| 版本 | `latest` = **`1.3.0`**（2026-11-14 经 CI 发布） |
| Issue / PR | open issue **0** / open PR **0** |
| 安全告警 | Dependabot open **1**（low，`deepmerge` — `mergeObject()` 原型污染）；无 critical / high |
| 下游兼容矩阵 | 最近成功 run `43590922508`（2026-11-14，`workflow_dispatch`，三仓 success，被测 `1.3.0`） |

**下游锁定版本复核**（取各仓**仓根** `pnpm-lock.yaml` 的解析值；dependfix 的 `apps/platform` 只是声明位置，锁文件在仓根；仓库 HEAD 同日）：

| 下游 | 仓 HEAD | `package.json` 声明 | 锁定版本 | 前次读数（2026-11-12） |
|:---|:---|:---|:---|:---|
| dependfix（`apps/platform`） | `fd52273` | `1.2.0` | **`1.2.0`** | `1.0.0` |
| caomei-auth | `d117ed1` | `1.3.0` | **`1.3.0`** | `1.2.0` |
| momei | `3bf2eb7` | `^1.2.0` | **`1.2.0`** | `1.0.0` |

**结论**：三仓均较 2026-11-12 上调（dependfix 1.0.0 → 1.2.0、caomei-auth 1.2.0 → 1.3.0、momei 1.0.0 → 1.2.0），无兼容红。**「等待外部反馈」仍成立**：momei 页面级反馈未提供；`1.3.0` 尚未被 dependfix / momei 采用（两者锁 1.2.0），caomei-auth 已上 1.3.0。

## 2. 候选盘点

### 2.1 Phase 35 执行期观察项（新增候选来源）

| 候选 | 依据 | 规模判断 | 落点建议 |
|:---|:---|:---|:---|
| 浮层隔离扩面：MultiSelect / AutoComplete / DatePicker 等 Open 态补 `inert` | [M1-1 记录](./2026-11-16-phase35-m1-1-select-open-inert.md) §5 观察项 1：这些组件仍只有 Reka 的 `aria-hidden`，`aria-hidden-focus` 在真实页面可能命中背景 | 中（需逐组件确认同族行为与焦点归还时序，`suppressOutside` 已可复用） | 组件无障碍批次 |
| DataTable 列宽拖拽手柄 | [M2-2 记录](./2026-11-16-phase35-m2-2-column-sizing.md) §2：本阶段只交付受控契约，拖拽交互与持久化示例归使用方 | 中（指针几何 + 命中区 + 键盘可达 + 冻结列/展开列回归） | 数据面交互批次 |
| DataTable 虚拟滚动 | Phase 35 登记 §1 阶段级非目标：需新增运行时依赖 | 大（依赖决策 + 行高测量 + 选择/展开状态跨窗口） | 先评估再定，需用户就依赖放行 |
| Rating 后续形态 | M3-1 记录 §2：不做表单集成、自定义图标集、半星以外的复杂评分 | 小（若仅为半星以外形态，触发条件不明确） | 维持候选，暂不启动 |

> M1-1 §5 的其余观察项（双浮层同时展开时无引用计数、`script` 豁免仅由选择器承载、`root` 必须位于 `body` 内）不单独构成候选，作为扩面批次的实现前置登记于下方风险表。

### 2.2 在册候选（Backlog §1 全部在册项，以条件触发为主；「基建（中优先级）」为 CI 镜像检测）

| 组 | 候选 | 触发条件现状（2026-11-16） |
|:---|:---|:---|
| 长尾组件 | Sidebar / ScrollPanel 型滚动面板 | 未命中（Drawer 可承接；原生滚动容器足够） |
| 国际化 | 二期 7 语（`it / nl / pl / tr / vi / th / id`）、RTL | 未启动；RTL 风险高、需单独立项 |
| 移动端 | 滚动容器键盘「无条件完整可见」、Toolbar 769–1023 档 | 未命中（无真实用例） |
| 基建 | 多版本托管、Tailwind preset、Storybook、`conventional-changelog` 8、示例外链守卫扩面、dev hydration 守护 | 均未命中 |
| 治理资产 | `ui-validator` 资产 follow-up（agent / skill 定义优化） | 未命中（无新的校验失败模式或用户指令） |
| 基建（中优先级） | CI 运行器镜像 `ubuntu-26.04` 检测 | 未命中（周级 run 仍为 `ubuntu-24.04`） |
| 依赖 | `typescript` 7（阻塞：`vue-tsc` / `tsdown` 未支持原生 API）、`glob` 跨 major 覆盖（阻塞：上游未支持 14.0.2） | 均未解除 |
| 服务层 | `useDialog` | 未命中（无非组件上下文的命令式弹窗用例） |
| 图标 | I5 运行时 `@iconify/vue` peer | 未命中 |
| 下游协同 | momei 侧迁移反馈 | **等待外部反馈**（见 §1） |

### 2.3 安全与依赖

- `deepmerge` low 1 条：与 Phase 32 D3 ①「接受并登记」的处置一致（非运行时路径）；按 Mergex 策略不升级 major。
- 其余无 critical / high；本周 Dependabot 无 open PR。

## 3. 推荐组合

**推荐 A：浮层隔离扩面 + DataTable 交互补齐 + 质量治理小项（不发布、不新增运行时依赖）**

- **M1 无障碍扩面**：把 `inert` 隔离落到 MultiSelect / AutoComplete / DatePicker（复用 `suppressOutside`），并把文档站 axe 的 `aria-hidden-focus` 扩到对应打开态页面（与 Phase 35 M1-1 同口径）。
- **M2 数据面交互**：DataTable 列宽拖拽手柄（受控 `columnSizing` 已就位），同步补键盘可达与持久化示例；虚拟滚动**只做可行性评估**（依赖放行前不实现）。
- **M3 质量治理**：Rating 组件页接入文档站 axe 矩阵；`deepmerge` 告警复核一次（确认仍为接受登记）；`capture:styles` / 视觉基线随新增交互重冻结。

规模预估：**3 条主线 / 8 ~ 10 条原子条目**，无公共 API 破坏性变更；不发布（`latest` 维持 `1.3.0`），或按 D3 决定阶段末发 `1.4.0`。

**备选 B（仅治理收口）**：不新增能力，只做依赖 / 文档站 / 守卫消缺——规模小但价值有限，当前在册红灯已为 0。
**备选 C（国际化二期 / RTL）**：需先补语言集与 RTL 立项评估，规模大、风险高，不建议在本轮直接启动。
**备选 D（长尾与集成：Form rules / useDialog / Sidebar）**：均无真实用例支撑，建议维持候选。
**备选 E（不启动）**：维持现状，等待下游反馈。

## 4. 决策点（≤5 项，待用户裁定）

- **D0 取向**：① 推荐组合 A / ② 仅治理收口 B / ③ 国际化二期 / RTL C / ④ 长尾与集成 D / ⑤ 暂不启动 E。
- **D1 浮层隔离范围**（D0 = A 时生效）：① 仅 Select 家族（MultiSelect / AutoComplete）/ ② 全部经 Reka 打开浮层的组件（含 DatePicker / ColorPicker 面板）/ ③ 不做。
- **D2 DataTable 能力**：① 只做列宽拖拽手柄 / ② 只做虚拟滚动可行性评估 / ③ 两者都做（虚拟滚动仅评估）/ ④ 都不做。
- **D3 发布**：① 阶段末发 `1.4.0`（走现有 CI 发布链，前置 = 当周周回归为绿）/ ② 不发布（`latest` 维持 `1.3.0`）。
- **D4 依赖与安全**：① `deepmerge` low 维持「接受并登记」（推荐）/ ② 复核是否有可消除路径后再定 / ③ 本轮不处理。

## 5. 风险与前置

| 项 | 风险 / 前置 | 处置 |
|:---|:---|:---|
| 浮层隔离扩面 | 各组件焦点归还时序不同（DatePicker 面板为 inline / popper 混用）；`suppressOutside` 目前**不接管外部已置位的 `inert`**（双浮层同时展开时先关者会提前解除隔离），且 `script` / live region 豁免只由选择器承载、`root` 必须在 `body` 内 | 逐组件先探针再改；沿用 M1-1 的「关闭先于焦点归还回退」；扩面前补引用计数或显式声明「同一时刻只有一层浮层」的边界，并为 `script` / 边界补用例 |
| 列宽拖拽 | 与冻结列 / 行展开 / 指针命中区冲突 | 先出几何探针与键盘路径，再落实现；视觉基线同批重冻结 |
| 虚拟滚动 | 需新增运行时依赖（如 `@tanstack/vue-virtual`） | **默认不引入**；仅出评估（体积 / SSR / 与选择态兼容） |
| 发布 | 周回归未绿时不得发版 | 按发布指南 §1 前置门禁执行 |

## 6. 声明

- 本记录**仅评估**：未登记任何阶段、未在 `todo.md` 新增条目、未分配阶段编号。
- 用户裁定后：按[规划规范 §3 / §4](../../standards/planning.md) 登记 `todo.md` 当前阶段与 `roadmap.md` 阶段表行，并同批同步 Backlog 移出与 `.session`。

## 7. Review Gate

- **R1（`standard`，约 9 分钟）**：**Reject**（1 blocker / 2 warning / 2 suggest）——① §2.2 标「Backlog 全量」却漏 `ui-validator` 资产 follow-up；② 组合 A 的浮层扩面未列 `suppressOutside` 已知边界（双浮层无引用计数、`script` 豁免与 `root` 边界）；③ §2.2「均为条件触发 / 低优先级」与 CI 镜像（中）矛盾。
- **R2（`quick`，约 4 分钟）**：**Pass**（0 blocker）。B1 补行、W1 风险表补两条前置与 §2.1 收口、W2 措辞修正、索引摘要去「全量」断言，均已关闭。
