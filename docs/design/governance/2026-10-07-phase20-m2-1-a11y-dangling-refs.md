# Phase 20 M2-1：a11y 同类悬空引用处置（分组标签 / 折叠内容）

> 创建时间：2026-10-07
> 关联条目：[待办归档](../../plan/todo-archive.md) Phase 20 **M2-1**（基建与治理守卫补口）
> 依据：Phase 14 M1 记录 §6.5「同类悬空引用（已登记、未修）」——① `CaomeiDropdownMenuGroup` / `CaomeiDropdownMenuRadioGroup` 无内嵌标签时 `aria-labelledby` 悬空；② `CaomeiAccordion` 折叠触发器关闭态 `aria-controls=""`（[2026-09-26 a11y 例外处置](./2026-09-26-m1-a11y-exception-disposal-and-surface.md)）
> 快照：本仓工作区（`pnpm verify` exit 0、`test:e2e` 312 passed）；**未推送**

---

## 1. 结论

- 处置两类同类悬空 / 空引用：
  - **分组标签**：`CaomeiDropdownMenuGroup` / `CaomeiDropdownMenuRadioGroup` 改为**槽内标签在位检测**——无内嵌 `CaomeiDropdownMenuLabel` 时不再输出 `aria-labelledby`（避免指向不存在的分组 id）。
  - **折叠内容**：`CaomeiAccordionItem` 触发器**统一不输出** `aria-controls`（Reka 内容 id 非响应式，三态取值均不可靠；`aria-controls` 在折叠模式中可选，关系由 `aria-expanded` + 内容 `role="region"` 的 `aria-labelledby` 承载）。
- 新增共享机构 `src/components/_shared/slot-presence.ts`（Phase 14 §6.6 预告的下沉落点），含 5 例单测。
- **复验先行**：axe-core 4.13（happy-dom）**不判**这两类为违规；真实 Chromium（`docs:build` 产物）逐项复验确认修复形态（§3）。
- 本批改 `src/**`（仅 ARIA 属性，零视觉）；`capture:styles` **0 差异**（`ref-attr-guard` 阻断模式复跑通过）。
- **有意例外维持现状**：`CaomeiToastProvider` 的 `aria-hidden-focus` ×2（例外清单唯一条目不变）。

---

## 2. 根因与修法

### 2.1 分组标签悬空（`DropdownMenuGroup` / `RadioGroup`）

- **根因**：Reka `MenuGroup` 无条件绑定 `aria-labelledby={id}`（`id = useId('reka-menu-group')`，`MenuGroup.js`），而该 id 只在 `DropdownMenuLabel` 渲染时落 DOM——无标签即悬空引用。`DropdownMenuRadioGroup` 经 `MenuRadioGroup → MenuGroup` 同源。
- **修法（槽形态在位检测）**：新增 `slotContainsComponent(slot, target)`（展平 `Fragment`，识别直系组件），分组的 `aria-labelledby` 仅在**内嵌标签在位**时保留；缺席时以 `{'aria-labelledby': null}` 覆盖（Vue 对 `null` 移除属性）。绑定顺序为 `{'...('ariaAttrs'), ...$attrs}`——**使用方显式透传的 ARIA 属性优先**（与 `_shared/use-label-attrs.ts` / `_shared/panel-idref.ts` 的「显式非空取值优先」约定一致），派生的空值只在无显式值时生效。
- **求值时机**：以**渲染期函数**（而非缓存 `computed`）求值——`useSlots()` 返回的槽对象非响应式，`computed` 只求值一次，无法感知标签的动态增减；渲染期求值使 `v-if` 切换标签时条件输出同步更新（有对应用例）。
- **覆盖机制的范围**：本结论（包装层透传属性经 Vue fallthrough 合并后于 Reka 内部绑定生效）限于 **`asChild` 未启用的元素根**；`asChild` / Reka `Slot` 合并路径方向相反（内部绑定遮蔽透传），见 `dropdown-menu-trigger.vue` 的既有记录。
- **边界**：检测面为直系 + `Fragment` 展平；标签经深层包装嵌套时不在检测面内（会在有标签时也省略关联，属已知取舍，见 §4）。

### 2.2 折叠触发器 `aria-controls`（`AccordionItem`）

