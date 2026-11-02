# 待办归档（深度归档）：Phase 20

> 收录阶段：测试装置扩面、治理守卫补口与发布收口。
> 主窗口与归档索引见 [待办归档](../todo-archive.md)；阶段交付的唯一权威记录仍是各阶段治理记录（见 [治理索引](../../design/governance/index.md)）。
> 迁移为机械操作：`../` → `../../`，另 2 处同目录 `./backlog.md` / `./recurring.md` → `../…`（全批 5 处）；正文不改写。

## Phase 20：测试装置扩面、治理守卫补口与发布收口

- 时间：2026-10-07 用户裁定 D1 ~ D13 后登记；2026-10-09 交付 5 条主线 / 12 条原子条目并完成阶段归档（用户指令「开始归档」）。
- 范围与授权（用户决策 2026-10-07）：用户取**组合 A + 组合 B + 组合 C（= M1 + M2 + M3）**，并**纳入 M6 发布收口**（D4 发 0.6.0）、**上收 M7 视觉回归基线立项评估**（D9）；**M5 国际化路线 / M4 组件能力不纳入**（D6 / D8 维持登记），共 **5 条主线 / 12 条原子条目**（M1 4 / M2 5 / M3 1 / M6 1 / M7 1）。逐条裁定——**D2** Phase 8 **只出范围评估、不启动**；**D3** 测试装置扩面三项**全纳入**；**D4** 发 **0.6.0**；**D5** 基建守卫五项**全纳入**；**D6** 国际化 / RTL 维持登记；**D7** 归档载体超阈维持登记；**D8** 组件能力维持条件触发；**D9** 上收视觉回归基线立项评估；**D10 ~ D12** 文档站长投 / 其余守卫 / 下游协同维持；**D13** 发布已登记为 M6-1 条目。范围依据见[下一阶段范围评估（第四轮）](../../design/governance/2026-10-07-next-stage-scope-evaluation-4.md) §8。
- 非目标：不纳入国际化路线落地 / 组件能力与长尾；不重写 / 不修改下游仓库；不做破坏性 API 变更；不启用 CI 自动发布；不改品牌色值；不重指已发布 tag；不引入 Tailwind / UnoCSS。

### M1 测试装置与覆盖扩面（4 条）

- **M1-1 Tabs 纳入 `capture:styles` 采样面**：采样面 **302 → 308**（Tabs 横 / 纵各 3 项），判定「指示条可稳定采样」；冻结基线重取后 **0 差异**、`capture.test.mjs` **17 passed**；两轮负向对照各命中 3 处。提交 `852908b`；记录见 [M1-1](../../design/governance/2026-10-07-phase20-m1-1-tabs-capture-face.md)。
- **M1-2 焦点可见扩面补全**：受检面 **5 → 31 项（+26）**，新增下界守卫 `MIN_FOCUS_TARGETS = 31`；负向对照 9 处失败；`test:e2e` **276 passed**。提交 `8d8a775`；记录见 [M1-2](../../design/governance/2026-10-07-phase20-m1-2-focus-visible-expansion.md)。
- **M1-3 禁用态几何扩面补全**：受检面 **7 → 18 对（+11）**，下界守卫 `MIN_DISABLED_PAIRS = 18`；负向对照 9 处失败；`test:e2e` **312 passed**。提交 `437431f`；记录见 [M1-3](../../design/governance/2026-10-07-phase20-m1-3-disabled-geometry-expansion.md)。
- **M1-4 文档站浮层泄漏常驻浏览器断言**：把一次性探针转为常驻 Playwright 规格 `test/e2e/docs-theme-isolation.e2e.ts`（`docs:build` 产物 + 每周回归），负向对照 1 failed；`test:e2e:gallery` **11 passed**。提交 `f3b3b78`；记录见 [M1-4](../../design/governance/2026-10-07-phase20-m1-4-docs-theme-isolation.md)。

### M2 基建与治理守卫补口（5 条）

