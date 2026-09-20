# 待办事项

本文档记录当前阶段的原子条目与验收状态；准入、命名与阶段衔接规则见 [规划规范](../standards/planning.md)，本文档不重述。

## 当前阶段

### Phase 11：组件样式按需化与能力增强

- **授权**：2026-09-20 用户授权启动；编号按 [规划规范 §4](../standards/planning.md) 取已有最大编号 +1（已有最大为 Phase 10）。范围依据见[下一阶段范围评估](../design/governance/2026-09-20-next-stage-scope-evaluation.md) §6；样式拆分方案与批次见[CSS 按需引入评估](../design/governance/2026-09-20-css-on-demand-evaluation.md) §7。
- **定位**：以**功能开发优先**——把样式交付粒度按需化并同步优化重量级组件，同时以低成本补齐文档与门禁守卫。
- **目标**：① 样式交付按需化（构建路径 POC → 稳定 `theme.css` 入口与全量入口语义 → `unbundle + css.inject` 落地与适配）；② 重量级组件优化与样式治理；③ 组件能力增强；④ 质量门与文档守卫落位。
- **非目标**：不做**逐组件样式入口**（POC 实测模块图 + `sideEffects` 已可让消费方 tree-shaking 达成按需，2026-09-20 用户确认）；不把覆盖率阈值放进日常 `test` / `verify`；不引入 CSS-in-JS / 构建期原子化；不改变既有组件视觉与 token 契约（有意变更须登记[设计规范 §7](../design/design-spec.md)）；不启动 Phase 8；不执行 momei 侧迁移（外部执行）；不做文档站观感与版本化。
- **用户决策（2026-09-20）**：① 取向取候选组合 **X + Y 混合**（不取 Z）；② **覆盖率不进入日常门禁**——现状约 90%，改为仅在周期性回归任务或 release 门禁中校验；③ **功能开发优先**，样式分层拆分与相应组件优化先行；④ M3 用量**按现有取证直接做**（不等 momei 反馈）；⑤ 样式拆分**兼容性不作要求**，下游自行修复（仍须在 CHANGELOG 与文档披露）。
- **执行顺序**：M1-1 POC 已交付（**判定「条件性可行」**，未触发回退）→ M1-2 消除待验项并确定入口语义 → M1-3 落地与适配；**M2 / M3 / M4 文件域与 M1 不重叠，可并行**（**例外**：若 M2-3 的 z-index token 落点为 `src/styles/theme.css`，则 M2-3 与 M1-2 须串行）。同一主线内条目按本表自上而下顺序执行。
- **阶段验收**：阶段验收通则见[路线图 §4](./roadmap.md)；每个原子条目收尾必须经 `@code-reviewer` Review Gate，涉及界面或样式时另经 `@ui-validator` 验证；阶段收口前与发布前各执行一轮[长期任务](./recurring.md)门槛复核并留痕。

#### M1 样式按需化（先行，POC 已交付）

- 执行范围：以 **`unbundle: true` + `css.inject: true`** 落地样式按需（消费方 tree-shaking 逐模块取用）；提供稳定 `theme.css` 入口（tokens + 暗色 + `.caomei-root`，含品牌预设）并确定全量入口语义；适配 `exports`、resolver、Nuxt 模块、`check:build` 断言与文档口径。
- 非目标：不做逐组件样式入口（POC 实测不需要）；不做依赖闭包批次（M1-4 已取消，见下）；不改变组件视觉与 token 契约。
- 最小验收标准：消费方 `tsc` 可解析 unbundled `dts`；CSS 随 JS 按需生效（消费侧实测，覆盖「命名导入」与「resolver」两条路径）；`check:build` / `check:nuxt` / `docs:build` / `pnpm verify` 全绿；文档口径与架构设计 §4 的决策反转留痕。

