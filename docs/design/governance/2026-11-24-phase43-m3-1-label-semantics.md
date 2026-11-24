# Phase 43 M3-1：`label` 语义按开发规范 §6 收口（登记例外）

> 创建时间：2026-11-24
> 触发：Phase 43 登记批次 M3-1（[登记批次](./2026-11-24-phase43-registration.md) §2）；候选来源 [1.4.0 下游反馈研判背景下的第二十八轮评估](./2026-11-24-next-stage-scope-evaluation-28.md) C7。
> 结论：**两处均登记为例外**（不整改），不改公共 props、不改渲染。

## 1. 范围与验收

- 范围：`Statistic.label`、`DescriptionsItem.label` 两处与[开发规范 §6](../../standards/development.md#_6-组件-api-设计约定)「`label` 统一表示不可见可访问名」的分叉，二选一处置（整改 / 登记例外）。
- 验收（登记原文）：两处口径与开发规范 §6、设计规范一致；中英组件页同步；`check:design` / `docs:check` / a11y 夹具通过。
- 非目标：不做全库 `label` 机械扫描、不改 Form 字段契约、不改浮层隔离策略。

## 2. 现状读数

| 组件 | `label` 的实际语义 | 与 §6 的关系 | 相关事实 |
|:---|:---|:---|:---|
| `Statistic` | **可见标签**，渲染为 `.caomei-statistic__label`；同一文本经 `aria-labelledby` 复用为数值区（`role="group"`）的可访问名 | 相反：§6 要求 `label` 只做不可见可访问名 | 中英组件页在 props 表内已显式标注「与本库 Input / Select 的约定不同」；`label` 插槽优先于 prop |
| `DescriptionsItem` | **可见标签**，渲染为 `dt`（根为 `dl`） | 相反（但**不**承担可访问名，读屏按术语 / 描述成对朗读） | 组件页说明条目「通过 `label` 提供标签」；无 `aria-label` 派生 |

## 3. 处置对比与选择

| 方案 | 内容 | 影响 |
|:---|:---|:---|
| A 整改 | 新增可见标签 prop（如 `text` / `heading`），`label` 只留可访问名 | `Statistic` / `DescriptionsItem` 的既有用法全部需要迁移；两者都是展示型组件，`label` 就是页面文案，改名没有下游收益，且在 1.x 内制造一次纯形态迁移 |
| **B 登记例外**（结论） | 在开发规范 §6 登记例外条款（含撤回条件），组件页显式声明差异 | 零公共 API 变更、零渲染变更；口径从「页面各自解释」收敛到「规范内单一登记」 |

选择 B 的理由：两处差异都已在中英组件页**如实声明**，问题只在「规范未登记」——补登记即可消除「规范写着统一约定、组件却相反」的口径分叉，而不必为纯命名迁移付出跨下游的迁移成本。

## 4. 落地内容

1. `docs/standards/development.md` §6：在 `label` 条目内新增「已登记例外（2026-11-24）」段，点名两处、给出理由与**撤回条件**（展示型组件引入独立可见标签 prop 的迁移窗口，或下游出现同名 prop 语义混淆实例）。
2. `docs/components/statistic.md` / `docs/i18n/en-US/components/statistic.md`：props 表的 `label` 行改为「可见标签 + 已按开发规范 §6 登记为例外」并链到 §6 锚点。
3. `docs/components/descriptions.md` / `docs/i18n/en-US/components/descriptions.md`：基础用法节补同口径说明与锚点链接。
4. 本条记录 + 治理索引一行。

## 5. 验证

- `check:design` 通过（组件样式规则 1343 条 / 声明 4242 条，预算未收窄）；`docs:check` exit 0（含 links / anchors / i18n parity 90 对）；`test:a11y` 86 例通过；`lint:md:check` 通过。
- 无代码改动，故不涉及 `pnpm test` 全量、`test:visual`、E2E。

## 6. 边界与后续

- 本条目**不改**两处 `label` 的运行时行为；`Statistic` 的「标签同源导致读屏可能朗读两遍」属 `group` 语义的标准成本，已在组件页「无障碍」节披露，不在本条范围。
- 例外清单目前只有这两条；若后续出现第三个展示型组件使用 `label` 表示可见文案，应先复核本条（避免例外扩散成事实约定）。

## 7. Review Gate

- **R1（2026-11-24，`quick`，时间盒 ≤5 分钟）**：**Pass**（0 blocker / 2 warning / 3 suggest，均同批修）。
  - 复核成立：验收第二分支成立，例外条款含点名 / 理由 / 撤回条件；`Statistic` 的可见标签与 `aria-labelledby` 复用、`DescriptionsItem` 的 `dt` 且不承担可访问名均与实现一致；设计规范无 `label` 统一条款（无隐性冲突）；锚点 `#_6-组件-api-设计约定` 有效。
  - warning（同批修）：`design-spec.md` §7 仍写「`label` 统一为不可见可访问名」且指针陈旧 → 改为链 §6 并点名展示型例外；例外扩散闸口只落在治理记录 → 在 §6 补「新增同类用法须逐条复核登记，不得直接沿用本例外」。
  - suggest（同批修）：撤回条件补「每次 major 前复核」；`Statistic` 页口径由「表单控件」改为「本库约定」；工件路径标注本地态、不入库。
- Review Gate 工件为本地态（`artifacts/review-gate/` 不入库，口径同上批）；结论已回填本节。
