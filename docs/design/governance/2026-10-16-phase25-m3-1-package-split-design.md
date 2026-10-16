# Phase 25 M3-1 前置：locale 分包方案设计（按语言子路径导出）

> 创建时间：2026-10-16
> 关联条目：Phase 25 **M3-1**（追加 5 语 + 按语言子路径导出〔分包方案 A〕）与 **M3-2**（locale 台账、守卫与子路径导出对齐）。
> 触发：用户 2026-10-16 指令——「M3 的改动比较大，先做方案设计。我认为在增加新的语言之前，最好先处理分包方案。」
> 性质：**方案设计（P 阶段交付）+ 裁定落点**——候选、实测、推荐形态与待裁定项，**并已回填用户 2026-10-16 的 D1 ~ D5 裁定（§6）**；**未改 `src/**`、未改 `package.json`、未改构建配置**（本条目的实施动作在 M3-1a / M3-1b）。
> 上游依据：[Phase 25 登记批次记录](./2026-10-16-phase25-registration.md) §2、[国际化调研（Phase 19 M7-1）](./2026-10-06-phase19-m7-1-i18n-research.md) §5「工程方案两条路线」。

## 1. 现状模型（含本轮实测，可复算）

### 1.1 分发与实现形态

- **单一注册表**：`src/locale/index.ts` 的 `caomeiLocales` 静态汇入全部 5 语，经**包根入口**导出（`src/index.ts:63` 的 `export * from './locale'`）。
- **`exports` 无语言子路径**：`package.json` 仅 `.` / `./theme.css` / `./resolver` / `./nuxt` / `./package.json`。
- **消费链**：31 个组件经 `useLocale()` 取文案；`useLocale()` 未注入时回退 `defaultLocaleMessages`；`provideLocale()` / `<CaomeiConfigProvider>` 才走 `resolveLocaleMessages()`（即查注册表）。
- **构建**：tsdown `unbundle` 模式⇒ `dist/locale/*.js` 已**逐语言物理存在**（`en-us` 2,654 B / `ja-jp` 3,264 B / `ko-kr` 2,937 B / `zh-cn` 2,583 B / `zh-tw` 2,601 B，注册表 `index.js` 435 B），只是**未在 `exports` 中暴露**。
- **旁路耦合**：`src/components/chart/chart-locale.ts` 有 `CHART_LOCALE_BY_LOCALE: Record<CaomeiLocale, string>`（类型上是**全函数**），未内置语言经动态 `import('echarts/i18n/langXX')` 注册。

### 1.2 体积实测（esbuild `--bundle --format=esm --minify --charset=utf8`，external `vue` / `reka-ui` / `@tanstack/vue-table` / `@internationalized/date` / `echarts` / `vue-echarts`）

| 入口（消费方实际引用的面） | min 字节 | gzip 字节 | 产物内含语言数 |
|:---|--:|--:|--:|
| 空入口（干重） | 24 | — | 0 |
| `useLocale` / `useLocaleCode`（只读，**无 provider**） | 2,312 | 1,344 | 1（`zh-CN` 基线） |
| `CaomeiButton`（不消费 locale 的组件） | 3,813 | 1,508 | 0 |
| `CaomeiMultiSelect`（消费 locale，**无 provider**） | 12,684 | 5,514 | 1（`zh-CN` 基线） |
| `CaomeiConfigProvider`（**走 provider**） | 12,317 | 4,413 | **5（全部）** |
| `caomeiLocales` 直接引用（真实注册表） | 11,548 | 4,178 | **5（全部）** |
| 合成对照：注册表 **2 语**（`zh-CN` + `en-US`，即 D1 ② 的分包后形态） | **4,235** | **1,801** | 2 |
| 合成对照：注册表 3 语 | 6,327 | 2,297 | 3 |
| 合成对照：注册表 4 语 | 9,082 | 3,070 | 4 |

**每语言边际（由上表差分实测）**：**+2,092 ~ +2,755 min / +496 ~ +841 gzip**（3 语 − 2 语 = +2,092；4 语 − 3 语 = +2,755；5 语 − 4 语 = +2,428）。

**这是本轮最关键的现状修正**：包根入口**并未**无条件拖入全部语言——打包器能把未用语言摇掉（`useLocale` 只带基线；单组件入口只带基线）。**全部语言进入产物的唯一条件是「使用 provider」**（即消费方真的启用了多语言）。

**推论（决定方案形态）**：

