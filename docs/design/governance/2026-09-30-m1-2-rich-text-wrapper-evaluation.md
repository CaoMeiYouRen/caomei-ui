# M1-2 富文本封装形态与依赖选型评估

> 创建时间：2026-09-30
> 归属：Phase 17 M1-2（[待办事项](../../plan/todo.md)）
> 口径来源：用户 2026-09-29 裁定——**富文本维持外购不自研**；**兼容主题与轻量封装不互斥**（形态待定，不做形态预设）；**优先考虑暗色切换与国际化切换的联动**，**然后**再考虑与库样式兼容的主题。裁定原文与落点见[下一阶段范围评估 §3.3 / §8.1 D5](./2026-09-30-next-stage-scope-evaluation.md)（[Backlog §1.3](../../plan/backlog.md) 为该能力的候选载体行）。
> 本记录为**评估交付，不改 `src/**`**；实现（含包装组件、导出面、文档）归 **M1-3**。

---

## 1. 背景与目标

- 本库「不纳入自研的能力」中，富文本编辑器维持**外购不自研**（同图标逻辑：第三方库作库依赖 + 轻量包装统一 API / 样式）。用户 2026-09-29 进一步明确：**先做暗色 / 国际化联动**，兼容主题后置。
- 下游 **momei** 在管理端以 `mavon-editor`（`^3.0.2`）承载 Markdown 编辑，迁移期实测「第三方库与 UI 的暗色模式 / 国际化不联动」——本记录以 momei 现有集成代码为一手痛点证据，再对候选库做多源核对。
- **M1-2 交付物**：① 候选与选型结论；② 暗色 / 国际化联动方案；③ 包装 API 边界；④ 依赖许可面影响。**不含实现**。

---

## 2. 下游一手取证（momei，只读）

取证快照：momei `02346816`（工作区脏状态与本记录无关）。相关文件：`utils/web/admin-markdown-editor.ts`、`components/admin/mavon-editor-client.client.vue`、`package.json:149`（`"mavon-editor": "^3.0.2"`）。

现有集成把「库不联动」的代价显式写在适配层里，共 **5 类手工补偿**：

| # | 现象 | 取证位置 | 说明 |
|:-:|:---|:---|:---|
| P1 | **语言需手工映射** | `admin-markdown-editor.ts:94-116` `resolveMavonEditorLanguage` | 逐分支映射 `zh-CN` / `zh-TW` / `ja-JP → ja` / `ko-KR → en` / `en*` → `en`，其余回落 `zh-CN` |
| P2 | **语种覆盖缺口** | 同上 | `ko-KR` **无原生支持**、只能回落 `en`；`ja-JP` 也要改写成库的 `ja` 键名 |
| P3 | **暗色需手工注入背景色** | `mavon-editor-client.client.vue` 模板 | 逐项传 `toolbarsBackground` / `editorBackground` / `previewBackground`（用 momei 自建 `--momei-md-*` 变量），非自动跟随宿主主题 |
| P4 | **需 patch 组件内部方法** | `admin-markdown-editor.ts:126-155` `patchMavonEditorComponent` | 覆写 `editableTextarea` / `getTextareaDom` / `textAreaFocus`，依赖 `$refs.vNoteTextarea.$refs.vTextarea` 内部结构 |
| P5 | **SSR 需隔离 + 手工引样式** | `mavon-editor-client.client.vue` | `defineAsyncComponent` + `.client.vue` 后缀；手工 `import 'mavon-editor/dist/css/index.css'` 与 `katex` 样式 |

结论：**若包装层能自动完成 P1 / P3 的联动，适配层即可退化为薄透传**——这是 M1-2 的验收指向。

---

## 3. 候选与多源核对

> 核对时间：2026-09-30。来源：npm registry 元数据（一手）+ 仓库 README / 类型定义（一手）+ 已下载 tarball 内文件清单（一手）。**未采用二手评测文章**。

| 候选 | 版本（核对时） | 许可 | Vue 3 | SSR | 内置暗色主题 | 内置 i18n | 社区 / 维护（2026-09-30 GitHub API） | 说明 |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| **md-editor-v3** | **7.1.0** | MIT | ✅ peer `vue ^3.5.3` | ✅（README 标 `ssr >1.6.0`） | ✅ `theme: 'light' \| 'dark'`（类型 `Themes`） | ✅ 内置 `zh-CN` / `en-US`，扩展包补 `zh-TW` / `jp-JP` / `ko-KR` 等 | **2,596 ★ / 0 open issues / 最近推送 2026-09-28** | 与 React 版 `md-editor-rt` 同源；按需导入（≥4.0.0） |
| mavon-editor | `latest = 2.10.4`（Vue 2）/ `next = 3.0.2`（Vue 3） | MIT | ⚠️ 3.x 在 `next` tag | 未见声明 | ❌（需手工注入背景） | ⚠️ 覆盖不全（无 `ko`） | 6,573 ★ / **377 open issues** / 最近推送 **2025-03-05** | momei 在用；npm `latest` 仍指向 Vue 2 版；维护长期停滞 |
| Tiptap（`@tiptap/vue-3`） | 3.31.3 | MIT | ✅ | ✅（headless） | ❌ 无内置 UI / 主题 | ❌ 无内置 i18n | 38,585 ★ / 839 open issues / 2026-09-29 | headless 框架，UI / 工具栏 / 主题 / 语言全部自建；非 Markdown 优先 |
| TOAST UI Editor（`@toast-ui/editor`） | 3.2.2 | MIT | ⚠️ 官方 Vue 包装为 Vue 2 时代 | — | ✅ 有暗色主题 | ✅ 多语言 | （本轮未取） | 框架无关核心 + 旧版 Vue 包装，Vue 3 需自封装 |