- **M2-1 a11y 同类悬空引用处置**：分组无内嵌标签时省略 `aria-labelledby`（槽内标签在位检测 + 显式透传优先）、折叠触发器统一省略 `aria-controls`（Reka 内容 id 非响应式）；新增共享机构 `_shared/slot-presence`；axe 不判本类 → 真实 Chromium 复验 + 等价断言；`test:a11y` 59。提交 `5d3ce82`；记录见 [M2-1](../../design/governance/2026-10-07-phase20-m2-1-a11y-dangling-refs.md)。
- **M2-2 文档站主题 CSS 纳入 lint 面**：`lint:css` 的 glob 追加 `docs/.vitepress/theme/**`（引号化交由 Stylelint 展开），存量 4 处记号等价 `--fix` 清零。提交 `2149de1` + `c6158ce`；记录见 [M2-2](../../design/governance/2026-10-07-phase20-m2-2-docs-theme-stylelint.md)。
- **M2-3 直连 Reka 触发器机检守卫**：新增 `check-reka-trigger-usage`（接入 `governance:check`）——本库已有包装时禁止组件内直连同型触发器；受检 **197 文件 / 0 违规**；单测 14 例 + 负向对照。提交 `d8641c6`；记录见 [M2-3](../../design/governance/2026-10-07-phase20-m2-3-reka-trigger-guard.md)。
- **M2-4 浮层交互 E2E 规格**：新增 `overlay-interaction.e2e.ts`（Dialog / ConfirmDialog 焦点落位 + 滚动锁复位，2 用例 × 三视口）；负向对照 `:modal=false` 1 failed；`test:e2e` **318 passed**。提交 `62431d0`；记录见 [M2-4](../../design/governance/2026-10-07-phase20-m2-4-overlay-interaction.md)。
- **M2-5 执行层规则重述与失效引用收敛**：任务粒度阈值重述收敛为链接引用（唯一权威 = 规划规范 §5）；扩展 `check:audit-protocol` 新增 `granularity-threshold` 规则 + 新增 `check-ai-asset-links`（AI 资产链接与 GitHub slug 锚点）。提交 `e996656`；记录见 [M2-5](../../design/governance/2026-10-07-phase20-m2-5-audit-protocol-convergence.md)。

### M3 下游协同与 Phase 8 评估（1 条）

- **M3-1 Phase 8 下游兼容性回归启动范围评估**（**评估不等于启动**）：前置三条件 ①② 成立、③ 因 dependfix 完成全量迁移并稳定消费 `0.5.0` 由「不完全成形」推进为「**部分成形**」；已接入下游清单（dependfix / momei）、触发形态四选（以 [发布指南 §10](../../guide/release.md) 的 A/B + 失败即阻塞为基线）、容量边界（发布触发、`typecheck + build`）；启动前待决策 D1 ~ D6。用户初步取向（2026-10-08）：**下阶段正式启动、以 dependfix 为试点**。提交 `2c803e0` + `ac21a46`；记录见 [M3-1](../../design/governance/2026-10-08-phase8-downstream-regression-scope-evaluation.md)。

### M6 发布收口（1 条）

- **M6-1 0.6.0 发布**：长期任务**第 22 轮**门槛复核（`d22f034`）→ `pnpm verify` 全绿 → `npm version 0.6.0`（`5c48387` + annotated tag `v0.6.0`；首跑被 `check-review-gate-artifacts` 阻断，根因 = `package.json` 缺末尾换行，`ef65a33` 修复）→ `pnpm changelog`（`b083a53`）→ 本地 `npm publish`（registry `latest` = 0.6.0）→ 发布后校验 + 版本句同步（`ead6624`，消解 `docs:check:version` 4 处红）→ 同源漂移 9 文件归一（`e14edc0`）+ 新增 `check-final-newline` 守卫（`8e3c395`，根治）→ **GitHub Release 回填** `v0.1.0` ~ `v0.6.0`（推送 `master` + tags 后）→ 发布执行记录（`a87f657`）。记录见 [M6-1](../../design/governance/2026-10-08-phase20-m6-1-release-execution.md)。

### M7 视觉回归基线立项评估（1 条）

- **M7-1**：评估 Playwright 截图比对形态（基线库 / 容差 / CI 集成成本），**只出立项建议、不建实体基线、不改代码**；结论 = 采用 Playwright **内置 `toHaveScreenshot`** + 仓库内冻结基线（零外部服务 / 零新依赖，与下游 dependfix / momei 同构），给出双轴容差、CI 先非阻断后转阻断与待决策 D1 ~ D6。提交 `6d992d8`；记录见 [M7-1](../../design/governance/2026-10-08-m7-1-visual-regression-baseline-evaluation.md)。

### 附带交付（非阶段条目）

