# Phase 36 登记批次：浮层隔离扩面、DataTable 列宽拖拽与虚拟滚动评估、质量治理

> 创建时间：2026-11-17
> 触发：用户就[第二十轮范围评估](./2026-11-16-next-stage-scope-evaluation-20.md) §4 的决策点作出裁定（D0 A 推荐组合 / D1 全部浮层组件 / D2 拖拽手柄 + 虚拟滚动仅评估 / D3 不发布 / D4 `deepmerge` 维持接受登记）。
> **本记录是 Phase 36 范围与验收口径的唯一载体**；`todo.md` / `roadmap.md` 只做状态指针与阶段摘要。

## 1. 阶段构成

- **编号推导**：取授权启动时已有最大编号 Phase 35 + 1 = **Phase 36**（[规划规范 §4](../../standards/planning.md)）。
- **3 条主线 / 8 条原子条目**：无障碍扩面 **4** / DataTable 交互 **2** / 质量治理 **2**；构成对账 4 + 2 + 2 = 8。
- **不发布**（D3）：`latest` 维持 `1.3.0`，不触发 Release。
- **阶段级非目标**：不新增运行时依赖（虚拟滚动只评估）；不做 i18n 二期 / RTL、Form 规则引擎、`useDialog`、Sidebar / ScrollPanel、破坏性 API、自动发布、Storybook / Tailwind preset / 文档站多版本。
- **主线级非目标**：
  - M1：只扩隔离面到既有浮层组件；不改 Reka primitive；不为「全库无障碍」另立总账。
  - M2：拖拽只交付交互层（受控 `columnSizing` 已就位），不做列宽持久化存储；虚拟滚动**只出评估**，不放行依赖、不写实现。
  - M3：只做可判定的小项，不引入新的高频误报守卫。

## 2. 条目与验收口径

| 编号 | 主线 | 条目 | 验收口径 | 文件面 |
|:---|:---|:---|:---|:---|
| **M1-1** | 无障碍扩面 | 隔离工具的多浮层边界收口 | `suppressOutside` 支持「同一时刻多层浮层」：后开者接管、先关者不提前解除；补 `script` / live region 子树与 `root` 不在 `body` 的用例；边界写入工具注释与记录 | ≈ 3 |
| **M1-2** | 无障碍扩面 | MultiSelect / AutoComplete 打开态补 `inert` | 展开后背景兄弟节点同时具备 `aria-hidden` 与 `inert`；关闭先于焦点归还回退；三视口焦点不入背景；文档站打开态 axe 纳入中英两页（`/components/multi-select` / `/en-US/components/multi-select`、`/components/auto-complete` / `/en-US/components/auto-complete`）并可红 | ≈ 6 |
| **M1-3** | 无障碍扩面 | DatePicker / ColorPicker 打开态补 `inert` | 与 M1-2 同口径（axe 中英：`/components/date-picker` / `/en-US/components/date-picker`、`/components/color-picker` / `/en-US/components/color-picker`）；额外覆盖 inline 面板与 popper 面板两种挂载形态（含模态内打开），焦点归还时序逐形态取证 | ≈ 6 |
| **M1-4** | 无障碍扩面 | 全库浮层回归与边界记录 | 逐组件枚举经 Reka 打开浮层的组件并判定「已隔离 / 本批补 / 不采用」（不采用须逐项给理由）；Dialog / Drawer / DropdownMenu / Popover / Tooltip / Toast 不因扩面无回归（抽检 `overlay-interaction` / `overlay-collaboration` / `select-open-inert` 与 Dialog 内组合）；「不采用」清单进交付记录 §遗留，不静默排除；范围为 D1 全集，任何缩减须回报用户确认 | ≈ 4 |
| **M2-1** | DataTable 交互 | 列宽拖拽手柄 | 基于受控 `columnSizing`：指针拖拽回写像素宽、键盘可达（方向键 ±步进）、双击复位；冻结列 / 行展开 / 选择列组合无错位；中英组件页与示例；视觉基线同批重冻结 | ≈ 8 |
| **M2-2** | DataTable 交互 | 虚拟滚动可行性评估（只评估） | 出评估记录：候选依赖与体积 / SSR 与构建形态 / 行高测量 / 与选择 / 展开 / 冻结列 / 行分组的兼容风险 / 推荐触发条件；**不写实现、不加依赖** | ≈ 2 |
| **M3-1** | 质量治理 | Rating 文档站 a11y 抽检 | `/components/rating` 中英纳入 axe 矩阵（就绪选择器 + 最小命中数），规则面与既有默认一致；违规即红 | ≈ 3 |
| **M3-2** | 质量治理 | 依赖告警复核 | 复核 `deepmerge` low 告警的利用路径与消除可能性；维持「接受并登记」时写明依据与复查触发条件；不升级 major | ≈ 2 |

