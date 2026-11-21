# 待办归档（深度归档）：Phase 18

> 收录阶段：发布收口、测试稳定性与一致性治理。
> 主窗口与归档索引见 [待办归档](../todo-archive.md)；阶段交付的唯一权威记录仍是各阶段治理记录（见 [治理索引](../../design/governance/index.md)）。

---

## Phase 18：发布收口、测试稳定性与一致性治理

- 时间：2026-09-30 用户逐条裁定 D1 ~ D13 后登记；2026-10-01 交付 5 条主线 / 12 条原子条目并完成阶段归档（用户指令「开始归档」）。
- 范围与授权（用户决策 2026-09-30，D1~D13）：**D1** 取 **M1 + M2 + M3 + M4 + M6**（**M5 下游升级护航与 Phase 8 不纳入**）；**D2** 先做文档同步、**推送继续等待**；**D3** flaky 类取「断言等待稳定 + `maxWorkers` 兜底」；**D4** 质量装置四条**全取**；**D5** 设计一致性**只出评估**；**D6** `iconOnly` 示例形态**继续登记待调研**；**D7** 对比度 6 项**收口为终局结论**（不改色值）；**D8** 下游升级护航**不纳入**（口径随 M6 修正）；**D9** Phase 8 **继续等待不启动**；**D10** 台账漂移**修 3 项 + 回扫**；**D11** 组件增强与长尾**全部维持条件触发**；**D12** 国际化 / RTL **均不纳入**并追加「国际化语言覆盖与文案分包体积调研」候选；**D13** 阶段末**按需发版、不预登记**；N5 `v0.5.0` 指向**维持现状**、只修发布指南 §3 文本口径。范围依据见[下一阶段范围评估（第二轮）](../../design/governance/2026-09-30-next-stage-scope-evaluation-2.md) §8。
- 非目标：不执行远端推送（推送继续等待）；不重指 `v0.5.0` tag；不重新发布 0.5.0；不做 `iconOnly` 示例形态；不落地设计一致性断言（M3 只评估）；不做下游升级护航；不启动 Phase 8；不做国际化 / RTL 实现；不做组件增强与长尾；不预登记发布条目；不做破坏性 API 变更；不引入 Tailwind / UnoCSS。

### M1 发布收口与版本一致性（3 条）

- **M1-1 0.5.0 发布后校验与版本句同步**：registry `version` / `dist-tags` = 0.5.0；registry tarball shasum `266f7686…` 与本地 `npm pack` 产物交叉核对一致（**358 文件 / 858390 B**）；解包冒烟 `ok`（resolver / nuxt / styles 全 true、根导出 **92**）；README（中英）/ `roadmap §1` / `todo.md` 缺陷状态行同步 → `docs:check:version` **exit 0**（4 处漂移清零）。提交 `f0df2b0`。
- **M1-2 发布指南 §3 tag 指向口径修正**：§3 第 4 步改为「tag 落点两种形态均属正常」；`npm version` 注由「不要用其替代本流程」改写为「本地发布的正常流程」并去掉「偏差」定性；**`v0.5.0` 不回改**、历史记录不回写。提交 `3fcc78f`。
- **M1-3 0.5.0 发布执行治理记录**：产出 [`2026-10-01-phase18-m1-3-release-0.5.0.md`](../../design/governance/2026-10-01-phase18-m1-3-release-0.5.0.md) 并登记索引；registry 实测值与 tarball 证据链逐项回链；「与发布日志逐条一致」不可证 → **替代取证边界**显式登记。提交 `1e05b5e`。

### M2 测试稳定性与质量装置消缺（5 条）

