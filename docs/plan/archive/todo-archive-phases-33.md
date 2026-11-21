# 待办归档（深度归档）：Phase 33

> 自 [todo-archive.md](../todo-archive.md) 主窗口迁出；迁移为机械操作（相对链接深度 `../` → `../../`，同目录 `./` → `../`），正文不改写。阶段交付权威记录见[治理索引](../../design/governance/index.md)。

## Phase 33：依赖与工具链升级、下游适配、组件增强与质量守卫（**2026-11-14 完成并发布 `1.3.0`**）

- 时间：2026-11-13 用户就[第十七轮范围评估](../../design/governance/2026-11-13-next-stage-scope-evaluation-17.md) §4 裁定 D0 ① / D1 ① / D2 ① / D3 ① / D4 ① 后登记；2026-11-14 执行期追加 M3-4（Select 长列表滚动）与协作测试 P0 2 条；同日交付 **6 条主线 / 14 条原子条目**、发布 `1.3.0` 并完成阶段归档（用户指令「开始归档」）。
- 范围与授权：取**推荐组合**（D0 ①）——依赖与工具链 **4** / 下游适配 **1** / 组件增强与可访问性 **4** / 质量守卫与对比度 **2** / 发布收口 **1** / 协作测试 **2**；构成对账 **4 + 1 + 4 + 2 + 1 + 2 = 14**。范围与验收口径的单一事实源见 [Phase 33 登记批次记录](../../design/governance/2026-11-13-phase33-registration.md) §1 / §2。
- 非目标：DataTable `scrollable` / 全表全选、长尾组件、国际化二期 / RTL、`useDialog`、多版本托管、Storybook、Tailwind preset、外链守卫扩展、`typescript` 7 / `glob` override / `conventional-changelog` 8 / CI 镜像检测、破坏性 API、新增运行时依赖。

### M1 依赖与工具链（4 条）

- **M1-1 `eslint` 10**（提交 `06880dc`；记录见 [M1-1](../../design/governance/2026-11-14-phase33-m1-1-eslint-10.md)）：升至 10.15.0（登记值 10.14.0，registry 漂移）；`lint:check` 零 error / 零 warning，规则与 ignore 未放宽。RG R1 / R2 `Pass`。
- **M1-2 `vitest` 5 + coverage 5**（提交 `f0e604a`；记录见 [M1-2](../../design/governance/2026-11-14-phase33-m1-2-vitest-5.md)）：覆盖率口径与阈值不变，`test` / `test:coverage` 全绿；未 await 断言与 mock 清理的暴露面逐条处置。RG `Pass`。
- **M1-3 `stylelint` 18 + `stylelint-config-cmyr` 1.1 同批**（提交 `312307c`；记录见 [M1-3](../../design/governance/2026-11-14-phase33-m1-3-stylelint-18.md)）：525 文件零 error，规则面 124 → 128，受检面未缩。RG `Pass`。
- **M1-4 `fontkit` 3**（提交 `669f4b8`；记录见 [M1-4](../../design/governance/2026-11-14-phase33-m1-4-fontkit-3.md)）：ESM-only 升级，视觉失败集合与改动前一致。RG `Pass`。

### M2 下游适配（1 条）

- **M2-1 DataTable `autoResetPageIndex` 透传**（提交 `31f9787`；记录见 [M2-1](../../design/governance/2026-11-14-phase33-m2-1-datatable-auto-reset-page-index.md)）：显式镜像上游默认（`props.autoResetPageIndex ?? !props.lazy`），默认行为不变；中英文档补受控分页与数据缩水回收口径；`capture:styles` 0 差异。RG `Pass`。

### M3 组件增强与可访问性（4 条）

- **M3-1 ColorPicker 色板 `radiogroup`**（提交 `2319ed6`；记录见 [M3-1](../../design/governance/2026-11-14-phase33-m3-1-colorpicker-radiogroup.md)）：`role="radio"` + `aria-checked` + roving tabindex + 方向键 / Home / End，移动即选中；新增真实浏览器 E2E（三视口）；无公共 API 变更。RG R1 `Reject`（缺真实浏览器验证）→ R2 `Pass`。
- **M3-2 Select 选项 `null` / `undefined` 开发期告警**（提交 `2714ead`；记录见 [M3-2](../../design/governance/2026-11-14-phase33-m3-2-select-option-warning.md)）：仅开发期 `warnDev`，解析结果与生产输出不变；收窄逻辑抽到 `_shared/option.ts`。RG `Pass`。
- **M3-3 Paginator `#report` 插槽**（提交 `d2d0322`；记录见 [M3-3](../../design/governance/2026-11-14-phase33-m3-3-paginator-report-slot.md)）：作用域 `page / pages / total`；无插槽零额外 DOM；中英文档与 API 表同批。RG `Pass`。
- **M3-4 Select 长列表面板滚动可达性**（提交 `3b4f7c3`；记录见 [M3-4](../../design/governance/2026-11-14-select-long-list-scroll.md)）：`max-height: min(15rem, 可用高)` + 内部滚动 + `overscroll-behavior: contain`；常驻 E2E 与负向验证（还原 CSS 必失败）。RG R1 `Reject` → R2 `Pass`。执行期插队条目（规划规范 §3.5）。

