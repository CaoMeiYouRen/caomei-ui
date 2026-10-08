# Phase 20 M2-3：直连 Reka 同型触发器的机检守卫

> 创建时间：2026-10-07
> 关联条目：[待办归档](../../plan/todo-archive.md) Phase 20 **M2-3**（基建与治理守卫补口）
> 依据：本库为部分 Reka primitive 提供包装（`CaomeiPopoverTrigger` / `CaomeiDropdownMenuTrigger` / `CaomeiTabTrigger` / `CaomeiStepperTrigger`），直连同型 primitive 会绕过包装契约且无守卫可感知；候选 B19
> 快照：本仓工作区（`pnpm verify` exit 0）；**未推送**

---

## 1. 结论

- 新增**阻断式**机检守卫 `check:reka-trigger-usage`（接入 `governance:check`）：当组件**存在本库包装**时，`src/components/**` 内直连同型 Reka 触发器即失败。
- 当前受检面 **197 文件**、**0 处违规**（预防性守卫，防未来回退）；13 例单测 + 负向对照（注入 1 处直连 → exit 1）自证。
- 明确**告警面**与**误报口径**（§2），避免「无包装 primitive 被误判」。

---

## 2. 告警面与误报口径（先定）

### 2.1 告警面（受检集合）

仅对**本库已有包装**的 Reka 触发器施检：

| Reka primitive | 本库包装 |
|:---|:---|
| `PopoverTrigger` | `CaomeiPopoverTrigger`（`popover/popover-trigger.vue`） |
| `DropdownMenuTrigger` | `CaomeiDropdownMenuTrigger`（`dropdown-menu/dropdown-menu-trigger.vue`） |
| `TabsTrigger` | `CaomeiTabTrigger`（`tabs/tabs-trigger.vue`） |
| `StepperTrigger` | `CaomeiStepperTrigger`（`stepper/stepper-trigger.vue`） |

### 2.2 误报口径（显式排除）

- **无包装者不判**：`ComboboxTrigger` / `CalendarCellTrigger` / `DropdownMenuSubTrigger` / `SelectTrigger` / `DialogTrigger` / `AccordionTrigger` 等（组件为单体实现或尚无独立包装能力）不在告警面——纳入会造成必然误报。
- **包装文件自身豁免**：对应包装文件内直连其 primitive 是**实现需要**，不计违规。
- **受检面**：仅 `src/components/**` 的 `.vue` / `.ts`（排除 `*.test.ts`）；`docs/**` / `playground/**` / `scripts/**` 不在面内。
- **判定依据**：`import { … } from 'reka-ui'` 的具名导入（本库不使用全局注册，模板内使用必先导入）。
- **不在判定面**（已核当前全仓 0 处）：命名空间导入（`import * as R` + `R.PopoverTrigger`）、子路径导入（`from 'reka-ui/dist/…'`）、经 barrel 再导出 raw 触发器、动态 `import('reka-ui')`——新增这类写法须同步扩展判定面，否则静默逃逸。

---

## 3. 规则（T1~T3）

| 规则 | 判定 | 作用 |
|:---|:---|:---|
| **T1** `direct-reka-trigger` | 非包装文件导入被包装的 Reka 触发器 | 主规则，命中即 exit 1 |
| **T2** `mapping-rot` / `mapping-missing-wrapper` / `allowlist-rot` | 映射中的包装文件须存在且确实导入其 primitive；允许名单条目须**仍被实际豁免** | 反向校验，防映射 / 豁免腐烂为空转 |
| **T3** `scope-narrowed` / `sentinel-missing` | 受检文件数与「导入 reka-ui 的文件数」下界 + 4 个哨兵包装文件须在受检面内 | 防静默收窄（如把受检根收窄到子目录） |

- `--fixture <dir>` 仅供受检面构造测试（跳过下界与哨兵，打印醒目提示）；非 `--fixture` 的位置参数直接 exit 2，无静默绕过通道。

---

## 4. 交付与验证

