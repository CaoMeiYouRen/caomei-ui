# 待办归档（深度归档）：Phase 32

> 自 [todo-archive.md](../todo-archive.md) 主窗口迁出；迁移为机械操作（相对链接深度 `../` → `../../`，同目录 `./` → `../`），正文不改写。阶段交付权威记录见[治理索引](../../design/governance/index.md)。

## Phase 32：质量收口与文档站回归（**2026-11-13 完成并归档；本阶段不发布**）

- 时间：2026-11-12 用户就[下一阶段范围评估（第十六轮）](../../design/governance/2026-11-12-next-stage-scope-evaluation-16.md) §3 裁定 D0 ① / D1 ② / D2 ① / D3 ① 后登记；2026-11-13 交付 **3 条主线 / 4 条原子条目**并完成阶段归档（用户指令「开始归档」）。
- 范围与授权：取**仅质量收口**（D1 ②，不含发布）——依赖适配与例外收口 **1** / 文档站质量收口 **2** / 文档站 demo 过渡 **1**；构成对账 **1 + 2 + 1 = 4**。**本阶段不发布**：`latest` 维持 `1.2.0`，未执行 `pnpm release`、未触发 Release workflow。范围与验收口径的单一事实源见[Phase 32 登记批次记录](../../design/governance/2026-11-12-phase32-registration.md) §1 / §2。
- 非目标：发布；`glob` cross-major override；CI 镜像迁移检测；文档站多版本托管；Tailwind preset / Storybook；`conventional-changelog` 8；示例外链守卫扩展；交互边界对比度；ui-validator 资产 follow-up；长尾组件；国际化二期 / RTL；`useDialog`；图标运行时 peer；破坏性 API；新增运行时依赖。

### M1 依赖适配与例外收口（1 条）