- **根因**：Reka `CollapsibleRoot` 的 `contentId` 为**非响应式**字符串，由 `CollapsibleContent` 挂载时 `||= useId(...)` 赋值；`CollapsibleTrigger` 无条件绑定 `aria-controls={contentId}`。于是：关闭态首帧为空串 `""`；**初始即展开**时内容挂载后无重渲染，仍为空串；展开后收起则 `contentId` 残留已卸载元素的旧 id → 悬空。
- **修法（统一省略）**：`AccordionTrigger` 以 `{'aria-controls': null}` 覆盖 Reka 的绑定，三态一致不输出。取舍论证：`aria-controls` 在 [WAI-ARIA 折叠 / 手风琴模式](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/) 中为**可选**；触发器 `aria-expanded` 与内容 `role="region"` 的 `aria-labelledby`（指向触发器 id）已表达两者关系。
- **为什么不用「展开态保留」的时序方案**：Reka 的 `contentId` 不可响应式读取（`inject` 仅在更深子树可得，且为普通字符串），自持内容 id 亦不可行——Reka `CollapsibleContent` 以 `mergeProps($attrs, { id: contentId })` 合并，其内部 id **后于**透传属性生效（与分组方向相反）。统一省略是不依赖上游时序的确定解。

---

## 3. 复验与验证

### 3.1 axe 复验（happy-dom，`test:a11y`）

- axe-core 4.13 对 `aria-labelledby` 悬空与空 `aria-controls` **均不判违规**（实测 `aria-valid-attr-value` 未命中）——即既有门禁对本类缺陷**无判别力**，故须以「等价新增断言」承接（见 §3.3）。

### 3.2 真实 Chromium 复验（`docs:build` 产物，一次性探针）

| 观测量 | 修复前 | 修复后 |
|:---|:---|:---|
| `/components/dropdown-menu` 无标签分组 `.caomei-dropdown-menu__group` `aria-labelledby` | 指向不存在的 `reka-menu-group-v-*` | **`null`（属性省略）** |
| `/components/accordion` 触发器 `aria-controls`（初始展开） | `""` | **`null`** |
| `/components/accordion` 触发器 `aria-controls`（交互收起后） | 残留已卸载内容 id | **`null`** |

### 3.3 等价新增断言（组件测试）

| 文件 | 断言 |
|:---|:---|
| `_shared/slot-presence.test.ts` | 槽缺席 / 直系命中 / 缺席 / `Fragment` 展平 / 带 key（5 例） |
| `dropdown-menu.test.ts` | 3 个新 `it` / 4 类断言：无标签分组（Group + RadioGroup）不输出 `aria-labelledby`；有标签分组指向存在的标签 id；**无标签但显式透传 `aria-labelledby` 时以使用方取值为准**；**槽内标签动态增减时条件输出同步更新** |
| `accordion.test.ts` | 触发器三态（关闭 / 展开 / 收起后）均不输出 `aria-controls`，且内容 region 的 `aria-labelledby` 指向触发器 id |

### 3.4 判别力（负向对照）

| 对照 | 回退 | 结果 |
|:---|:---|:---|
| 分组 | `labelAria()` 固定返回 `{}`（让 Reka 悬空值泄漏） | `dropdown-menu.test.ts` **2 failed**（无标签省略 + 动态增减；「显式透传优先」用例仍通过，反证优先级正确） |
| 折叠 | `triggerAria` 固定为 `{}` | `accordion.test.ts` **1 failed** |

- 两轮均还原后全绿。

---

## 4. 未纳入面与边界（显式）

- **标签经深层包装嵌套**：`slotContainsComponent` 只识别直系 + `Fragment` 展平，深层包装的标签不被识别（会省略关联），属已知取舍；如需支持可递归扫描任意组件子树，代价是失去「直系」这一简单判据。
- **`aria-controls` 关系**：采纳统一省略，展开态不再输出面板指向（ARIA 折叠模式可选）；如需恢复「展开态指向 region」，须由上游 Reka 提供响应式内容 id。
- **Toast 焦点哨兵**：`aria-hidden-focus` ×2 按用户裁定**维持现状**（例外清单不变）。
- **axe 门禁边界**：本类缺陷不在 axe 违规面内，故回归由组件测试 + 真实浏览器探针承接，不进 `exceptions.ts`（不把工具边界登记为组件例外）。

---

## 5. 规模、质量门与 Review Gate

