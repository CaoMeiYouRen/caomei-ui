# Phase 43 登记批次：1.5.0 发布、下游覆盖兼容与 Tree / TreeSelect

> 创建时间：2026-11-24
> 触发：用户就[第二十八轮范围评估](./2026-11-24-next-stage-scope-evaluation-28.md)裁定 **D0 ④（M1 + M2 + M3 + Tree / TreeSelect）/ D1 ①（2026-11-29 前后发布）**；其余决策点（D2 ~ D6）按评估记录的推荐默认执行。
> **本记录是 Phase 43 范围与验收口径的唯一载体**；`todo.md` / `roadmap.md` 只做状态指针与阶段摘要。

## 1. 阶段构成

- **编号推导**：取授权时点已有最大编号 Phase 42 + 1 = **Phase 43**（[规划规范 §4](../../standards/planning.md)）。
- **4 条主线 / 13 条原子条目**（**登记时点值**）：发布收口 **3** / 下游覆盖兼容 **4** / 语义收口 **1** / Tree · TreeSelect **5**；构成对账 3 + 4 + 1 + 5 = **13**。**2026-11-25 范围变更**：用户裁定「M1-1 / M1-2 / M1-3 直接移除，11-29 之前不列入规划」，发布收口 3 条转 [Backlog](../../plan/backlog.md)「已决策待窗口」；阶段最终为 **3 条主线 / 10 条原子条目**（4 + 1 + 5 = 10），随阶段归档落地。
- **与评估草案的差异（拆分，非扩容）**：评估 §3 的 M4 估 2 条（「实现与测试」「文档与登记面」）。按[规划规范 §5](../../standards/planning.md) 单条 ≤10 文件逐项复核：Tree 与 TreeSelect 是两件公共组件，实现各含组件 / 类型 / 入口 / 单测 / a11y 夹具（各 ≈ 8 文件）；文档面按同形态交付实测（`eb32794d` 的 Descriptions 文档面 **12 文件**：中英页 + 中英示例 ×2 + 侧栏 + 中英总览 + 展廊注册 + 设计清单 §5 + 文档与演示站 §11）两组件合并约 **20+ 文件**，单组件亦约 12。故 M4 拆为 **5 条**：Tree 实现 / TreeSelect 实现 / Tree 文档与示例 / TreeSelect 文档与示例 / 两组件共用登记面，阶段由 10 条变 **13 条**（登记时点值），范围不变。
- **裁定到构成的映射**：
  - D0 ④ 给出 M1（发布收口）+ M2（下游覆盖兼容）+ M3（语义收口）+ M4（Tree / TreeSelect）。
  - **默认落定（评估 §4 的推荐项）**：D2 ① Button 根节点修复随 `1.5.0`；D3 ① `@layer` 只评估、按结论决定是否落地；D4 ① 升级影响面自动化维持 Backlog；D5 ① `inert` 首击维持 Backlog；D6 ① 真机验收维持「未执行（无真机）」记录。上述可由用户在实施期改判，改判须按范围变更同批回填计数。
- **容量核对**：4 条主线（§6 建议 3–6、上限 8）；13 条原子条目（建议 10–15、上限 20）。
- **阶段级非目标**：国际化二期 7 语与 RTL（维持 Backlog）、`xl` 断点与宽屏布局规则、其余 P2 组件（Tour / Carousel / Watermark / Splitter / Anchor / QRCode / ContextMenu 系列）、通用 Picker、单 Demo 抽屉、依赖与工具链升级（`typescript` 7 / `conventional-changelog` 8 / `glob` 覆盖）、CI 运行器镜像迁移；不做破坏性 API；不新增运行时依赖；不进入 2.0。
- **主线级非目标**：
  - M1：不改发布触发模型、不重指 tag、不为发版专门改业务代码、不强制下游升级。
  - M2：不改 Button 既有 props 语义（新增 `wrap` 开关除外）、不改 `tooltip` 分支结构、不引入样式框架、不代替下游改代码。
  - M3：不做全库 `label` 机械扫描、不改 Form 字段契约、不改浮层隔离整体策略。
  - M4：不做 Tree 虚拟滚动（`TreeVirtualizer` 仅评估，不默认启用）、不做拖拽排序、不做懒加载之外的异步数据源抽象。

