# Phase 36 登记批次：浮层隔离扩面、DataTable 列宽拖拽与虚拟滚动评估、质量治理、选择器空值诊断

> 创建时间：2026-11-17
> 触发：用户就[第二十轮范围评估](./2026-11-16-next-stage-scope-evaluation-20.md) §4 的决策点作出裁定（D0 A 推荐组合 / D1 全部浮层组件 / D2 拖拽手柄 + 虚拟滚动仅评估 / D3 不发布 / D4 `deepmerge` 维持接受登记）。
> **本记录是 Phase 36 范围与验收口径的唯一载体**；`todo.md` / `roadmap.md` 只做状态指针与阶段摘要。

## 1. 阶段构成

- **编号推导**：取授权启动时已有最大编号 Phase 35 + 1 = **Phase 36**（[规划规范 §4](../../standards/planning.md)）。
- **4 条主线 / 12 条原子条目**：无障碍扩面 **5** / DataTable 交互 **3** / 质量治理 **2** / 选择器空值诊断 **2**；构成对账 5 + 3 + 2 + 2 = 12。**原登记 8（4 + 2 + 2）为 2026-11-17 时点值**；同日用户指令「再增加一到两个条目的内容」后追加 **M1-5 / M2-3**（见 §6.1），同日插队追加 **M4-1 / M4-2**（见 §6.2）。
- **不发布**（D3）：`latest` 维持 `1.3.0`，不触发 Release。
- **阶段级非目标**：不新增运行时依赖（虚拟滚动只评估）；不改变 `''` 作为「未选中」的模型语义；不做 i18n 二期 / RTL、Form 规则引擎、`useDialog`、Sidebar / ScrollPanel、破坏性 API、自动发布、Storybook / Tailwind preset / 文档站多版本。
- **主线级非目标**：
  - M1：只扩隔离面到既有浮层组件；不改 Reka primitive；不为「全库无障碍」另立总账。
  - M2：拖拽只交付交互层（受控 `columnSizing` 已就位），库内不做列宽持久化存储（M2-3 只给使用方示例与契约说明）；虚拟滚动**只出评估**，不放行依赖、不写实现。
  - M3：只做可判定的小项，不引入新的高频误报守卫。
  - M4：只收敛「空串选项值的失败方式」与声明契约；不做 opt-in 支持（`allowEmptyValue` / `emptyValues`，见 [Backlog §1.1](../../plan/backlog.md)），不改迁移指南与示例写法（见 [Backlog §1.6](../../plan/backlog.md)），不触碰 `CaomeiSelectButton`（ToggleGroup 允许 `''`）。

## 2. 条目与验收口径

