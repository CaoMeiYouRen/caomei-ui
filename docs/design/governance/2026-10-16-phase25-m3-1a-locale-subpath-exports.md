# Phase 25 M3-1a：locale 按语言子路径导出（包形态）

> 阶段 / 条目：Phase 25 **M3-1a**（国际化深化一期——包形态：locale 按语言子路径导出）。
> 依据：[locale 分包方案设计](./2026-10-16-phase25-m3-1-package-split-design.md) §3（契约）/ §5（执行顺序：步骤 1 ~ 6）/ §6（用户 2026-10-16 裁定的冻结面）。
> 范围：**只做包形态**（注册表预注册收敛 + 子路径 + 守卫 + 文档 + 体积对照），**不含一期新增 5 语**（属 M3-1b）。

## 1. 交付与验收对照

| 验收标准（[登记记录](./2026-10-16-phase25-registration.md) §2 + 设计 §5） | 交付 | 证据 |
|:---|:---|:---|
| 子路径产物与 d.ts 形态经 PoC 验证 | tsdown 多入口 + `exports` 子路径；PoC 先验单门语言 | §3 |
| `exports` / `check:build`（含子路径下界与负向对照）通过 | `check-build` 增「子路径数量下界 + 默认导出 + 注册表不得静态引入按需语言」三条断言 | §4 / §5 |
| `locale.md` 中英双页有「按需引入」章节与示例 | 中文页 + 英文镜像各新增「按需引入语言 / On-demand locales」章节（含同步 / 异步 / Nuxt 插件三种写法与时序约束） | 提交范围 |
| 体积前后对照实测留痕（含「非 provider 消费方零变化」对照） | 4 组对照实测，含零变化对照组 | §5 |
| 破坏性形态变更披露 | `version-policy` + `release.md §9` + `architecture.md 导出面` | §6 |

## 2. 形态契约（落点）

| 面 | 落点 | 说明 |
|:---|:---|:---|
| 显式联合 | `src/locale/index.ts` 的 `CaomeiLocale` | 改为**显式字面量联合**（不再由 `keyof typeof caomeiLocales` 派生）；当前 5 语（一期 5 语由 M3-1b 并入） |
| 预注册集合 | `PRE_REGISTERED_LOCALES = ['zh-CN', 'en-US'] as const` | **单一事实源**：守卫与测试引用它，不抄写清单 |
| 注册表 | `caomeiLocales: Partial<Record<CaomeiLocale, CaomeiLocaleMessages>>` | 语义由「内置全量」改为「**已注册表**」；初值 = 预注册集合 |
| 注册 API | `registerLocale(code, messages)` | 幂等；**须先于 provider**（文档 + 单测覆盖该时序） |
| 回退与告警 | `resolveLocaleCode` | 未注册 ⇒ 回落 `zh-CN` + **非生产环境一条可操作告警**（含子路径与注册写法；`provideLocale` 只解析一次语言标识，故双消费者也只告警一次）；原型链键仍被拒。**措辞口径**：告警代码在浏览器生产包中**仍会保留**（`globalThis.process` 不可静态替换），故不称「开发期告警」 |
| 子路径 | `./locale/{zh-tw,ja-jp,ko-kr}` | 默认导出 = 该语言完整文案对象；带 `types` |
| 附带上游改动 | `src/_shared/dev-warn.ts` | `chart.vue` / `rich-text-editor.vue` 各有一份 `devWarn`，本轮出现第 3 处调用点 ⇒ 提取为共享工具（`warnDev`），避免三份复制 |

**未改动且已核对无影响**：`src/resolver/index.ts`（语言不是组件）、`src/nuxt/module.ts`（D4 ① 裁定不提供语言选项，文档给 Nuxt 插件示例）、`src/locale/types.ts`（文案结构不变）、样式面。

## 3. PoC 结论（步骤 1）

- 先只加 1 门语言（`locale/ja-jp`）的 `entry` + `exports` 子路径并构建：产出 `dist/locale/ja-jp.js`（默认导出形态不变）**与 `dist/locale/ja-jp.d.ts`**（165 B，`declare const jaJP: CaomeiLocaleMessages; export { jaJP as default }`）。
- 结论：**tsdown 多入口 + 子路径方案物理可行**，`.d.ts` 逐入口产出，无需额外 d.ts 入口或人工转写。
- 随后按同一形态登记其余 2 门语言（`zh-tw` / `ko-kr`）。

## 4. 守卫与测试（机检面）

