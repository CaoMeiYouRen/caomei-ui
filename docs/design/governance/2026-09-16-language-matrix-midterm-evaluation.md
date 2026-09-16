# 2026-09-16 语言矩阵 - 中期评估记录（zh-TW / ja-JP / ko-KR）

> 状态：评估记录（2026-09-16）；**未登记 [todo](../../plan/todo.md) / [roadmap](../../plan/roadmap.md)**（按 [规划规范 §3](../../standards/planning.md)，须经用户决策后才登记为阶段条目）。
>
> 关联：[Backlog §1.4](../../plan/backlog.md) ｜ [规划规范](../../standards/planning.md) ｜ [内建文案与语言](../../components/locale.md) ｜ [Phase 9 收口与遗留清单](./2026-09-16-phase9-closure.md)

## 1. 背景与依据

- 用户决策（2026-09-16）：下一阶段优先方向为「**语言矩阵 - 中期**」——追加 zh-TW / ja-JP / ko-KR；依据是**下游 momei 为国际化项目，组件至少需支持其对应语言**。
- 现状机制已在 Phase 7 第一阶段 M2 落地（`CaomeiConfigProvider` / `provideLocale` + `useLocale`），但**库内仅承载 zh-CN / en-US 两份文案**，其余语种由下游注入承担。

## 2. 现状调研（2026-09-16 快照）

| 维度 | 现状 | 取证口径（2026-09-16） |
| --- | --- | --- |
| 文案载体 | `src/locale/{zh-cn,en-us}.ts` + `types.ts` + `index.ts` | `ls src/locale/` |
| 命名空间 / 文案条数 | **22 个命名空间 / 59 条文案**（中英各 59，结构对称） | `rg -o "^\s+[a-zA-Z]+: '[^']*'" src/locale/zh-cn.ts \| wc -l` → 59；`rg -c '^    [a-zA-Z]+: \{' src/locale/zh-cn.ts` → 22 |
| 消费面 | **25 个 `.vue` 文件 / 23 个组件目录**调用 `useLocale` | `rg -l 'useLocale' src/components --glob '*.vue' \| wc -l` → 25；同上按目录去重 → 23 |
| 注册与类型 | `caomeiLocales` 仅注册 `zh-CN` / `en-US`；`CaomeiLocale = keyof typeof caomeiLocales` | `src/locale/index.ts:7-12` |
| 注入机制 | `provideLocale` 按命名空间浅合并覆盖；下游可注入任意语言 | `src/composables/use-locale.ts` |
| 基准回退语义 | `resolveLocaleMessages` 按「注册表成员资格」选基准文案（未注册语种落 `zh-CN` 默认文案） | `src/composables/use-locale.ts:66-68` |
| 测试耦合 | `use-locale.test.ts:40` 以 `'ja-JP'` 作为「未知语言回退」用例（纳入三语后失效） | `rg -n "ja-JP" src` |
| 文档侧现状陈述 | `docs/components/locale.md` 与 en 镜像各含 13 处 `zh-CN` / `en-US` 语种表述（含 `CaomeiLocale` 表、momei 示例的基准映射、注释「仅 zh-CN / en-US 内建」）；`README.md:150` 与 `docs/standards/development.md:27` 的目录树均注明「组件内建文案（zh-CN / en-US）」 | `rg -c 'zh-CN.*en-US\|ja-JP\|ko-KR' docs/components/locale.md docs/i18n/en-US/components/locale.md` → 13 / 13；`rg -n '组件内建文案（zh-CN / en-US）' docs README.md` → 2 处 |
| 下游 momei | 5 语：`AppLocaleCode = 'zh-CN' \| 'en-US' \| 'zh-TW' \| 'ko-KR' \| 'ja-JP'`，含 locale registry（`fallbackChain` / `routePrefix`，五语均 `readiness: 'seo-ready'`） | `momei/i18n/config/locale-registry.ts:4` |

**关键事实**：
1. momei 的 5 语覆盖与本次目标语种**完全一致**，且其应用级文案（`i18n/locales/{ja-JP,ko-KR,zh-TW}/` 各 26 文件）已就绪；缺口**仅在组件级 59 条**。
2. momei 应用级文案为页面 / 表单键（如 `components.json` 的 search / header / footer 键），与组件库 22 个命名空间**不重叠**，故不能直接复用；但其译法（如 `キャンセル` / `クリア` / `読み込み中`）可作**术语一致性参照**。

## 3. 方案选项

| 方案 | 内容 | 成本 | 结果 |
| --- | --- | --- | --- |
| **A（推荐）库内建 5 语** | 新增 zh-TW / ja-JP / ko-KR 三份完整文案（各 59 条），扩展 `CaomeiLocale` 与注册表 | 177 条新文案 + 注册 / 类型 / 测试 / 文档同步 | 组件开箱即用支持 5 语；下游仍可用 `messages` 覆盖 |
| B 保持下游注入（现状） | 机制不变，三语由每个下游自行翻译 | 零库内改动 | momei 需自译 59 条 × 3 语；组件级文案在非中英页面露出源语言 |
| C 折中 | 只内建「用户可见文案」（空态 / 分页 / 按钮），aria-only 文案交下游 | 约 60% 的 A | a11y 文案在非中英页面仍为源语言，无障碍体验不一致 |
| D 渐进 | 先只内建 `zh-TW`（与 zh-CN 同源，替换成本最低），验证机制后再扩 ja / ko | 约 1/3 的 A | 分两轮交付；对 ja / ko 下游的缺口延后解决 |
| E 按需形态 | 三语不以静态方式并入 `caomeiLocales`，改子路径 / 懒注册 | 需要注册治理（与 Backlog §1.4「locale 组织与注册治理」合并） | 不使全部消费者承担三语体积；但复杂度上升、与现有 `CaomeiLocale` 类型模型冲突 |