- 体积成本的承受面 = **使用 provider 的消费方**，成本 = **注册表全量**（真实注册表 5 语 11,548 B min / 4,178 B gzip）。
- 按上表差分，**新增 5 语后注册表约 21 ~ 24 KB min / 约 7 ~ 8 KB gzip**（**推算值**：11,548 + 5 × 每语言边际），**无论该消费方是否用到那 5 语**。
- 采用分包形态（内建 2 语）后，provider 消费方的注册表成本 = **实测 4,235 B min / 1,801 B gzip** ⇒ 在 10 语场景下**省 > 16 KB min**。
- 因此本方案的收益面是「**用了 provider 但只用 1 ~ 2 种语言的消费方**」——据[Phase 24 范围扩展评估](./2026-10-13-phase24-scope-extension-evaluation.md) §2 的三仓实测，**下游 i18n 用量均为 0**（该结论出自该记录 §2，非 Backlog），故这类消费方目前**尚不存在**，收益属**前瞻性**（为语言矩阵增长预留零边际成本）。
- 反过来说：**若不做分包，加语言的代价全部由「用 provider 的消费方」承担，且随语言数线性增长**——这正是用户「先处理分包方案再加语言」判断的量化依据。

## 2. 候选方案对比

> **裁定取向（用户 2026-10-16，见 §6）**：取 **A1 形态**（子路径 + 注册表瘦身 + `registerLocale`）并以 **D1 ②「保留 `zh-CN` + `en-US` 内建」** 收敛破坏面。下表为各方案的候选对比（含未采纳项，保留判定依据）。

| 方案 | 形态 | 体积收益 | 破坏性 | 工程面 |
|:---|:---|:---|:---|:---|
| **A1** 子路径 + 基线注册表瘦身（**推荐 / 已采形态**） | `caomei-ui/locale/<code>` 逐语言导出；注册表初值只含基线；新增 `registerLocale()`；`provideLocale({ locale })` 未注册 ⇒ 回落基线 + 非生产环境告警 | **最大**（provider 消费方默认只带内建语言，10 语场景省约 17 KB min / 约 6 KB gzip） | **有**（下沉语言需注册；`caomeiLocales` 语义收窄；`CaomeiLocale` 类型面见 D3） | 中：构建入口 + `exports` + 守卫规则 1 改写 + 文档接入方式 |
| **A1'** 子路径 + 部分瘦身（折中） | 同上，但**保留现有 5 语内建**、仅新增语言走子路径 | 一半（新 5 语按需；旧 5 语仍全量） | **无** | 同 A1（注册表语义不变，守卫改动更小） |
| **A2** 子路径 additive | 只加 `exports` + 构建入口，注册表**保持全量** | **零**（provider 消费方仍带全部语言） | 无 | 小：仅构建与分发面 |
| **A3** A1 + 异步加载引导 | 在 A1 上补文档引导 `await import('caomei-ui/locale/<code>')` + `registerLocale`（SSR / 运行期切换场景） | 同 A1（且可按需延后到运行期） | 同 A1 | 小：文档 + 示例 |
| **B** 维持单包 + `messages` 覆盖 | 零工程改动，靠 `CaomeiLocaleMessageOverrides` 手工注入语言对象 | 零 | 无 | **不可用**：语言对象目前只能在根入口取到（要注入的整包已在产物里），除非有 A2 的子路径 ⇒ 实质等同 A2 |
| **C** 语言包独立发包 | `caomei-ui-locales` 独立版本节奏 | 同 A1 | 有 | **大**：多包发布 / CI / 语义化发布 / 许可声明面，收益与 A1 相同却引入持续维护成本 |

**不推荐**：B（形式大于实质）、C（成本收益不匹配，登记为「二期语言数量超阈值时的候选」）。

## 3. 推荐形态（A1，含 A3 的文档面）

### 3.1 接口契约（按 §6 裁定冻结）

