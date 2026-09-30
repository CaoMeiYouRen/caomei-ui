# Phase 17 阶段归档与规划清理

> 触发：用户 2026-09-30 指令「开始归档」。
> 范围：Phase 17（极简主题预设与富文本封装 + 治理补口）的阶段收口与规划载体清理。
> 依据：[规划规范 §4 / §7](../../standards/planning.md)（归档清理、长期任务触发、归档后回扫）；阶段交付详情见[待办归档](../../plan/todo-archive.md) Phase 17 块与各条目记录。
> 本记录是**本批次规模口径的唯一来源**（§7）；其他载体需要数字时引用该节。

---

## 1. 用户决策（本批次的两项结构决定）

Phase 17 归档前，`todo-archive.md` 已达 **594** 行（`docs:check:line-count` 的 warn > 400 持续累积、error > 600 逼近）；追加 Phase 17 归档块会直接越过 error 阈值。按该守卫的既定口径（「主窗口只保留**近线阶段窗口**与归档索引」，`scripts/docs/check-line-count.mjs`），归档批次须一并压缩。用户 2026-09-30 裁定：

| 决定项 | 取值 |
|:---|:---|
| 归档窗口边界 | **保留 Phase 13 ~ Phase 17 完整归档块 + Phase 0 ~ Phase 12 归档索引** |
| 旧阶段全文去处 | **进入 `docs/plan/archive/` 深度归档**（新建目录，按阶段区间分文件） |

---

## 2. 归档动作清单

1. **深度归档迁出**：新建 [`docs/plan/archive/`](../../plan/archive/index.md)，把主窗口 Phase 0 ~ Phase 12 的 14 个归档块**机械迁移**为两份文件——[phase-00-06.md](../../plan/archive/phase-00-06.md)（Phase 0 ~ Phase 6，7 块 / 140 行）与 [phase-07-12.md](../../plan/archive/phase-07-12.md)（Phase 7 第一阶段 ~ Phase 12，7 块 / 236 行）；迁移只做**链接深度调整**（`../` → `../../`、`./` → `../`），正文不改写；新增 [archive/index.md](../../plan/archive/index.md) 作为目录页（同时消除 VitePress 对目录链接的 dead link 判定）。
2. **主窗口重构**：`todo-archive.md` 改为「主窗口口径说明 + 归档索引（Phase 0 ~ Phase 12，逐阶段一行摘要 + 深度归档链接）+ Phase 13 ~ Phase 17 完整块」；行数由 594 回落至 warn 下界以下（**终态数值与复算命令见 §8**，不在本节复写易变数字）。
3. **Phase 17 归档块**：3 条主线 / 8 条原子条目逐条交付记录 + 提交对账（`e23b70e..2b2b129` = **24** 提交）+ 质量门 + 长期任务第 18 轮 + 回扫口径三段式 + wisdom 结论 + 已知观察 + 遗留与后续候选。
4. **`todo.md` 清空**：改为「**当前无进行中阶段**（Phase 17 已归档）+ 未完成项汇总」；删除阶段条目表、状态播报、提交号、非目标段与 M3 准入依据（归档清理规则：已归档条目不得在 `todo.md` / `backlog.md` 保留任何内容）；未完成项汇总去里程碑编号，仅保留能力名与取证入口。
5. **`roadmap.md` 同步**：阶段表 Phase 17 行补「2026-09-30 完成并归档」；§1 现状句（阶段流转 + 已落地能力：补 `minimal` 缺省预设与两项新守卫）；§2 状态行改「**当前无进行中阶段**」；§5 归档索引补 Phase 17 并声明「主窗口 / 深度归档」双载体口径。
6. **`backlog.md` 复核**：核对无 Phase 17 已交付项残留（候选池只保留尚未进入阶段者）——核对通过（Phase 17 登记时已迁出 5 行；本批新增的 4 行候选均为 follow-up，见 §6）。
7. **长期任务触发义务**：阶段收口前执行一轮门槛复核（[长期任务](../../plan/recurring.md) §3 第 18 轮），见 §5。
8. **归档后回扫历史规划指针**：按 [规划规范 §4](../../standards/planning.md) 的三段式口径执行，见 §4。