- **M1-1 `reka-ui` 2.11.0 适配与 Toast 例外收口**（PR [#52](https://github.com/CaoMeiYouRen/caomei-ui/pull/52)，合并 `5b72563`；回填 `a30dabb`；记录见 [M1-1](../../design/governance/2026-11-13-phase32-m1-1-reka-ui-2.11-adaptation.md)）：4 例 InputNumber 回归按评估归因落地——3 例为 VTU 未挂载到文档（`pointerup` 监听挂在 `window`）、1 例为触摸 `change` 时序（`flushStepChange` 以 `nextTick` 延后读取）；删除上游已修复的 `CaomeiToastProvider / aria-hidden-focus` 例外，许可证台账标题跟随安装版本。按 [GitHub 协作规范](../../standards/github-collaboration.md) §3「复杂修改不代改 dependabot 分支」另开 PR，#33 关闭并由该 PR 替代。RG R1 `deep` `Reject`（1 blocker：索引摘要复述门禁读数）→ R2 `quick` `Pass`。

### M2 文档站质量收口（2 条）

- **M2-1 `with-select` 示例可访问名**（提交 `46ad9ba`；记录见 [M2-1](../../design/governance/2026-11-13-phase32-m2-1-input-group-select-name.md)）：中英示例各补 `aria-label`（`placeholder` 不再充当组合框名称），新增源码契约守卫（逐份示例要求非空 `label` / `aria-label`，含「仅 placeholder」「纯空白」负向用例与 `label` 形态正例）。RG `quick` R1 `Pass`。
- **M2-2 首页 hydration mismatch 定性**（提交 `f5542da`；记录见 [M2-2](../../design/governance/2026-11-13-phase32-m2-2-home-hydration.md)）：按用户裁定以「SSG 结构快照 + dev 真机对照」结案——`/` 与 `/en-US/`、暗色、已存主题预设四种场景下 hero / features / nav 标题在 SSG 与水合后逐项一致，dev 与生产构建均无告警；结论为「当前版本 + 本判别面下未复现（不声称已消除）」，三层排除（VitePress 上游 / 主题层 / 示例层）与四条边界落盘。新增 fail-closed 探针 `pnpm docs:probe:hydration`（产物前置校验 / 受检面归零判失败 / `__vue_app__` 就绪轮询），约定写入[文档站设计 §9](../../design/documentation-site.md)。RG R1 `standard` `Reject`（2 blocker：探针静默假通过、结论越权）→ R2 `quick` `Pass`。

### M3 文档站 demo 过渡（1 条）

- **M3-1 demo 过渡恢复（站点仍压平）**（提交 `a678be3`；记录见 [M3-1](../../design/governance/2026-11-13-phase32-m3-1-demo-transition.md)）：VitePress reduce 压平 + 全局时长 token 归零 + 组件 `transition: none` 三层叠加使 demo 过渡不可见；在 `.vitepress-demo-plugin__container` 内按组件重声明完整 transition shorthand，时长改用文档站本地变量（150/200/300ms），字段外壳复写 `--caomei-field-transition` 保留公开覆盖入口。实测 reduce 下 demo 产出 150ms `CSSTransition`（字段边框 / 阴影、开关拇指、Button、Switch 轨道、FloatLabel），站点元素仍 `0s`；`expressive` 专属过渡与 Portal 手势不恢复。RG R1 `standard` `Reject`（1 blocker：Button 误排除；5 warning 含 Stepper 过度恢复 / Switch 轨道缺失 / FloatLabel 漏项）→ R2 `quick` `Pass`。

### 阶段总结

- **3 条主线 / 4 条原子条目全部交付**；本阶段不发布，`latest` 维持 `1.2.0`。
- **提交对账**：阶段交付与回填 `5b72563` / `a30dabb` / `46ad9ba` / `f5542da` / `a678be3`；阶段内 CI 修复 PR [#53](https://github.com/CaoMeiYouRen/caomei-ui/pull/53)（`46c00f9`，CodeQL #6 `js/incomplete-sanitization`）与 PR [#54](https://github.com/CaoMeiYouRen/caomei-ui/pull/54)（`6c0cd35`，CodeQL #7 `js/path-injection`）；登记与前置记录 `7abe62f` / `2c8a73b`。
- **质量门**：`6c0cd35` 的 CI（Test / Security Alerts / CodeQL / Pages / TODO to Issue）全部 success；全量单测 **3153 passed**（162 文件）；归档批次复跑 `lint:md:check` / `docs:check:links` / `check:governance-records` / `check:stage-counts` / `check:archive-rg-counts` / `governance:check` 全绿。
- **长期任务**：第 **35** 轮门槛复核（2026-11-13，Phase 32 收口轮）——待执行批次 **0 项**；未达门槛 → 条件触发 **1 项维持**；已判定不纳入 5 项维持；`useLabelAttrs` 15 / `labelAttrs` 11 / 模板级 0 / 继承契约 12 / 含内联同名字段 36 / `useFocusControl` 4 / `useAttrs()` 14，与第 34 轮逐项一致；`capture:styles` **399 项** 0 差异。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → **9 条活跃（< 阈值 20，不蒸馏）**。

### 回扫口径（三段式）

- **机检面**：`pnpm check:governance-records` 全绿；本轮 Phase 26 迁出致 **1 处** `stale-planning-pointer`（`2026-10-10-phase22-m2-3-major-upgrades.md:6` 的 `M2-3` 随迁出离开主窗口），改指 `archive/phase-22.md` 后 exit 0；`check:planning-numbers` / `check:stage-counts` / `docs:check` 全绿。
- **人工面**：本阶段新增记录（M1-1 / M2-1 / M2-2 / M3-1）与归档块逐条核对，无「链接文字为载体名、编号写在链接外」的失效散文指针；`docs/design/documentation-site.md` §9 已同步 demo 过渡层；`test/a11y/exceptions.ts` 与 `THIRD-PARTY-LICENSES` 随 M1-1 收口。
- **未处理面**：历史记录中指向 `docs/plan/todo.md` 的时点陈述按既有边界不回改——归档后 `todo.md` 已清空阶段段落，其失效由机检守卫覆盖范围之外的散文形态承担；同形指针（`2026-10-10-phase22-m2-2-*`、`2026-10-11-phase22-m6-3-*`）仍指向主窗口，靠同号标识碰撞通过机检，语义细节已在 `phase-22.md`，按既有边界不回改。

### 遗留与后续候选

- 本阶段不发布；`latest` 维持 `1.2.0`，版本积累至下一阶段。
- 依赖告警：`deepmerge` low（dependabot #69，无 patched version）已接受并登记；Code Scanning open 0（#6 / #7 均已 fixed）。
- 已知观察：`test:visual` 的 `font-latin*` / `font-mixed*` 6 项在本地环境持续失败（改动前后一致、非本阶段引入），基线未更新。
- 下一阶段候选见 [Backlog](../backlog.md)；启动需用户明确授权。