## 2. 条目与验收口径

| 编号 | 主线 | 条目 | 验收口径 | 文件面 | 依赖 |
|:---|:---|:---|:---|:---|:---|
| **M1-1** | 发布收口 | 发布前门槛复核与升级注意 | 在 HEAD 重跑 `Weekly Regression`（最近 success `7ee8f7c`，距 `dc449f75` 62 个提交；2026-11-24 读数快照）；复核安全告警 0（`Security Alerts` push + schedule 绿）；`pnpm verify` 全绿；复核 `docs/release-notes/1.5.0.md` 的「升级注意」并把本阶段的 Button 根节点 / 换行、`label` 语义变化补入（含下游迁移最小示例） | ≈ 6 | 无 |
| **M1-2** | 发布收口 | `1.5.0` 发布与发布后校验 | 经 `release.yml` 发布；npm `1.5.0` 可解析（`npm view caomei-ui@1.5.0 version`）；`v1.5.0` tag 与 GitHub Release 存在；CHANGELOG / `package.json` / 版本句一致；发布后文档站与 CDN 入口抽查 | ≈ 3 | M1-1、M2-1 / M2-2（Button 变更须在发布前收口） |
| **M1-3** | 发布收口 | 下游兼容复验与适配回收清单 | 记录自动 dispatch 的 `Downstream Compat` run 结论与三仓 revision（dependfix / caomei-auth / momei）；红因须归因；记录三仓当前锁定版本与 revision 并标注是否已升级（**实际升级下游须单列一步并取得用户授权**，本仓不改下游 `pnpm-lock.yaml`）；产出「可回收的下游写法」清单（双类 / `:deep(__content)` / `white-space: normal`），供下游自行清理，本仓不改下游代码 | ≈ 2 | M1-2 |
| **M2-1** | 下游覆盖兼容 | `CaomeiButton` 未启用提示时恢复单元素根 | 未启用内建提示时根节点直接渲染 `<button>`（`tooltip` 启用分支维持现状）；父级 scoped 样式（如 `<style scoped>` 内 `.btn { … }`）能命中按钮根；补回归用例（含 `asChild` / 禁用态 / 多根提示分支）；`pnpm test` / 定向 E2E / `pnpm test:visual` 通过 | ≈ 5 | 无 |
| **M2-2** | 下游覆盖兼容 | `CaomeiButton` 内容换行开关 | 新增 `wrap` prop（或等价 token），默认保持 1.4.0 的单行截断；开启后内容可折行且高度自适应（ja / ko 长标签在窄容器不溢出）；单测覆盖默认 / 开启 / 与 `iconOnly` 组合；中英文档与示例 | ≈ 4 | M2-1 |
| **M2-3** | 下游覆盖兼容 | `@layer` 策略评估 | 评估 `@layer caomei-ui` 的兼容面（构建产物、`theme.css` 入口、resolver / Nuxt 注入顺序、下游未分层样式优先级），输出「落地 / 不落地 + 边界」结论；不落地时须写清下游覆盖所需特异性口径 | ≈ 3 | 无 |
| **M2-4** | 下游覆盖兼容 | 下游覆盖指引 | 中英「下游覆盖指引」：可用 token、内部类、特异性建议与反例；与 `1.5.0` 升级注意互链；至少 1 条可执行示例（scoped 样式命中按钮根） | ≈ 3 | M2-1 / M2-2 / M2-3 |
| **M3-1** | 语义收口 | `label` 语义按开发规范 §6 收口 | `Statistic` / `Descriptions` 二选一：按 §6 整改（展示型文案改语义化 prop、`label` 只留可访问名）或登记例外条款；两处口径与 [开发规范 §6](../../standards/development.md)、[设计规范](../../design/design-spec.md) 一致；中英组件页同步；`check:design` / `docs:check` / a11y 夹具通过 | ≈ 4 | 无 |
| **M4-1** | Tree · TreeSelect | Tree 实现与测试 | 基于 `reka-ui@2.11.0` 的 `TreeRoot` / `TreeItem` 封装：树形数据（`items`）、展开 / 折叠、单选 / 多选、禁用节点、受控与非受控、键盘导航（上下 / 左右 / Home / End）；`role="tree"` / `treeitem` 与 `aria-expanded` / `aria-selected` 正确；单测覆盖边界（空树 / 全禁用 / 受控回写）+ 定向 E2E；**锁 `reka-ui` 版本并加 primitive 使用回归** | ≈ 8 | 无 |
| **M4-2** | Tree · TreeSelect | TreeSelect 实现与测试 | `CaomeiTreeSelect` 以 Tree + 触发 / 浮层组合：值（单选 / 多选）、已选回显、清空、禁用、打开态隔离（复用 `useOpenStateIsolation`）、浮层碰撞与键盘；单测 + 定向 E2E（含 320 / 390 窄屏几何） | ≈ 8 | M4-1 |
| **M4-3** | Tree · TreeSelect | Tree 文档与示例 | 中英 `Tree` 组件页 + 示例（基础 / 多选 / 异步或大数据说明，中英各 2）；说明 `TreeVirtualizer` 未默认启用与大数据边界；`docs:check` / `check:design` 绿 | ≈ 6 | M4-1 |
| **M4-4** | Tree · TreeSelect | TreeSelect 文档与示例 | 中英 `TreeSelect` 组件页 + 示例（基础 / 多选，中英各 2）；窄屏与浮层边界说明；`docs:check` / `check:design` 绿 | ≈ 6 | M4-2 |
| **M4-5** | Tree · TreeSelect | 两组件共用登记面 | 侧栏 / 中英总览 / 展廊注册 / 设计清单 §5 / 文档与演示站 §11 同批；`check:components-overview` / `check:design-catalog` / `governance:check` 绿 | ≈ 6 | M4-3 / M4-4 |

