# M1 下游反馈处置交付与验证记录（Phase 16）

> 创建时间：2026-09-28
> 条目：Phase 16 **M1-1 / M1-2**（下游反馈处置，精简纳入）
> 依据：[下一阶段范围评估 §8](./2026-09-28-next-stage-scope-evaluation.md) 的 **D4 / D5** 裁定；[momei 上游反馈评估](./2026-09-25-momei-upstream-feedback-evaluation.md) §2.4（反馈 §1.4 分页对齐）/ §2.6（反馈 §2.1 `Avatar` 档位）
> 快照：本仓 `444f4fa`（Phase 16 登记后）。本记录为 M1 两条目的唯一交付口径。

---

## 1. 范围与依据

- **M1-1**：`DataTable` 分页对齐 token —— 新增 `--caomei-data-table-pagination-justify`（缺省 `flex-end`，维持现值），中英组件页 token 登记 + 分页节说明。
- **M1-2**：`Avatar` 档位口径文档补强 —— **维持** `sm` / `md` / `lg`、**不补** `xl`；中英组件页补「与 PrimeVue 档位差异映射 + `--caomei-avatar-size` 覆盖口径」。
- **裁定**：D4（`Avatar` 维持 token 口径 + 补文档）、D5（补分页对齐 token，缺省零漂移）。
- **非目标**（沿用评估记录 §8）：不做 M1 其余候选（`Select` 字段层 `class` 文档 / `Select` `null` 开发期告警）；不补 `Avatar` `xl` 档位；不做破坏性 API 变更。

## 2. 上游取证（Search-First）

两条候选的「与 PrimeVue 差异」在评估阶段均标注为**下游反馈口径、本轮未复核上游**（评估记录 §6）。进入实现前按 [AI 协作规范 §2](../../standards/ai-collaboration.md) 补一方源码核对：

| 事项 | 上游事实 | 来源 |
| :--- | :--- | :--- |
| 分页器默认对齐 | `.p-paginator { display: flex; align-items: center; justify-content: center }` → **默认居中** | `primefaces/primeuix` `packages/styles/src/paginator/index.ts` |
| `Avatar` 档位值与默认 | 默认（`normal`）`2rem` / 字号 `1rem`；`large` → `p-avatar-lg` `3rem` / `1.5rem`；`xlarge` → `p-avatar-xl` `4rem` / `2rem` | `primefaces/primeuix` `packages/themes/src/presets/aura/avatar/index.ts`；`primefaces/primevue` `packages/primevue/src/avatar/style/AvatarStyle.js`（`props.size === 'large' → p-avatar-lg`、`'xlarge' → p-avatar-xl`） |

- 读取时间：2026-09-28；来源分支：两仓 `master`（`primevue` 最新 release `4.5.5`）。
- 16px 根字号下 `rem` 换算：`2rem` = 32px、`3rem` = 48px、`4rem` = 64px。
- **结论**：下游两条口径均成立 —— PrimeVue 分页器默认居中（本库默认 `flex-end`）；PrimeVue 最大档 `xlarge`（64px）大于本库最大档 `lg`（40px）。

## 3. M1-1 `DataTable` 分页对齐 token

- **源码**：`src/components/data-table/data-table.vue` 的 `.caomei-data-table__pagination` 由 `justify-content: flex-end` 改为 `justify-content: var(--caomei-data-table-pagination-justify, flex-end)` —— 消费处带默认回退，缺省值与改动前的字面量一致（**零漂移**）。
- **组件页（中英）**：[DataTable](../../components/data-table.md) 样式定制表新增 `--caomei-data-table-pagination-justify` 行（默认 `flex-end`）；分页节补一句「默认右对齐、与 PrimeVue 居中不同；需要居中等其它对齐时覆盖该 token，无需选择器级覆盖」。
- **价值**：下游不再需要选择器级覆盖（原反馈的痛点），符合「优先用 `--caomei-*` token 定制」的对外指引。

## 4. M1-2 `Avatar` 档位口径文档补强

