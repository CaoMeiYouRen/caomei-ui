# Phase 26 M1-1 冻结面终审与 1.0 决策记录

> 创建时间：2026-10-24
> 触发：Phase 26 M1-1（[Phase 26 登记批次](./2026-10-22-phase26-registration.md) §2）。
> 用户裁定（2026-10-24）：`--caomei-*` token 冻结档位取「全量 146 + 已披露覆盖钩子」；其余面按登记口径终审。
> **本记录是冻结面清单与 1.0 决策的唯一口径载体**；`docs/guide/version-policy.md` 只承载对外表述，不另立清单。

## 1. 决策摘要

| 面 | 冻结口径 | 复算入口 |
|:---|:---|:---|
| 组件公开契约 | 组件公开 props / events / slots 的**名称与语义**；新增可选成员属向后兼容增量 | §2.1 |
| 子路径导出 | `package.json` `exports` **13 键**的集合与语义 | §2.2 |
| 包根导出名 | 包根可导入的**全部 324 个名称**（组件、图标、composables、组件级类型、locale 运行时 / 类型、图表 helper、注入键、公共类型） | §2.3 |
| token 契约 | **146 个有默认声明的 token + 288 个已披露覆盖钩子**（去重后 **371** 个名称）；15 个仅消费、未披露的内部中间变量不冻结 | §2.4 |
| locale 形态 | **10 语**、每语 **28 命名空间 / 80 键**；`zh-CN` / `en-US` 预注册，其余 8 语经子路径按需注册 | §2.5 |
| `InputNumber` `step` | 按 `reka-ui` **2.10.4** 的 `NumberField` 行为冻结（`stepSnapping: false`） | §2.6 |

冻结**自 `1.0.0-rc.1` 起生效**：rc 用于下游复验，`rc → 1.0.0` 只允许修复，不允许破坏面变化。

## 2. 冻结面逐项清单

### 2.1 组件公开契约

- **组件目录（SFC 入口）**：**56** 个。命令：`ls src/components | grep -v _shared | wc -l`。
- **包根导出的组件名**：**94** 个 `Caomei*`（含 `TabList` / `TabContent` / `StepperItem` 等子组件）。命令：`rg -o --no-filename "export \{ default as [A-Za-z0-9_]+" src/components/*/index.ts | sed 's/export { default as //' | sort -u | wc -l`。
- **文档站 API 面**（`vue-component-meta` 抽取）：**props 516 / events 85 / slots 70 / exposed 16**。命令：先 `pnpm docs:gen`，再读取 `docs/.vitepress/data/component-meta.json` 逐键求和；该文件**为 gitignored 生成物**，见 §6。
- **冻结语义**：上述名称与语义不得删除或改义；新增**可选** props / events / slots 属向后兼容增量，不受冻结限制。必填性放宽（required → optional）属向后兼容；收紧（optional → required）属破坏性变更。
- **组件契约的权威表述**：以各组件页的 API 表与 `types.ts` JSDoc 为准；本记录只冻结面与复算入口，不复制逐组件清单。

### 2.2 子路径导出（13 键）

`node -e "console.log(Object.keys(require('./package.json').exports).length)"` → **13**。

| 键 | 目标 / 语义 | 冻结 |
|:---|:---|:---|
| `.` | `dist/index.js` + `dist/index.d.ts`，包根 ESM 入口 | 是 |
| `./theme.css` | `dist/styles/index.css`，基础层（token / 暗色 / `.caomei-root` / 预设） | 是 |
| `./locale/zh-tw` | `zh-TW` 文案模块 | 是 |
| `./locale/ja-jp` | `ja-JP` 文案模块 | 是 |
| `./locale/ko-kr` | `ko-KR` 文案模块 | 是 |
| `./locale/es-es` | `es-ES` 文案模块 | 是 |
| `./locale/fr-fr` | `fr-FR` 文案模块 | 是 |
| `./locale/de-de` | `de-DE` 文案模块 | 是 |
| `./locale/ru-ru` | `ru-RU` 文案模块 | 是 |
| `./locale/pt-br` | `pt-BR` 文案模块 | 是 |
| `./resolver` | unplugin 组件解析器（`CaomeiUiResolver`） | 是 |
| `./nuxt` | Nuxt 模块工厂与配置 | 是 |
| `./package.json` | 约定入口，供工具读取包元数据 | 是 |

