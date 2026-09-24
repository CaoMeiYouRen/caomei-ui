# M2 `TagsInput` 组件交付与验证记录（M2-1 实现与接线 / M2-2 组件页与示例 / M2-3 登记面接入）

> 阶段：Phase 13（组件能力补齐与 dependfix 迁移解阻）→ M2 缺失组件补齐（`TagsInput`）。
> 范围依据：[下一阶段范围评估 §6 / §11](./2026-09-23-next-stage-scope-evaluation.md)；条目登记：[待办归档](../../plan/todo-archive.md) Phase 13 M2；M1 记录见 [M1-1](./2026-09-23-m1-1-row-grouping.md) / [M1-2](./2026-09-23-m1-2-expandable-row-groups.md) / [M1-3](./2026-09-23-m1-3-row-expansion.md) / [M1-4](./2026-09-23-m1-4-multi-sort.md)。

## 1. 范围与目标

新增 `CaomeiTagsInput`（标签输入：多值 `v-model`、自由文本、回车 / 分隔符提交、标签删除、`max` / 去重 / `disabled` / `invalid` 等字段契约），封装 Reka `TagsInput` primitive（用户裁定 D5）；并按既有组件交付面齐备（类型 / 导出 / Nuxt 注册 / locale / a11y 受检面 / 中英组件页 / 示例 / 迁移节 / 设计规范 §7）。

**下游取向（评估记录 §6 M2）**：PrimeVue `Chips`（v4 起为 `InputChips` 的旧名）迁移**首选本组件**，`AutoComplete + multiple` 降为**备选**（后者是带选项面板的搜索选择，语义不同，仅在需要异步建议时使用）。

非目标：异步建议（`AutoComplete` 的职责）、标签分组 / 拖拽排序、`#chip` / `#chipicon` 插槽、图标替换、`variant`、`pt` / `dt` / `unstyled`、对象型标签值。

## 2. API 契约（对齐 PrimeVue / Reka 的命名映射）

| PrimeVue（`InputChips`） | 本库 | 说明 |
| :--- | :--- | :--- |
| `modelValue` | 同名（`string[]`） | `defineModel` 承载，故 props 接口不含 `modelValue` |
| `separator` | `delimiter` | 默认 `,`，另支持正则（Reka 命名） |
| `max` | 同名 | 缺省不限 |
| `allowDuplicate`（默认 `true`） | 同名但**默认 `false`** | 拒绝重复并抛 `invalidInput`；需要允许时显式传 `true` |
| `addOnBlur` | 同名（默认 `false`） | — |
| `inputId` / `ariaLabel` / `ariaLabelledby` | `id` / `label` / 透传 | `aria-labelledby` 经 `controlAttrs` 落输入框 |
| `invalid` / `disabled` / `placeholder` | 同名 | `invalid` 映射 `aria-invalid` + 错误态描边 |
| `fluid` | 删除 | 字段默认 `width: 100%` |
| `inputClass` / `inputStyle` / `inputProps` | 根 `class` / `style` + 透传 | class / style 留在字段根，其余原生属性落输入框 |
| — | `showClear` / `clearLabel`、`size`、`addOnPaste`（**默认 `true`**）、`addOnTab`、`label`、`invalidInput` 事件 | 本库新增或改默认 |

行为口径：回车提交；键入分隔符即提交；粘贴默认按分隔符拆分；点击标签删除按钮删除；键盘在输入框内按 `Backspace` **先选中末位标签**、再次按下删除（已选中时 `Backspace` / `Delete` 均可删除）；清空只重置模型并抛 `update:modelValue`，不逐个抛 `removeTag`；被拒绝的输入保留在输入框（无程序化清空入口）。

## 3. 有意差异（逐条）