| 编号 | 条目 | 范围 | 最小验收标准 | 依赖 |
| :-: | --- | --- | --- | :-: |
| M1-1 | 构建路径 POC | 判定 `unbundle: true` 与「显式多入口 + `css.splitting: true`」哪条能产出所需 CSS 入口，且不破坏 `dts` / `exports` / `check:build` / `check:nuxt` / `docs:build`；产出 `dist` 清单与体积对照 | 见下方状态行（已交付）；交付物含 `dist` 清单与体积对照（记录 §2~§3）、推荐路径与不通过判据（§6）、复现材料（附录 A） | — |
| M1-2 | 待验项消除 + 入口语义落定 | ① 用消费方 fixture 跑 `tsc` 验证 unbundled `dts` 可解析；② 确定 `theme.css`（tokens + 暗色 + `.caomei-root`，含品牌预设）与全量入口语义（是否保留单文件聚合、如何生成）；③ 评估 Nuxt 双注入去重与样式顺序 | `tsc` 解析通过；两条入口语义写入[架构设计 §3 / §4](../design/architecture.md) 并经用户确认；Nuxt 双注入结论落文档（含顺序判定） | M1-1 |
| M1-3 | `unbundle + css.inject` 落地与适配 | 落地构建配置；四处适配——`exports` 重写、**resolver `sideEffects` 目标改写**、Nuxt 模块注入目标、`check-build` 断言目标；文档口径同步（清单见[M1-1 记录 §7 A4](../design/governance/2026-09-20-m1-1-build-path-poc.md)）；CHANGELOG 披露入口变更 | 消费侧实测两条路径均按需生效——**命名导入路径**复用[M1-1 记录附录 A.2](../design/governance/2026-09-20-m1-1-build-path-poc.md) 的 fixture 与脚本，**resolver 路径**须新建等价 fixture 并随记录提交；`check:build` / `check:nuxt` / `docs:build` / `pnpm verify` 全绿；`npm pack` 体积与文件数冒烟（对照基线 11 文件）；架构设计 §4「未启用 `css.inject`」决策反转留痕 | M1-2 |

> **M1-4（依赖闭包批次）已取消**（2026-09-20 用户确认）：POC 实测 `unbundle` 保留完整模块图，依赖组件样式随图带入（`button.js` 仍 `import badge.js`），闭包问题不存在。依据见 [M1-1 记录 §3.2 / §7 A2](../design/governance/2026-09-20-m1-1-build-path-poc.md)。

状态（M1-3）：**已产出（2026-09-20）**——落地记录落 [M1-3 样式按需形态落地与适配](../design/governance/2026-09-20-m1-3-style-on-demand-landing.md)，**待 `@code-reviewer` Review Gate 放行**。形态已落地（`unbundle + css.inject`、`exports` 的 `./theme.css`、resolver / Nuxt 模块注入基础层、`check:build` / `check:nuxt` 断言、文档口径含架构 §4 决策反转留痕，D6 已纳入）；`pnpm verify` exit 0（1384 tests）；`npm pack` 341 文件 / 750.5 kB；消费侧真实包布局实测基础层「需显式引入且只注入一份」。**自纠**：M1-1 / M1-2 关于「根导入携带 tokens」的表述已更正。

状态（M1-2）：**已产出（2026-09-20）**——记录落 [M1-2 入口语义与 dts 验证](../design/governance/2026-09-20-m1-2-entry-semantics-and-dts-verification.md)，**待 `@code-reviewer` Review Gate 放行**。① `dts` 消费方解析通过（`bundler` / `node16` 双模式，含负向对照）；③ Nuxt 双注入结论落档（**Nuxt 侧不得依赖 JS 图携带 tokens**；`check:nuxt` 的断言面缺口只在双通道形态下暴露，补断言属范围增量，见记录 §6 **D6**）。**② 的入口语义（D1~D5）与 D6 已获用户确认（2026-09-20 指令「提交后继续推进」按建议值采纳）**，已写入[架构设计 §3 / §4 / §5](../design/architecture.md) 并由 M1-3 落地。

