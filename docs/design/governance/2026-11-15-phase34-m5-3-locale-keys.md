# Phase 34 M5-3：BackTop / TimePicker 的 10 语 locale 键与台账

> 创建时间：2026-11-15
> 触发：用户「继续推进剩余待办」。范围与验收口径见 [Phase 34 登记批次](./2026-11-14-phase34-registration.md) §2 的 M5-3 行。

## 1. 交付面（23 文件）

| 面 | 文件 |
|:---|:---|
| 类型 | `src/locale/types.ts`：新增 `backTop.label` 与 `timePicker.hour` / `minute` / `second` / `am` / `pm` |
| 语言（10） | `src/locale/{zh-cn,zh-tw,en-us,ja-jp,ko-kr,es-es,fr-fr,de-de,ru-ru,pt-br}.ts`：两组命名空间的译文 |
| 组件 | `back-top.vue`（`label` 改为可选，缺省取内置文案）、`back-top/types.ts`、`back-top.test.ts`（缺省名称用例）；`time-picker.vue`（段名与日序改取 `timePicker` 键）、`time-picker/types.ts`（移除失效的 `locale` prop） |
| 台账（中 / 英） | `docs/components/locale.md` / `docs/i18n/en-US/components/locale.md`：命名空间 28 → 30、消费组件 29 → 31，补 `backTop` / `timePicker` 行 |
| 计数回扫 | `docs/guide/version-policy.md` / `docs/i18n/en-US/guide/version-policy.md`（10 语 → 30 命名空间 / 89 条）；`docs/design/governance/2026-10-24-phase26-m1-1-freeze-final-review.md` §2.5 追加增量注 |
| 守卫基线 | `scripts/governance/check-locale-keys.test.mjs`：基准语断言 28 / 83 → 30 / 89 |
| 规范 | `docs/standards/planning.md` §2 第 9 条：治理记录 §1 的文件面计数须逐项列出扣除载体 |

治理索引、记录本体与规划状态位不计入上表。复算口径（2026-11-15，本记录落盘后）：`git status --porcelain -uall | wc -l` 为 27，扣除 4 个治理载体——本记录、`docs/design/governance/index.md`、`docs/plan/todo.md`、`docs/design/governance/2026-11-15-phase34-m5-2-time-picker.md`（同批同步 `locale` prop 移除）——后为 23，与表中逐行求和一致（类型 1 + 语言 10 + 组件 5 + 台账 2 + 计数回扫 3 + 守卫基线 1 + 规范 1）。

登记预算 ≈ 12；实测 23 是「10 语同批 + 台账两页 + 计数回扫」的必然构成（键集合守卫要求 10 语键集合一致，按语言拆分会产生不可绿的中间态），与登记行「单批交付」的要求一致。提交仍按可独立绿的粒度拆两层：类型 / 10 语 / 台账 / 守卫基线 / 计数回扫，以及组件接线与单测。

## 2. 决策

1. **新建 `timePicker` 命名空间而不是复用 `datePicker`**：两者语义不同（DatePicker 的 `hour/minute/second` 属于日期弹层的时间区，TimePicker 是独立字段）；复用会让改一个组件的文案牵动另一个组件。日序 `am` / `pm` 也从 `Intl` 改为显式键——10 语译文可控，且不再依赖运行环境 ICU 数据。
2. **`backTop.label` 改为可选**：此前必填是为了避免硬编码中文；补上 10 语键后缺省即可取当前语言，消费方仍可用 `label` 覆盖。这一改动向后兼容（原用法继续有效）。
3. **10 语同批**：`check-locale-keys` 要求所有内建语种键集合一致，逐语言提交会产生红态中间提交；本批一次性补齐 10 个文件，符合登记行的「单批交付」。
4. **台账与类型同批**：`check-locale-ledger` 对「命名空间 → 键集合 → 消费组件」做双向对账，漏一行即失败；中英两页同步更新，命名空间计数与消费组件计数一并改。
5. **译文口径**：`am` / `pm` 保留各语言习惯写法（中文「上午 / 下午」、西班牙语「a. m. / p. m.」、其余 AM/PM）；`hour` / `minute` / `second` 用各语言常用单数名词，与现有 `datePicker` 的译文保持同一风格。

