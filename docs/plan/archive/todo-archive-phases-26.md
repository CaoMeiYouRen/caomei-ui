# 待办归档（深度归档）：Phase 26

> 自 [todo-archive.md](../todo-archive.md) 主窗口迁出；迁移为机械操作（相对链接深度 `../` → `../../`，同目录 `./` → `../`），正文不改写。阶段交付权威记录见[治理索引](../../design/governance/index.md)。

## Phase 26：1.0 发布前收尾：冻结面、行为收口与发布链路（**2026-11-03 完成并发布 `1.0.0`**）

- 时间：2026-10-22 用户就[第十轮范围评估](../../design/governance/2026-10-22-next-stage-scope-evaluation-10.md) §3 裁定「按推荐来」后登记；2026-10-26 执行期追加 M5 插队批次 4 条与 1.0 发布门禁（G0 ~ G4）；2026-11-03 完成并发布 `1.0.0`、阶段归档。
- 范围与授权：取 **A + B + C + D** 四条主线，**5 条主线 / 17 条原子条目**（M1 4 / M2 4 / M3 3 / M4 2 / M5 4）；逐条裁定 **D1 ④**（四条主线全取）/ **D2 ①**（rc → 转正，维持手动）/ **D3 ①**（DataTable 主项 + ①②③ 全做）/ **D4 ①**（`Form` 只评估）/ **D5 ③**（发布时与上一已发布版本做 API 差分）。范围与验收口径的单一事实源见 [Phase 26 登记批次记录](../../design/governance/2026-10-22-phase26-registration.md) §1 / §2；执行期追加与门禁见[门禁规划](../../design/governance/2026-10-26-phase26-ui-gate-planning.md) §4。
- 执行期插队批次（不占条目计数）：**G1-F** 颜色角色修复（3 项）、**S1** 依赖安全告警清理、**S2** Code Scanning 清理、**S3** 安全告警门禁 CI 接入。
- 非目标：不进入自动发布、不实现 `Form` / RTL / 触摸目标 / 二期语言 / 长尾组件、不做破坏性 API 变更、不引入 Tailwind / UnoCSS、不自动推送。

> 条目级 Review Gate 结论集中于各阶段治理记录（各条目行已给出记录链接），本块不逐条复写计数。

### M1 冻结面终审与 1.x 承诺落地（4 条）

- **M1-1 冻结面清单终审与 1.0 决策记录**（提交 `036babd`；记录见 [M1-1](../../design/governance/2026-10-24-phase26-m1-1-freeze-final-review.md)）：token 档位经用户裁定取「全量 146 + 已披露钩子」（有效冻结面 371，2026-10-28 增量后 380）；六类面（组件 props / events / slots、`exports` 13 键、包根导出、token、10 语 locale、`InputNumber` 的 `step` 语义）与复算命令、例外 / 弃用流程、「最后一破」口径成文；`version-policy` 中英「5 键」改 13 键。
- **M1-2 `Form` / `FormItem` 形态与字段契约影响评估**（提交 `d648fbb`；记录见 [M1-2](../../design/governance/2026-10-24-phase26-m1-2-form-field-contract-evaluation.md)）：结论 = 1.x **不扩既有字段契约**，推荐「独立组合层 + 插槽作用域」；12 / 35（交集 8）逐项取证；组型控件需 `aria-labelledby`、`Switch` 无校验态；未实现组件。
- **M1-3 API 表面基线形态评估**（提交 `729488b`；记录见 [M1-3](../../design/governance/2026-10-24-phase26-m1-3-api-surface-baseline-evaluation.md)）：推荐 **③ 发布时差分**（对比上一版 `dist/*.d.ts`；删除 / required 收紧 = breaking，类型变化 = warning）；记录 `component-meta.json` 为 gitignored 生成物的限制。
- **M1-4 1.x 承诺载体改写**（提交 `f16f277`；英文链接修正 `e679fd4`）：中英版本策略页改写为「1.x 兼容策略 / 冻结面 / 弃用政策 / 预发布通道 / 例外与流程」，`getting-started` / `README` / `release.md` §1 · §2 · §5 同步；活载体「0.x」关键词回扫为 0。

### M2 行为收口与准破坏性变更（4 条）

- **M2-1 DataTable 全选作用域收口（方案 A）**（提交 `17bf41e`；记录见 [M2](../../design/governance/2026-10-24-phase26-m2-behavior-convergence.md) §2 / §5.1）：表头全选只作用当前页，客户端分页保留跨页选择，`lazy` 仍为当前页；`table.selectAll` 10 语改「全选当前页」；中英组件页、迁移表与设计规范 §7 披露。
- **M2-2 `lazy` 跨页选择两侧收敛**（同批 `17bf41e`；记录见 [M2](../../design/governance/2026-10-24-phase26-m2-behavior-convergence.md) §3）：受控输入只映射当前页、emit 只含当前页；自持态在 `lazy` 翻页时清空。
- **M2-3 `rowKey` 缺省在 `lazy` 下撞 id**（同批 `17bf41e`；记录见 [M2](../../design/governance/2026-10-24-phase26-m2-behavior-convergence.md) §4）：启用选择 / 展开时要求显式 `rowKey`，缺省走 `warnDev`；受控 `expandedRows` 同口径。
- **M2-4 `engines.node` ≥ 22**（提交 `add02bf`；记录见 [M2](../../design/governance/2026-10-24-phase26-m2-behavior-convergence.md) §5.1）：`package.json` 与中英 README / 开发指南同步；CI 仍 `lts/*`；1.0 发布说明列为发布前调整。

