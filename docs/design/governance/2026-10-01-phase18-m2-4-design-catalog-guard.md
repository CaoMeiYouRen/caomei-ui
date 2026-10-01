# Phase 18 M2-4：组件设计 §5 组件清单对账守卫

> 创建时间：2026-10-01
> 关联条目：[待办事项](../../plan/todo.md) Phase 18 **M2-4**（测试稳定性与质量装置消缺）
> 事实源：[文档与演示站 §11](../documentation-site.md) 的组件分区登记表
> 决策依据：用户 2026-09-30 裁定 **D4「全取」**——C36 新增 / 扩守卫对账 `docs/design/components.md` §5 与侧栏 / 总览页成员集合
> 快照：本仓工作区（`check:design-catalog` exit 0、单测 13 passed）；**未推送**

---

## 1. 结论

- 新增守卫 `check:design-catalog`（`scripts/governance/check-design-catalog.mjs`），以 §11 登记表为事实源，对账 [组件设计 §5](../../design/components.md) 清单的行成员集合与「（已实现）」标记；接入 `governance:check` 链（因而进入 `pnpm verify`）。
- **存量漂移修复**：§5 有 **7 行**已实现但漏标「（已实现）」（Skeleton / RadioGroup·RadioButton / ProgressBar / Popover / Slider / Toolbar / ToggleButton），本批补齐；守卫对当前仓库 **exit 0**。
- **判别力自证**：两条 CLI 负向对照（T1 / T2）均 exit 1；单测 **18 例**覆盖解析（含只取首张表）、五条判定与两条允许名单反向校验。
- 顺带把 §11 登记表解析下沉为共享模块 `component-registry.mjs`，消除 `check-components-overview` 与新守卫的重复解析（该守卫行为不变，复跑 exit 0）。
- 本批零 `src/**` 改动、零运行时行为变更。

---

## 2. 判定与事实源

**事实源**：§11 分组表 → `registered` 成员集合（当前 **48** 名，7 组）。§11 的「新增组件的登记面」注记原称组件清单「是唯一无机检的登记面」，本批收口后由本守卫覆盖。

**受检对象**：`docs/design/components.md` §5 表格（当前 **21** 行）。首列以 ` / ` 分隔复合名（`RadioGroup / RadioButton`、`InputGroup / FloatLabel`），逐名与 §11 比对，**命中任一即视该行对应已登记组件**（子部件如 `RadioButton` 无独立组件页，属正常）。

| 判定 | 编号 | 触发条件 | 拦截的漂移 |
|:---|:---|:---|:---|
| 幻影实现 | `phantom-implemented` | §5 行标 `**已实现**`，但组件名无一登记于 §11 | 声称实现却无组件页 / 未登记 |
| 标记滞后 | `stale-marker` | §5 行对应 ≥1 个 §11 已登记成员，却未标 `**已实现**` | 实现状态未回填（本批修复的 7 行） |
| 受检面收窄 | `scope-narrowed` | §5 行数 < 20 或 §11 成员数 < 45 | 清单 / 事实源被静默削减 |
| 豁免腐烂 | `allowlist-stale` | 允许名单条目不再**被实际豁免**（对应行已标已实现或已消失） | 永久豁免（当前允许名单为空，机制齐备） |
| 成员集合漂移 | `member-drift` | 对应已登记组件的行含**未登记名**且不在子部件允许名单内 | 拼写漂移 / 未登记子部件（子部件名单当前为 `RadioButton`，同样受反向校验） |

**成员名口径**：复合名按 ` / ` 拆分，「命中任一即视该行对应已登记组件」，其余名须是已声明的子部件——`RadioButton` 随 `RadioGroup` 登记、无独立组件页，属正常；未声明的非登记名按 `member-drift` 拦截（避免「复合名里塞一个拼写错误」静默逃逸）。

---

## 3. 实现与接线

| 文件 | 改动 |
|:---|:---|
| `scripts/governance/component-registry.mjs`（新增） | §11 解析共享模块：`parseSection11Groups` / `readSection11Groups` / `registeredComponentsOf` |
| `scripts/governance/check-design-catalog.mjs`（新增） | 守卫本体：`parseCatalogRows` / `checkDesignCatalog` / `checkRepository` + CLI（漂移 exit 1）；两份允许名单（豁免标记 / 声明子部件）均受反向校验 |
| `scripts/governance/check-design-catalog.test.mjs`（新增） | 单测 18 例 |
| `scripts/governance/check-components-overview.mjs` | 删除本地 §11 解析副本，改用共享模块（+1 −35，净 −34；行为不变） |
| `package.json` | 新增 `check:design-catalog`，并接入 `governance:check` 链（位于 `check:components-overview` 之后） |

---

## 4. 存量漂移修复（7 行）

§5 中以下行已实现（组件页与源码均在）但漏标「（已实现）」：`Skeleton`、`RadioGroup / RadioButton`、`ProgressBar`、`Popover`、`Slider`、`Toolbar`、`ToggleButton`。本批在说明单元格补齐 `（**已实现**）`，与 §11 登记对齐。

- 复核口径：逐名 `docs/components/<kebab>.md` 与 `src/components/<kebab>/` 均存在（7/7）。
- 未改动 `Panel`（「不新建」）与 `Sidebar`（未实现）——二者无 §11 登记成员，按判定不要求标记。