- `zh-CN` / `en-US` 为预注册语言，**不提供**子路径；这是冻结形态的一部分。
- 新增键（如未来新增语言子路径）属向后兼容增量；删除 / 重命名 / 改变目标语义属破坏性变更。
- **陈旧口径修正**：`docs/guide/version-policy.md` 与 `docs/i18n/en-US/guide/version-policy.md` 原写「`exports` 全部 5 键」，已在本批改为 13 键。

### 2.3 包根导出名

包根可导入名称共 **324** 个：`Caomei*` **98** / `use*` · `provide*` **7** / 其余 **219**。以下类别中的**既有名称与语义**全部冻结；新增名称属向后兼容增量。

- **组件与图标**：94 个组件名（见 §2.1）+ `CaomeiIcon`。
- **locale 类型**：`CaomeiLocale` / `CaomeiLocaleMessageOverrides` / `CaomeiLocaleMessages`（以上三项计入 `Caomei*` 98）。
- **composables（7）**：`provideLocale` / `useChartFormat` / `useConfirm` / `useLocale` / `useLocaleCode` / `useTheme` / `useToast`。
- **locale 运行时与注入键**：`PRE_REGISTERED_LOCALES` / `caomeiLocales` / `registerLocale` / `defaultLocale` / `defaultLocaleMessages` / `caomeiLocaleKey` / `caomeiLocaleCodeKey`。
- **组件级公开类型（其余 219 的主要构成）**：从 `src/components/*/index.ts` 经 `export *` 上抛的 `*Props` / `*Option` / `*Variant` / `*Event` / `*SlotProps` 等，例如 `ButtonProps`、`SelectOption`、`DataTableColumn`、`ToastPosition`、`RichTextEditorUploader`。
- **共享类型与 helper**：`ComponentSize` / `ComponentVariant` / `ComponentTone` / `OptionFieldAccessor` / `OptionValue` / `IconProps`、`Confirm*` / `Toast*` / `ProvideLocaleOptions` / `ThemeMode` / `UseThemeReturn`，以及图表格式化 helper（`createChartFormat` / `formatChartDate` / `formatChartNumber` / `formatChartPercent` / `formatChartUnit`）。

冻结规则：**既有名称与语义不得删除或改义**；新增导出名属向后兼容增量。组件级公开类型不划入「实现细节」——它们从包根可导入，下游可能直接用于类型标注，故与组件名同档冻结。

复算命令（TypeScript API 枚举包根可导入名）：

```bash
node -e "const ts=require('typescript'),p=ts.createProgram(['src/index.ts'],{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ESNext,moduleResolution:ts.ModuleResolutionKind.Bundler,noEmit:true}),c=p.getTypeChecker(),s=c.getSymbolAtLocation(p.getSourceFile('src/index.ts'));const n=c.getExportsOfModule(s).map(x=>x.getName());console.log('total',n.length,'Caomei',n.filter(x=>x.startsWith('Caomei')).length,'use-provide',n.filter(x=>x.startsWith('use')||x.startsWith('provide')).length)"
```

### 2.4 token 契约（用户 2026-10-24 裁定）

**裁定：取「全量 146 + 已披露覆盖钩子」**，不取「全局 68」。

| 集合 | 数量 | 定义 | 是否冻结 |
|:---|:-:|:---|:---|
| 全局语义层 | 68 | `src/styles` 中的默认声明 | 是（含在 146 内） |
| 全部默认声明 | 146 | 全 `src` 的 `--caomei-*:` 默认声明 | 是 |
| 已披露覆盖钩子 | 288 | 中英组件页「样式定制」表列出的可覆盖变量（两语集合一致） | 是 |
| **有效冻结面（去重）** | **371** | 146 ∪ 288（交集 63） | 是 |
| 消费但未披露（合计） | 98 | 386 个被消费名称 − 288 个已披露名称 | 部分 |
| 其中：有默认声明 | 83 | 已含在 146 内 | 是 |
| 其中：仅消费的内部中间变量 | 15 | 无默认声明、未披露 | 否 |

**裁定理由**：组件页已把 288 个覆盖钩子作为公开「样式定制」能力披露，其中 **225** 个仅有 fallback、无默认声明（288 − 63）。只冻结全局 68 或仅冻结有默认声明的 146，会让这部分已披露钩子落到 1.x 承诺之外，形成「文档承诺强于版本承诺」的落差。15 个仅消费、未披露的内部变量保留调整自由，避免把实现细节锁死。