- **源码**：**未改动**（维持 `:where(.caomei-avatar--sm|md|lg)` 三档 24 / 32 / 40px 与 `--caomei-avatar-size` 覆盖钩子）。
- **组件页（中英）**：[Avatar](../../components/avatar.md) 尺寸与形状节新增「与 PrimeVue 档位差异」映射表（`normal` 32px ↔ `md`；`large` 48px / `xlarge` 64px 无内置档位，走 token 覆盖）+ 一句「px 为 16px 根字号下 `rem` 换算、取值来自默认预设 Aura、本库 `sm` 无对应档」；样式定制节补覆盖口径「覆盖 `--caomei-avatar-size` 只改边长、字号仍取档位默认，需等比例时一并覆盖 `--caomei-avatar-font-size`」。
- **口径边界**：**不新增档位**（D4），差异映射只做文档化，不改变组件契约。

## 5. 验证（V）

- **M1-1**（可见渲染能力扩展：新增覆盖钩子）——真实浏览器实测，**20/20 通过**（逐项期望 → 实测）：

| # | 断言 | 期望 → 实测 |
| :-: | :--- | :--- |
| 1 | zh 分页容器唯一 | `count=1` → `1` |
| 2 | zh 缺省对齐 | `flex-end` → `flex-end` |
| 3 | zh token 覆盖（自身） | `center` → `center` |
| 4 | zh token 覆盖（祖先 `.demo-row`） | `space-between` → `space-between` |
| 5 | zh 移除覆盖后还原 | `flex-end` → `flex-end` |
| 6 | zh 1440 无横向溢出 | `sw<=cw+1` → `{sw:1440,cw:1440,scrollbar:0}` |
| 7 | en 分页容器唯一 | `count=1` → `1` |
| 8 | en 缺省对齐 | `flex-end` → `flex-end` |
| 9 | en token 覆盖（自身） | `center` → `center` |
| 10 | en token 覆盖（祖先） | `space-between` → `space-between` |
| 11 | en 移除覆盖后还原 | `flex-end` → `flex-end` |
| 12 | en 1440 无横向溢出 | `sw<=cw+1` → `{sw:1440,cw:1440,scrollbar:0}` |
| 13 | zh 暗色缺省对齐 | `flex-end` → `flex-end` |
| 14–17 | zh 响应式 1440 / 1024 / 768 / 390 无横向溢出 | `sw<=cw+1` → 四档 `sw===cw` |
| 18 | console error | `0` → `0` |
| 19 | pageerror | `0` → `0` |
| 20 | HTTP≥400 | `0` → `0` |

  - 复跑命令：`node test-results/m1-validate.mjs`（需 `pnpm docs:dev` 在 5173）；原始输出 `test-results/m1-validation.txt`（`test-results/` 被 `.gitignore` 忽略，故关键实测值已回写本记录）。
  - **环境注记**：本容器内 headless Chromium 打开 VitePress dev 页多 context 时渲染进程 crash，取证改用 `chromium.launch({ args: ['--single-process'] })` 单 page 顺序执行（ui-validator skill 的 `.opencode/skills/ui-validator/references/browser-cookbook.md` §2 容器降级路径）。
- **M1-2**：纯 markdown 文档改动，**V 阶段显式跳过**（无组件 / 样式 / 交互面）。

## 6. 质量门

- `pnpm lint:css:check`：通过（0 error）。
- `pnpm lint:md:check`：通过。
- `pnpm check:design`：通过（组件样式规则 796 / 下界 600、声明 2669 / 下界 2500；新 token 以消费处 fallback 形态声明，未触发 G1~G6）。
- `pnpm docs:check`：通过（10 段链：integrity 264 md / links 263 md / structure 225 页 + 侧栏 6 组 47 条目 / parity 59 对 / interpolation 225 md / config-links 160 条 / showcase 13 项 / line-count 未超 error 阈值等；计数为全部产物 `git add` 后的交付态口径）。
- `pnpm capture:styles`：**239 项 0 差异**（缺省值零漂移的机检面）。
- `pnpm verify`：**exit 0**（终态复跑 **2026-09-28T20:38:15+08:00 → 20:41:47+08:00**，约 3.5 分钟，覆盖含本记录 §5~§8 与 Review Gate 回填的完整 revision；此前 20:22 首跑曾在 `docs:build` 环节拦下上一批次遗留死链，修复后 20:27 复跑通过）——`lint:check` / `lint:css:check` / `lint:md:check` / `typecheck` / `typecheck:docs` / `test`（**88 文件 / 1837 tests**）/ `build` / `check:build` / `check:resolver` / `check:nuxt` / `docs:build` / `docs:check:i18n-routing` / `governance:check` 全绿。`governance:check` 内含 `docs:check` 10 段（integrity 264 md / links 263 md / structure 225 页 + 侧栏 6 组 47 条目 / parity 59 对 / interpolation 225 md）、`check:governance-records`（78 记录与索引一致 / 263 md 指针无失效）与 `check:planning-numbers`（0 命中）等；`[ref-attr-guard]` 报「变更未涉及引用型 ARIA 属性，跳过 `capture:styles`」。