| 编号 | 主线 | 条目 | 验收口径 | 文件面 |
|:---|:---|:---|:---|:---|
| **M1-1** | 无障碍扩面 | 隔离工具的多浮层边界收口 | `suppressOutside` 支持「同一时刻多层浮层」：后开者接管、先关者不提前解除；补 `script` / live region 子树与 `root` 不在 `body` 的用例；边界写入工具注释与记录 | ≈ 3 |
| **M1-2** | 无障碍扩面 | MultiSelect / AutoComplete 打开态补 `inert` | 展开后背景兄弟节点同时具备 `aria-hidden` 与 `inert`；关闭先于焦点归还回退；三视口焦点不入背景；文档站打开态 axe 纳入中英两页（`/components/multi-select` / `/en-US/components/multi-select`、`/components/auto-complete` / `/en-US/components/auto-complete`）并可红 | ≈ 6 |
| **M1-3** | 无障碍扩面 | DatePicker / ColorPicker 打开态补 `inert` | 与 M1-2 同口径（axe 中英：`/components/date-picker` / `/en-US/components/date-picker`、`/components/color-picker` / `/en-US/components/color-picker`）；额外覆盖 inline 面板与 popper 面板两种挂载形态（含模态内打开），焦点归还时序逐形态取证 | ≈ 6 |
| **M1-4** | 无障碍扩面 | 全库浮层回归与边界记录 | 逐组件枚举经 Reka 打开浮层的组件并判定「已隔离 / 本批补 / 不采用」（不采用须逐项给理由）；Dialog / Drawer / DropdownMenu / Popover / Tooltip / Toast 不因扩面无回归（抽检 `overlay-interaction` / `overlay-collaboration` / `select-open-inert` 与 Dialog 内组合）；「不采用」清单进交付记录 §遗留，不静默排除；范围为 D1 全集，任何缩减须回报用户确认 | ≈ 4 |
| **M1-5** | 无障碍扩面 | DropdownMenu / Popover 打开态补 `inert` | 与 M1-2 同口径：展开后背景兄弟节点同时具备 `aria-hidden` 与 `inert`；关闭先于焦点归还；三视口 Tab 不入背景；文档站打开态 axe 纳入中英四页（`/components/dropdown-menu`、`/components/popover` 及 en-US 对应页）并可红 | ≈ 6 |
| **M2-1** | DataTable 交互 | 列宽拖拽手柄 | 基于受控 `columnSizing`：指针拖拽回写像素宽、键盘可达（方向键 ±步进）、双击复位；冻结列 / 行展开 / 选择列组合无错位；中英组件页与示例；视觉基线同批重冻结 | ≈ 8 |
| **M2-2** | DataTable 交互 | 虚拟滚动可行性评估（只评估） | 出评估记录：候选依赖与体积 / SSR 与构建形态 / 行高测量 / 与选择 / 展开 / 冻结列 / 行分组的兼容风险 / 推荐触发条件；**不写实现、不加依赖** | ≈ 2 |
| **M2-3** | DataTable 交互 | 列宽持久化示例与契约说明 | 新增中英示例 `docs/examples/data-table/column-sizing-persist.vue` 与 `docs/i18n/en-US/examples/data-table/column-sizing-persist.vue`：`localStorage` 存取 `columnSizing`（加载恢复 / 拖拽后写回 / 越界与解析失败回退）；中英组件页「列宽调整与持久化」节补一段说明并链接新示例（Phase 35 M2-2 已有的 `column-sizing.vue` 保持不变）；**不新增公共 API**、库内不写存储 | ≈ 4 |
| **M3-1** | 质量治理 | Rating 文档站 a11y 抽检 | `/components/rating` 中英纳入 axe 矩阵（就绪选择器 + 最小命中数），规则面与既有默认一致；违规即红 | ≈ 3 |
| **M3-2** | 质量治理 | 依赖告警复核 | 复核 `deepmerge` low 告警的利用路径与消除可能性；维持「接受并登记」时写明依据与复查触发条件；不升级 major | ≈ 2 |
| **M4-1** | 选择器空值诊断 | 空串选项值不再透传（Select / MultiSelect / AutoComplete） | Select / MultiSelect 在既有归一化中丢弃、AutoComplete 新增同等边界（三处均把 `value === ''` 视为契约外值）：开发期 `console.warn`（带组件标识与选项序号，指明「需要全部 / 不限请用非空哨兵」）、生产静默丢弃；面板打开不再抛上游断言；模型侧 `''` 仍为「未选中」（`hasValue` / placeholder 既有行为不变）；`CaomeiSelectButton` 不参与过滤并补反例用例；单测覆盖告警文案、不渲染与面板可打开 | ≈ 7 |
| **M4-2** | 选择器空值诊断 | 空串契约声明（中英组件页 + 设计规范 §7） | Select / MultiSelect 中英组件页补「选项值不能为空串」、开发期行为（告警 + 不渲染）与哨兵写法；AutoComplete 既有「必须非空」句补行为说明；[设计规范 §7](../../design/design-spec.md) Select 家族映射段只补本库契约（空串不渲染），PrimeVue 对照留在 Backlog §1.6；不新增公共 API、不改迁移指南 | ≈ 6 |

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
- `todo.md`：新增 Phase 36 状态句与条目表（原 8 条为登记时点值；同批追加 2 条后为 10；插队追加 2 条后为 12，见 §6.1 / §6.2）。
- `roadmap.md`：§1 当前态与 Phase 36 行。
- `.session`：`current_phase` / `plan_state` 同批切到 Phase 36。
- 治理索引：本记录登记一行。

## 5. 风险与前置

| 项 | 风险 / 前置 | 处置 |
|:---|:---|:---|
| M1 扩面 | 各组件挂载形态不同（portal / inline / popper），焦点归还时序不一致 | 逐组件先探针；沿用「关闭先于焦点归还」；M1-1 先落边界再扩面 |
| 多浮层同时展开 | 现有工具不接管外部 `inert`，先关者会提前解除 | M1-1 做引用计数（§2 为唯一口径；不采用「只声明单层边界」的替代） |
| DropdownMenu / Popover 扩面 | 动作菜单与浮层关闭后的焦点归还路径不同（`onCloseAutoFocus` / 触发器） | 先探针再改；axe 打开态页与 M1-2 同规则面 |
| 列宽持久化示例 | 示例里写存储逻辑可能被误读为库能力 | 示例注释与组件页同时标注「使用方职责」；库内不引入存储 |
| 列宽拖拽 | 冻结列偏移、行展开列宽、选择列命中区 | 与 M2-1 同批做几何与键盘回归；视觉基线重冻结 |
| 虚拟滚动评估 | 结论可能「不做」 | 评估记录写触发条件，不预设结论 |
| 空串过滤面 | `CaomeiSelectButton`（ToggleGroup）允许 `''` 作真实值，同口径套用会破坏既有行为 | 过滤只在 Select / MultiSelect / AutoComplete 三处 Reka 绑定层落地（前两者改既有丢弃分支、后者新增边界）；补 `SelectButton` 反例用例锁住差异 |
| 插队范围 | 诊断修复易被扩张为 opt-in 能力（`hasValue` / `data-filled` / `showClear` 连带变更） | §1 M4 非目标；opt-in 已登记 [Phase 37 M2](./2026-11-18-phase37-registration.md)（原 Backlog 候选已迁出）；本阶段只改失败方式 |
| 发布 | 本阶段不发布（D3） | 不触发 Release；`latest` 维持 `1.3.0` |

