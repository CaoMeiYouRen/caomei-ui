# Phase 34 M1-2 / M1-9 / M1-10：P0 图标触发器接入（Toolbar / Paginator / SplitButton）

> 创建时间：2026-11-15
> 触发：用户「继续 M1-2」。范围与验收口径见 [Phase 34 登记批次](./2026-11-14-phase34-registration.md) §2（M1-2 于 2026-11-15 执行期拆为 M1-2 / M1-9 / M1-10，拆分依据见该记录 §1）。

## 1. 交付面

| 条目 | 内容 | 文件面 |
|:---|:---|:---|
| **M1-2**（Toolbar） | `CaomeiToolbarButton` / `CaomeiToolbarLink` 新增 `tooltip?: IconTooltipProp`（默认 `true`）；新增内部 `CaomeiIconTooltip`（未导出）与 `resolveIconTooltipContent`；顺带关闭 M1-1 F5（`Passthrough` 抽到 `components/_shared/`，回收 Button / Tooltip / TooltipText 三处重复实现） | 10（另回收 M1-1 F5 的 3 个既有文件，不计入） |
| **M1-9**（Paginator） | 首页 / 上一页 / 下一页 / 末页四个图标按钮接入 `tooltip?: boolean`（默认 `true`），内容取各按钮可访问名 | 3 |
| **M1-10**（SplitButton） | 下拉（图标）按钮接入 `tooltip?: IconTooltipProp`（默认 `true`），内容取 `menuLabel`；主按钮不挂载 | 3 |

生成物 `test/capture/baseline.json` 按[规划规范 §5](../../standards/planning.md) 生成物条款不计入文件面。

### 1.1 拆分与编号

M1-2 原为单条、覆盖 3 个组件；实测交付面 **19 文件 = M1-2 10 + M1-9 3 + M1-10 3 + M1-1 重复实现回收 3**（生成物 `test/capture/baseline.json` 不计入）。**拆前单条 = 10 + 3 + 3 = 16 > 10 文件阈值**，按 §5「超阈值时必须拆分」的要求拆为 3 条（随后同批更新三处计数），各自 ≤ 10（M1-2 10 / M1-9 3 / M1-10 3）；回收 3 属顺带关闭 M1-1 F5，不计入拆分判据。计数口径：`git status --porcelain` 排除生成物 `test/capture/baseline.json` 与治理 / 规划载体后的文件清单，M1-2 的 10 个文件名见登记记录 §1。编号采用[规划规范 §4](../../standards/planning.md) 的尾号追加惯例（原 M3-2 拆为 M3-2 + M3-5），取 **M1-2 / M1-9 / M1-10**，不重编既有 M1-3 ~ M1-8——`check-stage-counts` 的条目行正则只接受 `M<数字>-<数字>`，字母后缀（`M1-2a`）会漏计且与既有惯例不一致。表内顺序保持「拆分产物紧随原条目」，编号非单调是拆分痕迹而非缺号。

## 2. 决策

1. **默认开启**：四个触发面都是 icon-only（没有可见文本），正是「纯图标时展示」的目标场景；`tooltip: false` 可关闭。无内容时（未显式给内容且无可访问名）不挂载任何接线，DOM 与改造前一致。
2. **内容优先级**：字符串 / `{ content }` > 透传原生 `title` > `label` / 透传 `aria-label`。启用提示后接管原生 `title`（不再落 DOM），避免系统提示与内建提示双显；显式 `tooltip: false` 时 `title` 仍照常透传。
3. **`IconTooltipProp` 不含 `mode`**：icon-only 触发器没有可溢出文本，「有内容即显示」是唯一合理语义。若沿用 `TooltipProp`，`{ mode: 'auto' }` 会被静默忽略——同一 prop 名在 Button 与图标触发器上语义不一致，故用独立类型收窄（`boolean | string | { content?: string }`），并在 TSDoc 写明。
4. **Paginator 只接受 `boolean`**：四个按钮各有自己的可访问名，单一字符串 / 对象无法按按钮区分，故不支持内容覆盖；文档与验收口径按此写明。
5. **禁用态边界**：第 1 页的「首页 / 上一页」是原生 `disabled` 按钮——真实 Chromium 仍会派发 `pointerenter` / `pointermove`（悬停可见提示），但聚焦路径不成立；单测因此在 `page: 2` 下断言四个按钮。弱化到「disabled 按钮 hover 可见」不写入断言，作为已接受边界。
6. **读屏重复朗读**：内容由可访问名派生时，`aria-describedby` 会指向同一段文字（如「更多操作，更多操作」）。与 M1-1 的 Button 行为一致，保留现状并在此登记；需要区分时用字符串 / `{ content }` 提供补充说明。
7. **基线重冻结（`capture:styles`）**：SplitButton 下拉触发器的 attribute dump 新增 `data-grace-area-trigger`（Reka 提示触发器的既有契约），并因「Esc 关闭菜单后焦点回到触发器、提示随之打开」在 `.closed` 采样里出现 `aria-describedby`。该焦点行为是键盘用户的预期路径，予以接受；基线于 2026-11-15 重冻结（Chromium 158.0.8127.18），复跑 0 差异。
8. **F3（`watchEffect` 告警去重）已评估**：本批即「改动 Tooltip 接入面」，评估结论 = 暂不处理。现行为每个组件实例在依赖变化时最多各告警一次，未观察到刷屏；去重需要为每个实例维护告警组合键，收益不足。消费者反馈噪声后再执行。
9. **F5 已关闭**：`Passthrough` 抽到 `components/_shared/passthrough.ts`，Button / Tooltip / TooltipText / IconTooltip 四处共用（第 4 处消费出现时抽取的触发条件已满足）。