---

## 3. 交付与提交对账（Phase 17）

- 阶段条目：**3 条主线 / 8 条原子条目**全部交付（M1-1 / M1-2 / M1-3；M2-1 / M2-2 / M2-3；M3-1 / M3-2），逐条交付说明、Review Gate 结论与质量门见[待办归档](../../plan/todo-archive.md) Phase 17 块。
- 提交对账：`git log --oneline e23b70e..2b2b129 | wc -l` → **24**（下界 = 上一阶段归档提交 `e23b70e`，上界 = 本阶段末条实现 / 记录提交 `2b2b129`；**不使用 `HEAD` 相对范围**——归档提交会推进 `HEAD`）。构成：阶段登记与范围评估 2 + wisdom 蒸馏补做 1 + M1 11 + M2 5 + M3 5。
- 未推送：全部提交仅本地，推送须用户明确授权（[Git 规范 §3](../../standards/git.md)）。

---

## 4. 归档后回扫（三段式）

- **① 机检面**：`pnpm check:governance-records` 在本批清空 `todo.md` 后先报 **6 处** `stale-planning-pointer`，**已同批改指**——
  - 4 处（`docs/design/governance/2026-09-18-m6-8-*.md:3`）：链接文字含 `M6-8`，而 Phase 7 第二阶段归档块已随本批迁入深度归档 → 改指 `../../plan/archive/phase-07-12.md`；
  - 2 处（`docs/design/governance/2026-09-30-m1-3-rich-text-editor.md:4`、`2026-09-30-m2-governance-guards.md:4`）：链接文字含 `M1-3` / `M2-1 ~ M2-3`，而 `todo.md` 已清空 → 改指 `../../plan/todo-archive.md`。
  - 改指后 `pnpm check:governance-records` **exit 0**（**91** 记录与索引一致 / **281** md 指针无失效）。
- **② 人工面**：枚举指向 `docs/plan/todo.md` 的**散文指针**（链接文字为载体名如「待办事项」、编号写在链接之外）——共 **62 处 / 24 文件**（复算：`rg -o "\[[^]]*\]\((\.\./)*plan/todo\.md\)" docs -g '*.md' | wc -l` → 62、同命令 `rg -l | wc -l` → 24）；逐条判定为**登记动作的时点陈述**（如「已登记至待办事项」），不因阶段归档而失真，**本批不改**。本阶段新增载体（4 份治理记录 + 深度归档 3 文件 + 本归档块）逐条核对，无「载体名 + 链接外编号」形态的失效指针。
- **③ 未处理面**：更早历史记录中指向 `docs/plan/todo.md` 的散文指针沿用既有边界（**跨分隔符形态**，机检不覆盖），属登记动作的时点陈述，本批不回改、亦未登记为待办；深度归档文件内同类指针随迁入一并保留（只调链接深度）。`docs:check:integrity` 对 `todo.md` 的「H1/H2 结构标题减少」告警为归档预期（脚本自带说明：阶段 / 条目标题在 H3/H4）。

---

## 5. 长期任务门槛复核（第 18 轮）

- 轮次与范围：2026-09-30，Phase 17 收口前触发（**门槛复核轮**，零代码改动域）；两组任务（代码复用治理 / 样式重复收敛）的全部候选重新取证。
- 结论：**待执行批次 0 项**（§2.1 / §2.2 均无）；**条件触发 1 项维持**（表单控件公共 props 契约后续候选）；**已判定不纳入 5 项维持**。
- **计数漂移归因（+1 ×2）**：`labelAttrs` 9 → **10**、含内联同名字段 31 → **32**，均由 Phase 17 M1-3 新增的 `rich-text-editor` 引入——该组件是**独立第三方内核的包装组件**，`types.ts` 不继承共享字段契约、也不是字段外壳控件，故**未达门槛的那一项条件触发候选结论不变**；两处计数已在 [长期任务](../../plan/recurring.md) §2.1 就地标注归因。
- 其余计数与第 15 ~ 17 轮一致（`useLabelAttrs` 15 / 模板级 `:aria-label="label"` 0 / 继承契约 12 / `useFocusControl` 4 / `useAttrs()` 11；数值钳位 2 处）；`capture:styles` 245 项 0 差异。

