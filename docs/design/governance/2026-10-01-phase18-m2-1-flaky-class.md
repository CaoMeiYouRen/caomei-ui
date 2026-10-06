# Phase 18 M2-1：并行负载 flaky 类修复与并发上限兜底

> 创建时间：2026-10-01
> 关联条目：[待办归档](../../plan/todo-archive.md) Phase 18 **M2-1**（测试稳定性与质量装置消缺）
> 快照：本仓工作区（`pnpm verify` exit 0）；**未推送**
> 决策依据：用户 2026-09-30 裁定 **D3「两者结合」**——① 受影响用例改为等待稳定；② `vitest.config.ts` 兜底限定 `maxWorkers`。

---

## 1. 结论

- 观测集中的**时序敏感用例**已逐例改为条件轮询（不再依赖固定 tick 数）；`vitest.config.ts` 增 `maxWorkers: 4` 与 `testTimeout: 15000` 作兜底。
- **复跑结果**：修复后全量套件在**配置并发上限（4）**下**连续 7 轮零失败**（`pnpm test`，各轮 102 文件 / 2126 例），`pnpm verify` **exit 0**（含 `capture:styles` 0 差异）。
- **并发上限仍属必要（对照实测）**：绕过兜底跑 `pnpm test --maxWorkers=8` 共 **6 轮**，其中 **2 轮**各命中 1 ~ 2 例同类残留（`dropdown-menu` 的 Esc 关闭与方向键聚焦、`image` 预览遮罩打开）——逐例修复只覆盖**观测集**，其余同形态用例由并发上限兜底，不能仅靠逐例修复取代限流。
- **判别力保持**：轮询只改等待方式、不改断言内容；负向对照证明错误期望值仍会失败（§5）。
- **附带修复一处守卫缺陷**（本批触发）：`guard-ref-attrs` 在真正执行 `capture:styles` 时崩溃（§6）。

---

## 2. 根因与处置形态

- **根因**：Reka 的浮层挂载、roving focus 与双向 `emit` 由**微任务与定时器混合驱动**。高负载下「交互后立即断言」或「只补固定 tick 数（`nextTick()` / 两次 `flush()`）」会读到更新前状态，表现为**每轮全量约 1 例失败、且每轮命中的用例不同**。
- **形态**：① 逐例把断言放进条件轮询；② 并发上限与用例上限兜底。**不采用用例重试**（`test.retry`）——那会掩盖真实失败，与「不得以「隔离通过」单点关档」的口径相悖。

---

## 3. 逐例修复（观测到的实例）

| 文件 | 命中用例（观测） | 处置 |
|:---|:---|:---|
| `accordion.test.ts` | 单开模式切换、`collapsible` 收起、键盘上下键移动焦点 | 4 处断言改轮询 |
| `auto-complete.test.ts` | `ignoreFilter` 过滤、标签逐个移除、空提示面板、locale 可访问名 | 4 处断言改轮询（其中空提示的 DOM 查询一并移入回调，保证重查） |
| `data-table.test.ts` | 排序后 `aria-sort` 与行序 | 2 处改轮询，并改为**点击前重新查询**排序按钮 |
| `data-table.grouping.test.ts` | 分组展开 / 收起与双向事件 | 2 处改轮询 |
| `data-table.sorting-multi.test.ts` | 多列排序第三击移除排序键 | 1 处改轮询 |
| `dropdown-menu.test.ts` | 勾选项状态切换、Esc 关闭菜单 | 3 处改轮询（与该文件既有的轮询写法统一；Esc 用例系并发对照中暴露的残留，见 §7） |
| `select-button.test.ts` | 非受控单选互斥切换 | 2 处改轮询 |
| `tabs.test.ts` | 非受控点击切换面板 | 1 处改轮询 |
| `toolbar.test.ts` | 切换抛出 `update:modelValue` | 1 处改轮询 |
| `color-picker.test.ts` | `format=rgb` 序列化 | 1 处改轮询 |
| `generate-changelog.test.mjs` | git 夹具在高并发下超默认 5s | 两条用例显式 `30s` 上限（子进程派生受环境约束，非挂起） |
| `accordion.test.ts`「键盘 Home / End 跳到首个 / 末个条目」 | 断言 `document.activeElement` 前只补一个 `nextTick`（与 ArrowDown 用例同构） | 一并改条件轮询（同文件同形态，未再单点复现） |

**机制载体**：轮询 helper 落 `test/helpers/settle.ts`（`expectSettled(assertion, timeout = 5000)`），规则落[测试规范 §6.2](../../standards/testing.md)。

---

## 4. 并发上限与用例上限（实测）

