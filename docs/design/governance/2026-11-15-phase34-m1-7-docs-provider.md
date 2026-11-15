# Phase 34 M1-7：文档站 Provider、内建提示示例与原生 title 迁移

> 创建时间：2026-11-15
> 触发：用户「继续推进剩余待办」。范围与验收口径见 [Phase 34 登记批次](./2026-11-14-phase34-registration.md) §2 的 M1-7 行。

## 1. 交付面（8 文件）

| 面 | 文件 |
|:---|:---|
| 站点接入（1） | `docs/.vitepress/theme/layout.vue`（根部放置 `CaomeiTooltipProvider`） |
| 示例（2） | `docs/examples/tooltip/built-in.vue` / `docs/i18n/en-US/examples/tooltip/built-in.vue`（Toolbar / Paginator / SplitButton / Dialog·Drawer 关闭） |
| 组件页（2） | `docs/components/tooltip.md` / `docs/i18n/en-US/components/tooltip.md`（「组件内建提示」表 + 「从原生 `title` 迁移」） |
| 能力清单（1） | `docs/design/components.md`（Tooltip 行补内建提示标注） |
| 可访问名断言（2） | `scripts/docs/check-docs-axe.mjs`（页面矩阵 +2，脚本头同步 7 页）+ `docs/design/documentation-site.md` §17（矩阵 5 → 7 页） |

治理索引、记录本体与规划状态位属登记 / 留痕，不计入上表。**本阶段没有为每个触发面各开新 prop**（Button / Toolbar / Paginator / SplitButton 沿用各自既有的 `tooltip` 开关，其余面经根部 Provider 关闭）；组件页不宣称新增 API。

## 2. 决策

1. **Provider 放最外层（`ConfigProvider` 之内）**：文档站所有页面共享同一份提示配置，从而真正验证「跨触发器免延迟」这条 M1-1 的收益。内建兜底仍保留（下游未放 Provider 时不报错），文档两处口径一致。
2. **示例只演示默认开启的面**：Button 的 `tooltip` 是显式开启、且 [Button 组件页](../../components/button.md) 已有示例，本页不重复；新增示例覆盖 Toolbar / Paginator / SplitButton / Dialog / Drawer 五个默认开启的触发面，并说明「主按钮不挂提示」「打开面板不自动弹提示」两条行为。
3. **迁移说明只指向真正接管 `title` 的组件**：`CaomeiButton`（`tooltip` 开启时）与 `CaomeiToolbarButton` / `CaomeiToolbarLink`（默认开启）；Paginator / SplitButton 下拉 / Dialog / Drawer 关闭按钮内容固定取可访问名，不读取也不吞掉 `title`。下游四种现状（保留系统提示 / 改用内建 / 换文案 / 全局关闭）逐条给做法。
4. **组件页按「触发面 × 默认 × 内容来源 × 关闭方式」成表**：把 M1-1 ~ M1-6 的内建提示面收在一处；长文本面注明「仅截断时显示」与「指针路径（文本盒不可聚焦）」，DataTable 注明「只有绝对长度列宽才截断」及其三条口径（白名单单位、视口单位排除、可排序表头未扣图标宽度）——F15 的关闭条件由此推进，但 DataTable 组件页（M1-8）尚未同步，故 F15 仍留在册。
5. **可访问名断言落成可执行退出码**：axe 页面矩阵新增 `/components/tooltip` 中英两页，规则 `button-name` 下界取实测值（28 个适用节点，含示例里 `show-edges` 的首页 / 末页两键），把「示例可访问名」从人工抽检变成 `docs:check:axe` 的一份报告；§17 与脚本头注释同批把「5 页」改为「7 页」。
6. **能力清单只改说明、不改行成员**：`docs/design/components.md` 的 Tooltip 行补「库内内建提示」标注，`check:design-catalog` 仍是 27 行 / 56 成员。

## 3. 验证

| 面 | 结果 |
|:---|:---|
| `docs:build` | 通过（64s，无死链） |
| `docs:check` | 全链通过（integrity / links / structure / config-links / i18n-parity / version / interpolation / example-refs / showcase / demo-external-images / line-count / i18n） |
| `docs:check:axe`（新增两页） | `/components/tooltip` 与 `/en-US/components/tooltip` 均零违规：`button-name` 适用 28（通过 28 / 违规 0），`scrollable-region-focusable` 适用 2 |
| `typecheck:docs` / `lint` | 均 exit 0（`docs/tsconfig.json` 覆盖两个新增示例；`eslint --max-warnings 0` 全仓通过） |
| `check:design-catalog` | 通过（27 行 / 56 成员） |
| 真实浏览器 | 预览构建产物：工具条图标按钮悬停给出「加粗」，页面段落、示例与表格渲染正常（截图 `m1-7-tooltip-page.png`，一次性产物） |
| `pnpm verify` | exit 0（最终 revision；新文件已 `git add`，`docs:check:integrity` 的受检面覆盖到位） |