### M3 发布链路就绪与 1.0 交付（3 条）

- **M3-1 预发布通道与覆盖率前置**（提交 `b8a2086`；记录见 [M3-1](../../design/governance/2026-10-26-phase26-m3-1-release-tag-coverage-preflight.md)）：`--tag` 缺省按版本推断、预发布 + `latest` 参数层拒绝；`publish` 强制 dist-tag；`verify` 断言 `dist-tags.<tag>`、latest 不得有预发布、shasum fail-closed；`preflight` 补 `test:coverage` + `check:coverage`。
- **M3-2 1.0.0 CHANGELOG 里程碑段与 Release note**（提交 `318f959` / `cea60bf`；记录见 [M3-2](../../design/governance/2026-10-31-phase26-m3-2-1.0.0-release-notes.md)）：里程碑块 / 升级注意 / 已知限制落盘 32 行、锚点全中、不含 rc.1 段；`announce` 从该段生成 Release note。
- **M3-3 1.0 交付执行**（提交 `4fb0c52` / `1967ff7` / `bfe6e3a` / `37ca419`；记录见 [M3-3](../../design/governance/2026-11-03-phase26-m3-3-1.0.0-release.md)）：`latest = 1.0.0`、tag `v1.0.0` + GitHub Release（Latest）到位；tarball shasum `67d71348b452…`、包内 README 版本句 = 1.0.0；`exports` 13 键；API 差分（基线 rc.1）0 删除 / 0 重命名；发布前修复 Release note 抽取 fail-open（`4fb0c52`）。

### M4 下游复验与质量确认（2 条）

- **M4-1 下游正向复验**（2026-10-30）：run `41023344064` attempt 2（tag `v1.0.0-rc.1` 触发）success，`dependfix @ a95c1068`，`typecheck` + `build` 绿；attempt 1 为 `minimumReleaseAge` 门槛（非兼容性回归）。
- **M4-2 一期 5 语译文复核状态确认**（2026-11-01 裁定「未复核」；见 [G4 记录](../../design/governance/2026-10-31-phase26-g4-rollback-and-known-limitations.md) §3 KL-7）：按「显式声明边界」处置，1.0.0 Release note 保留「文案由 AI 生成，母语审校仍待完成」。

### M5 UI 可用性与示例可访问名（4 条，2026-10-26 插队批次）

- **M5-1 DataTable 横向滚动容器键盘可达**（提交 `d59800a`；记录见 [M5-1](../../design/governance/2026-10-27-phase26-m5-1-data-table-keyboard-scroll.md)）：根容器常驻 `tabindex="0"`，有 `caption` 时 `role="group"` + 可访问名，新增焦点环与 375px 键盘滚动 E2E；axe 三档违规 0。
- **M5-2 Select 示例可访问名（中文）**（提交 `013b647`；记录见 [M5-2](../../design/governance/2026-10-27-phase26-m5-2-select-example-names-docs-axe.md)）：17 个触发器补 `label`；新增 `check-docs-axe`（5 页矩阵 / 2 条 WCAG 规则 / 抗收窄 / 17 例单测）。
- **M5-3 Select 示例可访问名（英文）**（提交 `b021ccc`；记录见 [M5-3](../../design/governance/2026-10-28-phase26-m5-3-select-example-names-en.md)）：17 个英文触发器与中文逐项语义对齐；全矩阵零违规。
- **M5-4 Button hover / active 反馈**（提交 `2b7af3a`；记录见 [M5-4](../../design/governance/2026-10-28-phase26-m5-4-button-state-feedback.md)）：状态由既有 token 经 `color-mix()` 派生（不新增冻结 token）；36 条状态采样 + 三态不变量；默认预设亮暗最低 4.829；视觉基线 0 差异。

### 执行期插队批次（不占条目计数）