- **Phase 20 登记与范围评估**：`95aea81`（Phase 20 登记 + 第四轮下一阶段范围评估）。
- **发布机制评估**（用户指令）：`c4f2e3f`（统一手动发布流 + 1.x / 自动化发布评估，只出建议；记录见 [Release flow eval](../../design/governance/2026-10-08-release-flow-and-version-strategy-evaluation.md)）。
- **Phase 19 归档批次回填**（窗口内、属上一阶段）：`83ff5b4`（回填 Phase 19 归档批次提交号）。

### 阶段总结

- **提交对账**：`git log --oneline 29662c7..c4f2e3f | wc -l` → **24**（下界 = Phase 19 归档批次提交 `29662c7`，上界 = 本阶段末条记录提交 `c4f2e3f`；**不得写 `HEAD` 相对范围**，归档提交会推进 `HEAD`）。构成（逐项相加 = 24）：Phase 20 本体 **21**（M1 4 = `852908b` / `8d8a775` / `437431f` / `f3b3b78`；M2 6 = `5d3ce82` / `2149de1` / `c6158ce` / `d8641c6` / `62431d0` / `e996656`；M3 2 = `2c803e0` / `ac21a46`；M6 8 = `ef65a33` / `5c48387` / `b083a53` / `ead6624` / `e14edc0` / `8e3c395` / `d22f034` / `a87f657`；M7 1 = `6d992d8`）+ 阶段登记与范围评估 **1**（`95aea81`）+ 附带交付与上一阶段回填 **2**（`c4f2e3f` / `83ff5b4`）。**归档批次自身提交不计入上式**。
- **质量门**：`pnpm verify` **exit 0**、`test` / `test:a11y` / `test:e2e` / `capture:styles` / `docs:check` / `check:governance-records` / `check:distill-archive` / `docs:build` 的**终态数值与复算命令见[归档批次记录](../../design/governance/2026-10-09-phase20-archive.md) §8**（单点来源，本块不复写易变计数）。
- **长期任务**：阶段收口前触发**第 23 轮**门槛复核（规划清理域）——待执行批次 **0 项**；条件触发 **1 项维持**；已判定不纳入 5 项维持；**计数与第 22 轮逐项一致（无漂移）**；证据见[长期任务](../recurring.md) §3 第 23 轮。
- **回扫口径（三段式）**：见[归档批次记录](../../design/governance/2026-10-09-phase20-archive.md) §4（机检面 / 人工面 / 未处理面）。
- **wisdom 蒸馏**：22 条活跃条目 ≥ 阈值 → **本轮执行蒸馏**（migrate 22），段计数与落点见[归档批次记录](../../design/governance/2026-10-09-phase20-archive.md) §6。
- **归档批次审计**：经 `@code-reviewer` Review Gate **单分区 `standard`**——结论见本块末「归档批次 Review Gate」段。
- **已知观察**：① Phase 20 **含 `src/**` 行为改动**（M2-1 a11y 引用型属性）且**完成一次发布**（0.6.0），与 Phase 19 不同；② `capture:styles` 采样面由 **302 扩至 308**（M1-1），属预期变更；③ 归档载体行数（Phase 20 块后）超 `docs:check:line-count` 的 warn 阈值（warn > 400 / error > 600，**非阻断**）——归档载体只增不减；④ `docs:check:integrity` 对 `todo.md` 报「H1/H2 结构标题减少」告警——属归档正常移除面，**预期、非阻断**；⑤ 归档后 `check:governance-records` 报 `stale-planning-pointer`（Phase 19 及更早记录表头「关联条目」指向 `todo.md`），同批改指 `todo-archive.md`。
- **遗留与后续候选**：**Phase 8 未启动**（用户 2026-10-08 初步取向：**下阶段正式启动、以 dependfix 为试点**）；**发布机制评估**待决策 D1 ~ D6（统一手动流形态 / 1.x / 自动化发布）；dependfix（`0.5.0`，可升级 `0.6.0`）与 momei（锁 `0.3.0`、部分迁移）由对应仓库执行、本仓等待反馈；Backlog 在册含组件增强与长尾、国际化语言覆盖与文案分包（实现待规模触发）、RTL 独立立项、视觉回归基线（立项评估已出、实施待裁定）、下游 0.5.0 升级护航、依赖安全告警（推送时 GitHub 提示默认分支 13 条）等；其余见 [Backlog](../backlog.md)。

### 归档批次 Review Gate

经 `@code-reviewer` Review Gate **单分区 `standard`**（归档批次以规划载体为主，故不分区）：结论见[归档批次记录](../../design/governance/2026-10-09-phase20-archive.md) §10。

---