状态：M1-1 **已交付（2026-09-20）**——构建路径 POC 落 [M1-1 构建路径 POC](../design/governance/2026-09-20-m1-1-build-path-poc.md)，经 `@code-reviewer` Review Gate 两轮（R1 Reject：预写 Gate 结论 / 破坏面漏 resolver / 过早宣告「路径可行」→ 修复为「条件性可行」；R2 Pass，2 warning + 2 suggest 已同批修正）。结论：推荐 `unbundle: true` + `css.inject: true`，消费侧 Vite 实测仅单组件 1.48 KB gzip、三组件 6.22 KB gzip（对照全量 25.60 KB gzip，收益随用量面变化）；**未触发回退判据**，剩余待验项的归属：消费方 `dts` 解析与入口语义（含 Nuxt 双注入）由 M1-2 消除，四处适配（`exports` / resolver / Nuxt 模块 / `check:build` 断言）的落地与复验由 M1-3 承担。**该记录 §7 的 A1~A5 范围调整已获用户确认（2026-09-20）并据此改写本节**，M1-2 可启动。

#### M2 重量级组件优化与样式治理

- 执行范围：对**重量级组件固定清单**（auto-complete / drawer / multi-select / stepper / toolbar / file-upload / color-picker，依 [CSS 按需引入评估 §7.2](../design/governance/2026-09-20-css-on-demand-evaluation.md) 批次 2 的门槛「逐个 ≥ 4.5 KB 且不在 §2.6 依赖图中」）做质量盘点与优化；收敛与其同源的样式治理项（scoped 变量声明 / 档位死声明 / 禁用态字面量 / z-index 字面量）。
- 非目标：不改组件公开 props；不做与样式治理无关的重构；不顺手归并不同值档位（视觉变更须独立验收）。
- 最小验收标准：盘点产出条目化清单（含门槛判定与可复现证据）；守卫类改动可阻断回流且带正反例语料；视觉类改动经计算样式对照或真实浏览器验证。
- **M2-1 门槛（可复验）**：候选须**同时**满足 ① 有**下游实测用量 ≥ 1 处**（给出命令与快照日期，命中 0 处即不达标）；② **不引入未登记的对外契约变更**（新增 props 走受控枚举并登记[设计规范 §7](../design/design-spec.md)）。两条均满足者提交用户确认后纳入；任一条不满足者留 [Backlog](./backlog.md)。

| 编号 | 条目 | 范围 | 最小验收标准 | 依赖 |
| :-: | --- | --- | --- | :-: |
| M2-1 | 重量级组件质量盘点 | 对**上方固定清单的 7 个组件**（门槛依据见 M2 执行范围）做「样式 + 交互」盘点，并按**下方门槛**判定既有候选（Backlog 的 ColorPicker 色板导航增强、AutoComplete 严格选项模式） | 产出条目化候选清单（逐项含门槛判定与可复现取证命令，判定可复算）；**达标项须提交用户确认后才纳入实施**，未达标项留 Backlog 原行并附结论 | — |
| M2-2 | scoped 变量声明治理 + 档位死声明守护 | 收敛 `button` 基类预声明与 `message` / `badge` / `tag` / `toast` 档位类未用 `:where()` 的偏差；为「档位块直接声明属性」补机检规则 | `check:design` 扩展后可阻断回流（带正反例语料矩阵）；组件计算样式零漂移 | — |
| M2-3 | 禁用态字面量守卫 + z-index token | 为 `opacity: 0.5` / `0.6` 补预算守卫；浮层 z-index 字面量收敛为 `--caomei-z-*` | 守卫可阻断回流；逐浮层 z-index 计算值等价 | — |

#### M3 组件能力增强

- 执行范围：按 Backlog 既有取证（2026-09-20 用户裁定不等 momei 反馈）补齐 4 项能力：Select 分组、Tag / Badge 增强、DropdownMenu `model` 扩展、分组按钮可访问语义。
- 非目标：不在 Select 上实现 `filter`（2026-09-15 用户决策维持）；不实现 `AutoComplete` 严格选项模式（属 M2-1 门槛判定）；不新增散落布尔别名。
- 最小验收标准：新增能力走受控枚举 props；单测覆盖主路径与失败路径；中英组件页与[设计规范 §7](../design/design-spec.md) 登记一致；视觉 / 交互类经 `@ui-validator` 验证。