### 3.1 选型判定

**取 `md-editor-v3`**，理由（逐条对应用户口径）：

1. **Vue 3 原生**：同仓库 `jsx + typescript` 实现，peer 直接声明 `vue ^3.5.3`（与本库 Vue 3.5.x 一致）——无需 P4 类内部 patch。
2. **暗色为一等 prop**：`theme: 'light' | 'dark'`（类型定义 `Themes`，见 §4），包装层可由宿主暗色状态单向驱动，消除 P3 的逐项背景色注入。
3. **i18n 可覆盖 5 语种**：本体内置 `zh-CN` / `en-US`；`@vavt/cm-extension@2.0.0` 的 `dist/locale/` 实测含 `zh-TW` / `jp-JP` / `ko-KR`（及 12 种其它语言）→ **本库 5 语种全覆盖**，消除 P1 / P2 的回落缺口（注意扩展包键名为 `jp-JP`，映射时须转换）。
4. **SSR 与按需导入**：README 声明 SSR > 1.6.0、按需导入 ≥ 4.0.0；对 Nuxt 下游与库产物体积友好（配合包装层 `defineAsyncComponent` / client-only 策略）。
5. **许可与许可面**：MIT（与既有 `check:licenses` 声明流程兼容）；运行时依赖较重（`codemirror@6`、`markdown-it@14`、`@lucide/vue@1` 等），其中 **`markdown-it` 将为本库首个 Markdown 运行时依赖**（本仓 `dependencies` 现为 `@internationalized/date` / `@lucide/vue` / `@tanstack/vue-table` / `reka-ui`，**无 `markdown-it`**）；**M1-3 须把新增依赖登记进第三方许可声明**，并与锁定图谱中的传递版本核对；`@lucide/vue` 与库声明同主版本（本仓 `^1.45.0` vs 库 `^1.16.0`），去重收益真实。
6. **不取 mavon-editor 3.x**：`latest` 仍指 Vue 2（`2.10.4`，2021-12-16），Vue 3 版本停留在 `next` tag、最后发布 2025-03-05；且需 P1~P5 五类补偿。
7. **不取 Tiptap / TOAST UI**：Tiptap 为 headless，UI / 主题 / i18n 全自建，与「轻量封装」目标相悖；TOAST UI 的 Vue 3 包装缺位，仍需自封装（未省下工作量）。

> **版本时效**：上述版本为 2026-09-30 快照；M1-3 开工时须复核 npm `latest` 是否有破坏性升级。

---

## 4. 联动方案（用户口径的核心）

目标：**宿主（caomei-ui）的暗色状态与 locale 变化自动传导到编辑器**，不要求使用方逐项传参。

### 4.1 暗色联动

- 编辑器只暴露 `theme: 'light' | 'dark'`；包装层**从宿主状态派生**——与本库暗色机制保持同一事实源：`useTheme()` 的**本库管控面**为根元素 `class`（`.dark` / `.light`）与 `data-scheme`（`auto` 跟随系统）；`[data-theme="dark"]` 属**手工设定**机制（非 `useTheme()` 写入）。详见[主题与样式设计 §3](../theming.md)。
- 派生方式在 M1-3 落地时二选一（**形态待定，本记录不做形态预设**，遵循用户口径）：
  - **观察根元素**：`MutationObserver` 观察 `documentElement` 的 `class` / `data-theme`（与 `useTheme()` 状态一致）；
  - **经 composable**：复用/新增读取当前解析后主题的 composable，返回响应式布尔量。
- **不做**：不覆盖编辑器内部颜色 token（兼容主题后置，见 §6）。

### 4.2 国际化联动

- 包装层把本库 locale（`CaomeiConfigProvider` / `useLocale` 注入，取值 `zh-CN` / `en-US` / `zh-TW` / `ja-JP` / `ko-KR`）映射为编辑器 `language`：
  - `zh-CN` → `zh-CN`（内置）
  - `en-US` → `en-US`（内置）
  - `zh-TW` → `zh-TW`（扩展）
  - `ja-JP` → `jp-JP`（**键名转换**，扩展包用 `jp-JP`）
  - `ko-KR` → `ko-KR`（扩展）
- 未登记语种**回落 `zh-CN`** 并在开发期给出告警（口径对齐本库「语言矩阵」现状：新增语种须同时登记映射，见 §5 边界）。
- **不做**：不引入机器翻译；不自动加载扩展包全量语言（按需导入登记语种）。