- **G1-F 颜色角色修复**（提交 `5c260a2` / `a0e82ba`；记录见 [G1-F](../../design/governance/2026-10-28-phase26-g1-f-color-role-fix.md)）：新增 `--caomei-color-<tone>-text` 与 `--caomei-color-control-border`；6 预设 × 明暗文本 / 控件边界矩阵纳入常驻回归；`capture:styles` 与视觉基线按实际差异重冻结。
- **S1 依赖安全告警清理**（提交 `f9aeb43` / `c0c8e6d`；记录见 [S1](../../design/governance/2026-10-28-phase26-s1-dependency-alerts-remediation.md)）：15 项开发作用域告警在 lockfile 解析层清零；`nuxt` 4.6.3 / `vitest` 4.1.12；`deepmerge` low 无补丁留痕。
- **S2 Code Scanning 清理**（提交 `991330d` / `5146d71` / `6a46098`；记录见 [S2](../../design/governance/2026-10-28-phase26-s2-code-scanning-remediation.md)）：5 项告警（3 high 脚本规则 + 2 medium CI 权限）修复；`test.yml` 补最小 `permissions`。
- **S3 安全告警门禁 CI 接入**（提交 `0dfff98` / `34084cf` / `af72b2a`；记录见 [S3](../../design/governance/2026-10-29-phase26-s3-security-alert-gate-ci.md)）：`check-security-alerts` + `Security Alerts` workflow（`SECURITY_ALERTS_TOKEN`）；安全规范 §2.1 与发布指南同步。
- **G0 ~ G4 门禁**：G0（M5 收口自检，2026-10-28）/ G1（裁定「修复」）/ G1-F / G2（质量门，2026-10-28）/ G3（rc.1 与下游，2026-10-30）/ G4（发布证据与授权，2026-11-03）全部通过；口径见[门禁规划](../../design/governance/2026-10-26-phase26-ui-gate-planning.md) §4。

### 阶段总结

- **5 条主线 / 17 条原子条目全部交付**，另完成 G1-F / S1 / S2 / S3 四个插队批次与 G0 ~ G4 门禁。
- **发布**：`1.0.0` 于 2026-11-03 发布（`latest`），tag `v1.0.0` 与 GitHub Release（Latest）到位；tarball README 版本句 = `1.0.0`；API 差分 0 删除 / 0 重命名。
- **新增 / 强化装置**：冻结面清单与 token 复算、发布时 API 差分、`--tag` 预发布通道、`check:coverage` 前置、`check-docs-axe`、颜色角色对比度矩阵、`check-security-alerts` 门禁、DataTable 键盘滚动 E2E。
- **提交对账**：`git log --oneline 10de6e8^..37ca419 --no-merges | wc -l` → **56**（下界 = 登记提交 `10de6e8` 的父提交 `51f00bc`，上界 = 本阶段治理收口提交 `37ca419`）；构成 = 条目行 **28** + 门禁 / 规划 / 发布记录与收口 **28**（含 `10de6e8` / `37ca419`）。**归档批次自身提交不计入上式**。

### 回扫口径（三段式）

- **机检面**：归档后 `pnpm governance:check`（含 `check-governance-records` / `check-governance-counts` / `check:candidate-anchors` / `check:planning-numbers`）与 `pnpm docs:check` 全绿。
- **人工面**：Phase 26 各治理记录对 `todo.md` 的引用按「点时记录保持原样」处置；逐条核对 M1-1 ~ M1-4、M2、M3-1 ~ M3-3、M4-2、M5-1 ~ M5-4、G1-F、S1 ~ S3 的回链。
- **未处理面**：历史记录内「阶段限定 + 复用编号」类散文指针不回改（边界见 [M3-5 记录](../../design/governance/2026-10-15-phase24-m3-5-planning-carrier-discrepancy-cleanup.md)）。

### 长期任务

- **第 28 轮门槛复核**（2026-11-03，Phase 26 收口 / 1.0.0 发布后）：待执行批次 **0 项**；未达门槛 → 条件触发 **1 项维持**（表单控件公共 props 契约后续候选）；已判定不纳入 **5 项维持**。证据：`useLabelAttrs` 15 / `labelAttrs` 11 / 模板级 `:aria-label="label"` 0 / 继承契约 12 / 含内联同名字段 35 / `useFocusControl` 4 / `useAttrs()` 13（与第 27 轮逐项一致）；§2.2 `field-shell-overlap.mjs`：`input 0 / textarea 1 / input-number 0 / tags-input 16`、四组件共有声明 0；`capture:styles` 349 项 0 差异。详见[长期任务](../recurring.md) 第 28 轮。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → 活跃条目 14（< 阈值 20，不蒸馏）；`check:distill-archive` 通过。

### 遗留与后续候选

- **已知限制**（对外披露见 1.0.0 Release note）：品牌预设 `-solid` 对比度缺口、Calendar / RichTextEditor 交互边界 < 3:1、回归仅 Chromium、禁用态豁免、视觉快照容差、消费方覆盖 token 后的对比度责任、一期 5 语未复核（KL-1 ~ KL-7）。
- **发布后遗留已处置**：`next` 通道评估后**维持 `1.0.0-rc.1`**（1.x 暂无预发布计划，下一预发布时前移）；README 中英预发布声明改为「1.0 起默认 `latest`，预发布经 `next` 取回」。
- **后续候选**：PrimeVue 迁移经验回收与指南完善（Backlog §1.8）、`mobile-320` DatePicker 纵向滚动口径（已按矩阵 #6 判定为非缺陷，断言已修）、归档载体行数再评估；其余见 [Backlog](../backlog.md)。

### 归档批次 Review Gate

- 经 `@code-reviewer` Review Gate **单分区 `standard`**；结论与复查基线见[归档批次记录](../../design/governance/2026-11-03-phase26-archive.md) §6。