| 面 | 动作 |
|:---|:---|
| `scripts/governance/check-locale-keys.mjs` | 规则 1 重写为**等值 + 双向**：① 注册表字面量键集合 **==** `PRE_REGISTERED_LOCALES`（仅下界会被静默归零）；② 联合 ↔ 语言文件一一对应（双向）；③ 非预注册成员须同时登记于 `package.json` `exports` 与 `tsdown.config.ts` 入口，且双向判悬空；④ **规则 2 ~ 4（命名空间 / 键 / 占位符）的遍历集合改为「联合的全部成员」**——按需语言退出注册表后仍逐条比对（否则键位守卫会从 5 语静默收窄到 2 语）；⑤ 受检面下界（`MIN_UNION_LOCALES` / `MIN_SUBPATH_LOCALES`） |
| `scripts/governance/check-locale-keys.test.mjs` | 夹具改写为新注册表形态（+ `package.json` / `tsdown.config.ts` 桩）；**用例 28 → 43**（逐点复算：`1eb562b^` = 28 → `8206b01` = 43；**批次① 未含本夹具改写**——该改写随批次② 落地。另注两点留痕：① 被撤销重建前的同内容提交 `3250806` 曾测得 39，该提交因钩子把未提交文件卷入而撤销重建，**不作为可达历史**；② 批次② 的提交信息写「24 → 43」为错值，**提交信息不可回改**，以本处复算值为准）。另含唯一性、注释入口、缺件响亮失败、下界钉定，新增负向对照：注册表多出预注册语种 / 预注册未登记 / 缺 `exports` 子路径 / 缺构建入口 / 悬空子路径 / 联合低于下界 / 子路径低于下界 / 按需语种仍逐条比对基准 / 导入文件与标识错配 / 构建入口键不同源 |
| `scripts/release/check-build.mjs` | 新增 `findLocaleSubpathProblems`（**五条不变量**）：① 子路径数量下界；② **导出目标与语言标识同源**（防「按 A 的路径拿到 B 的文案」）；③ 子路径产物存在且**带默认导出**；④ **注册表产物不得静态引入按需语言**（语句级匹配，注释示例不算；该断言是形态的核心承重面）；⑤ **无孤儿语言产物**。下界常量与子路径前缀**从治理守卫导入**（单点定义） |
| `scripts/release/check-build.test.mjs` | 用例 7 → **15**，负向对照覆盖：数量不足 / 缺默认导出 / 注册表静态引入（含 `export … from`、动态 `import()`、单引号形态）/ 产物缺失 / 目标不同源 / 注释示例不误红 / 孤儿产物 |
| `src/composables/use-locale.test.ts` | 用例 24 → 33：按需语言注册后生效 / 未注册回落 / 注册表初值只含预注册 / 告警内容与次数 / 预注册与未指定不告警 / **时序契约**（先注册后 provider 生效、先 provider 后注册不回溯、provider 语言后续切换仍按注册表解析）；provideLocale 告警粒度（双消费者只告警一次）；并给两处既有注入用例补「先注册」前置 |
| `src/_shared/dev-warn.test.ts` | 新增 5 例：非生产输出 / 生产静默 / 无 `env` 的 process shim 不抛错 / 无 `globalThis.process` 不抛错 |

## 5. 体积前后对照（esbuild 单点，口径同设计记录 §1.2）

| 对照 | 改动前 | 改动后 | 结论 |
|:---|--:|--:|:---|
| **A. provider 消费方**（`CaomeiConfigProvider`） | 12,317 B min / 4,413 B gzip | **5,398 B min / 2,479 B gzip** | **−6,919 B min（−56%）/ −1,934 B gzip（−44%）** |
| **B. 非 provider 消费方**（`CaomeiMultiSelect`） | 12,684 / 5,514 | 12,684 / 5,517 | **零变化（对照基线成立）**；min 逐字节相同，gzip 微差 **±4 B** 属压缩器噪声，不视为变化 |
| **C. 只读 `useLocale`** | 2,312 / 1,344 | 2,312 / 1,340 | 零变化（同上，gzip ±4 B 为噪声） |
| **D. 语言子路径单包**（新增能力） | — | 2,767 / 1,373 | 每门按需语言的引入成本 |

**产物内含语言探测（对照 A）**：日语 / 韩语 / 繁体串 **0 命中**，简体与英文各 1 命中 ⇒ provider 消费方现在只带预注册的 2 语 ✓。