> 文件面为登记估算，实施时按[规划规范 §5](../../standards/planning.md) 的 10 文件阈值拆分并回填进度表。

## 3. 阶段规则

- **任务粒度**：单条 ≤ 10 文件 / 800 行；计数回扫按[规划规范 §3.9](../../standards/planning.md) 覆盖 `todo.md` / `roadmap.md` / 本记录 / 索引摘要 / `.session`。
- **执行顺序**：先 M2 / M3 / M4（无发布依赖），M1-1 门槛在 `1.5.0` 前最后执行；M1-2 依赖 M1-1 与 M2 收口（Button 变更须在发布前完成）。
- **发布口径**：本阶段发布 `1.5.0`，时机按用户裁定 **2026-11-29 前后**；发布前必须周回归在 HEAD `success`、安全告警 0、`pnpm verify` 全绿，否则 M1-2 阻塞，**不得降级发布**；版本判定沿用 11 个 `feat` 的 minor。
- **Tree 的 Alpha 对待**：`reka-ui@2.11.0` 已导出 `TreeRoot` / `TreeItem` / `TreeVirtualizer`，但该组原语按 Alpha 对待——不升 `reka-ui` 版本、加使用回归、文档标注边界。
- **质量门**：每条目 `lint` / `typecheck` / `typecheck:docs` / 定向测试 / 必要 E2E / Review Gate；阶段末 `pnpm verify` + `pnpm test:visual`。
- **状态词**：条目表沿用 `待执行 / 已交付`；进度表用 `未开始` / `进行中` / `已闭环` / `已阻塞`。
- **Review Gate**：每条目至少一轮 `@code-reviewer`；未 `Pass` 不得提交；M1-2 额外要求发布前门槛证据入记录。
- **文档**：组件能力变化同步中英组件页与设计登记；不虚构未实现能力；Button 渲染变化须写入 `1.5.0` 升级注意。
- **长期任务**：按[规划规范 §8](../../standards/planning.md)，阶段收口前与发布前各执行一轮门槛复核（`recurring.md`）并留痕。
- **依赖**：不新增运行时依赖；`reka-ui` 维持 `2.11.0`。