**冻结语义**：token 的**名称与用途**冻结；默认色值 / 尺寸值可调（视觉细节不承诺像素级稳定）。删除 / 重命名 / 改变用途属破坏性变更；新增 token 属向后兼容增量。

**复算命令**：

```bash
# 写入中间文件：146（默认声明）与 288（中英「样式定制」表；剔除 `--caomei-color-` 一类前缀片段）
rg -o --no-filename -- "--caomei-[a-z0-9-]+:" src | sed 's/:$//' | sort -u > tokens-defined.txt
awk '/^## (样式定制|Style customization)/{flag=1;next} /^## /{flag=0} flag' docs/components/*.md \
  | rg -o --no-filename -- "--caomei-[a-z0-9-]+" | grep -v -- "-$" > tokens-documented.txt
awk '/^## (样式定制|Style customization)/{flag=1;next} /^## /{flag=0} flag' docs/i18n/en-US/components/*.md \
  | rg -o --no-filename -- "--caomei-[a-z0-9-]+" | grep -v -- "-$" >> tokens-documented.txt
sort -u tokens-documented.txt -o tokens-documented.txt
wc -l tokens-defined.txt tokens-documented.txt

# 371（有效冻结面）
cat tokens-defined.txt tokens-documented.txt | sort -u | wc -l

# 386 / 98 / 83 / 15（消费面与未披露拆分）
rg -o --no-filename -- "--caomei-[a-z0-9-]+" src | grep -v -- "-$" | sort -u > tokens-consumed.txt
wc -l tokens-consumed.txt
comm -23 tokens-consumed.txt tokens-documented.txt > tokens-consumed-undocumented.txt
wc -l tokens-consumed-undocumented.txt
comm -12 tokens-consumed-undocumented.txt tokens-defined.txt | wc -l
comm -23 tokens-consumed-undocumented.txt tokens-defined.txt | wc -l
```

### 2.5 locale 命名空间与注册形态

- **语言集合**：**10** 语（`zh-CN` / `en-US` / `zh-TW` / `ja-JP` / `ko-KR` / `es-ES` / `fr-FR` / `de-DE` / `ru-RU` / `pt-BR`），显式字面量联合，不由注册表派生。
- **文案结构**：每语 **28 个命名空间 / 80 条文案**；键集合与占位符以 `zh-CN` 为基准，由 `pnpm check:locale-keys` 校验跨语一致性与分发登记。
- **注册形态**：`PRE_REGISTERED_LOCALES = ['zh-CN', 'en-US']` 随包根预注册；其余 8 语经 `caomei-ui/locale/<code>` 子路径引入后调用 `registerLocale()`。`caomeiLocales` 的语义是「已注册表」，不是「内建全集」。
- **冻结语义**：命名空间名称、既有键的名称与语义冻结；**新增**键属向后兼容增量；删除 / 重命名既有键属破坏性变更。预注册集合的改变（扩大或缩小）属破坏性变更。
- **复算命令**：`ls src/locale/*.ts | grep -v -E "index|types" | wc -l` → 10；命名空间 / 键计数：`node -e "const fs=require('fs'),f=fs.readFileSync('src/locale/zh-cn.ts','utf8');console.log((f.match(/^ {4}[a-zA-Z0-9_]+:/gm)||[]).length,(f.match(/^ {8}[a-zA-Z0-9_]+:/gm)||[]).length)"` → 28 / 80。`check:locale-keys` 负责跨语一致性与分发对应，绝对计数以本记录复算值为准。

### 2.6 `InputNumber` 的 `step` 语义（按 `reka-ui` 2.10.4 冻结）

`reka-ui` 版本固定为 **2.10.4**（`package.json` 的 `dependencies`）。当前语义：

- `step` 缺省为 **1**；传入非正数（`<= 0`）时回退为 1。
- 步进以**当前值为起点**按 `step` 累加 / 递减，**不吸附到 `step` 的整数倍**（`NumberFieldRoot` 显式传 `:step-snapping="false"`）。
- 步进与失焦结果先按 `precision`（优先）或 `maxFractionDigits` 取整，再按 `min` / `max` 钳制；`-0` 归一为 `0`。
- `change` 在失焦、回车、步进指针释放时发出。