1. **`allowDuplicate` 默认相反**：PrimeVue 默认 `true`（允许重复），本库默认 `false`（拒绝重复并抛 `invalidInput`），与 Reka 的 `duplicate: false` 一致。
2. **`addOnPaste` 默认 `true`**：上游 Reka 的该布尔 prop 无默认值（实为 `false`）；本库默认开启粘贴拆分（标签输入的预期行为），可置 `false` 关闭。
3. **`separator` → `delimiter`**：沿用 Reka 命名。
4. **无程序化清空草稿入口**：被拒绝的输入保留在输入框（Reka 内部输入框持有，不在 `v-model` 内）；需要清空时用 `:key` 重挂载。
5. **删除按钮可访问名来自标签文本**：Reka 经 `aria-labelledby` 指向标签文本（朗读为「标签名, 按钮」，不含「删除」字样）；`tabindex="-1"` 为 Reka 上游默认，键盘删除走「方向键选中 + `Backspace` / `Delete`」。
6. **包装层 a11y 修复**：标签项显式声明 `role="group"` —— Reka 在 `role=generic` 的 div 上输出 `aria-labelledby`，ARIA 1.2 禁止在 generic 上命名；改 `group` 后 axe 无 `aria-prohibited-attr`，**未新增例外清单条目**（既有 3 条例外不变）。
7. **`data-filled`**：有标签时字段根输出 `data-filled="true"`，接入 `CaomeiFloatLabel` 的 `over` 浮动态（与 Input / Select / MultiSelect / InputNumber 同口径）。

## 4. 实现落点（M2-1）

- `src/components/tags-input/types.ts`：`TagsInputProps`（继承 `FieldProps` + `FieldIdentityProps`，含 `allowDuplicate` / `delimiter` / `max` / `addOnPaste` / `addOnTab` / `addOnBlur` / `required` / `showClear` / `clearLabel`）。
- `src/components/tags-input/tags-input.vue`：`defineModel<string[]>`；`TagsInputRoot` / `Input` / `Item` / `ItemText` / `ItemDelete` / `Clear` 组合；`useAttrForwarding()` + `labelAttrs(label)`；`size` 档位与 `invalid` / `disabled` 走 `--` class + `:where()` 档位块（只声明变量）；`restoreInputFocus()` 在清空后把焦点交回输入框（受控不回写时按钮仍在则不抢焦点）。
- `src/components/tags-input/index.ts` / `src/index.ts` / `src/nuxt/components.ts`：导出与 Nuxt 自动导入注册。
- `src/locale/*`：新增 `tagsInput` 命名空间（`clear`，5 语种）→ 各 **76** 条 / **26** 命名空间；同步 `scripts/governance/check-locale-keys.test.mjs` 基准与中英台账 `docs/components/locale.md`。
- `test/a11y/fixtures.ts`：新增 `CaomeiTagsInput` 夹具，受检预算 **47 → 48**。
- `src/components/tags-input/tags-input.test.ts`（新增，**29 条**）：渲染与根 class / 回车提交 / 本地值写入与 prop 覆盖 / 分隔符提交 / 粘贴拆分（默认与 `addOnPaste: false`）/ 正则分隔符 / 点击删除 / Backspace 两段式 / 去重拒绝与 `allowDuplicate` / `max` 拒绝与缺省不限 / `invalid` 映射 / `disabled` / `size` 档位 / `label` / 删除按钮可访问名 / `placeholder` / `id` / 表单隐藏控件 `name[index]` / `data-filled` / `showClear` 显隐与清空 / `addOnTab` / `addOnBlur` / 既有标签顺序 / 载荷类型。

## 5. 文档与示例落点（M2-2）

- 中英组件页 `docs/components/tags-input.md` / `docs/i18n/en-US/components/tags-input.md`（8 个 H2 对称）：基础用法 / 提交与删除 / 数量与去重 / 状态与尺寸 / 表单与无障碍 / 范围说明 / 样式定制 / 从 PrimeVue 迁移 + `<ComponentApi name="tags-input" />`。
- 中英示例各 3 个：`basic.vue`（基础用法）/ `limits.vue`（`max` + 去重 + 清空 + `invalidInput` 反馈）/ `form.vue`（`FloatLabel` 组合 + `name` / `required` + `invalid` / `disabled` / `size`）。
- [设计规范 §7](../design-spec.md) 新增 TagsInput 迁移映射段（含上游 props 逐条映射、默认差异、包装层 a11y 修复、未实现清单与「首选 / 备选」口径）。
- **未进侧栏（M2-2 时点）**：本条目只落页面与示例；侧栏 / 总览页 / 画廊登记属 M2-3（`docs:check:structure` 的侧栏不变式因此保持 6 组 / 46 条目）。**M2-3 已接入**（§11）：侧栏 / 总览页 / 画廊登记表现与 §11 一致（6 组 / **47** 条目、画廊 **13** 项）。

## 6. 验证与证据

### 6.1 质量门（最终 revision，快照 2026-09-23）