## 6. Review Gate

- **R1（`standard`，约 8 分钟）**：**Pass**（0 blocker / 4 warning / 3 suggest）——① M1-4 的「不采用」边界可能扩缩 D1 范围；② M1-1 验收与 §5 风险处置对「单层边界」给了互斥口径；③ 评估 §2.1 的 Rating 后续候选在 Backlog 无载体；④ §6 占位。
- **R2（`quick`，约 4 分钟）**：**Pass**（0 blocker）。W1 ~ W4 与三条 suggest 全部关闭；仅留 2 条 suggest（D1 缩减须回报用户、M1-3 路径写全）并在本轮采纳。
- **R1 处置**：M1-4 改为「逐组件枚举 + 判定，不采用须逐项给理由并进交付记录 §遗留」；§5 删除「只声明单层边界」的替代、保留引用计数为唯一口径；Rating 后续形态补入 `backlog.md` §1.1；补 axe 中英页面清单与抽检 E2E 文件名；§4 说明登记批次不适用文件面复算；本节回填。

### 6.1 执行期范围变更（2026-11-17）

- **触发**：用户指令「再增加一到两个条目的内容」（同日，登记后、实施前）。
- **追加**：**M1-5** DropdownMenu / Popover 打开态补 `inert`（承接 D1「全部浮层组件」，补齐 M1-2 / M1-3 未覆盖的两类非模态浮层）；**M2-3** 列宽持久化示例与契约说明（承接 D2 的受控列宽，只给使用方示例、库内不写存储）。
- **计数口径**：原登记 8 条（4 + 2 + 2）；追加后 **10 条（5 + 3 + 2 = 10）**；`todo.md` / `roadmap.md` / 索引摘要同批改为新值并保留本时点标注。
- **未改变**：D0 ~ D4 裁定、阶段级非目标（不发布、不新增依赖、虚拟滚动只评估）均不变。

## 6.2 执行期插队（2026-11-17）

- **触发**：用户就「CaomeiSelect 不允许空字符串选项值」调研后指令「P0 先规划，并直接插队进入当前 todo；P1 / P2 进入 Backlog」。
- **准入依据**：[规划规范 §3.5](../../standards/planning.md) 第三类「直接影响可用性的 blocker 级缺陷」——`value: ''` 的选项在面板渲染时触发 Reka 断言（`A <SelectItem /> must have a value prop that is not an empty string`），该选项集下组件不可用；下游曾报告 caomei-auth 时区页 500（服务端链路与触发形态未取证，见调研记录 §6）；另有用户明确指令。
- **判定与证据**：[选择器空串选项值调研与处置](./2026-11-17-select-empty-option-value-evaluation.md)（本仓源码 + 定向探针 + 六个上游库源码判读 + 三仓用量盘点）。
- **追加**：**M4-1** 空串选项值不再透传（Select / MultiSelect 归一化分支 + AutoComplete 新增同等边界 + 开发期告警 + 单测）；**M4-2** 空串契约声明（中英组件页 + 设计规范 §7）。
- **计数口径**：原登记 8 条（4 + 2 + 2）；§6.1 追加后 10 条（5 + 3 + 2）；本节追加后 **12 条（5 + 3 + 2 + 2）**，主线 3 → 4；`todo.md` / `roadmap.md` / 索引摘要同批改为新值并保留时点标注。
- **未改变**：D0 ~ D4 裁定、阶段级非目标（不发布、不新增依赖、虚拟滚动只评估）均不变；M4 不改变 `''` 作为「未选中」的模型语义。
- **未纳入本阶段**：opt-in 能力（P1）与迁移 / 示例口径（P2）已登记 [Backlog](../../plan/backlog.md)，按规划规范 §3 等待用户决策后另行登记。

### 6.3 执行期口径更正（2026-11-18）

- **M2-3 写回时机**：登记 §2 原文写「拖拽后写回」，但拖拽手柄由 M2-1 承接、本阶段交付时尚未落地。口径更正为「点『保存』写回；『恢复默认』清除存储键」，示例与中英组件页文案按此表述；拖拽交互随 M2-1 交付后再补「调整后自动写回」的说明。本条只改验收口径的时点表述，不改变「使用方负责持久化、库内不写存储」的契约。

## 7. 验收与回扫

- 阶段完成时按[规划规范 §7](../../standards/planning.md) 归档：`todo.md` 清空、`roadmap.md` 更新、`todo-archive.md` 入窗、`recurring.md` 门槛复核、三段式回扫。
- `.session` 阶段态在登记 / 范围变更 / 归档三类事件同批同步。