- **M2-1 并行负载 flaky 类根因修复与并发上限兜底**：根因 = Reka 浮层挂载 / roving focus / 双向 emit 由微任务与定时器混合驱动，高负载下「交互后立即断言」读到更新前状态；观测到的 **11 个用例**改条件轮询（helper `test/helpers/settle.ts`，规则落[测试规范 §6.2](../../standards/testing.md)）；`vitest.config.ts` 增 `maxWorkers: 4` + `testTimeout: 15000`；**连续 7 轮零失败**、worker 进程恒为 4、负向对照证明判别力保持；**附带修复** `guard-ref-attrs` 在 `stdio: 'inherit'` 下 `.trim()` 崩溃。提交 `1b39f37` / `a3591a0` / `1e65760`。
- **M2-2 计算样式采样面扩展（Toast / Switch）**：采样面 **245 → 262 项（+17）**——`switch.*` 6（开 / 关 / 禁用三态轨道与滑块几何 + 前景回退色 + 选中态位移）与 `toast.*` 11（视口层级 / 停靠几何 + 五档语气强调色与图标色）；契约与夹具固有值逐项区分；负向对照 **7 处命中**（Switch 宽度 / Toast 强调条）、还原后 0 差异；`capture:styles` **262 项 0 差异**。提交 `6ba6d0c` / `5036199`。
- **M2-3 富文本编辑器窄屏真实几何回归**：新增常驻 E2E（三档视口断言页级 / `body` / 编辑器根相对视口与宿主容器的宽度 + 宿主 `display: grid` **前置守卫**）+ 独立夹具入口 `/rich-text-editor.html`；负向对照（回退 `min-width: 0`）mobile 失败（`scrollWidth` **1013** vs 390、溢出 **623**）、还原后三档全绿；`test:e2e` **117 passed**（既有 114 + 3，零回归）。提交 `8c7292d` / `2b2fe92`。
- **M2-4 组件设计 §5 组件清单对账守卫**：新增 `check:design-catalog`（接入 `governance:check`）——以 §11 登记成员（48）对账 §5 清单（21 行）的行成员与「（已实现）」标记，五条判定（`phantom-implemented` / `stale-marker` / `scope-narrowed` / `allowlist-stale` / `member-drift`）；**存量漂移修复**：§5 **7 行**已实现但漏标；负向对照 T1 / T2 均 exit 1；单测 **18 例**；§11 解析下沉共享模块。提交 `27c9700` / `5150e21`。
- **M2-5 浮层档位装置判别力补强**：① 内联 ColorPicker 由「只断言计算 `z-index`」升级为「声明层 + 真实绘制顺序命中」；② 命中测试判别力自证扩展到模态内容**后代**；③ 受检清单下沉单一事实源 `test/e2e/fixtures/overlay-panels.json`，`check:overlay-z-index` 新增 **T10 双向对账**（`src` 锚定面板组件 ↔ 清单条目 + 非面板例外名单反向校验）——新增 portal 浮层组件而未补清单即 `governance:check` 失败；三组负向对照均实测失败后还原；守卫单测 **41 例**（34 → +7）。提交 `37552ec` / `d02177c`。

### M3 组件设计一致性回归评估（1 条）

- **M3-1 设计规范 §6 组件约定「可机检性」分级评估**（**纯评估、零 `src/**` 零 `test/**`**）：产出 [`2026-10-01-phase18-m3-1-design-consistency-evaluation.md`](../../design/governance/2026-10-01-phase18-m3-1-design-consistency-evaluation.md)——§6 **16 行**约定**无一行属「仅人工」**（主层级 计算样式层 13 / 声明层 2 / 几何层 1；出现次数 算 15 / 声 6 / 几 9 / 交 7）；装置盘点（`check:design` 9 类 + `check:overlay-z-index` T1~T10 + 3 份 contracts + `capture:styles` 262 + e2e 117 + a11y 59 + 组件单测）；覆盖 9 行较完整 / 7 行缺口明显；取证发现 **7 项 §6 ↔ 实现口径漂移**（禁用态计数 37 vs 实测 35 处声明；`:invalid` vs `.caomei-field--invalid`+`aria-invalid`；浮层背景 `bg-elevated` vs 8 面取 `bg`；Popover 圆角；Tag 字号；AutoComplete 阴影字面量；Card 三变体）——**须先裁定再落守卫**；落地建议 P0~P3（待裁定后登记）。提交 `b0567c0`。

### M4 组件文档与口径收口（2 条）