- `pnpm lint:check`（`eslint docs src test --max-warnings 0`）/ `lint:css:check` / `lint:md:check`：通过。
- `pnpm typecheck` / `typecheck:docs`：通过。
- `pnpm test`：**87 文件 / 1767 tests passed**（M1-4 基线 86 / 1737；M2-1 新增 1 文件 / 29 tests）。
- `pnpm test:a11y`：**55 tests passed**（`CaomeiTagsInput` 入受检面，`V=0 / I=0`，未新增例外；预算 47 → 48）。
- `pnpm check:locale-keys`：基准 zh-CN **26 命名空间 / 76 条**；5 语种各 **76** 条。
- `pnpm docs:check`：9 段链全绿（integrity 247 md / links 246 md / structure 208 页 / config-links 158 条 / **i18n-parity 59 对**（+1 = tags-input 中英页）/ version / showcase 12 项 / line-count / i18n）。
- `pnpm build` + `check:build`（8 exports）/ `check:resolver` / `check:nuxt`（Nuxt 自动导入 + 样式注入 + SSR）：通过。
- `pnpm check:design`：通过。
- `pnpm capture:styles`：**239 项逐属性 0 差异**（既有组件零漂移；该装置采样面不含 TagsInput，TagsInput 自身的浏览器证据见 §6.2）。
- `pnpm verify`：**exit 0**。

### 6.2 V 阶段（`@ui-validator`，真实 Chromium）15 项全通过

**验证载体**：M2-2 的中英组件页与 3 个示例（**已随本批提交**，非仅存在于 gitignored 目录）；直接访问 `/components/tags-input` 与 `/en-US/components/tags-input`（新页尚未进侧栏，属 M2-3 范围）。

| 项 | 实测 |
| :--- | :--- |
| 基础渲染 | 标签 2（`Vue` / `TypeScript`）、`data-filled="true"`、输入框 `aria-label="技术栈"`、可聚焦 |
| 回车提交 | 键入 `React` + Enter → 3 标签、输入框清空、提示更新 |
| 分隔符提交 | **真实按键序列**键入 `Vite` 后键入 `,` → 提交成功 |
| 粘贴拆分 | 派发带 `clipboardData` 的 paste(`A,B,C`) → 一次新增 3 个（`defaultPrevented=true`） |
| 点击删除 | 标签消失、`aria-labelledby` 解析文本 = 被删标签 |
| Backspace 两段式 | 首次：计数不变 + 末位标签 `data-state="active"` + `outline: 2px rgb(37,99,235)`；二次：删除末位标签 |
| 数量与去重 | 重复输入与超限输入均计数不变 + 提示含「已拒绝」 |
| 清空 | 标签 0 + `data-filled` 移除 + 焦点回输入框 |
| 状态与尺寸几何 | `invalid`+`disabled`+`sm` 字段 border `rgb(220,38,38)`（danger）/ 背景 `rgb(247,247,248)` / opacity `0.6` / **高 29.19px**；非 invalid `md` border `rgb(229,231,235)` / 高 36px；focus 环 `rgb(37,99,235)` + `color-mix` box-shadow 2px |
| FloatLabel 组合 | 有值上浮（`computedTop=-16px`，与字段不重叠）；清空后回落居中 |
| 表单隐藏控件 | `<form>` 内 `input[name="tags[0]"]` + `required` + `value="重要"` |
| 主题与响应式 | 亮 / 暗实测色值；四档 1440 / 1024 / 768 / 375 文档级与容器级横向溢出全 **0** |
| 中英等价 | 英文页 1~4 等价（`aria-label="Tech stack"` / `Clear`） |
| 控制台噪声 | 中英两页 console error / pageerror / HTTP≥400 / requestfailed 全 **0** |
| 无回归 | `/components/multi-select`、`/components/input` 四类噪声全 0、无 error overlay |

**尺寸数值口径更正（M2-1 第 2 轮复审提出）**：V 阶段报告 sm 字段高 34px；复审在**当前源码**上独立实测为 **29.19px**（= 标签行高 19.2 + 纵向 padding 8 + border 2，与 CSS 计算一致），并复现 md 36px / lg 44px。本记录采用复审值；V 报值属夹具 / 被测元素口径差异，未复现，故不作为结论数值。