**推荐 A**，理由：
1. 与用户要求一致（「组件至少要支持对应的语言」），且 momei 目标语种与本次范围完全相同；
2. 59 条 / 语种规模可控（三语合计 177 条），远小于应用级文案量；
3. 当前**唯一**国际化下游为 momei；库内建可免其单独维护组件级文案，并对其余下游（afdian-linker / caomei-auth / rss-impact-next 等）向前兼容；
4. 机制不变，下游仍可按命名空间覆盖，向后兼容（类型层面为加法兼容，见 §6）。

## 4. 建议范围与条目拆分（3 条，按「可独立提交」排序）

1. **三语文案文件**（纯新增）：`src/locale/zh-tw.ts` / `ja-jp.ts` / `ko-kr.ts`（各 59 条，结构对齐 `CaomeiLocaleMessages`）。本条目不修改注册表，故可独立编译与提交。
2. **注册与类型扩展 + 测试调整**：`src/locale/index.ts` 的 `caomeiLocales` 增补三语（`CaomeiLocale` 随之扩展）；`use-locale.test.ts` 的「未知语言回退」用例由 `'ja-JP'` 改为未注册语种（如 `'fr-FR'`），并补「新语种可解析」断言。
3. **文档同步**：`docs/components/locale.md` 与 `docs/i18n/en-US/components/locale.md`（各 13 处语种表述：`CaomeiLocale` 表、基准回退说明、momei 示例的映射、注释）；`README.md:150` 与 `docs/standards/development.md:27` 的目录树说明。

> **非目标**：文档站新增 zh-TW / ja-JP / ko-KR 三语页面（站点翻译属独立决策）；RTL；语言矩阵 - 长期（俄 / 法 / 德 / 西 / 葡）。

## 5. 规模估算

| 项 | 估算 |
| --- | --- |
| 新增文案 | 3 文件 × 59 条 ≈ 327 行（与 `zh-cn.ts` 109 行/文件对齐） |
| 改动文件 | 3（新增文案）+ 1（`index.ts`）+ 1（`use-locale.test.ts`）+ 4（`locale.md` 中英 + `README.md` + `development.md`）= **9 文件** |
| 代码行数 | 约 360 行新增（文案为主，逻辑改动极小） |
| **包体影响（未量化，需注意）** | 当前 locale 为静态全量导入；新增三语对**不使用**这三语的消费者是**净增体积**。可选缓解：与 Backlog §1.4「locale 组织与注册治理（按需加载）」一并决策 |

> 单条目均在 10 文件 / 800 行阈值内。`README.md` 当前 194 行、`docs:check:line-count` warn 阈值 200，文档同步新增说明仅约 6 行余量。

## 6. 风险登记

| 风险 | 等级 | 对策 |
| --- | --- | --- |
| **翻译质量**（专业术语与 aria 文案误译影响 a11y） | 中 | 明确翻译来源与校对要求（见 §7 决策 2）；术语对齐 momei 既有译法 |
| **基准语言回退语义变化**：纳入三语后，`resolveLocaleMessages` 对这三个语种的**基准文案**由默认的 `zh-CN` 变为新内建语种，未覆盖键的回退来源随之改变；文档现行示例（把 `ja-JP` / `ko-KR` 基准映射到 `en-US`）将失效 | 中 | 条目 3 同步改写文档示例；在 locale 指南写明「内建语种的基准即自身，覆盖仍按命名空间浅合并」 |
| **维护成本**：每次新增组件文案需 ×5 语同步 | 中 | 在 locale 指南登记「新增文案须同步全部内建语种」；建议补「各语种键集合一致」的单测（见 §7 决策 4） |
| 测试用例耦合：`ja-JP` 当前是「未知语言」样例 | 低 | 随条目 2 调整（改用未注册语种）并补新语种解析断言 |
| 类型扩展 | 低 | `CaomeiLocale` 为 `keyof typeof caomeiLocales`，属**加法兼容**（跨字面量断言不报错，已实证）；下游按该类型传参处的合法集合变宽 |
| 文档站是否需要同步三语 | 低 | 已列为非目标；若后续需要，另行评估（涉及站点 IA 与 `routingPages`） |

## 7. 待用户决策项

1. **方案选择**：A（库内建 5 语，推荐）/ B（保持下游注入）/ C（折中）/ D（渐进，先 zh-TW）/ E（按需形态）。
2. **翻译来源与质量要求**：① 人工翻译；② 机器翻译 + 人工校对；③ 机器翻译并标注状态（若选 ③，需指定「标注落到何处」——建议在 locale 指南或本评估的后续记录中说明，仓库现无「翻译待校对」的既有约定）。
3. **条目拆分粒度**：三语文案作为一个原子条目，还是按语种拆三个提交。
4. **是否补一致性检查**：新增「各语种键集合一致」的单测或脚本守卫（防漏译 / 错键）。
5. **是否同步评估包体影响**：若在意三语静态体积，可在本阶段一并决策「按需加载」（与 Backlog §1.4 注册治理合并）。

> 说明：文案语种标识默认沿用现有命名（`zh-cn.ts` / `en-us.ts` 的 BCP 47 小写形式，即 `zh-tw.ts` / `ja-jp.ts` / `ko-kr.ts`），无需单独决策；如需改 `zh-TW` 形式请一并指出。