---

## 5. 判别力（负向对照）

| 编号 | 构造的漂移 | `check:design-catalog` 结果 |
|:---|:---|:---|
| T1 | 给 `Sidebar` 行加「（**已实现**）」（Sidebar 无 §11 登记） | exit 1：`§5「Sidebar」标记已实现，但其组件名无一登记于 §11（成员集合 / 标记漂移）` |
| T2 | 去掉 `Divider` 行的「（**已实现**）」（Divider 已登记） | exit 1：`§5「Divider」对应 §11 已登记成员（Divider）却未标已实现（标记漂移）` |

- 两处对照改动后即还原，`git diff` 中 `docs/design/components.md` 只剩本批的 7 行标记修复；复跑 exit 0。
- T3 / T4 / T5 与两份允许名单的反向校验由单测语料覆盖（18 例），其中 `member-drift` 语料为 `Divider / Ghost`（复合名塞入未登记名 → 拦截）。

---

## 6. 规模与质量门

- **规模**：**9 文件 = 5 改 + 4 新增**。改：`check-components-overview.mjs`（+1 −35，净 −34）、`package.json`（+2 −1）、`docs/design/components.md`（+9 −7）、`docs/design/documentation-site.md`（+1 −1）、`docs/design/governance/index.md`（+2 −0）。新增：`component-registry.mjs`（77 行）、`check-design-catalog.mjs`（199 行）、`check-design-catalog.test.mjs`（172 行）、本记录。`todo.md` 状态于 Review Gate Pass 后回填。**零 `src/**` 改动**。
- **质量门（本批实测）**：
  - `check:design-catalog` exit 0；`check-components-overview` exit 0（重构后行为不变）。
  - `npx vitest run scripts/governance/check-design-catalog.test.mjs` → **13 passed**。
  - 提交前复跑 `pnpm verify`（含 `test` / `governance:check`（链内新增本守卫）/ `docs:check`）。
- **V 阶段（显式跳过）**：本批为脚本与文档改动，无 UI 面。

## 7. Review Gate 结论

- **R1（第 1 轮，`standard`）`Pass`**：0 blocker / 1 warning / 3 suggest。本地留痕 `artifacts/review-gate/2026-10-01-phase18-m2-4-design-catalog-guard.md`。
- **审计方独立复核**（摘）：`check:design-catalog` / `check-components-overview` / 单测 / `eslint` / `lint-md` 均独立复跑通过；`registered.size = 48`、`rows = 21`（implemented 19 / 未实现 `Panel`·`Sidebar` 2）复算一致；T1 / T2 负向对照在内存构造下复现，文案与记录逐字一致；fail-closed 路径（缺 §5 标题 → 0 行 → `scope-narrowed`；去粗体 → 视为未标记 → T2）实测成立；**重构等价性判定为「逐字节相同」**（旧文件 `parseSection11Groups` 与共享模块同名函数源码一致，路径解析均指向仓库根，无 import 循环）。
- **修复点（同批收口，记「已修复未复审」）**：
  - **RG-W01**（warning，T1 对复合名中的非命中名不校验 → 假阴性）：新增 **T5 `member-drift`**——对应已登记组件的行，其非登记名须在「子部件允许名单」（当前 `RadioButton`）内，否则拦截；该名单同样受反向校验。记录 §2 / §8 口径同步为「成员集合 + 标记」双向。
  - **RG-S01**（`parseCatalogRows` 会把 §5 内任意 `|` 起始行当表格行）：改为只取**以 `组件` 表头开始的首张表**，表前内容与表后内容不纳入；新增单测语料（§5 内第二张表）。
  - **RG-S02**（T4 对「已不再需要的豁免」不提示）：T4 收紧为「条目须仍**被实际豁免**」，行补齐标记后条目即报 `allowlist-stale`；新增单测。
  - **RG-S03**（记录 §6 文件分类口径）：改写为「9 文件 = 5 改 + 4 新增」并逐文件列明。
- **实测用时**：派发 `2026-10-01T14:39:16+08:00` → 留痕写入 `2026-10-01T14:42:07+08:00`，**≈ 2 分 51 秒**（≤ 10 分钟时间盒，未超）。
- **未覆盖边界**（采信调用方证据）：审计方未复跑 `governance:check` 全链与 `pnpm verify`（时间盒内取最小生效性验证）。

---

## 8. 已知边界

- **守卫边界（有意）**：只覆盖「§5 行 ↔ §11 成员」双向漂移；§11 新增 Tier 1/2 组件不写入 §5（§5 只承载 Tier 3 清单），该方向无机器可读映射，仍由侧栏 / 总览页守卫与新增组件收口流程承担（已在 §11 注记与本记录显式声明）。
- **成员名口径**：§5 首列按 ` / ` 拆分；「命中任一即算对应已登记组件」，其余名须在子部件允许名单内（当前 `RadioButton`），否则按 `member-drift` 拦截。若未来出现含 `/` 的单一组件名会被误拆——当前无此形态，属已知边界。
- **标记形态**：只识别说明单元格内的 `**已实现**` 粗体标记；改写成其它形态（如去掉粗体）会被视为未标记，属 fail-closed。
- **允许名单**：豁免标记名单当前为空、子部件名单当前仅 `RadioButton`，两者均受反向校验（条目不再被实际豁免 / 不再出现即报错）。