未覆盖边界：`addOnTab` / `addOnBlur` 的真机触发（props 存在、默认 `false`，单测覆盖）、`allowDuplicate: true`、自定义 / 正则 `delimiter` 真机、对象型标签值 / `convertValue`、`showClear=false` 组合、RTL、标签间方向键导航、原生表单提交与校验全流程、reduced-motion 过渡对照；像素级美观度比对（验证通道无视觉能力，结论仅基于几何 + DOM/ARIA + 计算样式）。

### 6.3 M2-1 `RG-B01` 闭合（第 1 轮 blocker）

第 1 轮判定「UI 组件改动缺浏览器验证证据」为 blocker（组件已对外导出；`capture:styles` 采样面不含 TagsInput；happy-dom 不算浏览器验证）。**闭合证据**：

1. **验证载体可提交**：组件页 + 3 个示例随本批进入版本控制（§5），非仅存在于 gitignored 的 `artifacts/` / `test-results/`。
2. **证据覆盖第 1 轮点名的全部缺口**：档位几何（sm 29.19 / md 36 / lg 44px）、`:focus-within` 环、`color-mix()` 真实生效、暗色、真机键盘（Backspace 两段式、粘贴拆分、真实按键序列的分隔符提交）——见 §6.2。
3. **独立复现**：复审方自建 Chromium 夹具在当前源码复现了 sm 29.19px / md 36px、invalid+disabled 三项颜色、focus 环与 `color-mix` box-shadow、`role="group"` + `aria-labelledby` + `tabindex="-1"` + `data-filled`、FloatLabel 上浮不重叠、无 pageerror。
4. **无其他新增导出缺口**：`CaomeiTagsInput` 同时进入 `src/index.ts`、`src/nuxt/components.ts` 与 a11y 夹具，V 已覆盖；本批无其他新增导出。

### 6.4 V 之后的 docs-only 改动（证据对齐声明）

V 阶段之后仅有两类改动，均未触及组件运行期行为，且 V 已断言的项不受影响：

1. `limits.vue`（中英）新增 `@add-tag` / `@remove-tag` 重置拒绝提示；`form.vue`（中英）去掉与可见 `<label for>` 重复的 `label` prop（M2-2 复审 S2 / S3）。
2. 组件页（中英）更正键盘模型表述（`Delete` 单独不选中末位标签）、澄清「无程序化清空草稿入口」（M2-2 复审 W1 / W2）；设计规范 §7 更正 `tabindex="-1"` 的归属（上游默认，非包装层修改，M2-2 复审 S1）。

## 7. 规模

**M2-1 面：17 文件 / +719 −6；M2-2 面：9 文件 / +414 −0**（唯一口径；复算命令 `git diff 5344f57 --numstat`（可按路径前缀分面求和），base = M1-4 末提交 `5344f57`（持久 ref），快照 2026-09-23。其余载体不复写该数字，需要时引用本节）。

两面各自低于「建议 10 文件 / 800 行新增」阈值，按交付面拆**两次提交**（`feat(tags-input)` / `docs(tags-input)`），治理记录与规划载体随第三次提交落库；M2-3 的登记面（§11 侧栏 / 总览页 / 画廊登记表）另批收口（§11）。

**M2-3 面：6 文件 / +17 −2**（登记面；复算命令 `git diff 657c02c --numstat -- docs/.vitepress/config.ts docs/.vitepress/showcase-registry.json docs/components/index.md docs/design/components.md docs/design/documentation-site.md docs/i18n/en-US/components/index.md`，base = M2-2 末提交 `657c02c`（持久 ref），快照 2026-09-23）。治理记录本文件追加 §10~§12 为证据与结论载体，不计入登记面规模；M2-3 单批提交。

## 8. 结论

M2-1 / M2-2 已交付：组件在受控与自持两种用法下均有断言（29 条），导出与 Nuxt 自动导入可用，a11y 受检面纳入且 `V=0 / I=0`（未新增例外）；中英组件页与示例齐备、迁移映射含「首选 / 备选」口径，`docs:check` 9 段链全绿；浏览器真机 15 项全通过。Review Gate 结论见 §9。

## 9. Review Gate

**M2-1 第 1 轮（`standard`）：`Reject`（1 blocker / 4 warning / 5 suggest）**，实测用时 **7 分 34 秒**（`2026-09-23T20:25:12+08:00` → `20:32:46+08:00`），未超时间盒。