- **`maxWorkers: 4`**：默认 worker 数 = CPU 核数（本机 8）；满负载时 4 worker 已明显降载。**生效性实测**：运行期连续采样进程列表，恒为 **4 个 worker 进程**（外加主进程）。
- **耗时代价**（本机实测 `pnpm test` 单轮 `Duration`，随机器负载波动）：`maxWorkers: 4` **47 ~ 70s**（7 轮留痕）；`--maxWorkers=8` **26 ~ 35s**（6 轮留痕）——即并发受限约为 1.8 ~ 2 倍耗时。**口径**：以上为同一台高负载机器上的观测区间，非跨机器基准；CI 上以实测为准。
- **`testTimeout: 15000`**：须高于轮询上限（5s），否则轮询未超时、用例先超时。
- **代价边界**：全局抬高 `testTimeout` 会让**未使用轮询**的用例在真挂起时延迟到 15s 才失败（轮询用例的真失败仍在约 5s 报出）；如需更早暴露可改逐用例超时，本阶段取全局值以覆盖轮询上限。

---

## 5. 判别力保持（负向对照）

| 对照 | 操作 | 结果 |
|:---|:---|:---|
| 断言判别力 | 把分组用例的期望行序改为不可能值后单跑 | **失败**（`5049ms` 后超时失败），证明轮询不吞断言 |
| 守卫失败分支 | 临时把守卫内的 capture 命令替换为非零退出命令 | 输出「capture:styles 失败：存在计算样式差异，阻断提交 / 发布」并 **exit 1**；恢复后 exit 0 |

---

## 6. 附带缺陷修复：`guard-ref-attrs` 在捕获模式下崩溃

- **现象**：本批改动触及 `aria-controls` 字样（`auto-complete.test.ts`）→ 守卫进入阻断模式 → 执行 `capture:styles`（0 差异）后抛 `Cannot read properties of null (reading 'trim')` → `verify` 失败。
- **根因**：`execSync(cmd, { stdio: 'inherit' })` 在 `inherit` 下**返回 `null`**，而该守卫用统一的 `run()` 包装并对返回值调用 `.trim()`；此前守卫从未真正触发过 capture，缺陷被掩盖。
- **修复**：该处直连 `execSync` 并用 **异常**判定失败（非零退出码抛出），不再走 `.trim()` 包装；注释写明「inherit 下返回 null」的约束。
- **分类**：属 [规划规范 §3.5](../../standards/planning.md) 插队例外第 3 类（直接影响可用性的 blocker 级缺陷——守卫崩溃会阻断全部提交）；随本批修复并留痕。
- **已知边界**：内层 `catch` 同时覆盖「非零退出（样式差异）」与「命令派生失败（环境异常）」，两者均以 exit 1 阻断、提示语统一为「存在计算样式差异」；如需区分可在后续按 `error.status` 细分（不改变阻断语义）。

---

## 7. 复跑证据

- 修复前（默认并发）：全量 `pnpm test` 逐轮约 1 例失败，命中用例每轮不同（详见 §3 清单）。
- **早期失败轮次的如实披露**：实施过程中另有 **3 轮**全量失败，成因是 `vitest.config.ts` 注释一度写入规划编号（阶段与条目号）触发 `check:planning-numbers`——**不属 flaky 类**，移除编号后转绿；该 3 轮不计入上条的 flaky 基线。
- 修复后（`maxWorkers: 4`）：**连续 7 轮**零失败；`pnpm verify` exit 0（102 文件 / **2126** 例；`capture:styles` 245 项 0 差异）。
- **对照（绕过并发兜底）**：`pnpm test --maxWorkers=8` 共 **6 轮**，其中 **2 轮**各命中 1 ~ 2 例同类残留（`dropdown-menu` 的 Esc 关闭与方向键聚焦、`image` 预览遮罩打开）→ 逐例修复覆盖观测集，**并发上限是必要兜底**（与 §1 第三点同口径）。
- **未收敛面的如实披露**：以「交互 / flush 后紧跟断言」的形态扫描，仓库内仍有 **386 处候选**（45 个测试文件）——它们**并非都脆弱**（大量为同步语义或用例自带多段等待），本批只处置**实际观测到失败**的用例；后续新增用例按 [测试规范 §6.2](../../standards/testing.md) 的写法约束执行，暴露失败时再逐例收敛。

---

## 8. 规模、质量门与 Review Gate

- **质量门**：`lint:check`（`--max-warnings 0`）/ `typecheck` / `pnpm verify` **exit 0**；`check:planning-numbers` 0 命中（配置注释已避免规划编号）。
- **Review Gate**：见 `artifacts/review-gate/2026-10-01-phase18-m2-1-flaky-class.md`（本地态）。
- **并发写入与出处归一（披露）**：本批实施期间**另一会话曾在同一工作区并行写入**（改写 `vitest.config.ts` 注释、新建并暂存一份同题记录）。经用户 2026-10-01 裁定「以本会话产出为准」，该外部记录已移除、配置注释与本记录归一；文中所有数字均以本会话留痕为准（外部数据已替换）。
