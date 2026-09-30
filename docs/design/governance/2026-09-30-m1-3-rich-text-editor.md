# M1-3 富文本轻量封装（`CaomeiRichTextEditor`）交付与验证记录

> 阶段：Phase 17（极简主题预设与富文本封装 + 治理补口）→ M1 极简主题预设与富文本封装 → M1-3 富文本轻量封装实现与文档。
> 范围依据：[待办事项](../../plan/todo.md) M1-3；上游：[M1-2 富文本封装形态与依赖选型评估](./2026-09-30-m1-2-rich-text-wrapper-evaluation.md)。
> 用户口径：2026-09-29「富文本维持外购不自研」+「优先暗色 / 国际化联动、后兼容主题」；2026-09-30 三项实现形态决策（见 §3.1）。
> 本记录是**规模口径的唯一来源**（§6）；其他载体需要数字时引用该节。

---

## 1. 范围与交付物

- **交付**：`CaomeiRichTextEditor`（`md-editor-v3` 的 Markdown 编辑器轻量封装，`v-model` 绑定 Markdown 源）+ 前置的「读取 locale 代码」公开入口 + 全交付面（类型 / 根导出 / Nuxt 注册 / locale 文案 / 中英组件页 / 中英示例 / 画廊登记 / 侧栏 / 总览页 / 迁移映射 / 许可声明）。
- **非目标**（沿用阶段非目标与 M1-2 后置项）：不引入 Tailwind / UnoCSS；不做 HTML 富文本模式；不覆盖编辑器内部颜色 token（「兼容主题」后置）；不提供独立只读渲染组件；不做破坏性 API 变更。
- **验收标准**（`todo.md` M1-3）：暗色与国际化联动实测通过（`@ui-validator`）；`check:licenses` / `typecheck` / `docs:check` / `pnpm verify` 全绿；零破坏性 API 变更。

---

## 2. 实现

### 2.1 前置：读取 locale 代码（M1-2 §4.2 发现的缺口）

- 新增注入键 `caomeiLocaleCodeKey`（`InjectionKey<ComputedRef<CaomeiLocale>>`）与 `useLocaleCode()`，并从包根导出；`provideLocale()` 在提供文案之外同时提供语言标识（`<CaomeiConfigProvider>` 经 `provideLocale` 自动获得）。
- 新增内部工具 `resolveLocaleCode()`（未知值 / 原型链键回退 `defaultLocale`），`resolveLocaleMessages()` 改为复用它，消除重复的真值判断逻辑；行为等价（`caomeiLocales['zh-CN'] === defaultLocaleMessages`，原型链防护保留）。
- **零破坏性**：`caomeiLocaleKey` 语义、`useLocale()` 返回值、`provideLocale()` 返回值均不变。

### 2.2 组件与联动

- 目录 `src/components/rich-text-editor/`：`rich-text-editor.vue`（组件）、`types.ts`（props / 上传器类型）、`editor-language.ts`（语言映射与按需加载）、`use-editor-theme.ts`（暗色解析）。
- **API**：`v-model`（`string`，Markdown 源，`defineModel` 承载）；`placeholder` / `readonly` / `disabled` / `height` / `preview`（默认 `true`）/ `toolbars` / `noUploadImg` / `autoFocus` / `maxLength` / `theme`（逃生舱）/ `uploader` / `label`；事件 `change`（转发内核 `onChange`）。
  - `preview` 用 `withDefaults(..., { preview: true })` **显式声明默认值**：Boolean prop 传 `undefined` 会被 Vue 归一为 `false`，无法回落到内核默认（`true`）。
  - `uploader?: (files: File[]) => Promise<string[]> | string[]` 接入内核 `onUploadImg`；未提供时不注入该回调（交由内核内建行为，按需内联 data URL）。上传失败不抛出、回传空列表并告警。