| 编号 | 级别 | 内容 | 处置 |
| :---: | :--- | :--- | :--- |
| RG-B01 | **blocker** | UI 组件改动缺浏览器验证证据 | 已建立验证载体并完成真机验证（§6.3 闭合）；第 2 轮确认闭合 |
| RG-W01 | warning | 缺 `data-filled`，与 FloatLabel 契约不一致 | 已补（根元素输出）+ 断言 + 真机实测上浮不重叠 |
| RG-W02 | warning | 计划范围含 `Clear` 与 locale 命名空间，实现未提供且无留痕 | 已实现 `showClear` / `clearLabel` + `tagsInput.clear`（5 语种）+ 基准与台账同步 |
| RG-W03 | warning | `addOnPaste` 默认与上游相反未文档化 | 已在组件页与 §7 显式声明偏差与 opt-out |
| RG-W04 | warning | 测试判别力缺口 | 已补 8 条断言（`addOnPaste: false` / 正则分隔符 / `addOnTab` / `addOnBlur` / `max` 缺省不限 / `data-filled` / `showClear` 两条） |
| RG-S01 / S04 | suggest | 删除按钮命名取舍未声明 / `role="group"` 缺注释 | 均已补 |
| RG-S02 / S03 / S05 | suggest | 未修复项 | 保留（无可见影响 / 上游时序 / 契约固定） |

**M2-1 第 2 轮（只审修复点 / `standard`）：`Pass`（0 blocker）**，实测用时 **8 分 12 秒**（`2026-09-23T21:08:37+08:00` → `21:16:49+08:00`），未超时间盒。RG-B01 实质闭合（复审方独立复现关键项）；W01–W04 / S01 / S04 与声明一致；新增 1 条 warning（V 证据中 sm 高度数值失准 → 已在 §6.2 更正为 29.19px）与 2 条 suggest（`placeholder` 在有标签时保留、与 MultiSelect 不同——**保留**：标签输入需持续提示录入方式，且与 PrimeVue 一致；治理留痕落点 → 已按建议在本记录 §6.3 设独立小节并在 `todo.md` 补指针），按规则转 follow-up、不阻断。

**M2-2 第 1 轮（`standard`）：`Pass`（0 blocker / 2 warning / 3 suggest）**，实测用时 **9 分 05 秒**（`2026-09-23T21:20:10+08:00` → `21:29:15+08:00`），未超时间盒。W1（键盘模型过度声明：`Delete` 单独不选中末位标签）、W2（「在 `invalidInput` 中自行处理清空」不可达）、S1（`tabindex="-1"` 归属误记为本库修复）、S2（示例同时传 `label` 与可见 `<label for>`）、S3（拒绝提示在移除后滞留）**已同批修正**（§6.4），记为「已修复未复审」；复审方另确认迁移映射与上游 props 逐条对齐、「首选 / 备选」口径三处一致、中英 H2 8:8 对称、新页未进侧栏属 M2-3 范围（孤儿页盲区为已知且与计划一致）。

## 10. M2-3 登记面接入 · V 阶段（`@ui-validator`，2026-09-23）

**范围**：6 文件登记面 delta（`documentation-site.md` §11 登记表 / `config.ts` 中英侧栏 / 中英组件总览页 / `showcase-registry.json` 第 13 卡 / `components.md` 清单），**无组件源码改动**。被测 revision `657c02c`；delta sha256 `a61c58c7…880e6d9`（`git diff`）。入口 `pnpm docs:dev`（VitePress 1.6.4 / Playwright 1.63.0），验证前按端口清场。

**结论：通过（0 问题 / 1 观察项 / 2 显式跳过）。** 复跑脚本 `test-results/m2-3-tagsinput-registry/m2-3-tagsinput-validate.mjs`；完整记录 `test-results/m2-3-tagsinput-registry-validation.md`。