- **M4-1 `Select` 字段层 `class` 落点文档补强**：中英 `select.md` 新增「`class` / `style` 落点」说明——`inheritAttrs: false` 下 `$attrs` 整绑**触发器**、不落字段外层；`--caomei-select-max-width` 宿主为字段外层，覆盖须作用于本元素或其祖先（CSS 变量只向下继承）；与 `select.vue` 注释口径及 `theming §4.1` 一致。提交 `898fbf4`。
- **M4-2 对比度 6 项在册缺口终局结论收口**：产出 [`2026-10-01-phase18-m4-2-contrast-terminal-conclusions.md`](../../design/governance/2026-10-01-phase18-m4-2-contrast-terminal-conclusions.md)——6 项**全部维持、不修色**（3.76 / 3.39 / 4.17 / 4.28 / 4.39 / 3.73·4.32:1，阈值 4.5:1）；本批复算 **7/7** 与 M2 记录 8% 口径表一致；`design-spec §3.2` 跟踪指针由 Backlog 改指该记录（**唯一载体**）；**零色值变更**（`git diff -- src/styles/` 为空）、`capture:styles` 262 项 0 差异。提交 `37aa19b`。

### M6 治理台账漂移消缺（1 条）

- **M6-1 治理台账漂移消缺（3 项处置 + 同类回扫）**：**C49** 预备检查记录 §4 的 `Backlog §1.2` → **§1.8**；**C50** `todo.md` 陈旧轮次指针**复核确认无残留**（`rg "第 18 轮"` = 0、仅引第 19 轮）；**C51** `backlog.md` §1.8 行重写为「下游 0.5.0 升级护航」（本仓 0.5.0 已发布、隔两个 minor，差异清单改为触发时按 CHANGELOG 重取）；同类回扫（章节引用 / 轮次 / 版本口径）无其它漂移；回扫新增发现第 4 处（`todo.md` 阶段头「实施未启动」滞后）；**承接 M1-2 延期回扫面**（活载体 `experience-archive.md` 的 `npm version` gotcha 修、点时记录 3 处不回改）；**指针判据沉淀至 [规划规范 §9](../../standards/planning.md)**；旧口径逐载体 `rg` 复核零残留。提交 `5921787` / `d3de4e0`。

### 附带交付（非阶段条目）

- **组件画廊侧栏接入与对齐修复**（`25f79fa` / `8667117` / `b89d720`）：画廊进组件侧栏、RichTextEditor 独立「高级组件」分组、卡片安全居中修复（超高演示顶部可达）+ 常驻 E2E。
- **文档口径与设计区侧栏简化**（`8c696d2` / `29dbb86` / `29a7693`）：富文本内核安装前置说明、可选 peer（`md-editor-v3` / `@nuxt/kit`）说明、`/design/` 侧栏只留 7 篇面向使用者的设计文档。
- **发布前预备检查与第 19 轮门槛复核**（`1c9f9b0`）：发布面取证 + 14 项就绪检查 + 发布执行清单 + 长期任务第 19 轮。
- **并行负载 flaky 类登记**（`eea4746`）：根因与累计实例登记（其后由 M2-1 修复）。

### 阶段总结