```ts
// 包根入口（caomei-ui）
export type CaomeiLocale = 'zh-CN' | 'en-US' | 'zh-TW' | 'ja-JP' | 'ko-KR'
                       | 'es-ES' | 'fr-FR' | 'de-DE' | 'ru-RU' | 'pt-BR'   // 显式字面量联合（10 语内建）
export const PRE_REGISTERED_LOCALES: readonly CaomeiLocale[]              // ['zh-CN', 'en-US']（单一事实源，供守卫与测试引用）
export const caomeiLocales                       // 已注册语言表；初值 = PRE_REGISTERED_LOCALES 对应的文案对象
export const defaultLocale: CaomeiLocale         // 'zh-CN'（不变）
export const defaultLocaleMessages               // 基线完整文案（不变）
export function registerLocale(code: CaomeiLocale, messages: CaomeiLocaleMessages): void
export function provideLocale(options?: ProvideLocaleOptions)   // locale 未注册 ⇒ 回落基线 + dev 告警
export function useLocale(): ComputedRef<CaomeiLocaleMessages>   // 不变
export function useLocaleCode(): ComputedRef<CaomeiLocale>       // 不变

// 语言子路径（逐语言，一语言一文件）：共 8 条（现有 3 下沉 + 新增 5）
// caomei-ui/locale/zh-tw | ja-jp | ko-kr                       ← 现有语言下沉（M3-1a）
// caomei-ui/locale/es-es | fr-fr | de-de | ru-ru | pt-br        ← 一期新增 5 语（M3-1b）
export default messages            // 默认导出＝该语言完整文案对象
export const <camelCaseCode>       // 同名具名导出（两种写法皆可）
```

> **类型派生必须改为显式声明**：现状 `CaomeiLocale` 由 `keyof typeof caomeiLocales` **派生**（`src/locale/index.ts`），一旦注册表初值收为 2 语，联合即随之收窄为 2 语——这与 D3 ①「10 语内建联合」**直接冲突**，并会使 `chart-locale.ts` 与 `editor-language.ts` 两处 `Record<CaomeiLocale, string>` 全函数在 `typecheck` 报「多余属性」。故实现批次必须把联合改为**显式字面量**，`caomeiLocales` 的类型相应独立（不再是联合的来源）。

**术语与集合（契约必须显式声明，防「类型可传但运行期未注册」的误判）**：

| 集合 | 内容 | 说明 |
|:---|:---|:---|
| **内建（随包发布）语言** | 10 语（现有 5 + 一期新增 5） | = `CaomeiLocale` 类型联合的成员；子路径逐条可导入 |
| **预注册语言** | `zh-CN` + `en-US` | 随包根入手即用（不传 `locale` 的既有消费方零回归） |
| **需注册语言** | `zh-TW` / `ja-JP` / `ko-KR` + 一期新增 5 语 | 需 `import` 子路径 + `registerLocale` 后方可 `provideLocale({ locale })` |

> **类型联合 ≠ 预注册集合**：`CaomeiLocale` 表示「本库随包提供文案的语言」，不表示「已注册」。未注册语言传入时按 §3.1 要点 3 回落基线并告警——该差异须在文档与非生产环境告警两处同时可见。

**消费方接入（目标形态）**：

```ts
import { provideLocale, registerLocale } from 'caomei-ui'
import esES from 'caomei-ui/locale/es-es'

registerLocale('es-ES', esES)      // 只带这一门语言进产物
provideLocale({ locale: 'es-ES' })
```

**设计要点**：

1. **内建语言不动其可用性**：`zh-CN`（基线）与 `en-US` 仍随包根提供 ⇒「不传 `locale`」与「传 `en-US`」的既有消费方**零回归**（D1 ② 的收敛点）。
2. **注册表语义**：`caomeiLocales` 由「内置全量」改为「**已注册表**」（`check:build` 的 `REQUIRED_RUNTIME_EXPORTS` 已含该名，保留可避免守卫面改写）。
3. **静默失败防护**：`provideLocale({ locale: 'xx-XX' })` 而该语言未注册时——回落基线 + **非生产环境告警**（不抛错，保持 0.x 向后兼容的容错口径），避免「语言没生效但无人察觉」。
4. **注册时序契约（须在文档与测试中显式覆盖）**：`registerLocale` 须**先于** `provideLocale` 调用；已创建的 provider 不会因后续注册而重算（`provideLocale` 的 `computed` 依赖注册表快照）。文档示例与单测须覆盖「先注册后 provider」与「未注册即 provider」两条路径。
5. **物理目录不变**：语言文件仍在 `src/locale/<code>.ts`（不新建 `src/locale/packs/` 之类），避免 `check-locale-keys` 的目录枚举与既有治理面连带改动；子路径只体现在**构建入口**与**分发**两层。
6. **A3（异步）**：文档给 `await import(...)` + `registerLocale` 的写法，用于 SSR / 运行期切换；不新增运行时 API（异步场景同样受第 4 点的时序约束）。

### 3.2 文件级映射