| # | 断言 | 结论 | 关键实测 |
| :-- | :--- | :--- | :--- |
| 1 | zh 侧栏位次 + 跳转 | 通过 | 组 13 条；`Switch 开关 → TagsInput 标签输入 → Textarea 多行输入` 相邻；URL `/components/tags-input`、H1 `TagsInput 标签输入` |
| 2 | en 侧栏位次 + 跳转 | 通过 | `Switch → TagsInput → Textarea`；URL `/en-US/components/tags-input`、H1 `TagsInput` |
| 3 | zh 总览页 | 通过 | 节内 `Switch 开关 < TagsInput 标签输入 < Textarea 多行输入` 相邻；`./tags-input` → `/components/tags-input` |
| 4 | en 总览页 | 通过 | 两处：`/en-US/components/tags-input` + `/components/tags-input` |
| 5 | zh 画廊 | 通过（观察项 O1） | 卡数 **13**；Form Inputs `Input → Switch → TagsInput`；真实渲染 chip 2 `[Vue, TypeScript]` + 输入框；链接 `/components/tags-input` |
| 6 | en 画廊 | 通过（观察项 O1） | 13 卡；真实渲染；链接 `/en-US/components/tags-input` |
| 7 | 无回归 | 通过 | 13 卡 stage 全非空；既有 12 卡名齐全；侧栏组 13 条无错位 |
| 8 | 噪声 | 通过 | 6 页 × 亮/暗 12 run，四类噪声**全 0** |
| 9 | 响应式 | 通过 | 三档 `scrollWidth-clientWidth=0`；画廊列数 1440/834/390 = **2 / 2 / 1** |
| 10 | 主题 | 通过 | 亮 对比度 卡名 10.94 / chip 16.26 / 侧栏 10.13；暗 12.81 / 16.41 / 13.48；两态预览正常 |
| 11 | a11y 抽检 | 通过 | 侧栏条目 Tab **1 步**可达、可访问名正确；画廊卡链接 `role=link` 名 `TagsInput` |

**观察项 O1**：断言 #5「TagsInput 在 Switch 与 Textarea 之间」的措辞不成立——画廊登记表 Form Inputs 组**未含 Textarea 卡**，TagsInput 实为「Switch 之后、组内末位」。画廊是总览的策展子集，非渲染缺陷；若产品要求画廊含 Textarea，属登记表范围决策（另判）。**O2**：1440/834 画廊列数 2，系 `minmax(min(280px,100%),1fr)` 受内容列宽约束，属设计预期。

**显式跳过**：Step 2.5 宿主稳定性（无浮层 / portal / 滚动锁改动）、reduced-motion 对照（无动画 / 过渡改动）。

**视觉通道声明**：本会话未注册 `vision-augment` MCP，视觉通道**不可用**；结论仅基于几何 / 对比度 / DOM-ARIA / 计算样式，截图留档作人工复核，**美观度未经视觉确认**。

**未覆盖**：生产构建（`docs:build` + preview）下的登记面、834 档暗色、组件自身行为边界（属 §6.2）、`docs:check` 全绿（T 阶段职责）。

**交接**：问题 0；建议回归断言 5 条见 `test-results/m2-3-tagsinput-registry-validation.md` §7，交 `@test-engineer` 在 T 阶段于 build 产物补抽检。`docs/plan/todo.md` Phase 13 进度行仍记「M2-3 未启动」，需由规划归属角色在 M2-3 收口时刷新。

## 11. M2-3 登记面接入 · 交付面与规模

**交付面（6 文件，均为登记面）**：

1. [文档与演示站 §11](../documentation-site.md) 分组登记表——表单输入组新增 `TagsInput`（位于 `Switch` 与 `Textarea` 之间，kebab 序 `slider < switch < tags-input < textarea`）。
2. `docs/.vitepress/config.ts`——中英组件侧栏「表单输入 / Form Inputs」组各新增 1 条（zh `TagsInput 标签输入` → `/components/tags-input`；en `TagsInput` → `/en-US/components/tags-input`）。
3. `docs/components/index.md`——中文组件总览「表单输入」组新增条目。
4. `docs/i18n/en-US/components/index.md`——英文总览两处列表（Translated component pages / Chinese documentation）各新增 1 条。
5. `docs/.vitepress/showcase-registry.json`——新增第 13 项 TagsInput 卡片（Form Inputs 组，示例 `tags-input/basic.vue`）。
6. `docs/design/components.md`——组件清单 §5 Tier 3 新增 `TagsInput` 行（封装 / TagsInput / **稳定** / 已实现），并从「未纳入本清单的 primitive」候选清单移除 `TagsInput、`。

**第 6 项属登记面的理由**：该文件是组件清单，既有组件（Drawer / ColorPicker / SplitButton / DataView 等）均在实现批次的 docs 提交中同步登记「（已实现）」；TagsInput 在 M2-1 / M2-2 漏登，仍列于候选清单，属登记面陈旧项。「稳定」依据：本仓锁定 `reka-ui@2.10.4`，其官方文档站侧栏中 `Tags Input` 无 `Alpha` 标记（同页 `Calendar` / `DatePicker` / `Color Area` 等带 Alpha）。

