# Phase 35 M1-1：Select 展开态的兄弟隔离（F18）

> 创建时间：2026-11-16
> 触发：Phase 35 登记批次 §2 的 M1-1 行（[登记记录](./2026-11-15-phase35-registration.md)）；范围与验收口径以该记录为唯一载体。

## 1. 交付面

| 面 | 文件 |
|:---|:---|
| 内部工具 | `src/_shared/open-state-inert.ts`：`suppressOutside(root)` 计算保留链并给其余兄弟节点补 `inert`，返回只撤销自身写入的清理函数 |
| 工具单测 | `src/_shared/open-state-inert.test.ts`：保留链、live region 子树、外部 `inert` 不接管、哨兵豁免、脱离文档空操作 |
| 组件接线 | `src/components/select/select.vue`：`v-model:open` 的内部 `open` 状态、`contentRef`、打开后 `nextTick` 隔离、关闭 / 卸载回退 |
| 组件单测 | `src/components/select/select.test.ts`：展开补齐隔离、关闭回退、外部已置位 `inert` 不接管 |
| E2E | `test/e2e/select-open-inert.e2e.ts`：展开后背景隔离、Tab 不落入背景、关闭回退并归还焦点（三视口矩阵） |
| a11y 抽检 | `scripts/docs/check-docs-axe.mjs`（`select-open-zh` 登记 `aria-hidden-focus`）；`scripts/docs/check-docs-axe.test.mjs`（同名单测翻转为「必须登记」） |
| 文档 | `docs/design/documentation-site.md` §17：打开态口径 ① 改写为「背景补 `inert`，规则已登记」 |

记录本体、治理索引与规划状态位属留痕，不计入上表。

## 2. 决策

1. **不读 Reka 的 `aria-hidden` 标记，自算保留链**：`aria-hidden` 包会在浮层内容挂载时给背景打 `data-aria-hidden`，但那是**传递依赖的实现细节**，且取用要依赖 watcher 时序（组件层 watch 早于 Reka 内部 watch 执行）。改为以「浮层元素 + 其祖先链」自算，与 Reka 的时机解耦；保留链的遍历方式对齐 `aria-hidden@1.2.6` 的 `applyAttributeToOthers`（只对保留节点下钻）。
2. **焦点哨兵整体保留**：Reka 在 `body` 下放两个 `[data-reka-focus-guard]`，用于把越界的 Tab 折回浮层。`inert` 会同时拦住程序化 `focus()`，隔离后 Tab 会直接落到浏览器界面而不是在浮层内循环。两个哨兵被 Reka 的 `aria-hidden` 包命中（浮层自身是保留目标、不加 `aria-hidden`），在 axe 回报里表现为 `aria-hidden-focus` 的 **2 条待复核**（节点 selector 见 §3），不是违规。
3. **live region 与 `script` 整棵子树保留**：与 `aria-hidden@1.2.6` 的实际行为一致——该包把这两类节点并入保留目标（`targets`），而 `deep()` 对目标节点**不再下钻**，故其子树不会被 `aria-hidden`；这里同样不隔离其子树。代价是浮层打开期间提示类内容仍留在无障碍树与焦点序列里（与引入本工具前一致，属预期）。
4. **只接管自身写入**：调用前已有 `inert` 的节点（外层模态 / 其它浮层）跳过且不撤销；撤销只移除本函数写入的节点，回到调用前状态（嵌套场景不接管别人的生命周期）。
5. **回退时点取「`open` 变 false 的 post-flush」**：必须早于 Reka 把焦点归还触发器——触发器在背景子树内，仍处于 `inert` 时 `focus()` 无效，焦点会掉到 `body`。Reka 的 `usePresence` 在 `nextTick` 后才卸载内容，故该次序是结构性的，reduced-motion 下同样成立。
6. **不新增公开 prop**：`open` 只是组件内部状态，`SelectRoot` 的 `v-model:open` 不对外暴露，默认行为（开合、选中、清空、`bodyLock`）不变。

## 3. 验证

| 面 | 结果 |
|:---|:---|
| 单测 | `npx vitest run src/_shared/open-state-inert.test.ts src/components/select/select.test.ts` → 55 passed（工具 6 例 + 组件新增 3 例） |
| 工具覆盖率 | `--coverage.include='src/_shared/open-state-inert.ts'` → Stmts / Branch / Funcs / Lines 均 100% |
| E2E | `npx playwright test test/e2e/select-open-inert.e2e.ts` → 三视口（mobile / tablet / desktop）全绿；断言背景同时具备 `aria-hidden` 与 `inert`、面板不在 `inert` 子树内、连续 4 次 Tab 不落入背景、关闭后宿主祖先链上零 `inert` 且焦点回到触发器 |
| E2E 判别力（负向对照） | 把组件内的 `suppressOutside(element)` 临时替换为空操作 → 同用例三视口全红（断言落在「背景被补 `inert`」），恢复后全绿 |
| 文档站 axe | `pnpm docs:build` 后 `node scripts/docs/check-docs-axe.mjs` → 全矩阵 OK（零违规）；`/components/select` 打开态新增 `aria-hidden-focus`：通过 17 / 违规 0 / 待复核 2。**待复核节点身份已取证**：`span[data-reka-focus-guard][aria-hidden="true"][tabindex="0"]` 的两个焦点哨兵（`body` 第 1 / 第 21 个子节点），刻意保持可聚焦 |
| 组件构建 | `pnpm build` → exit 0 |
| 质量门 | `pnpm lint:check`、`pnpm typecheck` 均 exit 0 |
| 回归抽检 | `test/e2e/select-long-list.e2e.ts` + `overlay-interaction.e2e.ts` + `focus-and-motion.e2e.ts` → 36 passed（含 Dialog 内 Select 的嵌套路径） |