---

## 6. wisdom 蒸馏与 Backlog

- **wisdom 蒸馏**：活跃 **2** 条（`pnpm distill:wisdom --check` → `WISDOM_OK: 2 active entries (threshold 20)`），**未达阈值（>= 20）**，本轮不执行蒸馏；条目留存 `.session/wisdom.md`（`pnpm check:distill-archive` 归档段对账维持通过）。
- **Backlog 复核**：Phase 17 登记时迁出的 5 行已不在候选池；本批**未新增**候选行；在册 follow-up 已含 M1-3 / M2 批次登记的 4 行（富文本窄屏真实几何回归、两例并行负载 flaky、两类治理守卫的已知边界）。`todo.md` 未完成项汇总与 Backlog 的指针一致性已核对。

---

## 7. 规模（唯一口径）

- **口径**：`git diff 2b2b129..<本批归档提交> --numstat | awk 'NF==3{a+=$1;d+=$2;n++} END{print n,a,d}'`（本批起点 = `2b2b129`，即 Phase 17 末条提交；终值含本记录与深度归档 3 文件）。
- **数字在提交后由回填批次写入本行**——批量记录 / 归档类的规模计数与「记录自身的内容」互相包含（写一次数字就改变该数字），故按仓库既有「回填提交号与规模口径」的做法延后到提交后测量，避免自引用漂移。

---

## 8. 质量门

> **单点来源范围（R1~R3 三轮 findings 同源于「同一计数跨载体漂移」，故显式界定）**：**`todo-archive.md` 行数**与 **`check-docs-git-revision` 的 md / 命令计数**只在本节声明——归档块与治理索引条目**不复写**、仅引用本节（该两项随文档增删变化，是漂移高发项）。其余各项（`pnpm verify` / `test` / `test:a11y` / `capture:styles` / `docs:check` / `check:class-prefix` / `distill:wisdom` / `check:governance-records` / `docs:build`）在归档块、治理索引条目与本表为**同批实测的同值**（本批无漂移）；若后续批次使其变化，以本节为准并同步。数值均为**本批终态时点口径**，复算命令随行给出。

| 项 | 实测（2026-09-30 本批终态） | 复算命令 |
|:---|:---|:---|
| `pnpm verify` | **exit 0** | `pnpm verify` |
| `pnpm test` / `test:a11y` | **102 文件 / 2124 例** / **59 例** | `pnpm test` / `pnpm test:a11y` |
| `capture:styles` | **245 项 0 差异** | `pnpm capture:styles` |
| `docs:check` | **11 段链全绿** | `pnpm docs:check` |
| `todo-archive.md` 行数 | **306 行**（主窗口，回落 warn 下界 400 以下） | `pnpm docs:check:line-count`（**以此脚本口径为准**；`wc -l` 因末行换行计为 305） |
| `check-docs-git-revision` | **243 md / 105 条取证命令**（代码区 33021 行随文档增删变化） | `node scripts/governance/check-docs-git-revision.mjs` |
| `check:governance-records` | **91** 记录与索引一致 / **281** md 指针无失效 | `pnpm check:governance-records` |
| `check:class-prefix` | 90 文件 / 81 样式区 / 914 次 `ca` 前缀令牌，零违规 | `pnpm check:class-prefix` |
| `distill:wisdom --check` | **2** 活跃条目（阈值 20） | `pnpm distill:wisdom --check` |
| `docs:build` | exit 0（新增深度归档目录页后复跑） | `pnpm docs:build` |

---

