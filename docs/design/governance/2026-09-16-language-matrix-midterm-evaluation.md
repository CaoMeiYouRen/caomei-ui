# 2026-09-16 语言矩阵 - 中期评估记录（zh-TW / ja-JP / ko-KR）

> 状态：评估记录（2026-09-16）；**已获用户决策并登记为 [Phase 10](../../plan/todo.md) M1（2026-09-16 授权启动）**。决策记录见 §9，包体评估见 §8。
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

> 登记说明：本节 3 条为逻辑拆分，登记到 [Phase 10](../../plan/todo.md) 时按提交粒度细分为 5 条（三语文案各一条 + 注册与守卫一条 + 文档一条）。

> **非目标**：文档站新增 zh-TW / ja-JP / ko-KR 三语页面（站点翻译属独立决策）；RTL；语言矩阵 - 长期（俄 / 法 / 德 / 西 / 葡）。

## 5. 规模估算

| 项 | 估算 |
| --- | --- |
| 新增文案 | 3 文件 × 59 条 ≈ 327 行（与 `zh-cn.ts` 109 行/文件对齐） |
| 改动文件 | 3（新增文案）+ 1（`index.ts`）+ 1（`use-locale.test.ts`）+ 4（`locale.md` 中英 + `README.md` + `development.md`）= **9 文件** |
| 代码行数 | 约 360 行新增（文案为主，逻辑改动极小） |
| **包体影响（已实测）** | 见 §8；结论：增量可接受，不引入按需加载 |

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
2. **翻译来源与质量要求**：① 人工翻译；② 机器翻译 + 人工校对；③ 机器翻译并标注状态（若选 ③，需指定「标注落到何处」——建议在 locale 指南或本评估的后续记录中说明，仓库现无「翻译待校对」的既有约定）。**（已决策，见 §9：取「AI 生成 + 用户复核」，标注与落点按 §9 落实）**
3. **条目拆分粒度**：三语文案作为一个原子条目，还是按语种拆三个提交。
4. **是否补一致性检查**：新增「各语种键集合一致」的单测或脚本守卫（防漏译 / 错键）。
5. **是否同步评估包体影响**：若在意三语静态体积，可在本阶段一并决策「按需加载」（与 Backlog §1.4 注册治理合并）。

> 说明：文案语种标识默认沿用现有命名（`zh-cn.ts` / `en-us.ts` 的 BCP 47 小写形式，即 `zh-tw.ts` / `ja-jp.ts` / `ko-kr.ts`），无需单独决策；如需改 `zh-TW` 形式请一并指出。

## 8. 包体影响评估（用户决策 5 要求，2026-09-16 实测）

> **口径约定**：本表体积一律为**字节数**（`Buffer.byteLength` / `zlib.gzipSync`）；`String.length` 统计的是 UTF-16 字符数，含 CJK 时会显著偏小（本次实测 `dist/index.js` 字符数 226,799 对字节数 233,553，偏差 3%），引用数字时须注明测量口径。

| 指标 | 实测值 | 取证口径（`pnpm build` 后） |
| --- | --- | --- |
| 产物体积 | `dist/index.js` **233,553 B**（原始）/ **49,342 B**（gzip） | `node -e "const b=require('fs').readFileSync('dist/index.js');console.log(b.length, require('zlib').gzipSync(b).length)"` |
| locale 两语体积 | **3,451 B = 产物的 1.5%**（zh-cn 1,701 B / en-us 1,750 B） | 按产物内 `//#region src/locale/<file>` 区块裁剪后按字节统计 |
| 新增三语体积 | **≈ 5,177 B**（单语均值 1,726 B × 3），相对增幅 **+2.2%** | 同上推算 |
| 新增三语 gzip 增量 | **≈ 1.3–1.6 KB（+2.6%~3.2%）**；另计「单语孤立 gzip × 3 = 2,682 B」为**保守上界** | 实测边际（从完整产物移除单语：en-US −420 B、zh-CN −522 B、两语 −1,188 B；合成插入三语 +921 B）区间取值 |
| tree-shaking 行为 | **部分可摇除**，分两种情形：① **基准语 zh-CN 对全部消费者无条件进入产物**（`useLocale` 的 `fallbackLocale` → `defaultLocaleMessages`）；② **注册表内其余语种仅在消费者走 `provideLocale` / `<CaomeiConfigProvider>` 路径时进入**（`resolveLocaleMessages` 读 `caomeiLocales`），且进入后不可再按语种摇除 | `src/composables/use-locale.ts:32/66-68/94`；生产代码中的注册表引用点（`rg -n 'caomeiLocales' src --glob '!**/*.test.ts'`）为 `locale/index.ts:7`（定义）/ `:12`（类型）/ `use-locale.ts:11`（导入）/ `:66-67`（消费）——**其中消费点仅 `use-locale.ts:66-67`**；测试文件另有 59 处直接消费（非发布面）。摇除行为经消费者级实测确认（Rollup + 不触 locale 路径的入口 → 其余语种被摇除；经 `provideLocale` 的入口 → 全部语种保留）；包裹 `export * from './locale'`（`src/index.ts:53`）不改变上述依赖图 |