**跳过项**：`pnpm verify` 全量与视觉基线（本批无视觉变更，样式未改）。

## 4. Review Gate

- **R1（`standard`，≤10 分钟；实际约 12–14 分钟）**：**Pass**（0 blocker / 4 warning / 5 suggest）。
- **R2（`quick`，≤5 分钟；实际约 8 分钟）**：**Pass**（0 blocker / 1 warning〔W-R2-1〕/ 1 备注）。R1 的 9 条全部关闭；W-R2-1 指向 live region 的口径论证。
- **R3（`quick`，≤5 分钟；实际约 6 分钟）**：**Pass**（0 blocker）。W-R2-1 关闭（整棵子树保留与 `aria-hidden@1.2.6` 的 `elementsToStop` 语义逐行对齐），另留 4 条 suggest，处置见 §5 观察项。
- **R1 / R2 处置**：
  - W1 新工具函数覆盖率不足（Functions 75%，保留链分支零覆盖）→ 新增 `src/_shared/open-state-inert.test.ts`，覆盖保留链、live region 子树、外部 `inert` 接管边界、哨兵豁免与脱离文档；覆盖率四项 100%。
  - W2（R1）/ W-R2-1（R2）live region 与 `aria-hidden` 口径的表述 → R2 实测反证后改回「整棵子树保留」：`aria-hidden@1.2.6` 的 `elementsToStop` 包含 live region / `script`，`deep()` 对目标节点直接返回、不下钻，故其子树本就不被隐藏；记录 §2.3 与 docstring 按真实口径重写（R2 新增 warning 一并关闭）。
  - W3 §2.2 的「哨兵不产生适用节点」与 §3 的「待复核 2」自相矛盾 → 取证后改写：2 条待复核即两个焦点哨兵（§2.2 / §3）。
  - W4 §3 缺 `pnpm build` → 补跑并记入 §3。
  - S1 E2E 的 `[inert]` 计数改为宿主祖先链判定，避免与夹具其它 `inert` 耦合；S2 `nextTick` 回调复检 `open`；S3 去掉无来源的 `data-radix-focus-guard`、把空操作内联；S4 docstring 写明 `root` 必须在 `body` 内；S5 已知边界记入 §5。
  - R2 备注：仓库内 `dist/` 为更早一次构建的产物（已 gitignore，不入库）；`pnpm build` 以当前源码可正常产出，`pnpm verify` / `check:build` 走新建目录。

## 5. 遗留

| 编号 | 内容 | 落点 |
|:---|:---|:---|
| F1 | 可测量盒的布局级持久守卫 | 本阶段 M1-2 |
| F14 | 治理计数一致性机检 | 本阶段 M1-3 |
| F17 | DataTable 逐格提示接线开销 | 本阶段 M1-4 |
| F16 | Menu 项槽包裹约束 | 本阶段 M1-5 |

**观察项（不构成条目）**：

1. 本批隔离只接在 `CaomeiSelect`；MultiSelect / AutoComplete / DatePicker 等同样经 Reka 打开浮层的组件仍只有 `aria-hidden`。是否扩为全库浮层隔离属范围决策，不在 M1-1 内动手。
2. 两个 Select 同时展开（仅程序化可达）时，后开者因「跳过已有 `inert`」不接管，先关者的撤销会让隔离提前失效；正常交互下同一时刻只有一个浮层，未做计数式引用管理。
3. 焦点哨兵在 axe 中恒为 `aria-hidden-focus` 的待复核节点（设计如此）；若后续把哨兵纳入隔离面，需同时解决 Tab 折返。
4. live region / `script` 子树不隔离，故浮层打开期间提示类内容仍可被读到与聚焦（与 `aria-hidden` 的既有行为一致）；若将来希望连提示区域一并隔离，需评估播报丢失。
5. Review Gate 的 suggest 级残留（不阻断）：`script` 豁免只有选择器承载、无用例；`body.contains(root)` 对 `root === body` 为真时会给整页补 `inert`（当前唯一调用方传面板根，不可达）。若将来把本工具泛化为通用浮层隔离，需补这两处。

## 6. 复查基线

本记录 §1 ~ §5；`src/_shared/open-state-inert.ts` 的 `suppressOutside` 与其单测；`src/components/select/select.vue` 的 `open` / `contentRef` / `releaseInert` 接线；`test/e2e/select-open-inert.e2e.ts`；`check-docs-axe.mjs` 的 `PAGES` 中 `select-open-zh`；`documentation-site.md` §17 打开态口径 ①。