## 3. 验证

| 面 | 结果 |
|:---|:---|
| `pnpm verify` | exit 0（全链） |
| 真实 Chromium | Toolbar 按钮 / 链接悬停显示对应文案；斜体按钮的原生 `title` 被接管（DOM 无 title、内容为 title 值）；Paginator 首页 / 上一页显示对应文案；SplitButton 下拉按钮显示「更多操作」，主按钮无面板；各按钮 `aria-label` 与改造前一致 |
| 单测 | Toolbar 新增 7 例（含 `aria-label` 单传、`false` 关闭、字符串覆盖、`title` 接管）、Paginator 新增 3 例（默认开启 / 自定义文案 / 关闭）、SplitButton 新增 5 例（默认 / `menuLabel` / 字符串 / `false` / 主按钮不挂载）；全量 3261 passed |
| `capture:styles` | 重冻结后 0 差异（399 项） |
| 视觉回归 | 42 passed（0 diff） |
| E2E | `paginator-sizing` / `component-alignment` / `menu-navigation` 42 passed |

## 4. Review Gate

- **R1（`standard`，A / B 两分区并发）**：A `Pass`（0 blocker；4 warning：基线漂移声明不完整、Paginator 禁用态断言不可达、`TooltipProp.mode` 被忽略、交接缺 build 证据；4 suggest）；B `Reject`（1 blocker：登记记录对 M1-2 文件面给出互斥计数、「各 ≤6 文件」不成立；4 warning：F5 未声明、成员表与类型注释不一致、M1-9「同一契约」与 `boolean` 不符、F3 评估缺席）。
- **R1 修复**：文件面改为可对账表述并删去「各 ≤6」（该轮的 18 = 8 + 3 + 3 + 1 + 3 口径已被 R3 的 **19 = 10 + 3 + 3 + 3** 取代）；成员表补齐内容优先级与「未显式给内容」限定；M1-9 标注仅 `boolean`；F5 关闭与 F3 评估写入 §2 / 登记记录；`TooltipProp` 收窄为 `IconTooltipProp`；Paginator 用例改 `page: 2` 并登记禁用态边界；补 `aria-label` 单传用例；解析工具内置字符串归一（回收两处 `nonEmpty`）。
- **R2（`quick`，两分区修复点）**：A 分区 `Pass`（W1 ~ W4 / S1 ~ S4 关闭；新 3 条 follow-up：Toolbar 成员表补「无 `mode`」、结构性赋值可绕过收窄、基线日期为 UTC）；B 分区 `Reject`（1 blocker，复发：文件面口径为 18 而仓库实测 20 / M1-2 10 > 「≤8」；另 3 条 warning：索引遗留条数、§4 占位、todo 状态待回填）。
- **R3（`quick`，B 分区 blocker 修复点）**：`Reject`（2 blocker）——批次记录 §1.1 仍是旧口径 18（`……` 占位不可对账）；索引摘要「4 条 / 承接 2 条」与 §5 的 6 个编号（承接 3 条）不符。两项已于 R4 前修复。
- **R4（`quick`，B 分区两项修复点）**：`Pass`（0 blocker）；同轮 follow-up：§1.1 的引文措辞与「10 + 3 回收」歧义、M1-9 / M1-10 未逐名列出、`todo.md` 状态与 §4 回填——前两项与第 3 项均并入 F9，状态回填在批次收尾提交完成。

## 5. 遗留

| 编号 | 内容 | 落点 |
|:---|:---|:---|
| F1 / F2（承 M1-1） | 真实布局持久守卫、组件页「须保留可测量盒」补写 | M1-6 / M4-1、M1-8 |
| F6（承 M1-1） | 示例缺 `mode: 'auto'` 可复制片段 | M1-8 |
| F7 | 禁用态图标按钮的 hover 提示只做了源码级确认（Chromium 探针），未写常驻 E2E | 并入 F1 的真实布局 E2E 批次 |
| F8 | 读屏重复朗读（内容 = 可访问名）为已接受取舍；若要收敛，需在触发器层过滤同文描述 | 出现下游可访问性反馈时再评估 |
| F9 | 文件面计数须附产生该数字的文件清单（本轮 B 分区连续两轮因口径与事实不一致否决） | 下一批规划载体更新起执行；如需机检，登记 Backlog 后单独实施 |

## 6. 复查基线

本记录 §1 ~ §5；`src/components/tooltip/icon-tooltip.vue`、`src/components/tooltip/resolve-icon-tooltip.ts`、`src/components/_shared/passthrough.ts`、三个组件的源码与单测；`docs/components/toolbar.md` 中英；`docs/design/governance/2026-11-14-phase34-registration.md` §1 / §2 / §4。