- **暗色联动**：`useEditorTheme()` **观察 DOM**（`documentElement` 的 `class` / `data-theme` / `data-scheme` + `prefers-color-scheme`），解析优先级对齐 `theme.css` 与预设选择器（`.dark` / `[data-theme='dark']` → 暗；`.light` / `[data-theme='light']` → 亮；`[data-scheme='auto']` → 跟随系统；未挂标记按亮）。**不做形态预设**：之所以不读 `useTheme()` 的 `mode`，是因为该 composable 每次调用都创建局部状态、不是可跨组件读取的全局单例；DOM 才是它与手工 `[data-theme]` 共用的唯一事实源。SSR 初值 `false`、`onMounted` 后再解析，观察者与媒体监听在作用域销毁时清理。
- **国际化联动**：经 `useLocaleCode()` 取语言标识 → 映射编辑器 `language`（`zh-CN` / `en-US` / `zh-TW` / `ko-KR` 同名直用、`ja-JP` → `jp-JP` 键名转换）；`zh-TW` / `ja-JP` / `ko-KR` 经 `@vavt/cm-extension` 的单个 locale 文件**按需加载**并 `config({ editorConfig: { languageUserDefined } })` 注册；未登记语种回落 `zh-CN` 并告警。运行期切换 `<CaomeiConfigProvider>` 的 `locale` 即时更新，且以请求序号守卫避免「后到先写」。
- **SSR / 可选 peer**：内核与扩展语言包**只以动态 `import()` 访问、无静态 import**；因此包根 `.d.ts` 不引用其类型、未安装时不影响其余组件与包根类型解析。SSR 渲染占位，客户端挂载后再加载内核；加载失败渲染 `role="alert"` 占位并告警。
- **样式**：内核样式由组件按需加载（`md-editor-v3/lib/style.css`），宿主无需手工引入；覆盖钩子 `--caomei-rich-text-editor-radius` / `--caomei-rich-text-editor-min-height`。根类声明 `min-width: 0`（见 §5 P1）。

### 2.3 依赖与构建

- `md-editor-v3`（`^7.1.0`）：**可选 peerDependency**（`peerDependenciesMeta.optional`），本地以 devDependency 安装用于构建 / 测试 / 验证。用户 2026-09-30 决策。
- `@vavt/cm-extension`（`^2.0.0`）：**常规 `dependencies`**。用户决策为「纳入」以覆盖 5 语种；同时这是 Review Gate R1 warning 的修复结果——组件内对扩展包的 import 是**字面量动态 import**，消费方打包器（Vite / Rolldown）会在构建期解析它，若为「可选 peer 且消费方未安装」将直接构建失败，与「仅需要时再加」的文档口径矛盾（见 §7 RG-W1）。作为常规依赖后由本库依赖树解析，按需加载仍在运行期生效。
- `tsdown.config.ts` 的 `neverBundle` 新增两者（保持 external），`scripts/release/check-build.mjs` 的 `REQUIRED_RUNTIME_EXPORTS` 新增 `CaomeiRichTextEditor` 与 `useLocaleCode`。
- `THIRD-PARTY-LICENSES` 新增 `md-editor-v3@7.1.0` 与 `@vavt/cm-extension@2.0.0` 条目（许可全文取自安装包，`check:licenses` 通过）。

### 2.4 交付面齐备性

类型 / 根导出（`src/index.ts`）/ Nuxt 注册（`src/nuxt/components.ts`，漂移守卫通过）/ resolver（前缀通配，无需逐组件登记）/ locale（新增命名空间 `richTextEditor: loading, loadFailed`，5 语种 + 台账）/ 中英组件页（各 7 个 H2 对称）/ 中英示例各 2 个 / 画廊登记 / 侧栏与总览页 / 组件清单 / 迁移映射（`## 从 mavon-editor 迁移`，PrimeVue 无对应项）/ 许可声明。

---

## 3. 设计决策与有意差异

### 3.1 本轮由用户裁定的三项形态

| 决策 | 取值 | 落点 |
|:---|:---|:---|
| 富文本内核的依赖放置 | **可选 peerDependencies** | `package.json` peer + peerMeta.optional；文档要求「使用本组件前须安装 `md-editor-v3`」 |
| 是否纳入 `@vavt/cm-extension` | **纳入**（5 语种全覆盖） | 作为常规 `dependencies`（见 §2.3 与 §7 RG-W1） |
| 组件形态 | **仅 `CaomeiRichTextEditor`** | 不提供 `CaomeiMarkdownPreview`；只读场景走 `readonly` |

### 3.2 有意差异与口径修正

- **未登记语种回落 `zh-CN` + 告警**（对齐本库语言矩阵现状）。
- **`theme` 不开放逐项传参**，仅作逃生舱，缺省由宿主暗色状态派生。
- 告警为**控制台告警**而非严格「开发期」：告警路径用逐级可选访问以兼容「不含 `env` 的 process shim」（不抛错），代价是无法依赖打包器静态替换 `process.env.NODE_ENV` 做生产裁剪——消费者未定义 `globalThis.process` 时按非生产处理、照常输出（仅用于故障诊断）。
- **顺带修正的既有漂移**（本批触碰但非本批引入）：① locale 台账正文计数 `25 个命名空间 / 26 个消费组件` 自 `TagsInput` 起即为陈旧值，已更正为实际值；② `roadmap.md §1 现状句` 同一计数同步；③ `docs/guide/release.md` 的依赖许可清单漏列 `@internationalized/date`，已补。
- **新增规范条款**：`planning.md` §3 第 9 条补「规模计数变更的回扫面」——改动命名空间 / 消费组件数等计数时，回扫面须含 `roadmap.md §1` 现状句与台账 / 脚本基线 / 侧栏 / 总览页 / 画廊登记等全部载体（自然语言计数无机检）。

