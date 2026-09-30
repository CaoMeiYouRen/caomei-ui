# M2-1 ~ M2-3 治理装置补口与消缺（类名前缀 / 取证命令 revision / 版本口径）交付与验证记录

> 阶段：Phase 17（极简主题预设与富文本封装 + 治理补口）→ M2 治理装置补口与消缺。
> 范围依据：[待办事项](../../plan/todo.md) M2-1 ~ M2-3；候选来源与决策见[下一阶段范围评估](./2026-09-30-next-stage-scope-evaluation.md) §6（C19 / C20 / C31 / C45）与 §8.1 D10 / D13。
> 三个条目共用同一批装置载体与同一批权威口径，故合并为一份记录，逐条目分节。
> 本记录是**规模口径的唯一来源**（§6）；其他载体需要数字时引用该节。

---

## 1. 条目总览

| 条目 | 交付 | 接入强度 | 受检面与实测 |
|:---|:---|:---|:---|
| M2-1 | `check:class-prefix`（`scripts/governance/check-class-prefix.mjs`）：样式区类名令牌前缀拼写守卫 | `governance:check` **阻断**（预算 0） | 90 文件 / 81 样式区 / 914 次 `ca` 前缀令牌，非 `caomei-` 前缀 **0** 处 |
| M2-2 | `check:docs-git-revision`（`scripts/governance/check-docs-git-revision.mjs`）：`docs/**` 代码区取证命令的 revision 钉定守卫 | `governance:check` **阻断**（预算 0） | 238 md / 32542 代码区行 / 87 条命令，违规 **0** |
| M2-3 | `check-site-version` 扩两条弱守卫（系列字面量 / 当前版本句）+ 版本策略页正文口径修正 | `docs:check` **阻断**（弱守卫，预算 0） | 5 版本展示面 + 2 版本策略页 + README（中 2 / 英 1）+ `roadmap §1`，违规 **0** |

---

## 2. M2-1 类名前缀拼写守卫

- **动机**：2026-09-29 批次实测同一根因（`caomei` 误拼为 `caumei`）4 处，规则选择器**永不命中**、样式静默失效（`Button` `iconOnly` 方形几何 / `Select` 非法态聚焦色），当时无任何守卫覆盖类名前缀拼写。
- **规则**：T1 `prefix-typo`（`ca` 开头但非 `caomei-` 前缀）/ T2 允许名单反向校验（形态 + 不再出现即报错）/ T3 受检面下界（70 文件 / 65 样式区 / 700 次令牌）/ T4 **哨兵文件身份断言**（`src/styles/theme.css` 等必须在内：数量下界挡不住「把受检根收窄到子目录」，实测 `src/components` 仍高于三项下界）。
- **误报边界（验收要求项，逐条）**：
  - `:deep()` 穿透 / 第三方类名：`.card` / `.caret` 这类「以 `ca` 开头但非库类名」**会**被判违规——**有意**如此（受检面实测为 0），确需使用时登记 `ALLOWED_TOKENS` 并写明理由；名单受反向校验防腐烂。
  - 动态拼接：反校验「样式令牌须在模板出现」**实测 303 处误报**（档位 / 变体类由模板动态拼接，如 `` `caomei-badge--${tone}` ``），故**不实施**、显式登记为边界。
  - 已剥离形态：CSS 块注释、字符串（先于 `//` 剥离，避免 `content: "x//y"` / `url(//cdn/…)` 截断整行）、SCSS `//` 行注释（仅在行首 / 空白 / `; { }` 之后起算，不误伤 `https://`）。
  - 不在面内：`docs/**` 示例、`playground/**`、模板 `class="…"` 属性、以其它字母开头的拼写错误（如 `comei-`）。
- **接入强度**：`governance:check` 阻断、预算 0（当前零例外）。CLI 的**无参**调用（gate 链形态）走完整规则；仅显式 `--fixture <dir>` 进入无界模式（跳过下界与哨兵并打印醒目提示），其它位置参数 `exit 2`——**不存在静默绕过通道**。
- **负向对照**：注入 `.caumei-divider` → `exit 1` 且消息含 `src/components/divider/divider.vue:48`；还原后 `exit 0` 且 `git diff` 为空。测试含 CLI 退出码三态（无参 0 / `--fixture` 注入 1 / 非 `--fixture` 参数 2）与字符串内 `//`、`url(//…)` 的回归锁定用例。