**前置（本轮核实发现，M1-3 必须先解）**：本库 `useLocale()` 返回的是**已解析文案对象**（`ComputedRef<CaomeiLocaleMessages>`，见 `src/composables/use-locale.ts`），注入键 `caomeiLocaleKey` 亦只携带文案——**当前没有读取「locale 代码」的公开入口**（包根导出面见 `src/index.ts`）。因此 M1-3 落地前须先补一个读取入口：优先**新增并导出 `useLocaleCode()`**（或让注入值同时携带语言代码），否则本节「自动联动」无法按字面实现。若最终选择由使用方显式传参，则须同步收敛本节目标表述（「自动联动」降级为「受控传入」）并回到用户口径确认。

---

## 5. 包装 API 边界（M1-3 的输入）

| 面 | 边界 |
|:---|:---|
| **组件名 / 位置** | 建议 `src/components/rich-text-editor/`（`CaomeiRichTextEditor`），与既有组件同构（目录 + `types.ts` + 中英组件页 + 示例） |
| **取值模型** | `v-model`（`string`，Markdown 源）；预览模式可另出 `CaomeiMarkdownPreview`（编辑器只读形态）或由同一组件 `readonly` 承载——**M1-3 定稿** |
| **受控 props** | `theme` 由宿主暗色状态派生（不开放手工覆盖，或仅作逃生舱）；`language` 由宿主 locale 派生——**依赖 M1-3 先补「读取 locale 代码」入口**（见 §4.2 前置）；工具条 / 上传 / 只读 / 高度等按需透传 |
| **上传** | 图片上传按「能力 + 事件」最小落地形态（须连带 `uploader` / 回调，否则是死代码，见 [AI 协作规范 §9](../../standards/ai-collaboration.md)） |
| **样式引入** | 库样式 `md-editor-v3/lib/style.css`（或按需入口）由包装组件引入；宿主侧无需手工 import（消除 P5 的一半） |
| **SSR** | 编辑器主体 `client-only`（`defineAsyncComponent` 或 `.client.vue`）；预览若为纯渲染可评估 SSR 可行性（M1-3 定稿） |
| **不做的** | 不自建工具栏 / 不自研 Markdown 引擎 / 不做富文本 HTML 模式（维持 Markdown 口径）/ 不做拖拽上传的自研实现（复用库能力） |

**依赖影响**：新增运行时依赖 `md-editor-v3`（+ 可选 `@vavt/cm-extension`）；须在 M1-3 一并完成 ① `check:licenses` 声明、② 与既有 `markdown-it` / `@lucide/vue` 的版本去重核对、③ 按需导入的导出面登记（`exports` / resolver / Nuxt 模块是否需要感知）。

---

## 6. 与用户口径的对应与后置项

| 用户口径 | 本记录落点 |
|:---|:---|
| 外购不自研 | §3.1 取 `md-editor-v3`，包装层不碰编辑器内核 |
| 兼容主题与轻量封装**不互斥** | §5 包装 API 只做透传 + 联动，不改库样式；「兼容主题」（把编辑器内部 token 与本库 `--caomei-*` 对齐）**后置** |
| **先**暗色 / 国际化联动 | §4 作为 P0；§3.1 选型依据即「两者可自动派生」 |
| **再**考虑兼容主题 | 后置项：M1-3 不覆盖编辑器内部 token；若后续需要，另立条目（触发条件：下游提出编辑器视觉与宿主不一致） |

---

## 7. 边界与不做（本记录）

- **不改 `src/**`**：本记录为评估交付；实现、导出面与文档归 M1-3。
- **未做的核对**：未实测 `md-editor-v3` 与本库 CSS 变量 / 暗色机制的真实联动（属 M1-3 的 D / V 面）；未核对 `md-editor-v3` 全部传递依赖的许可与体积（M1-3 落地时以 `check:licenses` 与实际产物体积为准）；未评估 `@vavt/cm-extension` 之外的语言获取方式（如自建 locale 覆盖）。
- **不构成阻塞**：下游 momei 现有 `mavon-editor` 集成可继续使用；本记录不要求其立即替换。
- **多源核对口径**：版本 / 许可 / 文件清单均取自 npm registry 与已下载 tarball（一手），核对时间 2026-09-30；下游痛点取自 momei `02346816` 只读代码，未修改其任何文件。

---

## 8. 附：核对命令（可复算）

```sh
# 候选元数据（许可 / peer / 体积）
curl -s https://registry.npmjs.org/md-editor-v3/latest
curl -s https://registry.npmjs.org/mavon-editor | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['dist-tags'])"
# 扩展包语言清单（zh-TW / jp-JP / ko-KR）
curl -sL https://registry.npmjs.org/@vavt/cm-extension/-/cm-extension-2.0.0.tgz | tar tz | grep locale
# 编辑器 prop 类型（theme / language）
curl -sL https://registry.npmjs.org/md-editor-v3/-/md-editor-v3-7.1.0.tgz | tar xz -O package/lib/types/index.d.ts | grep -n "Themes\|language"
```
