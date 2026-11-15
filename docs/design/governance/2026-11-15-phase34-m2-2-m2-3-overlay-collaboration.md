# Phase 34 M2-2 / M2-3：浮层协作 C6 ~ C9（嵌套 / Toast 层叠 / 焦点陷阱 / 触摸滚动）

> 创建时间：2026-11-15
> 触发：用户「继续推进剩余待办」。范围与验收口径见 [Phase 34 登记批次](./2026-11-14-phase34-registration.md) §2 的 M2-2 / M2-3 行；用例定义见 [遮罩协作调研](./2026-11-14-overlay-collaboration-research.md) §6。
> **合并交付说明**：两条目的改动落在同一份 spec（`overlay-collaboration.e2e.ts`）与同一份夹具（`app.vue` 的协作段），按 hunk 拆分会把共用的 helper 与夹具状态切散，故以**一条记录 + 一次提交**交付；下表按条目分别列出验收映射。

## 1. 交付面（4 文件）

| 面 | 文件 | 覆盖条目 |
|:---|:---|:---|
| 用例 | `test/e2e/overlay-collaboration.e2e.ts`：C7 / C8 / C9 三个 describe + C6 两例，另有 `hitTestInside` helper 与 C9 专属的触摸告警过滤 | C7 / C8 / C9 → M2-2；C6 → M2-3 |
| 夹具 | `test/e2e/fixtures/app.vue`：新增 `#collab-toast`（M2-2）与 `#collab-nested`（M2-3）两段，追加在末尾 | M2-2 / M2-3 |
| 夹具驱动（2） | `test/e2e/fixtures/collab-toast-driver.vue`（Toast 触发键置于对话框内，提示 `duration: 0` 常驻，M2-2）、`collab-nested-driver.vue`（详情 Dialog → `useConfirm`、抽屉 → 对话框，M2-3） | M2-2 / M2-3 |

治理索引、记录本体与规划状态位（`docs/plan/todo.md`）属登记 / 留痕，不计入上表。**无组件源码改动**：本轮只补协作回归与夹具。

## 2. 决策

1. **C7 探针先行**：先断言页面上**所有**提示视图层容器均为 `pointer-events: none`（页内有两个 provider，只查一个会命中另一段），再断言提示本体 `auto`、中心命中自身——否则「提示可点」没有对照对象。
2. **C7 的多条提示判据**：两条提示后仍断言对话框 `z-index` 与打开前一致（层级不被提示改写），并断言提示数累加到 3、关闭一条后对话框仍在。
3. **C8 的「顶层」定义**：面板经 portal 挂在 `body`，不是对话框的后代，故 `Shift+Tab` 的断言对象是「对话框内容 ∪ 已展开列表」；仅断言 `insideDialog` 会把正确行为判成失败（首轮实测即如此）。
4. **C6 依赖 M2-1 的「固定档位」结论**：断言只校验「子层在上、Esc 只关最上层、锁逐层释放、焦点归还」，**不假定 z-index 逐层递增**；命中测试的负向对照改为「把子层压到父层之下必须命中失败」，直接对齐 M2-1 记录的「子层遮罩不压暗父层」异常形态。
5. **C6 的锁断言用「单层基线」**：只断言最终复位无法证明分层释放（`resetBodyStyle` 会把四项一律清空，最终态必然等于初始态），故先记录父层单层时的 `bodyState`，首轮 Esc 后逐项断言 `overflow` / `pointerEvents` / `paddingRight`。
6. **C9 走 CDP 触摸序列**：`test.use({ hasTouch: true })` + `Input.dispatchTouchEvent`（`tap` 只产生点按、不产生滚动）；断言 `scrollTop` 增大且抽屉与面板都不关闭。
7. **触摸告警按环境差异显式过滤**：CDP 触摸滚动会触发 Chromium 平台提示「Ignored attempt to cancel a touchend event with cancelable=false」。按调研 §7「环境差异登记、不静默跳过」处理，边界为——只按**精确前缀**（`startsWith`）放行，且**只在 C9 的 describe 内生效**（由该 describe 的 `beforeEach` / `afterEach` 开关），其余用例出现同类告警仍判失败。无应用代码参与时未复现该告警（空白页 + 同一 CDP 序列得到 0 条日志），故它确属原生滚动路径的平台提示，不是本库监听器的缺陷信号。
8. **焦点归还用 `expect.poll`**：关闭确认框 / 面板后焦点回触发器是异步的（Presence 卸载后），轮询断言避免把渲染时序当成缺陷。

## 3. 验证