| 面 | 文件 | 动作 | 原因 |
|:---|:---|:---|:---|
| 注册表 | `src/locale/index.ts` | 改：注册表初值 = `PRE_REGISTERED_LOCALES`（`zh-CN` + `en-US`）；新增 `registerLocale`；**`CaomeiLocale` 由 `keyof typeof caomeiLocales` 派生改为显式字面量联合（10 语）** | 语言包从「静态全量」变「按需注册」；派生式联合会随初值收窄（见 §3.1 注） |
| 类型 | `src/locale/types.ts` | 不改 | 文案结构（`CaomeiLocaleMessages` / 命名空间 / 键）不变 |
| 解析与告警 | `src/composables/use-locale.ts` | 改：未注册回落 + dev 告警 | 防静默失败；`resolveLocaleCode` 口径同步 |
| 构建 | `tsdown.config.ts` | 改：`entry` 增 `'locale/<code>': 'src/locale/<code>.ts'` | 产出稳定的子路径产物与 d.ts |
| 分发 | `package.json` `exports` | 改：增 `./locale/<code>`（含 `types`） | 子路径可达（`check-build` 会自动校验其产物存在） |
| 基线 | `src/locale/zh-cn.ts` | 不改 | 基线仍内建（D1 ②） |
| 英文 | `src/locale/en-us.ts` | 不改（仍内建） | D1 ② 保留面：`en-US` 免注册 |
| 现有 3 语 | `src/locale/{zh-tw,ja-jp,ko-kr}.ts` | 下沉：加子路径 + 注册（**按 D1 ② 裁定**） | 决定破坏面（见 §4.1） |
| 守门 | `scripts/governance/check-locale-keys.mjs` | 改**规则 1**为**等值 + 双向**断言；**并显式约束规则 2 ~ 4 的遍历集合不变** | ① **等值**：注册表初值键集合 **==** `PRE_REGISTERED_LOCALES`（仅「下界」会被静默归零——初值留着 3 语即全部收益失效）；② **双向**：`src/locale/*.ts`（除基线/内建）↔ `exports` 子路径 ↔ 构建入口**一一对应**（遗漏与悬空双向可判）；③ 基线文件 = `defaultLocaleMessages` 源；④ **关键**：规则 2 ~ 4（命名空间 / 键 / 占位符一致性）现由**注册表成员**驱动 —— 注册表收为 2 语后，若不同步改为「遍历 `src/locale/` 下**全部**语言文件」，键位守卫会**从 5 语静默收窄到 2 语**（受检面缩小而全绿）；⑤ 守卫须带**负向对照**（常量与注册表「一致扩语」时仍须能被判出不一致，不能只靠构造性恒真） |
| 守门 | `scripts/release/check-build.mjs` | 增子路径**下界** + 默认导出断言 | 防「语言静默缩水」（受检面下界原则） |
| 文档 | `docs/components/locale.md` + `docs/i18n/en-US/components/locale.md` | 增「按需引入语言」**独立章节** + 子路径清单（按 D5 ②） | 下游接入方式（M3-1 验收要求） |
| 文档 | `docs/design/architecture.md` | 增导出面口径 | 包形态的单一事实源 |
| 测试 | `src/composables/use-locale.test.ts` | 增注册 / 回落 / 告警 / **时序**断言 | 行为面证据（含 §3.1 第 4 点） |
| Nuxt | `src/nuxt/module.ts` | **不改**（按 D4 ① 裁定） | 语言注册属运行时，文档给插件示例 |
| 图表 | `src/components/chart/chart-locale.ts` | 保持全函数；**M3-1b** 补 5 语映射 | 按 D3 ① 裁定（`resolveLocaleCode` 已归一化，未知语言不到此处） |
| 富文本 | `src/components/rich-text-editor/editor-language.ts` | 保持全函数；**M3-1b** 补 5 语映射（含 `ru-RU` → 扩展包键 `ru` 的转换） | 同为 `Record<CaomeiLocale, string>` 全函数，不更新即 `typecheck` 失败 |

**明确无影响**（已核对）：`src/resolver/index.ts`（语言不是组件，resolver 无感知）、`src/nuxt/theme.ts`、样式面。

## 4. 兼容性与风险

### 4.1 破坏性形态变更的处置路径

> 登记口径要求「包形态变更按 [Phase 11 破坏性形态变更](../../plan/todo-archive.md) 的处置路径评估影响面」。Phase 11 的先例是 `styles.css` → `theme.css`（0.2.0）：**移除旧子路径 + 换入口**，处置动作为 CHANGELOG `💥 BREAKING CHANGES` + [版本与兼容策略](../../guide/version-policy.md) 披露 + [发布指南 §9](../../guide/release.md) 下游修复指引。