**冻结语义**：上述四条行为在 1.x 内保持不变。升级 `reka-ui` 若改变 `NumberField` 的 `step` / `stepSnapping` 行为，须按破坏性变更处理（或提供兼容层），不得静默跟随。

复算入口：`src/components/input-number/input-number.vue` 的 `resolvedStep` / `normalize` / 模板 `:step-snapping="false"`；定向测试 `src/components/input-number/input-number.test.ts` 的 `step` 用例。

## 3. 例外与弃用流程

### 3.1 冻结面例外（安全 / 正确性必须破坏时）

1. **单独决策**：在治理记录中列明破坏面、影响范围、替代方案与不破坏的后果。
2. **版本**：1.0 之前按 0.x 冻结窗口的 `minor` 处理；**1.0 之后只能随 `major` 发布**，不得在 `minor` / `patch` 静默破坏。
3. **披露**：CHANGELOG 的 `BREAKING CHANGES` 段 + [发布指南](../../guide/release.md) 的下游修复指引 + GitHub Release note。
4. **迁移**：给出可执行的替换写法；无法平滑迁移时提供至少一个 `minor` 的弃用过渡。

### 3.2 弃用政策（deprecate → 下个 major 移除）

1. 在**最近一个 `minor`** 标记弃用：文档标注、类型 JSDoc `@deprecated`、CHANGELOG 的 `Deprecations` 段。
2. 弃用项**至少保留一个 `minor`**，期间保持可用（可含开发期告警，但不得静默移除）。
3. 在**下一个 `major`** 移除；移除须列入 `BREAKING CHANGES` 并给出替换写法。
4. `patch` 不引入弃用、不改变公开契约。

### 3.3 预发布与冻结生效点

- `1.0.0-rc.N` 发布到 npm `next` 通道，不占用 `latest`；`1.0.0` 发布后才更新 `latest`。
- 冻结**自 `1.0.0-rc.1` 起生效**，供下游按最终形态复验；`rc → 1.0.0` 只允许修复与文档调整。

## 4. 「最后一破」归零确认

- **已发布且不回改**：`0.7.0` 的语言包形态（预注册 + 按需子路径）已发布，按点时快照保留，不回改、不回退。
- **1.0 前剩余破坏 / 准破坏项**：Phase 26 M2-1 ~ M2-4（DataTable 全选作用域、`lazy` 跨页选择收敛、`rowKey` 缺省撞 id、`engines` 提升）。四项**必须在 `1.0.0-rc.1` 前完成**。
- **归零结论**：本记录产出时点复核 Phase 26 全部条目，除 M2-1 ~ M2-4 外**无其它破坏 / 准破坏面**；M1（文档与决策）、M3（发布链路与交付）、M4（复验）均不改变公开契约。`1.0.0-rc.1` 之后不再接受破坏面变化，`rc → 1.0.0` 只做修复。
- **执行期复核点**：M3-3 发布 `1.0.0-rc.1` 前，逐条确认 M2-1 ~ M2-4 已交付且 Review Gate 放行；未完成则不得发 rc。

## 5. 验证证据（2026-10-24）

| 项 | 命令 | 读数 |
|:---|:---|:---|
| `exports` 键数 | `node -e "console.log(Object.keys(require('./package.json').exports).length)"` | 13 |
| 组件目录 | `ls src/components \| grep -v _shared \| wc -l` | 56 |
| 根导出组件名 | `rg -o --no-filename "export \{ default as [A-Za-z0-9_]+" src/components/*/index.ts \| sort -u \| wc -l` | 94 |
| 根导出名总数 | §2.3 TypeScript API 命令 | 324（`Caomei*` 98 / `use*`·`provide*` 7 / 其余 219） |
| API 面 | `pnpm docs:gen` 后读取 `component-meta.json` 求和 | props 516 / events 85 / slots 70 / exposed 16 |
| token 默认声明 | §2.4 第一条命令 | 146 |
| token 已披露钩子 | §2.4 第二组命令（中英各一次） | 288 / 288 |
| token 有效冻结面 | §2.4 合并命令 | 371 |
| token 消费面 | §2.4 第四组命令 | 386 / 未披露 98（含已声明 83 / 纯内部 15） |
| 语言数 / 结构 | §2.5 复算命令 | 10 语 / 28 命名空间 / 80 键 |
| `reka-ui` 版本 | `node -e "console.log(require('./package.json').dependencies['reka-ui'])"` | 2.10.4 |