| 面 | 结果 |
|:---|:---|
| `npx playwright test test/e2e/overlay-collaboration.e2e.ts` | 45 passed（mobile / tablet / desktop 三 project；C6 2 例 + C7 1 例 + C8 1 例 + C9 1 例全部通过） |
| 判别力 / 覆盖强度 | 判别力：C6「把子层压到父层之下必须命中失败」的负向对照、C7 的「多条提示不改变对话框层级」对照；覆盖强度：C8 的 12 次 Tab 逐次轮询**并要求焦点身份去重 ≥ 3**（只断言「仍在框内」无法区分「循环」与「Tab 被吞掉」）；C7 每条提示均断言视图层 `pointer-events: none` 与提示本体中心命中 |
| `npx eslint` / `pnpm typecheck` | 通过（新增夹具组件与 spec 均在受检面内） |
| 邻接回归 | `overlay-motion` / `toast-tone-contrast` / `overlay-stacking` / `overlay-interaction` 共 57 passed（`app.vue` 是共享夹具，新增两段后必须回扫这四份 spec） |
| `pnpm verify` | 本批无源码改动；随本阶段最后一次全量复跑一并回填（见 §4） |

> 首轮三 project 全量跑出现 2 例既有用例（C4 / C5）超时；隔离运行与整文件复跑均通过、未再复现（未记录 workers 与复跑次数，不给出归因）。

## 4. Review Gate

- **R1（`standard`，A 用例与夹具 / B 记录与索引两分区并发）**：A `Reject`（1 blocker：C8 的 12 次 Tab 只断言「仍在对话框内」，无法区分「Tab 循环」与「Tab 被吞掉、焦点不动」；6 warning：C7 的视图层探针命中的是 `#toast-contrast` 段的另一个 provider、触摸告警过滤全文件生效且缺来源证据、C6「锁分层释放」只断言最终复位、文件头 describe 职责与本批新增不一致、C6 负向对照未用 `try/finally`、共享夹具未回扫邻接 spec；4 suggest）。B `Reject`（1 blocker：§1 写 5 文件而表内求和为 4；3 warning：§4 占位、索引复述「45 例」读数、告警过滤粒度宽于声明）。
- **R1 修复**：① C8 增加焦点身份去重断言（≥ 3 个不同元素），把「不逃出」与「真的在循环」分开；② C7 的视图层断言改为「页面上所有提示视图层容器均为 `pointer-events: none`」，提示查询收窄到 `#collab-toast .caomei-toast`（含多条后的命中复测）；③ 触摸告警过滤改为 `startsWith` + C9 describe 内开关，并补「空白页同一 CDP 序列不复现」的来源证据；④ C6 两个链路都补「单层基线」`parentOnly`，首轮 Esc 后逐项断言 `overflow` / `pointerEvents` / `paddingRight`（不再只看最终复位）；⑤ C6 负向对照包 `try/finally`；⑥ 文件头 describe 职责与夹具路径改为与本批一致；⑦ 跑邻接四份 spec 共 57 例通过；⑧ §1 改为 4 文件并补齐排除项，索引删读数，todo 的 M2-3 改显式链接。
- **R2（`quick`，两分区修复点）**：`Pass`（0 blocker；A-B1 / B-B1 关闭，A-W1 ~ W6 / B-W2 / B-W3 关闭；follow-up：C8 的「回环」证据已在本轮补为「12 次 Tab 的不同元素数 < 12」，§2 决策 1 / 5 的陈旧措辞已改写）。

## 5. 遗留

| 编号 | 内容 | 落点 |
|:---|:---|:---|
| F1 | 承接 M1-1：可测量盒的真实布局级持久守卫 | M4-1 |
| F7 ~ F9 | 承接 M1-2 | 见 M1-2 记录遗留节 |
| F10 / F11 | 承接 M1-3（F12 已收敛） | 见 M1-3 记录遗留节 |
| F14 | 承接 M1-5：验证表计数须与逐点清单求和一致 | 见 M1-5 记录遗留节 |
| F16 / F17 | 承接 M1-6：Menu 槽包裹约束 / 大表逐格接线开销 | 见 M1-6 记录遗留节 |
| F18 | 承接 M3-1：Select 展开时兄弟节点仅 `aria-hidden`、未 `inert` | 见 M3-1 记录遗留节 |

## 6. 复查基线

本记录 §1 ~ §5；`overlay-collaboration.e2e.ts` 的「嵌套（C6）」「层叠与焦点（C7 / C8）」「移动端触摸滚动（C9）」三个 describe 与 `hitTestInside` / `TOUCH_CANCEL_NOISE`；`test/e2e/fixtures/app.vue` 的 `#collab-toast` / `#collab-nested` 两段；两个夹具驱动组件。