## 9. 边界与未覆盖

- 深度归档为**机械迁移**，未对旧阶段正文做事实性复核（原始记述的时点性由各记录自身的快照 / 让渡声明界定）。
- 人工面 **62 处 / 24 文件**指向 `docs/plan/todo.md` 的链接按既有边界不回改（口径与复算命令见 §4 ②）。
- 本批无 UI / 行为改动，`@ui-validator` 不适用（显式跳过）；无依赖与构建产物改动。

---

## 10. Review Gate（归档批次）

单分区 `standard` 审计（归档批次以规划载体为主、无运行时面，故不按 §3.2 分区；时间盒 10 分钟）。

| 轮次 | 结论 | 主要 findings | 处置 |
|:---|:---|:---|:---|
| R1 | **`Reject`** | 1 blocker：`todo-archive.md` Phase 17 块「质量门」自称终态口径，但 `line-count`（记 340）与 `check-docs-git-revision`（记 239/103）为交付前快照；4 warning（`check:governance-records` 计数 90/280、回扫① 无值且悬空引用、人工面 60 不可复算）；3 suggest（深度归档末行孤立 `---`、跨阶段段未登记、`todo.md` 措辞近编号） | 计数订正 + 回扫段内联 + 索引/记录同步；3 suggest 同批采纳 |
| R2 | **`Reject`** | blocker **同类复发**：为关闭 R1 warning 4 而新增的审计段使 `todo-archive.md` 由 302 → 306 行，四处仍写 302（302 为加段前快照）；warning 5 未闭合（记录 §9 仍写 26/60）；新发现 wisdom 计数 1 vs 实测 2 | 改为**不在归档块复写易变计数**（结构处置）；§9 计数订正；wisdom 计数订正 |
| R3 | **`Reject`** | 「单点来源」§8 自身仍为旧值 302、且未承接 `check-docs-git-revision` 数值（指向落空） | §8 重写为「单点来源」表（逐项附复算命令 + 时点口径 + 工具口径说明）；§2 / 索引绝对终值改为指针 |
| R4 | **`Pass`**（`quick`，机械面复核） | R3 三项全部闭合；§8 逐项可复算、无残留易变终值。残余：§8 声明强于实际（另有 warning 2：压缩致 Phase 14 块内「第 474 行」行号引用失效） | 已同批收口：§8 声明收窄为「行数 / 取证命令计数」单点；行号引用改为段名引用 |

**根因与结构处置（供同类批次复用）**：三轮 Reject 同源——**同一组计数散落在归档块 / 批次记录 / 治理索引三处，且其中一项（`todo-archive.md` 行数）会因本批自身的新增文字而变化**，故「订正数字」永远滞后一拍。按 [AI 协作规范 §3.5](../../standards/ai-collaboration.md) 的复发类处置（先缩面）改为：**易变计数只在批次记录 §8 声明一次并附复算命令，其它载体只引用**；`todo-archive.md` 行数明确「以 `docs:check:line-count` 脚本口径为准」（`wc -l` 因末行换行计 305）。

## 11. 提交

按载体拆分（提交号在后续「回填」批次写入本表）：

| 提交 | 内容 |
|:---|:---|
| 1（归档批次） | 深度归档（`docs/plan/archive/` 3 文件）+ 主窗口重构（`todo-archive.md`）+ Phase 17 归档块 + 规划载体同步（`todo.md` / `roadmap.md` / `recurring.md` 第 18 轮）+ 本记录与索引 + 6 处指针改指 |
| 2（回填） | 本表提交号回填 |

> **为何不再细分**：归档块与本记录互相引用（归档块的质量门指向本记录 §8、Gate 指向 §10），拆成多提交会让中间提交在「按 checkout 逐提交全绿」口径下悬挂引用（该口径见 Phase 16 M6-8 的判例）；故本批按「一致性优先」合并为 1 个归档提交 + 1 个回填提交。

未执行 `git push`（须用户明确授权）。规模口径见 §7。