- **脚本**：`scripts/governance/check-reka-trigger-usage.mjs`（201 行）。
- **单测**：`scripts/governance/check-reka-trigger-usage.test.mjs`（100 行 / 14 例）：导入解析、直连判定、包装豁免、无包装不判、例外豁免、T2 三类腐烂、T3 下界（files / rekaImporters 两分支）与哨兵、仓库不变量。
- **接入**：`package.json` 新增 `check:reka-trigger-usage` 并插入 `governance:check` 链（`check:class-prefix` 之后）。
- **判别力（负向对照）**：临时新建 `src/components/zz-scratch-probe.vue`（`import { PopoverTrigger } from 'reka-ui'`）→ 守卫 **exit 1**（`direct-reka-trigger: zz-scratch-probe.vue 直连了 PopoverTrigger`）；删除后 **exit 0**。
- **实测**：守卫 `OK：直连 Reka 同型触发器 0 处（受检 197 文件）`。

---

## 5. 规模、质量门与 Review Gate

- **规模**：`scripts/governance/check-reka-trigger-usage.mjs`（新增 201 行）、`scripts/governance/check-reka-trigger-usage.test.mjs`（新增 100 行）、`package.json`（+2 −1）；文档载体（本记录 + 治理索引 + `todo.md` 状态回填）。**零组件库 `src/**` 改动**。
- **质量门（本批实测）**：
  - `pnpm check:reka-trigger-usage` **exit 0**（0 违规）。
  - `pnpm verify` **exit 0**（`lint:check` / `lint:css:check` / `lint:md:check` / `typecheck` / `typecheck:docs` / `test` **112 文件 / 2226 例** / `build` / `check:build` / `check:resolver` / `check:nuxt` / `docs:build` / `docs:check:i18n-routing` / `governance:check` 全绿）。
  - 负向对照 **exit 1**、还原后 exit 0（§4）。
- **V 阶段**：本批为治理守卫，无可见 UI 面，按 PDTFC+ 显式跳过 `@ui-validator`。
- **Review Gate**：见 §6；本地留痕 `artifacts/review-gate/2026-10-07-phase20-m2-3-reka-trigger-guard.md`。

## 6. Review Gate 结论

- **R1（第 1 轮，`standard`）`Pass`**：0 blocker / 3 warning / 3 suggest。审计方独立复跑守卫（exit 0 / 197 文件）、单测 13 例、全量 112 文件 / 2225 例、ESLint、`check:planning-numbers` 0 命中、`check-governance-records` OK；并核验 4 个受检触发器仅在各自包装文件内直连、6 个无包装触发器确有实义（非空集）、本库无全局注册 / barrel 绕过。
- **实测用时**：派发 `2026-10-08T00:31:15+08:00`；返回未单独取戳，以本批收尾写入为界 ≈ 10 分钟内（≤ 时间盒）。
- **同批收口（记「已修复未复审」）**：
  - **RG-W1**（T3 `rekaImporters` 下界分支无独立用例）：补「文件数达标但无 reka 导入」用例（单测 13 → **14 例**）。
  - **RG-W2**（判定面仅覆盖具名导入）：脚本注释与 §2.2 显式登记四类**不在判定面**的写法（命名空间 / 子路径 / barrel 再导出 / 动态导入）。
  - **RG-W3**（`--fixture` 绕过通道提示弱）：fixture 模式改为醒目 `[warn] 仅限本地测试，禁止接入 CI`；另有 `governance:check` 链不含 `--fixture` 的事实核验。
  - **RG-S1**（`SCOPE_FLOOR.files` 裕度过大）：下界收紧为 `files: 150 / rekaImporters: 40`（基线 197 / 65）。
  - **RG-S2**（fixture 目录不存在抛异常）：加 `existsSync` 校验，缺失时 exit 2 + 明确提示。
  - **RG-S3**（`T1~T3` 标签）：不改（合规且文档内自洽）。
- **未覆盖边界**（采信调用方证据）：审计方未完整复跑 `pnpm verify` / `governance:check` 全链（对高风险子门独立复跑通过）；本批无可见 UI 面，`@ui-validator` 显式跳过。