---

## 3. M2-2 取证命令 revision 钉定守卫

- **动机**：写在 `docs/` 的取证命令用 `HEAD` 或裸分支名作 revision 时，提交落地后结论不可复算（同一批次连续两轮命中）。
- **口径（「要求显式 revision」的可判定化，显式声明）**：只对**出现在 revision 位置**的令牌施加约束，须为持久形态（commit hash（含 `~n` / `^n`）/ tag / `<base>..<end>` / 占位符 `<...>`），且**禁 `HEAD`**——覆盖 `HEAD~n` / `HEAD^` / `@` / **引号内的 `HEAD`（整段为 rev 或 `rev:path`）** / **reflog `HEAD@{n}`** / **半开区间 `A..`（隐含 HEAD 端点）**。
- **不计入的形态及理由**（把「每条命令都必须写 rev」字面执行会产生 15+ 处误报并与命令语义冲突）：index / worktree 作用域（`git diff --cached`、`git show :<file>`、`git diff <path>`）；`git grep <pattern>`（rev 仅在 pattern 之后）；**零 rev 的 `git log` / `show` / `diff`**（缺省作用于 HEAD / 工作区，属**有意不在面内**的 prose 示例形态，已登记为已知边界）；`--grep` / `--author` / `-S` 等取值型 flag 的引号参数（模式文本）。
- **跨行与边界（验收要求项）**：只扫 `docs/**` 的**代码区**（围栏块内整行 + 行内代码段），**逐行**解析、不跨行——规避同类守卫跨行误解析的实测缺陷（评估记录 §6）；非代码区（prose）的 `git …` 提及不扫描。
- **豁免口径（显式声明）**：`EXEMPT_COMMANDS` 2 条，均为**精确整命令 + 指定文件**，受 T4 反向校验（不再命中即报错）：
  ① `docs/standards/git.md` 的 `## HEAD..@{u}` 上游同步惯用法（语义即「本地领先上游」，任一检出可复算）；
  ② `docs/standards/ai-collaboration.md` 中**该条款自身给出的反例**（一条以 `f1b0b22` 为起点、以 `HEAD` 作终点的 `git log` 范围命令，用于说明被禁形态）。
- **fail-closed**：命令含命令替换 / 变量展开（`$(` / 反引号 / `$VAR`，含引号内）→ `unverifiable-shape`；含 `/` 的令牌仅在「仓库内已存在路径」或「带文件扩展名」时按 pathspec 放行，否则按 ref 判定（`origin/main` / `feature/foo` 会被拦下）。
- **顺带修正（语义等价，不改结论）**：`docs/design/governance/2026-09-16-m3-demo-motion-validation.md` 的 2 条以 `HEAD` 作 revision 的 `git show` 命令，改钉该记录 §2 声明的基点 `d4e4725`（当时 `HEAD` 即指向该提交），并在文末附「附带纠正」说明；由本守卫拦下。
- **负向对照**：把一条以 `HEAD` 作 revision 的 `git show` 命令注入 `docs/plan/todo.md` → `exit 1` 且行号准确；还原后 `exit 0` 且 `git diff` 为空。

---

## 4. M2-3 版本策略页正文口径同步与弱守卫