本方案（A1 + D1 ②）的破坏面**小于**该先例：**不删除任何现有导出名**，只改变 `caomeiLocales` 的**内容语义**（`zh-TW` / `ja-JP` / `ko-KR` 不再默认在册）与这几门语言的**可达方式**（子路径 + 注册）；`zh-CN` 与 `en-US` **完全无影响**。故处置动作：

1. CHANGELOG `💥 BREAKING CHANGES` 明示「`zh-TW` / `ja-JP` / `ko-KR` 需 `registerLocale` 注册（`zh-CN` / `en-US` 不受影响）」；
2. `version-policy.md` 的 0.x 兼容策略段补本条形态变更与修复指引；
3. `release.md §9` 给下游迁移三步（引入子路径 → 注册 → 传 `locale`）；
4. 受影响面：仅「用 provider 且语言 ∈ {`zh-TW`, `ja-JP`, `ko-KR`}」的消费方（据[范围扩展评估](./2026-10-13-phase24-scope-extension-evaluation.md) §2 的三仓实测，**下游 i18n 用量均为 0** ⇒ 预期无实际受影响方，但须按路径披露）。**注意可逆性**：若后续认为繁体亦应免注册，把 `zh-TW` 并入内建集合是**一行改动**（加入 `PRE_REGISTERED_LOCALES` 并移出子路径清单），不影响其余形态。
5. **顺带的类型面变更（须一并披露）**：`caomeiLocales` 由 `as const` 的 5 键字面量对象改为**运行期可变**的已注册表 ⇒ 其**索引值类型变为可能 `undefined`**，且**直接索引注册表**（而非经 `provideLocale` / `useLocale`）不会触发未注册告警。若消费方直接读 `caomeiLocales['ja-JP']`，属破坏性变更的一类，须与 §4.1 第 1 项同批写入 CHANGELOG 与迁移指引。

**体积对照（实测 + 推算，口径分列）**：`provider` 消费方在「10 语」场景下——不做分包约 **21 ~ 24 KB min**（推算：5 语实测 11,548 + 5 × 每语言边际），本方案（内建 2 语）**实测 4,235 B min / 1,801 B gzip**，省 **> 16 KB min / 约 5 KB gzip**；实现批次须以 esbuild 实测出「前后对照」，「非 provider 消费方零变化」为对照基线。

### 4.2 风险与缓解

| 风险 | 等级 | 缓解 |
|:---|:---|:---|
| tsdown 多入口的 **d.ts 形态未验证**（子路径是否各自产出 `.d.ts`） | 中 | **PoC 前置**（见 §5 步骤 1），未通过则退回「A2 形态 + 单独 d.ts 入口」再定 |
| 未注册语言的**静默回落**被误判为「语言不生效」 | 中 | dev 告警 + 文档显式声明 + 单测覆盖回落与告警两条路径 |
| 体积收益为**推算值**（无真实消费方打包环境） | 中 | 实现批次以 esbuild 实测**前后对照**留痕（本轮表为「前」），并保留「非 provider 消费方零变化」的对照 |
| 守卫规则 1 改写引入**假阴性**（文件未登记却放行） | 中 | 新规则须**带负向对照**（删一条子路径登记 ⇒ 守卫必须失败）与受检面下界；**规则取等值断言而非下界**（见 §3.2 守门行） |
| **契约误读**：「`CaomeiLocale` 含该语言」被当作「该语言已可用」 | 中 | §3.1 显式声明「类型联合 ≠ 预注册集合」；dev 告警文案直接给出注册示例；文档同批写明 |
| **扩展包键名转换**（RTE）：`@vavt/cm-extension` 用 `ru`（非 `ru-RU`）、`jp-JP`（非 `ja-JP`） | 中 | M3-1b 逐条核对键名（该包另有 15 个语言文件，含 `zh-TW` / `es-ES` / `fr-FR` / `de-DE` / `pt-BR`）；直通未转换会**静默回落到 `zh-CN`**（`hasExtensionLocale` 判定），须在映射表与冒烟断言中显式覆盖 |
| **注册时序**：先 `provideLocale` 后 `registerLocale` 不生效 | 中 | §3.1 第 4 点写为契约；文档示例与单测覆盖两条路径 |
| 新增语言的 **ECharts 语言包可用性** | 低 | 已核对：`node_modules/echarts/i18n/` 含 `langES` / `langFR` / `langDE` / `langRU` / `langPT-br`（5 语均有；`pt-BR` 键名带小写地区段，映射须转换） |