---

## 4. 质量门

| 项 | 实测 |
|:---|:---|
| `pnpm verify` | **exit 0** |
| `pnpm test` | **100 文件 / 2009 例通过**（较本阶段基线 94 文件 / 1965 例新增 6 个测试文件；分步复跑两次全通过） |
| `test:a11y` | **59 例通过**；新夹具 `CaomeiRichTextEditor` `V=0 I=0 P=13`；夹具预算 **51 → 52** |
| `check:locale-keys` | 基准 zh-CN **27 命名空间 / 78 条**；5 语种各 **78**（基线同步由 26/76 更新） |
| `check:locale-ledger` | 通过（中英台账表与 `types.ts` 结构一致） |
| `check:licenses` | 通过（新增两条许可声明） |
| `check:build` / `check:nuxt` / `check:resolver` | 全通过（含新增必需导出断言） |
| `pnpm build` + 产物核对 | `dist` 中 `md-editor-v3` / `@vavt/cm-extension` **仅动态 `import()`**，`dist/**/*.d.ts` 无类型引用 |
| `capture:styles` | **245 项 0 差异** |
| `docs:check` 全链 | 通过（结构 237 页 / 侧栏 6 组 48 条目；画廊 14 项；i18n-parity 60/60） |
| `governance:check` | 通过 |

命中并行负载 flaky：`data-table.test.ts:229`（隔离 3/3、全量两次 2009 例全通过）与 `dropdown-menu.test.ts:429`（隔离 25/25、随后全量两次全通过），均与本次改动无因果，按测试规范 §6.1 登记 [Backlog §1.6](../../plan/backlog.md)。

---

## 5. V 阶段（`@ui-validator`，真实 Chromium）

**结论：暗色联动与国际化联动实测通过；发现并闭合 1 处窄屏溢出缺陷。**

- **文档站真实页面**（`/components/rich-text-editor` 与 `/en-US/components/rich-text-editor`）：编辑器真实渲染（`.md-editor` 存在、加载占位 0）；点击站点自带暗色开关 `html.dark` 后编辑器 `data-theme` 由 `light → dark`、计算背景色 `rgb(255,255,255) → rgb(0,0,0)`、前景色 `rgb(63,74,84) → rgb(153,153,153)`，再切回正常；中英两页 console error / page error / 请求失败 / HTTP≥400 均为 0。
  - 更正任务书的一处假设：`md-editor-v3@7.1.0` 用根元素 **`data-theme` 属性**表达暗色，**不存在** `md-editor-dark` 类。
- **locale 联动**（自建 Vite harness + `CaomeiConfigProvider`）：5 语种工具条提示两两可区分（如加粗：`加粗` / `bold` / `加粗` / `太字` / `진하게`）；运行期切换（zh-CN → ja-JP）节点未重挂载而文案即时更新；`ja-JP` 确认使用 `jp-JP` 资源（`太字`）而非 `zh-CN` 回落；`.dark` / `[data-theme]` / `data-scheme=auto` 三分支在 harness 中同样驱动 `theme`。
- **包裹层可访问性**：传 `label` 时容器输出 `role="group"` + `aria-label`；不传时两者均不输出。
- **加载失败降级**：阻断内核模块后渲染 `role="alert"` 占位并告警、无 `.md-editor`。
- **P1（缺陷，已闭合）**：窄屏页级横向溢出——组件根只设 `width: 100%`，作为 grid 项时 `min-width: auto` 被内核 `nowrap` 工具栏的 min-content 撑开。真实几何：390 视口 `documentElement.scrollWidth` **1034**（超出 644）、834 视口 **1083**（超出 249）；1440 下 wrapper 989 亦超出内容列 686。**修复**：根类补 `min-width: 0`（溢出交由内核工具栏自身横向滚动）。**复验**：390 / 834 / 1440 三档 `scrollWidth == clientWidth`（溢出 0），wrapper 与父容器同宽（300 / 646 / 646），工具栏窄屏可滚动且末项可达，暗色跟随与 console 0 报错维持。
- **回归守卫**：新增声明级契约 `test/contracts/rich-text-editor-layout.test.ts`（根类须同时声明 `width: 100%` 与 `min-width: 0`），负向对照通过（去掉 `min-width` 即失败）。真实几何层断言登记为 [Backlog §1.6](../../plan/backlog.md) 候选。

---

## 6. 规模（唯一口径）

- **文件 / 行数**：`54 文件 / +2480 −44`（36 个跟踪文件改动 `+969 −44` + 18 个新增文件 `+1511`）。
- 复算命令（base = 本批起点提交 `2f8dc00`，持久 ref）：`git diff 2f8dc00 --numstat | awk '{a+=$1;d+=$2;n++} END{print n,a,d}'` 得跟踪部分（输出 `36 969 44`）；`git ls-files --others --exclude-standard | xargs wc -l | tail -1` 得新增部分（输出 `1511 total`）。快照时点见 §9。
- 拆分提交口径：按交付面切分（前置 + 实现；依赖与构建；测试与守卫；文档与登记），每段独立提交，详见提交记录。