> 文件面为登记估算，实施时按[规划规范 §5](../../standards/planning.md) 的 10 文件阈值拆分；生成物与基线不计入。

## 3. 阶段规则

- **任务粒度**：单条 ≤ 10 文件 / 800 行；超出时按 §5 拆分（同批更新三处计数）。
- **质量门**：每条目 `lint` / `typecheck` / 定向测试 / 必要 E2E / Review Gate；阶段末 `pnpm verify`。
- **Review Gate**：每条目至少一轮 `@code-reviewer`；未 `Pass` 不得提交。
- **文档**：组件能力变化同步中英组件页与设计登记；不虚构未实现能力。
- **发布**：本阶段不发布；`release.yml` 与发布触发模型不改。
- **依赖**：不新增运行时依赖；虚拟滚动只评估。

## 4. 载体同步与候选流转

> 登记批次为规划载体改动，不含实现文件面；[规划规范 §3.9](../../standards/planning.md) 的 `git status` 文件面复算适用于**条目交付记录**，登记批次按本记录 §4 逐载体核对即可。

- `backlog.md`：本轮候选（浮层隔离扩面、列宽拖拽、虚拟滚动评估）来自评估记录 §2.1 而非候选池，**无移出行**；`momei 侧迁移` 保持「等待外部反馈」。
- `todo.md`：新增 Phase 36 状态句与 8 条条目表。
- `roadmap.md`：§1 当前态与 Phase 36 行。
- `.session`：`current_phase` / `plan_state` 同批切到 Phase 36。
- 治理索引：本记录登记一行。

## 5. 风险与前置

| 项 | 风险 / 前置 | 处置 |
|:---|:---|:---|
| M1 扩面 | 各组件挂载形态不同（portal / inline / popper），焦点归还时序不一致 | 逐组件先探针；沿用「关闭先于焦点归还」；M1-1 先落边界再扩面 |
| 多浮层同时展开 | 现有工具不接管外部 `inert`，先关者会提前解除 | M1-1 做引用计数（§2 为唯一口径；不采用「只声明单层边界」的替代） |
| 列宽拖拽 | 冻结列偏移、行展开列宽、选择列命中区 | 与 M2-1 同批做几何与键盘回归；视觉基线重冻结 |
| 虚拟滚动评估 | 结论可能「不做」 | 评估记录写触发条件，不预设结论 |
| 发布 | 本阶段不发布（D3） | 不触发 Release；`latest` 维持 `1.3.0` |

## 6. Review Gate

- **R1（`standard`，约 8 分钟）**：**Pass**（0 blocker / 4 warning / 3 suggest）——① M1-4 的「不采用」边界可能扩缩 D1 范围；② M1-1 验收与 §5 风险处置对「单层边界」给了互斥口径；③ 评估 §2.1 的 Rating 后续候选在 Backlog 无载体；④ §6 占位。
- **R2（`quick`，约 4 分钟）**：**Pass**（0 blocker）。W1 ~ W4 与三条 suggest 全部关闭；仅留 2 条 suggest（D1 缩减须回报用户、M1-3 路径写全）并在本轮采纳。
- **R1 处置**：M1-4 改为「逐组件枚举 + 判定，不采用须逐项给理由并进交付记录 §遗留」；§5 删除「只声明单层边界」的替代、保留引用计数为唯一口径；Rating 后续形态补入 `backlog.md` §1.1；补 axe 中英页面清单与抽检 E2E 文件名；§4 说明登记批次不适用文件面复算；本节回填。

## 7. 验收与回扫

- 阶段完成时按[规划规范 §7](../../standards/planning.md) 归档：`todo.md` 清空、`roadmap.md` 更新、`todo-archive.md` 入窗、`recurring.md` 门槛复核、三段式回扫。
- `.session` 阶段态在登记 / 范围变更 / 归档三类事件同批同步。