## 5. 执行顺序（按 D2 ① 拆为两条原子条目）

| 步骤 | 内容 | 归属 |
|:---|:---|:---|
| 1 | **PoC**：仅为 1 门语言加 `entry` + `exports` 子路径，验证产物与 d.ts 形态（不改运行时语义） | **M3-1a** |
| 2 | 运行时改造：注册表初值收敛为内建 2 语 + `registerLocale` + 未注册告警（**零新语言**） | **M3-1a** |
| 3 | 分发：`exports` / 构建入口登出 3 条下沉子路径（`zh-tw` / `ja-jp` / `ko-kr`） | **M3-1a** |
| 4 | 守卫：`check-locale-keys` 规则 1 改写 + `check-build` 下界（含负向对照） | **M3-1a**（与 M3-2 同批收口） |
| 5 | 文档：`locale.md` 按需引入章节 + 架构导出面 + 版本/发布指南披露 | **M3-1a** |
| 6 | 体积**前后对照**实测留痕（含「非 provider 消费方零变化」对照） | **M3-1a** |
| 7 | 一期 5 语落地（`es-ES` / `fr-FR` / `de-DE` / `ru-RU` / `pt-BR`）+ 子路径登记 + **两处全函数映射同步**（ECharts `chart-locale.ts`：5 语均有官方语言包；RTE `editor-language.ts`：扩展包键名 `ru` / `jp-JP` 须转换）+ 台账对齐 | **M3-1b**（+ M3-2） |

- **M3-1a = 步骤 1 ~ 6**（形态先落地，零新语言）；**M3-1b = 步骤 7**（纯机械，成本已摊薄）。
- 切分理由：① 用户判断「分包先行」；② 形态变更与语言内容是两类风险（前者含分发 / 破坏性，后者纯机械），拆开后各自的 Review Gate 面更清晰；③ D1 ② 下若需回调内建集合（如把 `zh-TW` 并入内建），可在不牵动语言内容的前提下单独完成。

## 6. 裁定结论（用户 2026-10-16）

| 编号 | 决策点 | 裁定 | 落点 |
|:---|:---|:---|:---|
| **D1** | 现有 5 语是否下沉 | **② 保留 `zh-CN` + `en-US` 内建**；`zh-TW` / `ja-JP` / `ko-KR` 下沉子路径 + 注册 | §2 / §3.1（预注册集合）/ §4.1（破坏面） |
| **D2** | M3-1 是否拆条 | **① 拆为 M3-1a（包形态：注册表 + 子路径 + 守卫 + 文档）/ M3-1b（5 语落地）** | §5 / `todo.md` / [登记记录](./2026-10-16-phase25-registration.md) |
| **D3** | `CaomeiLocale` 类型面 | **① 保持内建语言字面量联合**（一期 5 语并入联合；自定义语言走 `messages` 覆盖面） | §3.1 / §3.2（图表全函数保持） |
| **D4** | Nuxt 模块语言选项 | **① 不提供**；文档给 Nuxt 插件示例 | §3.2 |
| **D5** | 台账形态 | **② 独立「按需引入」章节 + 子路径清单**（调用方推荐，随 D1 ~ D4 同批采纳） | §3.2 |

**裁定带来的冻结面**（实现批次的输入，不得自选形态）：

- 预注册集合 = `{ 'zh-CN', 'en-US' }`，并落为**单一事实源常量** `PRE_REGISTERED_LOCALES`（守卫与测试引用该常量，不手抄清单）；子路径集合 = 8 条（现有 3 下沉 + 一期新增 5）。
- `CaomeiLocale` = 10 语内建联合（现有 5 + 一期 5），**不含任意字符串**，且**改为显式字面量声明**（不再由 `keyof typeof caomeiLocales` 派生）；`chart-locale.ts` 与 `editor-language.ts` 维持全函数。
- 标题以外无新增运行时导出（仅 `registerLocale` 与 `PRE_REGISTERED_LOCALES` 两项）。
- 拆条后的阶段条目构成：Phase 25 由 **4 条主线 / 7 条原子条目 → 4 条主线 / 8 条**（M3 主线 2 → 3），登记动作见 [登记记录](./2026-10-16-phase25-registration.md) §7。