## 7. Review Gate 记录

- **R1（第 1 轮，`standard`，时间盒 ≤ 10 分钟）：`Pass`（0 blocker / 2 warning / 2 suggest）**。实测用时 **4 分 55 秒**（发起 2026-09-28T20:31:56+08:00 → 返回 20:36:51+08:00），未超时间盒。
  - 审计方独立复现：`git diff --cached --stat` 8 文件 / +104 −2（未超粒度阈值）；`data-table.vue` 确为等价替换（缺省零漂移属实）；token 名称与档位值与源码 / 中英文档逐项一致；`pnpm docs:check`（interpolation 225 / links 263 / integrity 264 / structure 225 页 / parity 59 对）、`check:design`（796/600、2669/2500）、`check:governance-records`（78 记录与索引一致）、`check:planning-numbers`（0 命中）复现全绿；死链修复最小、未误改结论；无新依赖。
  - **W1（首次）**：记录 §6 内部计数自相矛盾（interpolation 224 vs 225）→ **已同批修正**为交付态口径 225 并补全 10 段计数。
  - **W2（首次）**：§6 引用的 `pnpm verify` 时间戳早于记录最终写入（新鲜证据未回填）→ **已同批修正**为终态复跑时间戳（20:27:41 → 20:31:24），并注明首跑被死链拦下。
  - **S3（首次，follow-up 级）**：`2026-09-28-next-stage-scope-evaluation.md` C7 行与 `2026-09-25-momei-upstream-feedback-evaluation.md` 的「硬编码 `flex-end` / 无对齐 token」断言被本批证伪 → **已同批回扫**，两处追加现行口径指针。
  - **S4（首次）**：§5 只给分组摘要 → **已同批补** 20 项断言的「期望 → 实测」逐项表。
  - 4 条 finding 记为「**已修复未复审**」（R1 即 Pass、无 blocker，按既有惯例同批修正）。
  - **未覆盖边界（审计方声明）**：未重跑 `pnpm build` / `docs:build` / `capture:styles` / 浏览器 20/20 / 全量测试（依赖调用方声明，纯文档 + 1 行 CSS，风险低）；未写 `artifacts/review-gate/`（按调用方「只审查、不改文件」约束）。

## 8. 边界与未覆盖

- **本批附带修复（doc build 硬阻塞）**：`pnpm verify` 的 `docs:build` 环节暴露上一批次（`f8b3a78`）遗留的一处**死链**——`2026-09-28-next-stage-scope-evaluation.md` §5 D12 行指向仓库根 `AGENTS.md` 的 markdown 链接落在文档站 srcDir 之外，被 VitePress 判死链（该批次申报 `docs:build` 时沿用 Phase 15 归档批次的旧实测、未重跑，故未暴露）。本批改为行内代码引用（`AGENTS.md` §9.1），`docs:build` 恢复 exit 0；未改该记录结论。
- `capture:styles` 采样面（239 项）**不含分页容器几何**，故缺省值由 §5 的浏览器实测承载，而非该装置；本记录已显式区分两类证据。
- M1-2 只补文档，未改任何组件契约；`Avatar` 档位差异映射的 PrimeVue 取值来自上游 `master`（读取日期 2026-09-28），非版本化产物逐字节复核。
- **同批回扫（Review Gate S3）**：`2026-09-28-next-stage-scope-evaluation.md` C7 行与 `2026-09-25-momei-upstream-feedback-evaluation.md` §2.4 的「硬编码 `flex-end` / 无对齐 token」断言被本批证伪，两处已追加现行口径指针（原取证保留为评估时点快照，不改历史结论）。
- 未触及 `Select` 字段层 `class` / `Select` `null` 告警（M1 未纳入候选，维持 Backlog / 条件触发）。