| 编号 | 条目 | 范围 | 最小验收标准 | 依赖 |
| :-: | --- | --- | --- | :-: |
| M3-1 | Select 分组 | `SelectGroup` 分组渲染与键盘遍历；分组标签与既有对象选项映射兼容 | 分组渲染 / 键盘遍历 / 受控更新单测；中英文档与设计规范 §7 同步 | — |
| M3-2 | Tag / Badge 增强 | Tag 可选中筛选 / 可编辑；Badge 叠加位置偏移与宽度过渡 | 各能力带单测与中英示例；视觉与交互经真实浏览器验证 | — |
| M3-3 | DropdownMenu `model` 扩展 | `model` 支持 `items` 嵌套子菜单（递归渲染）与逐条目 `class`（momei 实测 2 处 / 1 处）。契约扩展授权来源：用户原话「M3 按现有情况直接做」（2026-09-20），本阶段启动授权覆盖该项 | 递归渲染深度与逐条目类名单测；中英迁移指引同步；模型契约为新增字段（不破坏既有 `model` 形态） | — |
| M3-4 | 分组按钮可访问语义 | ButtonGroup / SplitButton 根补 `role="group"` 与可选分组可访问名 | 无障碍断言（role + 名）；中英文档登记；既有拼接样式零回归 | — |

#### M4 质量门与文档守卫

- 执行范围：把覆盖率校验从日常门禁移出、落到周期性回归与 release 流程；补文档结构守卫与翻译旧目录守卫；提升文档对外可用性。
- 非目标：不把覆盖率阈值放进 `pnpm test` / `pnpm verify`；不引入 a11y 自动化回归与 E2E 入门禁（延后）；不做文档站观感与版本化。
- 最小验收标准：日常门禁不因覆盖率失败且周期 / release 门禁阈值可复现；新守卫带正反例语料且全库零误报；文档修复项经三档视口实测。

| 编号 | 条目 | 范围 | 最小验收标准 | 依赖 |
| :-: | --- | --- | --- | :-: |
| M4-1 | 覆盖率门禁落位 | 新增独立覆盖率校验入口（仅由 `.github/workflows/regression-weekly.yml` 与 `.github/workflows/release.yml` 调用）；阈值先取证当前实测基线与分布 | `pnpm test` / `pnpm verify` 不含阈值校验；上述两个 workflow 中阈值生效并可复现；阈值来源与排除项有说明 | — |
| M4-2 | 文档守卫补强 | 空文件 / 截断 / 孤立表格行守卫 + 翻译旧目录守卫（`docs:check:i18n`） | 守卫带正反例语料并接入 `docs:check`；全库零误报 | — |
| M4-3 | 文档对外可用 | `README.en-US.md`（定位为仓库内文档）+ en-US 文档页 768 档横向溢出（`847 > 768`）修复 | 768 / 1024 / 1440 三档无横向溢出；README 中英差异有守卫或显式约定 | — |

## 未完成项汇总

> 本节仅汇总未完成项以供跨阶段可见，**不构成阶段待办登记**（登记需用户明确决策）。

- **未启动 / 未完成阶段**：Phase 8（下游兼容性回归机制，稳定后启用）。范围见[路线图](./roadmap.md)。
- **等待外部反馈**：momei 侧迁移（B0b 视觉基线 / B2 / B3 / B4）由 momei 项目在其仓库执行，本仓不触碰 momei 文件；本仓等待其反馈后再决定下一轮动作。
- **后置项**：Phase 5 第二阶段的下游接入验证（发布后由下游实际迁移反馈驱动）；文档站版本化（依赖后续版本基线）。
- **未纳入任何阶段的候选**：见 [Backlog](./backlog.md)（组件增强、国际化与 RTL、移动端与响应式、基建与治理、服务层、下游协同等分组）。
- **已完成阶段的遗留项与已知偏差**：见[待办归档](./todo-archive.md) 与 [Backlog](./backlog.md)（后者承载其中仍待决策的候选）。