- **正文修正（中英同步）**：`docs/guide/version-policy.md` 与 `docs/i18n/en-US/guide/version-policy.md` 的冻结窗口起点句原写作「即 0.3.x 系列 / the 0.3.x line」，与当前发布版本 0.4.0 不符（该句同时声称版本由 `theme.version` 派生，自相矛盾）。修正为**版本无关表述**（「版本号一律派生，正文不手写 `major.minor.x` 系列号」，并说明 `0.x` 是本节概念性冻结区间）——不是更新为 `0.4.x`（后者下次发版会再漂移）。
- **弱守卫（验收要求项：三面逐一给边界判定）**：
  - **版本策略页正文**：**成立，已实现**——规则 6 `series-literal`，中英两页不得出现 `<major>.<minor>.x` 系列字面量（大小写不敏感）。已知边界：`0.x`（仅 major，概念区间）与两段式非 `x`（`0.4`）不命中；三段式 `0.4.0` 由既有规则 2 兜住。
  - **仓库根 README**：**成立，已实现**——规则 7 锚定「当前版本」声明句（`README.md` 2 处 + `README.en-US.md` 1 处）须等于 `package.json` 版本。不采用「全文件版本字面量相等」（README 按设计保留各历史版本叙述）。
  - **`docs/plan/roadmap.md`**：**成立，已实现**（原拟排除，经 R1 判定该排除既无载体又与 README 处置双标）——同一套窄锚策略，锚定 §1 的 `` `latest` = <version> `` 句。**结论：三面统一采用窄锚，不再有「规划载体豁免」特例**；不采用全文件相等要求的理由对三面一致（保留历史版本叙述）。
  - `statement-missing`：声明句式被改写 / 删除即报错并回显期望正则——这是**有意的防静默失效**设计，代价是改措辞即红。
- **负向对照（5 条，全部实测）**：版本策略页注入 `0.3.x` → `series-literal` @ 25；README 改成 `0.3.0` → `current-version-drift` @ 48；README 句式改写 → `statement-missing`；roadmap 改成 `0.3.0` → `current-version-drift` @ 9；roadmap 句式改写 → `statement-missing`。另补 **runner 级接线用例**（fixture 根断言 `series-literal` 与 `current-version-drift` 经 `runSiteVersionCheck` 汇总），防新规则接线被静默拆除。

---

## 5. 质量门

| 项 | 实测 |
|:---|:---|
| `pnpm verify` | **exit 0** |
| `pnpm test` | **102 文件 / 2124 例通过**（新增 4 个测试文件：2 个守卫单测 + 既有 `check-site-version.test.mjs` 扩 8 例） |
| 三个装置自报 | `check-class-prefix` 90/81/914 零违规；`check-docs-git-revision` 238 md / 32542 行 / 87 命令零违规；`docs:check:version` 5 展示面 OK |
| `capture:styles` | **245 项 0 差异**（无样式改动） |
| `governance:check` | 通过（两新守卫已接入链内） |
| `lint:check` / `typecheck` / `lint:md:check` | 通过 |

---

## 6. 规模（唯一口径）

- **文件 / 行数**：`15 文件 / +1640 −11`（口径 = 本批起点提交 `9bc7909` → 最后一条实现/记录提交 `2400db4`；**不含**其后的提交号回填批次，该批次本身会改动本记录）。
  构成：4 个新增装置/单测文件 `+1290`（`check-class-prefix` 311+286 / `check-docs-git-revision` 424+269）+ 本记录 120 行 + 其余载体 `+230 −11`。
- 复算命令（持久 ref，提交后仍可复算）：`git diff 9bc7909..2400db4 --numstat | awk 'NF==3{a+=$1;d+=$2;n++} END{print n,a,d}'` → 输出 `15 1640 11`。

---

## 7. Review Gate

三个条目独立审计（R1），修复后做 R2 复审，再对「R2 指出的「修复引入的回归」做 R3 聚焦复审。

| 轮次 | M2-1 | M2-2 | M2-3 |
|:---|:---|:---|:---|
| R1（`standard`） | **Pass**（0 blocker / 4 warning / 4 suggest） | **Pass**（0 blocker / 6 warning / 5 suggest） | **Reject**（1 blocker / 1 warning / 3 suggest） |
| R2（`standard` delta） | **Pass**（W1/S2/S3 闭合；W2 部分闭合 + S1 残留 = 修复引入的 fail-open 与注释口径） | **Pass**（W2/W3/W5/W6 闭合；W1 过度闭合、W4 引入新 fail-open = 修复引入的回归） | **Pass**（blocker 闭合 + warning 1 与 suggest 1/2/3 全闭合） |
| R3（`quick` 聚焦回归） | **Pass**（W1 回归闭合 + 注释 T1~T4 与 CLI 逃生门收紧） | **Pass**（3 条回归全闭合；1 warning = 回归用例未落地 → 已补） | 无需（R2 已 Pass） |