## 7. 边界与未覆盖

- **未改实施面**（除本记录、索引与 §6 裁定要求的规划载体登记）：`git diff -- src/` / `package.json` / `tsdown.config.ts` 均为空。**规划载体回扫面清单**（逐面核对，防「同载体两套口径」）：① `docs/plan/todo.md` —— 当前状态句（构成对账）+ `## Phase 25 原子条目` 条目表 + M3-2 验收列；② `docs/plan/roadmap.md` —— **§1 现状句**（Phase 25 段）+ **阶段表 Phase 25 行** + **状态行**（三处独立口径，须逐处确认）；③ 本记录本体（§3 / §5 / §6）；④ `docs/design/governance/index.md` 摘要；⑤ `.session/current-task.yaml`（git-ignored，会话收尾同步）。
- **本批 Review Gate（R1 `standard` `Pass` 0 blocker / 4 warning / 3 suggest → R2 delta `standard` `Reject` 1 blocker → 收口后 R2 复审见 §8）已同批收口的项**：① `CaomeiLocale` 类型派生落点（改为显式字面量联合，见 §3.1 / §3.2）；② RTE `editor-language.ts` 映射面与扩展包键名转换（§3.2 / §4.2 / §5）；③ 守卫规则 1 的**等值断言** + 规则 2 ~ 4 遍历集合不得收窄（§3.2）；④ 出处误引（「三仓 i18n 用量为 0」改指[范围扩展评估](./2026-10-13-phase24-scope-extension-evaluation.md) §2）；⑤ `registerLocale` 签名收为 `CaomeiLocale` + 注册时序契约（§3.1 第 4 点）；⑥ 推算值与实测读数分列、每语言边际改为**差分实测**（§1.2 / §4.1）；⑦ `roadmap.md` **§1 现状句 / 阶段表行 / 状态行三处**构成口径回扫（`check-planning-numbers` 与本族均无机检，须人工逐面核对）；⑧ `caomeiLocales` 类型面变更披露（§4.1 第 5 项）。
- **follow-up 的裁定后处置（用户 2026-10-16 就本节 ① / ③ 裁定，同批执行）**：① 「locale 组织与注册治理」候选**已移出候选池** —— `docs/plan/backlog.md` §1.4 该行删除，并入「本组两处处置」注（与「国际化深化一期」同源）；`docs/plan/todo.md` 未完成项汇总表同步移出该行。③ 新候选「**阶段构成计数跨载体一致机检**」**已登记**为 `docs/plan/backlog.md` §1.6 候选 + `todo.md` 汇总表行（判别键 `阶段构成计数跨载体一致机检`；`check:candidate-anchors` 受检 17 行通过），**等待后续修复**（用户口径：记录在册，不在本批实现）。**候选池计数（逐点复算）**：移出 1 行 + 新增 1 行 ⇒ §1 在册候选 **35 → 35**。基线取点：`e41f63f^` = 37 → `e41f63f`（登记）= **34**（与[登记记录](./2026-10-16-phase25-registration.md) §4 的「37 → 34」吻合；34 为**登记时点值**），其间 M2-1 批次（`0b4849c`）在 §1.5 新增「Toolbar 在 769–1023px 的容器收敛档」行 **+1 ⇒ 现值 35**——故不得用登记时点值直接推导本批终值。② `.session/current-task.yaml`（git-ignored）的阶段构成句已在会话收尾同步为 8 条。
- **未覆盖**：① tsdown 多入口的 d.ts 与产物形态（留待 §5 步骤 1 的 PoC）；② 真实消费方打包环境（Vite / Nuxt / webpack）下的 tree-shaking 差异——本轮为 esbuild 单点实测；③ 未实测 SSR / 运行期切换场景的语言加载时序；④ 未评估下游迁移的实际工作量（已知用量为 0）；⑤ 未含 RTL（维持独立立项）与二期 7 语集（D1 的形态对语言数零边际，但语言内容不在本批）。
- **不做**：不引入运行时依赖、不改文案结构、不改组件 API、不启用定时发布、不进入 1.x。

## 8. Review Gate

**R1（`standard`，单分区 ≤ 10 分钟）**：**`Pass`**（0 blocker / 4 warning / 3 suggest）。审计方**独立复算** esbuild 读数（偏差 ≤ 0.2%）⇒ 核心结论「全部语言进产物的唯一条件是使用 provider」**无反证**；跨载体口径四处一致；未改实施面（`src/**` / `package.json` / `tsdown.config.ts` / `scripts/` 的 staged diff 为空）。