**推断值校正**：设计记录 §4.1 曾以「内建 2 语约 5.2 KB」作推算，实测为 **5,398 B**（含 provider 组件自身开销），量级一致；10 语场景的收益结论（相对不分包省 > 16 KB min）方向不变，但**以本表实测为准**。

## 6. 破坏性与披露面

- **受影响面**：使用 `provideLocale` / `<CaomeiConfigProvider>` 且语言 ∈ {`zh-TW`, `ja-JP`, `ko-KR`} 的消费方（须补一行注册）；`zh-CN` / `en-US` 免注册、**零回归**。
- **类型面变更**：`caomeiLocales` 由 `as const` 5 键字面量对象改为运行期可变注册表（`Partial<Record<...>>`）⇒ 索引值类型含 `undefined`，直接索引不再保证命中。
- **披露落点**：`docs/guide/version-policy.md`（0.x 兼容策略段的形态变更条目）、`docs/guide/release.md §9`（子路径清单 + 下游修复指引）、`docs/design/architecture.md`（导出面表 + 语言子路径语义段）、`docs/components/locale.md` 与英文镜像（「按需引入语言」章节）。
- **CHANGELOG 的 `BREAKING CHANGES` 段**：本批不发布版本（M4-1 为发布条目），故该段在下一次发布批次按本记录 §6 的事实写入。

## 7. 未覆盖边界

- **未含一期 5 语**（`es-ES` / `fr-FR` / `de-DE` / `ru-RU` / `pt-BR`）：属 M3-1b；本批的联合仍是 5 语。
- **未做真实消费方打包环境验证**（Vite / Nuxt / webpack 的 tree-shaking 差异）：本表为 esbuild 单点；四组对照中的「非 provider 零变化」只在 esbuild 下取证。
- **未做 SSR / 运行期切换的端到端验证**：仅覆盖到时序契约的单测层面。
- **未复跑视觉基线**：本批零样式改动（`src/styles/**` 无 diff），`capture:styles` 不适用。
- **未评估下游迁移工作量**：已知下游 i18n 用量为 0（出处见设计记录 §1.2）。
- **`.d.ts` 的消费方解析**（TS `moduleResolution: bundler` 下经 `exports.types` 取到子路径声明）未在独立工程实测，仅在仓库内 `tsdown` 产物层面核对。
- **残留面（如实列出，**未登记为候选**——如需立项须用户裁定）**：① 台账守卫的**等值断言盲区**——「预注册集合与子路径清单同步调整、子路径数仍达下界」的组合同值扩展时守卫为构造性恒真（现由仓库不变量用例对预注册身份与子路径清单的 `toEqual` 钉定 + 本批 `check-build` 的产物面断言兜底）；② `check-build` 的 ③/⑤ 断言**硬依赖构建器当前 emit 形态**（双引号 + 显式 `.js` 扩展名），构建器升级时须一并复核；③ `registerLocale` 无 own-key 写入防护（`__proto__` 仅可经非类型化调用触发，因 `hasOwnProperty` 双检不构成可用性突破）；④ `rich-text-editor.test.ts` 的 `mocks.config` 未调用未显式断言；⑤ `check-build` 的同源断言只校验 `.js`（`types` 与条件键错指未覆盖）。
- **拆批与提交机制（本条目过程留痕，供后续复用）**：M3-1a 一次成型后**超出任务粒度约束**（[规划规范 §5](../../standards/planning.md)：≤ 10 文件 / 800 行；实测 21 文件 / 1,057 行）⇒ 按**交付面**拆为 4 批（① 共享 `warnDev` / ② 运行时形态 + 台账守卫 / ③a 产物面断言 / ③b 文档与记录），依赖顺序 ① → ② → ③a → ③b（② 与台账守卫**必须同批**：新守卫要求新注册表形态，旧守卫在新形态下必红）。**提交机制教训**：本仓 `lint-staged` 会跑**全仓** `eslint . --fix` 并把被它改动的文件自动入暂存 ⇒ 只要工作区还有未提交改动，它们就可能被卷入本次提交（实测两次：6 文件 / 8 文件）⇒ **多批提交前必须先让 `eslint --fix` 幂等**（先跑 `pnpm lint`，并以 `pnpm lint:check` exit 0 佐证），再逐批 `git commit`。

## 8. Review Gate

本条目按交付面拆为 4 批，**每批独立审计后提交**（结论均见对应审计工件，`artifacts/review-gate/…`，本地态、git-ignored）：