- **R1 M2-3 blocker**：`roadmap.md` 弱守卫的排除结论「无载体且论证与 README 处置双标」→ **已按「成立」实现窄锚守卫**（§4）。该 blocker 是 M2-3 从 Reject 转 Pass 的唯一条件。
- **R2 三条「修复引入的回归」**（均由修复自身引入，`quick` R3 复核闭合）：① M2-1 剥离顺序错误致字符串 / `url(//…)` 内 `//` 截断整行 → 改为「块注释 → 字符串 → `//`」且 `//` 仅在行首 / 空白 / `; { }` 后起算；② M2-2 引号剥成空串使取值型 flag 吞掉紧随 revision（`--grep 'fix' HEAD` 漏判）→ 引号改为**占位 token**；③ M2-2 引号 HEAD 过度闭合（`--grep='HEAD is banned'` 误判）→ 仅认「整体即 rev / `rev:path`」且跳过取值型 flag 的引号参数。
- **R3 残余（已修复未复审）**：R3 warning（M2-2 回归用例未落地）与 2 条 suggest（`--grep='HEAD'` 模式文本、`HEAD@{n}` reflog）已在本轮收口——回归用例已补（并自查落地）；模式文本按取值型 flag 位置跳过；`HEAD@{n}` 纳入引号 HEAD 判定。按 AI 协作规范 §3.4 的轮次纪律（同一原子条目 3 轮）不再开 R4，记为「已修复未复审」。
- 审计用时：R1 三题在 `08:24:17Z`–`08:51:25Z` 窗口内完成（M2-1 起算）；R2 实测 **10 分 51 秒**（`08:51:25Z` → `09:02:16Z`）；R3 自 `09:02:16Z` 起、主 session 于 `09:15:01Z` 前收到结论（上界含主 session 处理时间，审计方自述在 8 分钟盒内）。

---

## 8. 边界与未覆盖

- **M2-1**：模板侧拼写（样式与模板同时写错）不在面内——反向校验实测 303 处误报而不实施；`docs/**` / `playground/**` 示例不在面内；以其它字母开头的拼写错误（`comei-`）不在前缀规则面内。
- **M2-2**：零 rev 的 `git log` / `show` / `diff` 缺省作用于 HEAD / 工作区，**有意不在面内**（prose 示例形态）；引号内的**非 HEAD 非持久 ref**（如 `"main"`）不在面内；`git status` / `rebase` 等非四子命令不在面内。
- **M2-3**：仅 major 的 `0.x`（概念区间）与两段式非 `x`（`0.4`）不命中，已在脚本文件头登记。
- 三项均无 UI 改动，`@ui-validator` 不适用（显式跳过）。

---

## 9. 提交与复算

- 提交（按条目拆分，合计 **15 文件 / +1640 −11**，与 §6 一致；未执行 `git push`）：

| 提交 | 内容 | 规模 |
|:---|:---|:---|
| `0378fd4` | M2-1 类名前缀拼写守卫 + 接线 + 规范落点 | 4 文件 / +600 −1 |
| `1c26cd3` | M2-2 取证命令 revision 钉定守卫 + 接线 + 规范落点 + 2026-09-16 记录改钉 | 5 文件 / +700 −4 |
| `bca8db8` | M2-3 版本口径修正 + 两条弱守卫 | 4 文件 / +215 −3 |
| `2400db4` | 本记录 + 治理索引 + `todo.md` 状态 | 3 文件 / +126 −4 |

> `package.json` 的两次脚本 / 链改动按提交切成两段（提交 1 仅 `check:class-prefix`，提交 2 追加 `check:docs-git-revision`），保证**每个提交单独** `pnpm governance:check` 全绿。
- 复算：

```sh
node scripts/governance/check-class-prefix.mjs
node scripts/governance/check-docs-git-revision.mjs
node scripts/docs/check-site-version.mjs
pnpm vitest run scripts/governance/check-class-prefix.test.mjs scripts/governance/check-docs-git-revision.test.mjs scripts/docs/check-site-version.test.mjs
git diff 9bc7909 --numstat | awk '{a+=$1;d+=$2;n++} END{print n,a,d}'
```

- 快照时点：2026-09-30（UTC+0 09:15 前，R3 结论收到后、提交前）。