**结论：包体影响可接受，不引入按需加载（方案 E 不采纳）。** 依据：
1. 增量绝对值小：未使用 provider 的消费者**零成本**（仅基准语 zh-CN 进入）；使用 provider 者增量约 1.3–1.6 KB gzip（相对 49,342 B gzip 约 +2.6%~3.2%）；
2. 按需加载需重构 `CaomeiLocale` 类型模型与注册机制（Backlog §1.4 的独立候选），复杂度与收益不成比例；
3. locale 在产物中仅占 1.5%，三语落地后约 2.2%。

**后续触发条件（与体积无关的判据，避免口径混算）**：当**注册语种数达到 8 个及以上**，或**新增语种使 locale 区块占产物原始体积超过 5%** 时，重新评估按需加载（与 Backlog §1.4 注册治理合并决策）。按当前边际（约 0.42–0.52 KB gzip / 语），语言矩阵 - 长期（+5~9 语）预计增量约 2.1–4.7 KB gzip。

## 9. 用户决策记录（2026-09-16）

| 决策项 | 结论 |
| --- | --- |
| 方案选择 | **A：库内建 5 语**（新增 zh-TW / ja-JP / ko-KR 三份完整文案） |
| 翻译来源与质量要求 | **AI（模型）基于 zh-CN 生成译文 + 用户复核**（属「机器翻译 + 人工校对」的具体化）——复核由用户执行；复核前译文须显式标注「待复核」，且该标注在复核完成后由复核者移除（2026-09-16 细化） |
| 条目拆分粒度 | **按语种拆三个提交**（zh-TW / ja-JP / ko-KR 各一个） |
| 一致性检查 | **补审查与脚本**，以**简体中文（zh-CN）为基准**比对各语种键集合。其中「脚本」指 CI 可执行的守卫（键集合比对，缺键 / 多键即失败）；「审查」指新增语种 PR 的人工评审要点。**责任边界**：PR 审查只覆盖键集合、结构与术语引用一致性；**译文质量以用户复核结论为准**（不在本阶段验收内） |
| 包体影响 | 已评估（§8）；结论为可接受，不引入按需加载 |
| 译文生成与复核流程 | 由 AI 基于 zh-CN 生成各语种译文；文件头部以注释标注「**AI 生成、待人工复核**」；守卫脚本只校验**键集合一致性**（不校验译文质量）；**复核已于 2026-09-17 完成，标注已移除**（结论见下方复核记录） |

### 9.1 译文复核记录（2026-09-17）

- **复核范围**：`src/locale/{zh-tw,ja-jp,ko-kr}.ts` 全部 22 命名空间 × 59 条（与 zh-CN 逐键对照；键集合 / 占位符 / 非空白值由 `pnpm check:locale-keys` 另行守卫）。
- **复核方式**：逐条对照 zh-CN 基准核对语义、术语与语言惯例（zh-TW 用台湾用语、ja-JP 用「です・ます」体技术文案惯例、ko-KR 用标准韩国语，含 `최솟값` / `최댓값` 拼写）；另核对与代码语义的一致性（如 `pagination.page` 的 `{page}` 占位符、`toast.viewport` 的 `{hotkey}` 形态）。
- **结论：三语均无明显错误**，标注移除、条目关闭。
- **复核中修正 2 处（zh-TW，措辞自然度，非错误）**：`autoComplete.empty` 由「無符合的建議」改为「**沒有符合的建議**」、`multiSelect.empty` 由「無符合的選項」改为「**沒有符合的選項**」（原文可读但偏机器直译）。
- **未改动项（记录为观察，不阻断）**：ja-JP `colorPicker.label: '色'` 与 `areaRole: 'カラーピッカー領域'` 属可接受的简省 / 意译；ko-KR `hue: '색조'` 与 `swatches: '프리셋 색상'` 符合韩国语色学术语惯例。
- **配套清理**：`scripts/governance/check-locale-keys.mjs` 的 docstring 不再绑定「待复核标注」这一已移除形态（保留「解析器只忽略 `//` 行注释」的约束说明）；Backlog 中「内建文案『待人工复核』标注机检」候选随标注移除而**作废并删除**（其守卫对象已不存在）。
- **验证**：`pnpm check:locale-keys` 通过；`pnpm test`（含 `use-locale.test.ts` 的三语解析断言）通过；`pnpm build` 产物无标注（标注已不存在于源码）。
- **前瞻**：若将来新增语种重新引入「待人工复核」一类标注，须重新登记对应机检候选（原候选已随本次标注移除而作废）。

> 依 [规划规范](../../standards/planning.md)，阶段范围须在**授权启动时**分配编号并登记条目。**本阶段已于 2026-09-16 授权启动并登记为 [Phase 10](../../plan/todo.md) M1**；实施条目与拆分见 §4（三语文案按语种拆为三个提交）。