- **提交对账**：`git log --oneline ed99c7b..d3de4e0 | wc -l` → **41**（下界 = Phase 17 归档批次末条提交 `ed99c7b`，上界 = 本阶段末条状态提交 `d3de4e0`；**不得写 `HEAD` 相对范围**，归档提交会推进 `HEAD`）。构成（逐项相加 = 41）：Phase 18 本体 **19** + 阶段登记与范围评估 **2** + 发布执行 **2** + 附带交付 **8** + 依赖维护 **10**；逐条清单见[归档批次记录](../../design/governance/2026-10-01-phase18-archive.md) §2。**归档批次自身提交不计入上式**。
- **质量门**：`pnpm verify` **exit 0**、`test` / `test:a11y` / `test:e2e` / `capture:styles` / `docs:check` / `check:governance-records` / `check:distill-archive` / `docs:build` 的**终态数值与复算命令见[归档批次记录](../../design/governance/2026-10-01-phase18-archive.md) §8**（单点来源，本块不复写易变计数）。
- **长期任务**：阶段收口前触发**第 20 轮**门槛复核（零代码改动域）——待执行批次 **0 项**；条件触发 **1 项维持**；已判定不纳入 5 项维持；**计数与第 19 轮逐项一致（无漂移）**；证据见[长期任务](../recurring.md) §3 第 20 轮。
- **回扫口径（三段式）**：见[归档批次记录](../../design/governance/2026-10-01-phase18-archive.md) §4（机检面 / 人工面 / 未处理面）。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → **`WISDOM_OK: 15 active entries (threshold 20)`**——**未达阈值、本轮不执行蒸馏**（[规划规范 §7](../../standards/planning.md)）；`pnpm check:distill-archive` → **11 段 reconciled**（未新增段）。本阶段 3 条发现已即时落入规范载体（`planning.md §9` 等），未在活跃段累积。
- **归档批次审计**：经 `@code-reviewer` Review Gate **单分区 `standard`**（归档批次以规划载体为主、无运行时面，故不分区）——结论见本块末「归档批次 Review Gate」段。
- **已知观察**：① **M3-1 的 7 项 §6 ↔ 实现口径漂移未处置**——属评估交付的发现，须用户裁定后再落守卫（已登记为该记录 §4 的前置阻塞）；② **0.5.0 已发布、git 侧未推送**（本地领先 `origin/master`、远端 0 tag），推送与阶段末发版时机由用户决定（D2 / D13）；③ 本阶段**零 `src/**` 行为改动**（仅临时负向对照改动、均已还原），候选计数与第 19 轮一致；④ 本仓期间被另一会话并行写入一次（`pull --tags --autostash` 前移 HEAD），开工前已确认工作区洁净；⑤ `docs:check:integrity` 对 `todo.md` 报「H1/H2 结构标题由 HEAD 的 4 个降为 3 个」告警——脚本自带说明「阶段 / 条目标题在 H3/H4，属**归档正常移除面**」，**属预期、非阻断**（Phase 17 归档批次同类观察）；⑥ 归档清理的 `Mx-y` 残留形态**已补机检兜底**——`check-planning-numbers` 受检面扩至规划载体（`docs/plan/todo.md`），负向对照（注入编号 → exit 1）与单测（43 例）齐备，该形态此前在近三次归档复发、原为「Review Gate 必查项」。
- **遗留与后续候选**：Phase 8 未启动（用户 2026-09-28 裁定 D13、2026-09-30 D9 维持）；dependfix `apps/platform` 与 momei 侧迁移由对应仓库执行、本仓等待反馈；Backlog 在册含「下游 0.5.0 升级护航」、`iconOnly` 示例形态（待调研）、组件增强与长尾（条件触发）、a11y 同类悬空引用与 Toast 焦点哨兵、国际化语言覆盖与文案分包体积调研、设计一致性可机检项落地（待 M3-1 口径裁定）等；其余见 [Backlog](../backlog.md)。

### 归档批次 Review Gate

经 `@code-reviewer` Review Gate **单分区 `standard`**（归档批次以规划载体为主，故不分区）：R1 **`Reject`**（1 blocker / 1 warning / 1 suggest）——blocker = 归档后 `todo.md` 残留条目编号 `M3-1`（规划规范 §7 明令禁止、**近三次归档复发**）→ 修复：清除编号**并补机检兜底**（`check-planning-numbers` 受检面扩至 `docs/plan/todo.md`，把「Review Gate 必查」升级为可复算门禁，负向对照 + 单测 43 例齐备），另收口 warning（回扫人工面数字留痕）与 suggest（轮次口径限定）→ **R2 `Pass`（0 blocker / 0 warning / 0 suggest）**。逐轮 findings、逐条处置与实测用时见[归档批次记录](../../design/governance/2026-10-01-phase18-archive.md) §10。**单点来源界定**（易变计数只在[归档批次记录](../../design/governance/2026-10-01-phase18-archive.md) §8 声明）使 Phase 17 的「同一计数跨载体漂移」根因未复发。

---