**未改**：`docs/guide/primevue-migration.md` 的「表单输入」对应表（按计划由 **M3-1** 跨组件收口）；未触碰 `AGENTS.md`。

**规模**：6 文件 / **+17 −2**（唯一口径见 §7；本记录 §10~§12 为证据与结论载体，不计入登记面规模）。单批提交。

## 12. M2-3 Review Gate

**第 1 轮（`audit-depth: standard`；理由：含 VitePress 配置类文件 `docs/.vitepress/config.ts`，按 [AI 协作规范 §3.1](../../standards/ai-collaboration.md)「配置类改动至少 standard」；时间盒 ≤ 10 分钟）：`Pass`（0 blocker / 1 warning / 3 suggest）**，实测 ≤ **5 分 02 秒**（宿主时钟 `2026-09-23T23:00:59+08:00` → `23:06:01+08:00`，含返回后处理；未超时间盒）。审计方独立复现：`git diff --numstat`（7 文件 / +47 −2，全部 `docs/**`）、delta sha256 `a61c58c7…880e6d9` 与 §10 声明逐位一致、`docs:check:structure` / `docs:check:showcase` / `lint:md:check` / `governance:check` 独立复跑通过、Reka 上游成熟度外部核验。

| 编号 | 级别 | 内容 | 处置 |
| :---: | :--- | :--- | :--- |
| RG-W01 | warning | `docs/plan/todo.md` Phase 13 进度行仍记「M2-3 未启动」，与已交付 delta 矛盾 | **已同批修正**（F 阶段刷新进度行与 M2-3 条目状态，§13） |
| RG-S01 | suggest | `docs/plan/backlog.md` 的 TagsInput 候选行仍称「无对应组件与导出」并引用已移除的 §5 候选清单 | **已同批修正**（改为「已交付」口径 + 交付面指针，§13） |
| RG-S02 | suggest | `docs/guide/primevue-migration.md`（中英）「表单输入」对应表未含 TagsInput | **已由 M3-1 闭合**（2026-09-23，[M3 记录](./2026-09-23-m3-migration-delivery.md) §2）：指南「表单输入」入口行已补 `TagsInput`，并补 3 行通用陷阱覆盖 `DataTable` 三项能力与 `TagsInput` |
| RG-S03 | suggest | 中英组件总览页缺 `CheckboxGroup`（既有缺口，非本 delta 引入） | **保留**：已在 [Backlog](../../plan/backlog.md)「组件总览页与侧栏的成员对账」候选在册（含该缺口与守卫候选），本批不扩面 |

## 13. M2 收口结论

M2（`TagsInput` 缺失组件补齐）三条原子条目全部交付：**M2-1** 组件实现与接线、**M2-2** 中英组件页与示例、**M2-3** 登记面接入。组件在受控与自持两种用法下均有断言（29 条），导出与 Nuxt 自动导入可用，a11y 受检面 `V=0 / I=0`（未新增例外）；中英组件页与示例齐备、迁移映射含「首选 / 备选」口径；四处登记面（§11 表 / 中英侧栏 / 中英总览页 / 画廊登记表）与组件清单互相一致，`docs:check` 9 段链全绿（侧栏 6 组 / 47 条目、画廊 13 项）。

**Review Gate**：M2-1 R1 `Reject`（1 blocker：UI 组件缺浏览器证据）→ R2 `Pass`；M2-2 R1 `Pass`；M2-3 R1 `Pass`。W1 / S1 已同批修正，S2 留 M3-1，S3 维持 Backlog 在册。

**T 阶段**：`pnpm verify` exit 0（87 文件 / 1767 tests）；构建产物 SSG 静态断言 18/18（中英画廊 13 卡 + TagsInput SSR 真实渲染 + 链接 + 侧栏 / 总览顺序）。**边界**：本环境 Chromium 打开 preview 服务时对所有页面（含 `/`）均 crash，build 面以 SSG HTML 静态断言替代浏览器渲染，客户端 hydration 后行为由 dev 真机 V 覆盖。

**残留项**：`docs/guide/primevue-migration.md` 的 TagsInput 映射与不支持清单收口归 **M3-1**；组件总览页成员对账守卫归 Backlog。
