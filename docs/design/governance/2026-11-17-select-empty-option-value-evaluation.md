# 2026-11-17 选择器空串选项值调研与处置

> 来源：用户 2026-11-17 提问——「CaomeiSelect 不允许空字符串选项值是否好设计；主流组件库怎么做；本地哪些地方需要」。
> 触发背景：下游 caomei-auth 时区页曾以页面 500 暴露该约束（`components/profile/timezone-settings.vue` 现以 `__browser__` 哨兵绕行）。
> 口径：本仓源码判读 + 定向探针（`vitest` + jsdom，临时用例已删除）+ 上游库发布产物源码判读 + 三仓用量检索；**未运行上游库实例**，跨库结论均为源码判读而非实跑。
> 快照：caomei-ui `d876537`（2026-11-17）；下游 caomei-auth `1c9c189` / momei `3bf2eb78`（同日读取）。
> 判定取值：**缺陷**（契约内不一致且无诊断）/ **设计如此**（已文档化的有意契约）/ **能力缺口**（无表达方式）/ **文档缺口**。

## 1. 结论摘要

| 事项 | 判定 | 落点 |
|:---|:---|:---|
| 空串选项值到达 Reka 后由上游裸抛（面板打开即失败，与 `null` / `undefined` 的「丢弃 + 告警」口径不一致） | **缺陷** | Phase 36 **M4-1**（插队，见 §5.1） |
| Select / MultiSelect 未声明「选项值不能为空串」及其开发期行为 | **文档缺口** | Phase 36 **M4-2** |
| 下游需要以「全部 / 不限 / 默认」作为真实选项值，但库不提供表达方式，只能自造哨兵 + 边界转换 | **能力缺口** | Backlog §1.1（P1，见 §5.2） |
| 迁移口径（PrimeVue 允许空串）与示例写法未统一 | **文档缺口** | Backlog §1.6（P2，见 §5.3） |

构成：缺陷 **1** / 文档缺口 **2** / 能力缺口 **1**。

## 2. 现场机制（本仓）

- `src/components/_shared/option.ts`：`narrowOptionValue` 只做类型收窄，**空串是合法 `string`**，不会被丢弃；`OptionValue = string \| number` 因此 `value: ''` 可通过类型检查。
- `src/components/select/select.vue`：`normalizedOptions` / `normalizedGroups` 仅对 `value === undefined` 跳过；`''` 直达 `SelectItem` → `reka-ui` 在 setup 阶段 `throw new Error('A <SelectItem /> must have a value prop that is not an empty string…')`。
- 同一文件的 `hasValue` 以 `model !== undefined && model !== null && model !== ''` 判定「有选中值」——**模型侧的 `''` 是「未选中」**，与选项侧的 `''` 含义相反，两处无共同契约。
- 定向探针（2026-11-17，临时用例）：关闭态 `mount` 与关闭态 SSR 均不抛；**面板一渲染即抛**，`[role="option"]` 计数 0；`CaomeiMultiSelect` / `CaomeiAutoComplete` 走同一 Reka 断言（`ComboboxItem`），`CaomeiSelectButton`（ToggleGroup 基座）**不抛**，`value: ''` 的项 `data-state=on`。
- 结论：现状不是「库不允许空串」，而是「库没有在边界处理空串」，失败方式由上游决定。

## 3. 主流做法（源码判读）