---

## 7. Review Gate

- **R1（`standard`）：`Reject`**——1 blocker / 1 warning / 5 suggest。
  - **RG-B1（blocker）**：`docs/plan/roadmap.md:12` 仍写「25 个命名空间 × 26 个消费组件」，与本批更新后的 27/28 冲突（同一事实两套计数，本仓最高频 blocker 类）。**已闭合**：roadmap 现状句改为 27/28；台账脚本注释同步；新增 `planning.md` 规模计数回扫条款；`rg` 全仓核对后仅历史快照类记录保留旧值（不改）。
  - **RG-W1（warning）**：`@vavt/cm-extension` 原为可选 peer，但字面量动态 import 在 Vite / Rolldown 消费方构建期不可解析 → 未安装即构建硬报错，与「需要时再加」的文档口径矛盾。**已闭合**：移入常规 `dependencies`，中英组件页表述改为「`md-editor-v3` 未安装 → 引入组件即打包期不可解析；未使用组件不受影响；组件内占位覆盖**运行期**加载失败」。证据：临时消费方 Vite 构建探针 `BUILD_OK`，产物含 `chunk-jp-JP.js` / `chunk-ko-KR.js` / `chunk-zh-TW.js` 与编辑器 CSS 钩子（局限：`caomei-ui` 以 symlink 指向仓库根，未隔离消费方包布局）。
  - RG-S1 ~ RG-S5：观察者 / 媒体监听清理无单测、watch 竞态、`in` 与 `hasOwnProperty` 口径、peer 下界、`devWarn` 抛错风险——**全部处理**（见 R2）。
- **R2（`standard`，delta）：`Pass`**——0 blocker / 2 warning / 4 suggest。
  - 的 1 blocker 与 1 warning 均判定**已闭合**。
  - R2 warning-1：媒体监听清理仍无断言 → **已补** `matchMedia` 用例（`removeEventListener('change', 同一回调)` 恰一次），负向对照通过（删除清理调用即失败）。
  - R2 warning-2：竞态用例不判别守卫 → **已补**独立判别性用例（deferred 控制完成顺序，令「后发起者先完成」），负向对照通过（移除序号守卫则结果退回先发起者）。
  - R2 suggest-1（`devWarn` 生产裁剪退化）**以口径说明闭合**（见 §3.2）；suggest-2（peer 下界对齐实测版本 `^7.1.0`，理由：仅验证过 7.1.0，lockfile 单一版本、无 duplicate-install）**采纳并留痕**；suggest-3（规范条款归类）**已改**为并入 `planning.md §3` 第 9 条；suggest-4（历史快照计数可接受）**无需动作**。
- 审计用时：R1 实测 **20 分 05 秒**（发起 `2026-09-30T06:20:38Z` → 返回 `06:40:43Z`，声明时间盒 20 分钟 soft，未超）；R2 实测 **12 分 18 秒**（发起 `06:40:43Z` → 返回 `06:53:01Z`；返回时点与 R1 间隔含主 session 修复耗时，R2 的 delta 盒按 12 分钟计，判定未超）。

---

## 8. 边界与未覆盖

- **未覆盖**：真实几何层的窄屏溢出断言（仅声明级守卫，候选见 Backlog）；`md-editor-v3@7.0.x` 兼容性（以 7.1.0 验证）；隔离消费方包布局下的「未使用内核」树摇路径（仅由 `dist` 无静态 import + `sideEffects` 声明推断）；编辑器内部颜色 token 与本库 token 的对齐（「兼容主题」后置项）。
- **不构成阻塞**：下游 momei 现有 `mavon-editor` 集成可继续使用；本批不要求其立即替换。

---

## 9. 复算命令与快照

```sh
# 规模（base 为持久 ref）
git diff 2f8dc00 --numstat | awk '{a+=$1;d+=$2} END{print "tracked +",a," -",d}'
git ls-files --others --exclude-standard | xargs wc -l | tail -1

# 计数一致性（逐载体核对）
rg -n "个命名空间|个消费组件|namespaces|consuming components" docs/plan docs/components docs/i18n/en-US/components
node scripts/governance/check-locale-keys.mjs
node scripts/governance/check-locale-ledger.mjs

# 产物静态面（可选 peer 不被静态引用）
rg -n "from ['\"]md-editor-v3|from ['\"]@vavt/cm-extension" dist/
```

- 快照时点：2026-09-30（UTC+0 06:53 前，V 复验完成后、提交前）。