## 6. 未覆盖边界

- **不落地守卫**：API 表面基线的形态与守卫由 M1-3 只做评估，不在本批实现。
- **生成物限制**：`docs/.vitepress/data/component-meta.json` 为 gitignored 生成物，不能直接充当提交态基线；§2.1 的 516 / 85 / 70 / 16 为**本次复算值**，发布前须重新生成复核。
- **token 已披露集合的口径**：只取中英组件页「样式定制」章节表格内的变量名（2026-10-24 实测均为 288 且集合一致）；示例代码或其它章节偶然出现的变量名**不构成披露**，也不进入冻结面。
- **未逐条冻结组件清单**：本记录冻结的是「面 + 规则 + 复算入口」，逐组件 props / events / slots 清单以组件页与 `types.ts` 为准，避免双载体漂移。
- **不涉及实现**：本批零 `src/**`、零测试、零配置。

## 7. Review Gate

- **audit-depth**：`standard`（本批为文档 / 治理记录，但含 1.x 公开承诺与定量复算，按「判定表类交付至少 standard」取档）；时间盒 ≤ 10 分钟。R1 于 2026-10-24 08:22:16Z 发起、R2 发起前已返回（实测 ≤ 6 分 26 秒，未超时间盒）。
- **R1（`standard`）：`Reject`**（1 blocker / 3 warning / 3 suggest），7 条全部同批修复：
  - **RG-B1**：§2.4 的「89 个未披露内部变量」与 146 默认声明重叠（78 个同时被判冻结与不冻结）⇒ 拆为「消费但未披露 98 = 有默认声明 83（已含在 146，冻结）+ 仅消费内部变量 15（不冻结）」，有效冻结面 375 → **371**；§1 / 裁定理由 / §5 / 索引 / `todo.md` 同步。
  - **RG-W1**：`reka-ui` 复算命令误用 `devDependencies` ⇒ 改为 `dependencies`，实跑 2.10.4。
  - **RG-W2**：§2.3 的包根导出名枚举不完整（漏组件级类型 / `IconProps` / 注入键）⇒ 改为冻结全部 **324** 个包根可导入名（`Caomei*` 98 / `use*`·`provide*` 7 / 其余 219），并给 TypeScript API 复算命令。
  - **RG-W3**：288 / 297 的口径与命令不一致 ⇒ 统一为「样式定制」章节表格口径 **288**（中英一致），命令改用 `awk` 限定章节，§6 与命令一致。
  - **RG-S1**：例外流程补「0.x 按 `minor`、≥1.0 按 `major`」分界。
  - **RG-S2**：locale 计数补可执行命令，并注明 `check:locale-keys` 的职责边界。
  - **RG-S3**：英文版本策略页的治理记录链接注明「record is in Chinese only」。
- **R2（`delta`，`quick`）：`Pass`**（R1 的 1 blocker / 3 warning / 3 suggest 全部闭合；新增 1 warning）。时间盒 ≤ 5 分钟，实测约 2 分钟。
  - **RG-W1（R2）**：复算命令块未写出中间文件，按字面执行会缺文件 ⇒ 已改为自包含命令块（写入 `tokens-defined.txt` / `tokens-documented.txt` / `tokens-consumed.txt` / `tokens-consumed-undocumented.txt`）。调用方复算 146 / 288 / 371 / 386 / 98 / 83 / 15 **全部复现**，按「已修复未复审」登记。
- **验证证据**：`pnpm lint:md:check` exit 0；`pnpm docs:check` 12 段全绿（含 `docs:check:links`）；`check:governance-records` / `check:governance-counts` / `check:planning-numbers` / `check:final-newline` / `check:candidate-anchors` exit 0。定量复算见 §5 与 §2.4 命令块。
- **未覆盖边界**：未跑全量 `pnpm verify` / `docs:build`（本批零 `src/**`、零测试、零配置）；未重跑 `pnpm docs:gen`（API 面读数沿用 2026-10-21 生成物）；未审 M1-2 ~ M4-2。
- **复查基线**：本记录 §1 / §2.3 ~ §2.6 / §3.1 / §4 / §5；`docs/guide/version-policy.md` 与 `docs/i18n/en-US/guide/version-policy.md` 的 `exports` 段；`docs/design/governance/index.md` 首条；`docs/plan/todo.md` M1-1 行。