| 批次 | 提交 | 审计链 | 结论 |
|:---|:---|:---|:---|
| ① 共享 `warnDev` | `1eb562b` | R1 `standard` **`Reject`**（2 blocker：staged 落后于工作区 ⇒ index blob 过不了 lint；`development.md` 声明了本批尚不存在的子路径能力）→ 收口 → R2 `quick` **`Pass`** → 刷新确认 **`Pass`** | Pass |
| ② 运行时形态 + 台账守卫 | `8206b01` | R1 **并发分区**（§3.2：>8 文件且跨模块）——分区 1「运行时与导出面」**`Reject`**（1 blocker：内部工具 `resolveRegisteredMessages` 经 barrel **泄漏进公开导出面**，与设计 §6 冻结面冲突；2 warning / 2 suggest）＋ 分区 2「台账守卫」**`Pass`**（0 blocker / 2 warning / 4 suggest）⇒ 汇总取最严 | 收口后 **Pass** |
|  |  | R2 delta（合并去重）**`Pass`**（0 blocker；8/8 条闭合；`provideLocale` 语义与改前等价经核对） |  |
| ③a 产物面断言 | `d9949f3` | R1 `standard` **`Pass`**（0 blocker / 2 warning / 6 suggest）→ R2 delta `quick` **`Pass`** → 刷新确认 **`Pass`** | Pass |
| ③b 文档与记录 | 本批 | R1 `standard` **`Reject`**（1 blocker：**既有下游示例把改义后的注册表当「内建语种清单」**⇒ 示例静默失效；6 warning / 5 suggest）→ 收口（示例改写含注册前置、措辞全仓回扫为「非生产环境告警」、计数改逐点复算值、`M4-1` 补 `BREAKING CHANGE:` 义务、`roadmap §1` 同步新公开面）→ R2 delta **`Reject`**（1 blocker：**命名空间 / 消费组件计数两套口径**——实测真值 **28 个命名空间 / 29 个消费组件**）→ 收口（中英组件页 + `roadmap` 同值校正）→ **收口确认**（`quick`；结论以审计工件为准，本记录不复述） | Pass |

**批次① 的提交 provenance**：其首次提交（`3250806`）因 `lint-staged` 的全仓 `eslint . --fix` 把工作区未提交文件自动入暂存而被污染（6 文件 / 331 行），故撤销并仅按本批 5 文件重建，最终哈希 **`1eb562b`**（5 文件 / 99 行）。审计针对重建前的同名内容执行，**结论不受影响**；被撤销对象已成为 dangling 对象（**当前仍可解析**，`gc` 回收后其取证命令将不可复现）。

**actor 侧独立复算（审计方实跑）**：② 的 R2 复跑 `check-locale-keys` exit 0、`vitest` **112 passed**、逐条核 `provideLocale` 语义等价；③a 的 R2 用真实产物副本注入探针，验证「注释示例不误红」「目标不同源 RED」「孤儿产物 RED」「真实产物基线 0 条」；③a 的红蓝对照另证 `export … from` / 动态 `import()` / 单引号三种引入形态**均可判出**。

**同批收口的高价值发现（说明该批审计非形式过场）**：① blocker 抓到「staged 版本落后于工作区」与「文档先行声明未落地能力」；② blocker 抓到「内部工具经 `export *` barrel 泄漏进公开导出面」（`check:build` 无「无多余导出」断言，故此前无机检兜底）；② R1 的并发分区抓到「守卫规则 2 ~ 4 的遍历集合会随注册表收窄到 2 语」的**受检面静默收窄**风险（已改为按联合成员遍历，并以定向变异证明判别力）；③a R2 抓到「孤儿产物断言仍用全文匹配 ⇒ fail-open」。

**未覆盖边界（本条目整体）**：真实消费方打包环境（Vite / Nuxt / webpack）的 tree-shaking 差异（本轮为 esbuild 单点）；SSR / 运行期切换的端到端时序；`.d.ts` 在独立消费方工程各 `moduleResolution` 档的解析；一期 5 语（属 M3-1b）；下游迁移工作量。

**复查基线**：本记录 §2 / §4 / §5 / §7；`src/locale/index.ts`、`src/composables/use-locale.ts`、`tsdown.config.ts`、`package.json`（子路径）、`scripts/governance/check-locale-keys.mjs`、`scripts/release/check-build.mjs`、`docs/components/locale.md` 与英文镜像、`docs/design/architecture.md`、`docs/guide/release.md §9`、`docs/guide/version-policy.md`、`docs/plan/todo.md`、`docs/design/governance/index.md`。