### M4 质量守卫与对比度（2 条）

- **M4-1 文档站 transition 副本守卫**（提交 `b2fb929`；记录见 [M4-1](../../design/governance/2026-11-14-phase33-m4-1-transition-copy-guard.md)）：27 条副本、受检下界 27、强制 `!important`；接入 `governance:check`，CLI 负向 exit 1。RG `Pass`。
- **M4-2 Calendar / RTE 交互边界对比度**（提交 `05b722c`；记录见 [M4-2](../../design/governance/2026-11-14-phase33-m4-2-calendar-rte-contrast.md)）：导航按钮与编辑器容器描边改用 `--caomei-color-control-border`；RTE 因内核根元素 `data-theme` 回退基础 token，改由 `:where()` 包装层桥接；矩阵 6 预设 × 明暗 × 2 背景三视口 9 passed。RG R1 `Reject`（`:where()` 口径 / stylelint）→ R2 `Pass`。

### M5 发布收口（1 条）

- **M5-1 `1.3.0` 发布**（提交 `5b5c2c7` → Release run `43590300810`；记录见 [M5-1](../../design/governance/2026-11-14-phase33-m5-1-1.3.0-release.md)）：`latest = 1.3.0`、`v1.3.0` tag 与 GitHub Release 到位；产物 shasum / `exports` / 版本句 / 里程碑段校验通过；下游兼容三仓 success；事后周回归 `43591838970` 全绿。RG R1 `Reject`（门禁覆盖披露）→ R2 `Pass`；R3 回填 `Pass`。发布前检查见[就绪度评估](../../design/governance/2026-11-14-phase33-m5-1-release-readiness.md)。

### M6 协作测试（2 条）

- **M6-1 协作主链路 C1 ~ C5 / M6-2 残留与滚动锁栈**（提交 `7456aa7`；记录见 [M6](../../design/governance/2026-11-14-phase33-m6-overlay-collaboration.md)）：Dialog / Drawer 与 Select 的指针展开、选择、焦点归还、滚动锁与 Esc 分层；`overlay-collaboration.e2e.ts` 10 例 × 三视口；C4 与 C3 几何各做负向验证。RG 两分区 `Pass`。

### 阶段总结

- **6 条主线 / 14 条原子条目全部交付**；`1.3.0` 已发布，`latest = 1.3.0`。
- **提交对账**：窗口 `git log --oneline --no-merges 48fcbfa..7ad48a7` → **31**；分组 = 条目交付与回填 20（含 M5-1 准备 / 发布记录）+ 评估与登记 7 + dependabot 自动合并 3 + 发布回推 1。
- **质量门**：`pnpm verify` exit 0（164 文件 / **3187** 例）；`test:coverage` 通过（93.52 / 86.35 / 95.40 / 92.92）；`test:a11y` 68；全量 E2E **772 passed / 4 skipped**；`test:visual` **42 passed**；`capture:styles` **399 项** 0 差异；API 差分 203 → 205 声明文件 / 337 → 349 导出，无 breaking。
- **长期任务**：第 **37** 轮门槛复核（2026-11-14，Phase 33 收口轮）——待执行批次 **0 项**；条件触发 **1 项维持**；已判定不纳入 5 项维持；计数与第 36 轮逐项一致；`capture:styles` 399 项 0 差异。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → **12 条活跃**（< 阈值 20，不蒸馏）；`check:distill-archive` 通过（14 段对账）。

### 回扫口径（三段式）

- **机检面**：`check:governance-records` / `check:planning-numbers` / `check:stage-counts`（无进行中阶段分支）/ `docs:check` / `check:archive-rg-counts` 全绿。
- **人工面**：`todo.md`（清空阶段状态句与条目表）/ `roadmap.md`（§1 当前态与 Phase 33 行）/ `todo-archive.md`（本块入窗、主窗口口径与行数）/ `archive/index.md`（无迁出，仅口径不变）/ `recurring.md`（第 37 轮）/ 治理索引（本批次记录）逐处核过。
- **未处理面**：历史记录中指向 `docs/plan/todo.md` 的时点陈述按既有边界不回改；归档后 `todo.md` 已清空阶段段落，其失效由机检守卫覆盖范围之外的散文形态承担。

### 遗留与后续候选

- 依赖告警：`node-forge` low（dependabot #69）仍 open；`@tanstack/vue-table` / `@lucide/vue` / `vue` 三个 dependabot PR 因许可证台账标题未随安装版本更新导致 `Quality` 红，待人工处理。
- 发布前置门禁（周回归绿）目前靠人工执行，`release.yml` 未接入机检；是否接入需用户决策（就绪度记录 §7）。
- 下一阶段候选见 [Backlog](../backlog.md)；启动需用户明确授权。