| 库 / 基座 | 选项值 `''` | 「未选择」表示 | 清除写入 | 判读位置 |
|:---|:---|:---|:---|:---|
| Reka UI 2.11.0（本库基座） | 禁止，硬抛 | `undefined` 与 `''` 均显示 placeholder | `''` | `dist/Select/SelectItem.js`；`SelectValue` 取 `placeholder` 的条件 |
| Element Plus 2.11.3 | 可配置，默认按空值 | `emptyValues`，默认 `['', undefined, null]` | `valueOnClear`（默认 `''`，可设 `null`） | `es/components/select/src/useSelect.mjs`；官方 `empty-values.vue` 示例即「All = `''`」 |
| Ant Design 5.29.3（rc-select 14.16.8） | 是，普通值 | `undefined` / `null` 显示 placeholder | `undefined` | `es/Select.js`（仅丢弃 `value === null`）；6.3.1 changelog 仍在修 `''` 回显 |
| Naive UI 2.43.2 | 是，普通值 | `null`（默认值即 `null`） | `null` | `es/select/src/Select.mjs` 无 `''` 特判 |
| Vuetify 3.10.3 | 是，普通值 | `null`（单选 `transformed[0] ?? null`） | `null` / `[]` | `lib/components/VSelect/VSelect.mjs` 无 `''` 特判 |
| PrimeVue 4.4.1（下游迁移来源） | 是，普通值 | `null` | `null` | `select/index.mjs` 无空串断言；`isValidSelectedOption` 走 `equals`，`''` 可回显 |
| 本库 SelectButton（ToggleGroup） | 是 | `undefined`（内部冻结对象占位） | — | `select-button.vue` 的 `EMPTY_SINGLE_VALUE` |

版本来源：Reka 取本仓 `node_modules`（2.11.0）；其余五个版本取自 npm 发布包的 CDN 产物（jsDelivr / unpkg，2026-11-17 读取），Element Plus 的默认 `emptyValues` 另与官方文档及 `useEmptyValues` 源码核对。

两类范式：**Radix 系**把 `''` 私有化为「清空」并硬性禁止；**Element Plus / Ant / Naive / Vuetify / PrimeVue** 要么让 `''` 成为普通值，要么把「什么算空」做成可配置项。硬禁止且不可配置仅 Reka 一支。

## 4. 本地需求盘点

| # | 位置 | 语义 | 现状写法 |
|:--|:---|:---|:---|
| 1 | `docs/examples/input-group/with-select.vue`（+ `docs/i18n/en-US` 同名） | 状态筛选的「全部」 | `{ label: '全部', value: 'all' }`；同页 `status = ref('')` 又表示未选 |
| 2 | `docs/examples/float-label/with-select.vue`（+ en-US） | 同上 | `'all'` 哨兵 |
| 3 | `docs/examples/float-label/in.vue`（+ en-US） | 「全部」作为多选标签值 | `'all'` 哨兵 |
| 4 | `src/components/select/select.test.ts` / `multi-select.test.ts` / `select-button.test.ts` | 「全部」本应是 `null` | 负向断言「`id: null` 的选项不渲染」 |
| 5 | caomei-auth `components/profile/timezone-settings.vue` | 「跟随浏览器时区」，存库为空串 | `__browser__` 哨兵 + `get` / `set` 双向还原 |
| 6 | momei `components/admin/users/user-filters.vue` | 全部角色 / 全部状态（模型 `null`） | `__all__` ×2 + `computed` 边界转换 |
| 7 | momei `components/admin/content-language-switcher.vue` | 全部语言（共享状态 `null`） | `__all__` |
| 8 | momei `pages/admin/calendar/index.vue` | 全部语言（`null`） | `__all__` |
| 9 | momei `pages/admin/comments/index.vue` | 全部状态（`null`） | `__all__` |
| 10 | momei `components/admin/users/user-ban-dialog.vue` | 永不过期（`null`） | `__never__` |

- 取证：`rg -n "SENTINEL\|BROWSER_SENTINEL" /root/projects/{momei,caomei-auth} --glob '!node_modules'`；示例侧 `rg -n "label: '全部'" /root/projects/caomei-ui/docs`。
- **候选覆盖声明**：本盘点 10 行 = 本仓 4（文档示例 3 + 测试 1）+ caomei-auth 1 + momei 5；**逐条均有落点**——第 4 行由 M4-1 补正向保护，第 5 ~ 10 行由 P1 承接（待用户决策，触发条件见 §5.2），第 1 ~ 3 行由 P2 统一示例与迁移口径，无静默豁免。
- 共性：全部是「全部 / 不限 / 默认」筛选，且每个下游各自发明哨兵，属能力缺口而非零散用法。

## 5. 处置

### 5.1 P0：诊断收敛（已插队 Phase 36）