**R1 findings 同批收口（7 条）**：RG-W01 `CaomeiLocale` 类型派生落点（→ 显式字面量联合，§3.1 / §3.2 / §6）；RG-W02 RTE `editor-language.ts` 映射面与扩展包键名转换（§3.2 / §4.2 / §5）；RG-W03 守卫规则 1 改为**等值 + 双向**断言（§3.2）；RG-W04 出处误引（→ [范围扩展评估](./2026-10-13-phase24-scope-extension-evaluation.md) §2）；RG-S01 `registerLocale` 签名收为 `CaomeiLocale` + 注册时序契约（§3.1 第 4 点）；RG-S02 数值口径改为**差分实测** + 实测 / 推算分列（§1.2 / §4.1）；RG-S03 `backlog.md` §1.4 承接注（不移出、不改计数）。

**R2（delta，`standard`，≤ 8 分钟）**：**`Reject`**（**1 blocker**）。审计方独立复算差分实测（2,116 / 4,267 / 6,365 / 9,126 / 11,560 B）⇒ 与本记录同区间同量级；R1 的 7 条中 **5 条闭合**、W02 / W03 **主面闭合**、W04 部分未闭合（转 follow-up）。

- **RG-B01（blocker）**：`docs/plan/roadmap.md` 的 **§1 现状句**与**状态行**两处仍写 Phase 25「4 条主线 / 7 条原子条目」，与同文件阶段表行（已改 8 条）并存 ⇒ **同载体两套无标注口径**。该族在仓库历史上已两次判 blocker（2026-09-30 两批、2026-10-14「roadmap 状态行漏回扫」），且**无机检**（`governance:check` / `lint:md:check` / `check:planning-numbers` 全部放行）。
  **收口**：两处改为「原登记 4 条主线 / 7 条原子条目，2026-10-16 经用户裁定把 M3-1 拆为 M3-1a / M3-1b 后为 8 条」；并按审计方要求的**约束载体**，在本记录 §7 补「**规划载体回扫面清单**」（`todo.md` 两处 / `roadmap.md` **三处独立口径** / 记录本体 / 索引摘要 / `.session` 五面逐条列出），替代原「`roadmap.md`」这一粒度。

**R2 follow-up 同批采纳（F1 ~ F4）**：F1 出处残留（§4.1 改指范围扩展评估 §2）；F2 `todo.md` M3-1b 验收补「两处全函数映射同步（含键名转换）」（→ 设计记录 §3.2 / §4.2 / §5 已列，本处同步登记面）；F3 守卫规则 2 ~ 4 的**遍历集合不得随注册表收窄**（§3.2 守门行第 ④ 项）与负向对照要求（第 ⑤ 项）；F4 `caomeiLocales` 的**类型面变更**披露（§4.1 第 5 项）。

**未采纳（转登记）**：F5 `backlog.md` 候选移出与否**待用户裁定**；F6 `.session` 阶段构成句在会话收尾同步；**另登记一项候选**——「阶段构成计数跨载体一致」本族已第 3 次判出且无机检，建议按独立条目立项（§7 follow-up ③）。

> RG-B01 收口后另做一次**收口确认**（`quick`：只核 RG-B01 闭合、F1 ~ F4 落地与新引入 blocker）——其结论以审计工件为准，本记录不复述。

**审计工件**：`artifacts/review-gate/2026-10-16-phase25-m3-1-package-split-design.md`（本地态、git-ignored）。

**未覆盖边界**：① tsdown 多入口的 d.ts 与产物形态（PoC 属 M3-1a 步骤 1）；② 真实消费方打包环境（Vite / Nuxt / webpack）的 tree-shaking 差异（本轮为 esbuild 单点）；③ SSR / 运行期切换的语言加载时序；④ 下游迁移工作量；⑤ M3-1a / M3-1b 实现未开工（本记录不含实现证据）。

**复查基线**：本记录 §1.2 / §3.1 / §3.2 / §4.1 / §4.2 / §5 / §6 / §7；`docs/plan/todo.md`（当前状态句 + M3-1a / M3-1b / M3-2 行）；`docs/plan/roadmap.md`（§1 现状句 + 阶段表 Phase 25 行 + 状态行）；`docs/plan/backlog.md` §1.4；[登记记录](./2026-10-16-phase25-registration.md) §7；`docs/design/governance/index.md` 条目。