## 4. Review Gate

- **R1（`standard`，A 实现 / B 记录两分区并发）**：A `Reject`（4 blocker：`tooltip="false"` 是字符串而非布尔（Toolbar / SplitButton 会把 `false` 当提示文案、Paginator 的布尔转换不认它）；迁移表「什么都不用改」对 Button 不成立（默认关闭）；开篇「不新增公开 prop / 内容一律取可访问名 / 只有图标面默认开启」与同页表格及既有组件页矛盾；缺 `typecheck:docs` / `lint` 证据。3 warning：示例声称四个翻页按钮但 `showEdges` 默认关只渲染两个；axe 脚本头仍写 5 页；全局关闭不恢复已被接管的 `title`）。B `Reject`（2 blocker：F4 记为已落地但三个 guide 文件零改动；F15 关闭条件未满足（DataTable 页无口径即销账）。3 warning：脚本头页数、`text-bearing` 的 `title` 断言过宽、integrity 未覆盖未跟踪新文件）。
- **R1 修复**：① 关闭方式统一改 `:tooltip="false"`（中英 6 处 + 示例提示文案）；② 迁移表按 Toolbar / Button 拆行，首句限定「按钮类」，并补「全局关闭不恢复已被接管的 `title`」；③ 开篇改为「本阶段没有为每个触发面各开新 prop，Button / Toolbar / Paginator / SplitButton 沿用既有 `tooltip`」，并点明 Button 默认关闭是唯一例外；④ 示例补 `show-edges`，axe 下界按复测改 28（23 → 28），脚本头与 §17 同批改 7 页；⑤ §1 排除句补「规划状态位」，F4 恢复在册（落点改为 M1-8：四个 guide 文件中英，并入后 8 + 4 = 12 文件须按规划规范 §5 执行期再拆）、F15 改为「部分收敛」（余项承接 M1-8），索引摘要同步；⑥ 补 `typecheck:docs` / `lint:check` / `pnpm verify` exit 0 证据，并把新文件 `git add` 后复跑（integrity 覆盖到位）。
- **R2（`quick`，两分区修复点）**：A `Pass`（B1 ~ B4 / W1 ~ W3 关闭；3 条 follow-up：开篇「只有图标」未覆盖长文本面、示例标题「四个翻页按钮」与实际按钮数不符、提示文案里的行内代码未包 `<code>`——均已在本轮收口）。B `Reject`（1 blocker：F4 的落点文件集合少 `docs/i18n/en-US/guide/primevue-migration.md`，实为四个；另 warning：F4「后续文档批次」在规划载体里查不到、§4 R2 行待回填）→ 已按四点修正并把落点改为 M1-8（附 `grep` 取面命令与 12 文件的拆分口径）。
- **R3（`quick`，B 分区单点复核）**：`Pass`（B1 关闭：四个文件与 `grep -rn` 取面命令实测 exit 0、落点 M1-8 可查、12 文件拆分口径成立；§4 台账如实；0 blocker）。两条 warning 已在本轮收口：取面命令补 `-r`、R3 行回填。

## 5. 遗留

| 编号 | 内容 | 落点 |
|:---|:---|:---|
| F1 / F2 / F4 / F6 | 承接 M1-1 | F1 / F2 / F6 → M4-1、M1-8；**F4**（Provider 措辞统一：`docs/guide/upgrade-to-1.0.md` / `docs/i18n/en-US/guide/upgrade-to-1.0.md` / `docs/guide/primevue-migration.md` / `docs/i18n/en-US/guide/primevue-migration.md` **四个文件**，取面命令 `grep -rn "TooltipProvider" docs/guide docs/i18n/en-US/guide`）→ **M1-8**（与四组件页同批；并入后 8 + 4 = 12 文件，须按[规划规范 §5](../../standards/planning.md) 执行期再拆，不自带新条目） |
| F7 ~ F9 | 承接 M1-2 | 见 M1-2 记录遗留节 |
| F10 / F11 | 承接 M1-3（F12 已收敛） | 见 M1-3 记录遗留节 |
| F14 | 承接 M1-5：验证表计数须与逐点清单求和一致 | 见 M1-5 记录遗留节 |
| F15 | 承接 M1-6：DataTable 仅绝对长度列宽截断 | **部分收敛**：白名单单位 / 百分比 / 未设列宽已写入本批组件页；视口单位枚举与「可排序表头未扣图标宽度」尚未写进 DataTable 组件页 → 余项承接 M1-8 |
| F16 / F17 | 承接 M1-6：Menu 槽包裹约束 / 大表逐格接线开销 | 见 M1-6 记录遗留节（F16 的组件页约束由 M1-8 落实） |

## 6. 复查基线

本记录 §1 ~ §5；`layout.vue` 的 Provider 位置；中英组件页的两个新章节与示例；`check-docs-axe.mjs` 的 `PAGES` 新增两行；`documentation-site.md` §17；`components.md` 的 Tooltip 行。