- **准入依据**：[规划规范 §3.5](../../standards/planning.md) 第三类「直接影响可用性的 blocker 级缺陷」——面板渲染即抛，该选项集下组件完全不可用，且下游已出现页面 500；另有用户 2026-11-17 明确指令。
- **范围（M4-1）**：Select / MultiSelect / AutoComplete 在归一化阶段把 `value === ''` 视为契约外值——开发期 `console.warn`（带组件标识与选项序号，指明「需要全部 / 不限请用非空哨兵」）、生产静默丢弃；面板不再抛上游断言。模型侧 `''` = 未选中保持不变。
- **边界（M4-1）**：`CaomeiSelectButton` 不纳入过滤（ToggleGroup 允许 `''`，纳入会破坏既有可用值），补反例用例锁住差异。
- **文档（M4-2）**：Select / MultiSelect 组件页（中英）补空串约束与开发期行为；AutoComplete 既有「必须非空」句补行为说明；[设计规范 §7](../design-spec.md) 的 Select 家族映射段同步「空串不渲染」。
- **非目标**：不改变 `''` 作为「未选中」的模型语义；不新增公共 prop；不动迁移指南。

### 5.2 P1：opt-in 支持（Backlog §1.1）

- 目标：让 `''` 可作为真实选项值，下游不再需要哨兵与边界映射。
- 形态候选：`allowEmptyValue`（默认 `false`，保持 P0 后的现状）或 Element Plus 式 `emptyValues`；内部以私有 token 承载 `''`，对外原样回显。
- 连带口径（须一并裁定）：`hasValue` 从「值不为空串」改为「存在匹配选项」；`data-filled`、浮标 label、`showClear` 在「选中的是空值项」时的行为。
- 触发条件：P0 交付后下游仍有「全部」诉求，或用户裁定启动契约变更。

### 5.3 P2：迁移与示例口径（Backlog §1.6）

- 范围：`primevue-migration` 常见陷阱补「PrimeVue 允许 `''`、本库不允许」；统一 `docs/examples` 的哨兵写法（现为 `'all'`）并给出推荐的哨兵约定，避免下游继续各自发明。
- 触发条件：P1 决策落地，或下一次文档批次。

## 6. 边界与未覆盖

- 下游「时区页 500」的服务端链路**未在本仓复现**：本仓探针显示关闭态 SSR 不抛，只有面板被渲染的路径才抛；该 500 的触发形态（默认展开 / 强制挂载 / 水合路径）未取证。
- 跨库结论为**发布产物源码判读**，未实例化运行；Element Plus 的默认值以官方示例与 `useEmptyValues` 说明为准，未逐版本回归。
- 未评估 P1 对 SSR / 表单提交语义的影响（`''` 与「未填」在服务端不可区分），留待 P1 立项。
- 本次不改动任何下游仓库；第 5 ~ 10 行为只读取证。

## 7. Review Gate

- **R1（`quick`，2026-11-17，时间盒 8 分钟）：`Pass`**（0 blocker / 3 warning / 6 suggest）。审计复跑 `check-stage-counts` / `check-governance-counts` / `check-governance-records` / `check-planning-numbers` 均 exit 0。
  - **W1（已同批修复）**：登记记录把「时区页 500」写成已取证的因果，与本记录 §6 的「未复现」矛盾 → 改为「下游曾报告时区页 500（触发形态未取证）」，准入依据不依赖该句。
  - **W2（已同批修复）**：Backlog §3「开发期告警已登记 §1.1」指针已失效 → 改为「已纳入 Phase 36 M4-1」，并在 §1.1 新行注明与 `null` 值支持分列。
  - **W3（已同批修复）**：M4-2 的 §7 落点与 P2 的迁移对照口径可能重叠 → 写死「§7 只补本库契约，PrimeVue 对照留 Backlog §1.6」。
  - **S1 ~ S6（已同批采纳）**：AutoComplete 是新增边界而非既有归一化（三处表述改为「两处分支 + 一处新增」）；Backlog 状态词区分「已登记 / 已交付」；索引摘要去掉会漂移的盘点计数；补本 §7；补版本取证来源；P1 措辞改为「承接（待决策）」。
- **未覆盖边界**：审计未运行下游仓库复验、未实例化六个上游库、未跑 `docs:build`（`docs:check:*` 全套已绿）；本批零 `src/` 零 `test/`。
