# Phase 46 M3：消费方影响面清单与下游回归接入

> 创建时间：2026-11-28
> 触发：Phase 46 登记批次 M3-1 / M3-2（见 [登记批次](./2026-11-27-phase46-registration.md) §2）。
> 性质：**交付记录 + 裁定留痕**。范围与验收口径的唯一载体仍是登记批次；本记录承载裁定、取证读数与未覆盖清单。

## 1. 交付内容

| 条目 | 交付 | 载体 |
|:---|:---|:---|
| M3-1 消费方可见变化清单 | 新增 `scripts/release/diff-consumer-impact.mjs`：复用 `scripts/docs/gen-component-meta.mjs` 的 SFC 抽取（props **含默认值**）与 `diff-api.mjs` 的职责边界（只读复用，未扩展其 `--baseline` 语义）；输出 JSON（组件 / props / events / slots、`--caomei-*` 变量、`caomei-*` 类名的增删与变更）；`--fail-on-breaking` 可选返回非零；导出 `extractSourceTreeFromGit` 供从上一 tag 抽基线 | 脚本 + `scripts/release/diff-consumer-impact.test.mjs`（5 例）+ `package.json` 的 `check:consumer-impact` |
| M3-2 下游回归接入与文档 | `Downstream Compat` 矩阵新增 `critical-command` / `visual-command` 两项与两个条件步骤（留空即跳过）；发布指南 §10 / §10.1 中英改写为「清单 + 回归」流程，并登记各下游的覆盖能力与未覆盖风险；新增 `test/contracts/downstream-compat-matrix.test.ts` 守住「字段登记 + 步骤存在 + 未覆盖段在位」 | `.github/workflows/downstream-compat.yml`、`docs/guide/release.md`、`docs/i18n/en-US/guide/release.md`、契约测试 |

## 2. 裁定（M3-1 要求留痕）

- **`check:api-surface` 不并入发布链的自动门禁**（不进 `verify` / `governance:check`）：它需要「上一发布版本的 `.d.ts` 目录」这一外部输入，放进自动门禁会让本地与 CI 都要额外准备基线，收益小于成本。维持现状（发布手动流程第 2 步 `api-diff`）。
- **新清单定位为「输入」而非「门禁」**：默认退出码 0（即使有变化），`--fail-on-breaking` 供需要时显式收紧；删除 / required 收紧是否阻断发布仍交人工复核。
- **`exposed` 不在受检面**：与 props / events 同源（`defineExpose`），本轮不单列以免清单噪声。

## 3. 取证读数

**1.3.0 → 1.4.0 历史差分回放**（测试内复跑，`extractSourceTreeFromGit` 抽取两 tag 的 `src` + `tsconfig.json`）：

- `components.added` = 14 项（`action-sheet` / `back-top` / `cascader` / `cell` / `descriptions` / `empty` / `input-otp` / `popconfirm` / `rating` / `result` / `tabbar` / `time-picker` / `timeline` / `transfer`），`components.removed` = 0；
- `props.added` 含 `data-table#columnVisibility` 等 18 项，`props.removed` = 0；
- `props.changed` 6 项，其中 `calendar#locale` / `date-picker#locale` 的默认值 `defaultLocale` → `null` 对应 Phase 40 M1-1「locale 缺省消费 `useLocaleCode()`」；
- `events.added` = `data-table#columnResizeEnd` / `data-table#update:columnSizing`；
- `tokens.added` 含 `--caomei-descriptions-columns` 等 21 项，`tokens.removed` = 0；`classNames.added` 60 项；
- 窗口外（1.4.0 之后才引入）的 `--caomei-carousel-gap` **不得出现**，由该断言防止「把整棵树当成新增」。

**下游回归能力（2026-11-28 按各仓 `package.json` 的 `scripts` 复核）**：

| 下游 | 关键流 | 视觉回归 | 结论 |
|:---|:---|:---|:---|
| `dependfix` | 无（根与 `apps/platform` 只有 vitest） | 无 | **两项均未覆盖 + 风险**；其 `inert` 手势用例仍为本地手工复核 |
| `caomei-auth` | 无 e2e 脚本 | `test:visual` | 视觉覆盖；**关键流未覆盖 + 风险** |
| `momei` | `test:e2e:critical` | `test:visual` | 两项均覆盖 |

## 4. 工作流校验与未执行项

- **本地校验**：YAML 解析通过（`yaml.safe_load` 读取矩阵三条目与末两步）；`test/contracts/downstream-compat-matrix.test.ts` 4 例通过（覆盖「字段登记」「步骤条件」「未覆盖段在位」）。
- **`actionlint` 不可用**：本地未安装、环境无法取得；已改用「YAML 解析 + 结构契约测试」替代，效果等价于 `gh workflow view` 的静态面。
- **手动 dispatch 冒烟未执行**：需在本仓触发真实 CI（会 checkout 三仓并跑其回归），且下游首跑可能因视觉基线或关键流用例自身问题变红；按「不推送、不擅自触发外部流程」的口径留待发布窗口执行，届时以 run 记录回填本节。

## 5. 风险

- **默认值噪音**：vue-component-meta 对标识符默认值的解析在基线与当前树可能分别给出标识符 / `null`，清单需要人工判读（已由回放用例固定为已知项）。
- **下游命令漂移**：`critical-command` / `visual-command` 取自下游当前 `scripts`；下游改名会让本工作流变红（失败方向安全，但需重登）。
- **时序风险**：`momei` 增加两项回归后 `timeout-minutes` 由 60 放宽到 90、`caomei-auth` 由 45 放宽到 60；若实测仍逼近上限再评估拆分。