- **规模**：`src/**` **7 文件**（`slot-presence.ts` +29 / `slot-presence.test.ts` +32 / `accordion-item.vue` +13 −1 / `accordion.test.ts` +20 / `dropdown-menu-group.vue` +18 −1 / `dropdown-menu-radio-group.vue` +14 −1 / `dropdown-menu.test.ts` +109 −1）；测试夹具 **1 文件**（`test/a11y/fixtures.ts` +2 −2）；文档载体 **3 文件**（本记录 / 治理索引 / `todo.md`；**本记录自身行数随其修订变化，故不列具体值，以 `git diff --cached --numstat` 为准**）。**零视觉变更**。代码与夹具合计 **8 文件 / +237 −6**（`git diff --cached --numstat -- src test` 复算）。
- **分区豁免**：本批虽 >8 文件且横跨 `accordion` / `dropdown-menu` / `_shared`，但属**同一原子条目、同一判据（a11y 引用型属性悬空）的单一根因**，不可分割——**调用方裁定**以单分区 `standard` 送审（[AI 协作规范 §3.2](../../standards/ai-collaboration.md) 未定义「不可分割」豁免，此处为决策记录，非脚本授权）。
- **质量门（本批实测）**：
  - `pnpm verify` **exit 0**（`lint:check` / `lint:css:check` / `lint:md:check` / `typecheck` / `typecheck:docs` / `test` **111 文件 / 2212 例** / `build` / `check:build` / `check:resolver` / `check:nuxt` / `docs:build` / `docs:check:i18n-routing` / `governance:check` 全绿）。
  - `pnpm test:a11y` **59 例**全绿（例外清单不变）。
  - `ref-attr-guard` 检测到 `aria-controls` 变更 → 触发 `capture:styles` **0 差异**（阻断模式通过）。
  - 负向对照两轮各 **1 failed**、还原后全绿（§3.4）。
- **V 阶段**：真实 Chromium 逐项复验（`docs:build` 产物，§3.2），一次性探针（不入库）。
- **Review Gate**：见 §6；本地留痕 `artifacts/review-gate/2026-10-07-phase20-m2-1-a11y-dangling-refs.md`。

## 6. Review Gate 结论

- **R1（第 1 轮，`standard`）`Reject`**：1 blocker / 2 warning / 3 suggest。
  - **RG-B1（blocker）**：分组 `{...$attrs, ...ariaAttrs}` 吞掉使用方显式透传的 `aria-labelledby`（公共 API 行为回归）→ 改为 `{...labelAria(), ...$attrs}`（显式值优先）+ 补用例。
  - **RG-W1（warning）**：`useSlots()` 非响应式 + `computed` 缓存 → 标签动态增减时条件输出陈旧 → 改**渲染期函数**求值 + 补动态用例。
  - **RG-W2（warning）**：§5 规模计数不准（「5 文件」实为 7）+ 漏 `test/a11y/fixtures.ts` → 重算。
  - **RG-S1（suggest）**：fallthrough 覆盖机制加 `asChild` 限定 → §2.1 补。
  - **RG-S2（suggest）**：补分区豁免理由 → §5 补。
  - **RG-S3（suggest）**：`labelAria()` 每次渲染多调用一次槽函数（低风险，vnode 描述被丢弃、无重复副作用）→ 保留（属可接受的一次性开销）。
- **R2（第 2 轮，`standard`，复审修复点）`Reject`**：1 blocker（RG-W2 **复发**）/ 3 follow-up。
  - **RG-W2（blocker，复发）**：只改了文件数措辞，逐文件行数与门禁例数仍为修复前旧值 → 重算并在 staged 后复核对齐：`src/**` 7 文件逐项按 `git diff --cached --numstat` 校准；文档载体不列记录自身行数（消除自引用陷阱）；门禁例数同步回扫治理索引（+2 例）。
  - RG-B1 / RG-W1 / RG-S1 / RG-S2 **关闭**（审计方独立复跑 3 文件 / 48 例、全量 111 文件 / 2212 例、读 Vue `mergeProps`/`cloneVNode` 与 Reka 源码佐证）。
  - follow-up（非阻断）：artifact 悬空引用（本批 F 阶段落盘）、新用例 `it` 数措辞、分区豁免表述。
- **R3（第 3 轮，`standard`，复审 blocker 修复点）`Pass`**：0 blocker / 1 warning（非阻断）。
  - RG-W2 **关闭**：`git diff --cached --numstat -- src test` = **8 文件 / +237 −6**，与 §5 逐文件逐字一致；旧门禁例数全仓 0 命中；记录 §5 / §6 与治理索引均为 `111 文件 / 2212 例`；`src/**` / `test/**` 未见修复计数时误改。
  - **RG-W3（warning）**：§6 R1 汇总计数（3 suggest）与枚举不一致 → 补齐 RG-S3（枚举与表头均 3 条）。
- **实测用时**：R1 派发 `2026-10-07T23:40:03+08:00` → 首个修复写入 `23:49:02` 作上界，**≈ 8 分 59 秒**；R2 派发 `23:53:10`（返回未单独取戳）；R3 派发 `2026-10-08T00:04:35+08:00` → 记录回填写入 `00:07:35` 作上界，**≈ 3 分**。各轮均 ≤ 10 分钟时间盒。

## 7. 未覆盖边界（采信调用方证据）

- 审计方未独立复跑 `capture:styles` / `ref-attr-guard` / `pnpm verify` 全链 / 真实 Chromium 探针、未复现负向对照（只读约束）。
- `slotContainsComponent` 在「不同包实例 / 深层包装标签」下的命中率为已知取舍（§4）。