## 4. 载体同步与候选流转

- `backlog.md`：迁出已登记候选 **2 行**——§1.6 的「`1.5.0` 发布收口」1 行、§1.11 的「Tree / TreeSelect」1 行；候选池 **45 → 43**（§1.6 18 → 17、§1.11 8 → 7）。不写 `→ Phase 43` 迁出标注（[规划规范 §7](../../standards/planning.md)）。
- `todo.md`：新增 Phase 43 当前状态句、进度表（4 行）与 **13** 条条目表。
- `roadmap.md`：§1 当前态切到 Phase 43；阶段表新增 Phase 43 行（**4 条主线 / 13 条原子条目**；构成对账 3 + 4 + 1 + 5 = 13）。
- 治理索引：本记录登记一行。
- `.session`：`current_phase` / `plan_state` 同批切到 Phase 43（13 条）。
- **默认裁定的可改判性**：D2 ~ D6 按评估记录推荐项落定；若实施期改判（如 `@layer` 落地、`inert` 首击纳入），按范围变更同批回填 `todo` / `roadmap` / 本记录 / 索引 / `.session` 的计数。

## 5. Review Gate

- **R1（2026-11-24，`standard`，时间盒 ≤10 分钟；实测约 11 分钟）**：**Reject**（1 blocker / 3 warning / 3 suggest）。
  - blocker：M4 拆 3 条后文档面仍由单条承载（「文档面亦超 10 文件」与文件面 `≈ 10` 自相矛盾）；同类交付实测（`eb32794d` 的 Descriptions 文档面 **12 文件**）证明两组件合并约 20+ 文件。
  - warning：① 登记面漏「文档与演示站 §11」，验收缺 `check:design-catalog`（`check:design` 不含该守卫）；② M1-2 依赖列未含 M2-1 / M2-2，与 §3「Button 变更须在发布前完成」不一致；③ M1-3「更新三仓锁定版本指针」越出本仓工作区且与「不强制下游升级」冲突。
  - suggest：① 周回归读数标「2026-11-24 快照」；② 本节提交前回填；③ 评估 §3 注明条目数为草案估算。
  - 修复：M4 拆为 **5 条**（Tree 实现 / TreeSelect 实现 / Tree 文档与示例 / TreeSelect 文档与示例 / 两组件共用登记面，文件面各 ≈ 6 ~ 8），阶段改 **4 条主线 / 13 条原子条目**（3 + 4 + 1 + 5 = 13），五个载体同批回填；M4-5 补「文档与演示站 §11」与 `check:design-catalog`（登记面随拆分收敛到共用条目）；M1-2 依赖补 M2-1 / M2-2；M1-3 改为「记录并标注是否已升级，实际升级下游须单列一步并取得用户授权」；周回归读数标快照；评估 §3 加「草案估算」注并同步 §4.1。
- **R2（2026-11-24，`quick` delta，时间盒 ≤5 分钟；实测约 6 分钟）**：**Pass**（0 blocker / 0 warning / 2 suggest）。
  - 复核成立：13 条在登记 / `todo` / `roadmap` / 评估 §4.1 / 索引 / `.session` 六处一致，对账 3 + 4 + 1 + 5 = 13；M4 五条文件面 ≈ 8 / 8 / 6 / 6 / 6 均 ≤ 10，拆分理由与 `eb32794d` 实测 12 文件对应；M1-2 依赖与 M1-3 边界已消除越界；§11 与 `check:design-catalog` 落在 M4-5；Backlog 45 → 43、§1.6 17 / §1.11 7 与登记一致，无 `→ Phase 43` 标注。
  - suggest（同批）：① §5 回填措辞写「M4-3 ~ M4-5」而实际仅 M4-5 承载 → 改为「M4-5 承载 §11 与 `check:design-catalog`（登记面随拆分收敛到共用条目）」；② 评估 §3 草案表格保留拆分前形态 → M1-3 改「记录」、M4 两行并行末注「（草案，最终见 §4.1）」。