## 3. 验证

| 面 | 结果 |
|:---|:---|
| 键集合守卫 | `node scripts/governance/check-locale-keys.mjs` → `exit 0` |
| 台账守卫 | `node scripts/governance/check-locale-ledger.mjs` → `exit 0`；「消费组件」列去重计数为 31（人工枚举，当前无机检） |
| 单测 | `npx vitest run src/components/back-top src/components/time-picker src/locale` → 全绿（BackTop 缺省名称取内置文案、TimePicker 段名与日序仍为「时 / 分 / 秒 / 上午 / 下午」） |
| `pnpm typecheck` / ESLint | 通过 |
| 浏览器验证（V） | 跳过实机探针：10 语新文案与旧 `Intl` 输出逐语言完全相等（中 / 英 / 日 / 韩 / 西 / 法 / 德 / 俄 / 葡 / 繁中），默认路径渲染无文本差异，差异只在已移除的 `locale` prop 路径（见 §4 W2 处置） |
| `pnpm verify` | `exit 0`（首轮因 `check-locale-keys.test.mjs` 的基准语断言仍写 28 / 83 失败，同步为 30 / 89 后通过） |

## 4. Review Gate

- **R1（`standard`，A 语言 / 类型 / 组件 / 台账，B 记录 / 索引）**：`Reject`（2 blocker：`version-policy` 中英的命名空间 / 文案计数未回扫；记录 §1 交付面与 `git status` 不符且缺复算口径。3 warning：冻结面 §2.5 缺增量注、`TimePicker` 的 `locale` prop 变成静默无效项、缺 V 面证据。3 suggest：§3 复述守卫读数、提交粒度、31 个消费组件无机检）。
- **R1 修复**：① `version-policy` 中英改为 30 / 89；② §1 改 23 文件、补单测行与复算口径（27 − 4 = 23，扣除项逐项列名）、说明按提交粒度拆两层；③ 冻结面 §2.5 追加 2026-11-15 增量注（+2 命名空间 / +6 键，期望 30 / 89）；④ 删除 `TimePicker` 的 `locale` prop 与 `defaultLocale` 依赖（未发布，删除成本最低），同步 M5-2 记录的 prop 列表与决策 3；⑤ §3 补 V 面跳过依据（10 语字符串等价）；⑥ 守卫读数改为 `exit 0` 并注明 31 为人工计数。
- **R2（`quick`）**：`Reject`（1 blocker：§1 的复算读数为 25、扣除集只列 3 项，而 M5-2 记录同批被修改，实跑为 26；两个偏差恰好抵消）。修复：读数改落盘后的 27、扣除集列 4 项、表内计数改 23；并在 `docs/standards/planning.md` §2 第 9 条补「记录 §1 文件面计数须给 `git status -uall` 读数并逐项列出扣除载体」。
- **R3（`quick`，单点）**：`Pass`（0 blocker；复算 27 − 4 = 23 与表内求和一致，规范条可执行且不重复）。

## 5. 遗留

| 编号 | 内容 | 落点 |
|:---|:---|:---|
| F1 | 承接 M1-1：可测量盒的真实布局级持久守卫 | 本阶段 |
| F7 ~ F9 | 承接 M1-2 | 见 M1-2 记录遗留节 |
| F10 / F11 | 承接 M1-3（F12 已收敛） | 见 M1-3 记录遗留节 |
| F14 | 承接 M1-5：验证表计数须与逐点清单求和一致 | 见 M1-5 记录遗留节 |
| F16 / F17 | 承接 M1-6 | 见 M1-6 记录遗留节 |
| F18 | 承接 M3-1：Select 展开时兄弟节点仅 `aria-hidden`、未 `inert` | 见 M3-1 记录遗留节 |

## 6. 复查基线

本记录 §1 ~ §5；`src/locale/types.ts` 的两个新命名空间；10 个语言文件的对应块；`back-top.vue` 的 `accessibleLabel`；`time-picker.vue` 的 `hourLabel` / `minuteLabel` / `secondLabel` / `amLabel` / `pmLabel`；中英台账的 `backTop` / `timePicker` 行与计数。
