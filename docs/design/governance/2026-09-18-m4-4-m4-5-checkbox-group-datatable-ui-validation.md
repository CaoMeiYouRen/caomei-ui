# M4-4 / M4-5 批次浏览器验证（Checkbox 数组模型 + CheckboxGroup + DataTable rowsPerPageOptions）

- 日期：2026-09-18
- 范围：工作区未提交 diff 的 M4 批次——M4-4 `Checkbox` 数组模型（`v-model` 传数组 + `value` 成员标识，按 value 增删）、M4-5 新增 `CaomeiCheckboxGroup` 与 `DataTable` `rowsPerPageOptions` 透传
- 类型：组件新增 prop / 数组模型语义 / 新增组件与文档页；本文件为 V 阶段（真实浏览器验证）记录
- 依据：[测试规范 §2.1 / §5.1](../../standards/testing.md)、[响应式设计 §3 / §4](../responsive.md)、[主题与样式设计 §4.1 / §5.1](../theming.md)、ui-validator skill（`.opencode/skills/ui-validator/SKILL.md`）
- 被测对象：`src/components/checkbox/checkbox.vue` 及 `types.ts`、`src/components/checkbox-group/**`、`src/components/data-table/data-table.vue` 及 `types.ts`、`src/locale/*`、`src/index.ts`、`src/nuxt/components.ts`；`docs/examples/{checkbox/group,checkbox-group/*,data-table/pagination}.vue` 与 `docs/i18n/en-US/examples/**` 同名示例；`docs/components/{checkbox,checkbox-group,data-table}.md` 与英文页、`docs/.vitepress/config.ts`、`docs/design/{components,design-spec}.md`

## 范围（scope）

| 维度 | 取值 |
| --- | --- |
| 被测 revision | HEAD `446695a`（已提交）+ 工作区未提交 diff（29 个已跟踪文件修改 + `checkbox-group/` 等新增）；**主验证窗口内** `src/` 与示例未再改动，写就后的跟进见「本轮后跟进」节 |
| 入口 / 产物 | `pnpm docs:build`（`vitepress build docs`）→ `pnpm exec vitepress preview docs --port 4173`；被测产物构建于 2026-09-18 02:14（`dist/index.html` mtime 02:14:46），112 + 18 项均在该产物上复测；本记录写入后按门禁重跑 `docs:build` / `docs:check` 全绿 |
| 页面（中文） | `/components/checkbox-group`、`/components/checkbox`、`/components/data-table` |
| 页面（英文） | `/en-US/components/checkbox-group`、`/en-US/components/checkbox`、`/en-US/components/data-table` |
| 示例 | checkbox-group demo0 基础用法 / demo1 全选与半选；checkbox demo3 多选组合（数组模型）；data-table demo5 分页。索引已与 `.vitepress-demo-plugin__container` 顺序逐项核对 |
| 视口 | 桌面 1440×900、平板 1024×768、移动 375×812（DataTable 三档横向溢出全覆盖） |
| 主题 | 亮色 / 暗色（`colorScheme` + localStorage `vitepress-theme-appearance=dark` + `html.dark` 三处对齐） |
| 浏览器 | Chromium（Playwright 1.63.0 内置），容器内 `--no-sandbox --disable-dev-shm-usage`；`ignoreDefaultArgs: ['--hide-scrollbars']` |
| 取证脚本 | `test-results/m4-4-m4-5/validate.mjs`（文档站主验证 112 项）+ `test-results/m4-4-m4-5/fixture-test.mjs`（一次性 Vite 夹具 18 项）；原始 JSON 与截图落 `test-results/m4-4-m4-5/`（已 gitignore） |
| 视觉通道 | vision-augment reasoning 通道实测 **400 Bad Request 不可用**；本地 RapidOCR 文字层可用（两页截图复核，置信度 0.977 / 0.999），结论以几何 / 计算样式 / ARIA / 键盘断言为准，**未做逐像素目视比对** |

- 结论：**通过**——**130 / 130 核对项通过，失败 0**（文档站 112：A 22 / B 24 / C 12 / D 44 / E 10；夹具 18）；console error / pageerror / HTTP ≥ 400 均为 **0**；观察项 3（均不计为问题）。

## 1. A：CheckboxGroup 基础用法（M4-5，中英各 11 项）

demo0（`docs/examples/checkbox-group/basic.vue`）选项 `apple/banana/cherry` + `durian(disabled)`，初始 `selected=['apple']`，`label` 分别为「水果 / Fruits」。

| 核对项 | 期望 | 中文页实测 | 英文页实测 |
| --- | --- | --- | --- |
| 分组根 `role` | `group` | `group` | `group` |
| 分组根 `aria-label` | 水果 / Fruits | `水果` | `Fruits` |
| 选项数（含 1 禁用） | 4 | 4 | 4 |
| 禁用项 | 榴莲 / Durian | 1（`榴莲`，`disabled`） | 1（`Durian`） |
| 初始「苹果」`aria-checked` | true | `true` | `true` |
| 初始其余三项 | false | `["false","false","false"]` | 同左 |
| 初始 demo 文本 | 已选：apple | `已选：apple` | `Selected: apple` |
| 点击「香蕉」后 `aria-checked` | true | `true` | `true` |
| 点击「香蕉」后 demo 文本 | 模型含 apple + banana | `已选：apple、banana` | `Selected: apple, banana` |
| 点击禁用项「榴莲」后模型 | 不变 | 文本不变（`已选：apple、banana`） | 文本不变 |
| 禁用项 `aria-checked` / `disabled` | false / true | `false` / `disabled` | `false` / `disabled` |

- 行为契约（数组模型按 `value` 增删）成立；`aria-checked` 与模型同步。**demo 文本拼接的是模型 value（`apple`/`banana`），非选项 label（`苹果`/`香蕉`）**，与任务书预期文字不一致，见观察项 OBS-1。

## 2. B：全选与半选（M4-5，中英各 12 项）

demo1（`docs/examples/checkbox-group/select-all.vue`）`selectAll`，可选项 3（`apple/banana/cherry`），`durian` 禁用不参与。

| 核对项 | 期望 | 中文页实测 | 英文页实测 |
| --- | --- | --- | --- |
| 全选项可访问名 | 全选 / Select all | 1 | 1 |
| 初始全选项 `aria-checked` | `mixed` | `mixed` | `mixed` |
| 初始 demo 文本 | 已选 1 项 / 1 selected | 含 `已选 1 项` | 含 `1 selected` |
| 初始榴莲 | false | `false` | `false` |
| 点击全选后 `aria-checked` | true | `true` | `true` |
| 三个可选项 | 全部 true | `["true","true","true"]` | 同左 |
| 全选后榴莲（不计入） | false | `false` | `false` |
| 全选后 demo 文本 | 已选 3 项 / 3 selected | `已选 3 项（「榴莲」禁用，不参与全选）` | 含 `3 selected` |
| 再点全选后 `aria-checked` | false | `false` | `false` |
| 可选项全部取消 | 全 false | `["false","false","false"]` | 同左 |
| 取消全选后 demo 文本 | 已选 0 项 / 0 selected | 含 `已选 0 项` | 含 `0 selected` |
| 全程榴莲 | 恒 false | `false` | `false` |

## 3. C：Checkbox 数组模型页（M4-4，中英各 6 项）

`/components/checkbox` demo3（`docs/examples/checkbox/group.vue`），初始 `selected=['apple']`。

| 核对项 | 期望 | 中文页实测 | 英文页实测 |
| --- | --- | --- | --- |
| 初始「苹果」选中 + 文本 | true + 已选：apple | `true` + `已选：apple` | `true` + `Selected: apple` |
| 点击「香蕉」→ 香蕉选中 | true | `true` | `true` |
| 点击后文本 | apple + banana | `已选：apple、banana` | `Selected: apple, banana` |
| 再点「苹果」→ 苹果取消 | false | `false` | `false` |
| 再点后文本 | 仅 banana | `已选：banana` | `Selected: banana` |
| 「香蕉」保持选中 | true | `true` | `true` |

- 与 A 组同源：数组模型下点击按 `value` 增删，且此 demo 复用本轮新增的数组模型能力（原实现用 `isSelected`/`toggle` 手工维护包含关系，已删除）。文本同样拼接 value，见 OBS-1。

## 4. D：DataTable `rowsPerPageOptions`（M4-5，中英各 22 项）

`/components/data-table` demo5（`docs/examples/data-table/pagination.vue`）：23 条数据、`rows-per-page-options=[5,10,20]`、`v-model:page` / `v-model:rows`，提示文本为「第 N 页，每页 M 条」。

### 4.1 选择器存在性、几何与可访问名（中英各 4 项）

| 核对项 | 期望 | 中文页实测 | 英文页实测 |
| --- | --- | --- | --- |
| demo 内 Paginator | 1 | 1 | 1 |
| 每页条数选择器 | 1 | 1 | 1 |
| `client rect / clientWidth / offsetWidth` | 96±1px（6rem） | `96 / 96 / 96` | 96 |
| 选择器可访问名 | 每页条数 / Rows per page | `每页条数` = 1 | `Rows per page` = 1 |

### 4.2 偏移保持语义（中英各 9 项）

| 步骤 | 期望 | 中文页实测 | 英文页实测 |
| --- | --- | --- | --- |
| 初始（每页 5） | 第 1 页、首行「成员 1」 | `第 1 页，每页 5 条` / `成员 1` | `Page 1, 5 rows per page` / `Member 1` |
| 切到每页 10 | 页码保持、首行成员 1 | `第 1 页，每页 10 条` / `成员 1` / 10 行 | `Page 1, 10 rows per page` / `Member 1` / 10 |
| 切回每页 5 | 第 1 页 | `第 1 页，每页 5 条` | `Page 1, 5 rows per page` |
| 翻到第 3 页（每页 5，偏移 10） | 首行成员 11 | `第 3 页，每页 5 条` / `成员 11` / 5 行 | `Page 3, 5 rows per page` / `Member 11` / 5 |
| 切到每页 10（偏移 10） | 落第 2 页、首行成员 11 | `第 2 页，每页 10 条` / `成员 11` / 10 行 | `Page 2, 10 rows per page` / `Member 11` / 10 |

- 偏移保持成立：`floor(offset / newSize)` 重推导页码；第 3 页（偏移 10）+ 每页 10 → 第 2 页，首行仍为成员 11，切换后行数与提示文本一致。

### 4.3 三档视口横向溢出（中英各 9 项）

| 视口 | Paginator `scrollWidth / clientWidth` | 页面 `scrollWidth / clientWidth` | 选择器可见 |
| --- | --- | --- | --- |
| 1440 | 276 / 276 | 1425 / 1425（真实滚动条占位 15px） | true |
| 1024 | 276 / 276 | 1009 / 1009 | true |
| 375 | 270 / 270 | 360 / 360 | true |

- 三档均无横向溢出；窄屏分页器自然换行（270px），每页条数选择器仍完整可见。分页按钮数少于 Paginator 独立页（23 条 / 5 页），故整体宽 276px 小于 Paginator 页的 646px，属数据规模差异。

## 5. E：亮 / 暗复验（CheckboxGroup，暗色 10 项）

`html.dark` 生效（E0 true）。关键计算样式实测（亮色基线另采）：

| 指标 | 亮色 | 暗色 |
| --- | --- | --- |
| 选中指示器背景 / 描边 | `rgb(37, 99, 235)` | `rgb(96, 165, 250)` |
| 分组 token `--caomei-color-primary` | `#2563eb` | `#60a5fa` |
| 禁用项（榴莲）不透明度 | `0.6` | `0.6`，rect `646×24`（宽高 > 0，可见） |
| 选中态 `aria-checked` | true | true |
| 全选项初始 | `mixed` | `mixed` |
| 点全选后三项 + 文本 | 全 true + 已选 3 项 | 全 true + `已选 3 项（「榴莲」禁用，不参与全选）` |
| 榴莲 | false | `false` |
| DataTable 选择器宽 / 可访问名 | 96px / 每页条数 | 96px / `每页条数` = 1 |

- 暗色下选中指示器背景为暗色主色（不透明 rgb），禁用项仍可见且带 0.6 不透明度，无主题相关回归。

## 6. F：一次性夹具（gitignored，18 项全过）

文档 demo 不含 `name + required` 表单、`rovingFocus`、全禁用、`invalid` 组合，另建一次性 Vite 夹具（`test-results/m4-4-m4-5/fixture/`）在真实 Chromium 实测。

| 场景 | 期望 | 实测 |
| --- | --- | --- |
| `name="fruits"` + 选中 2 项 | 隐藏控件 `fruits[0]=apple` / `fruits[1]=banana`（数量 = 选中数） | 2 个，名称与值逐一对应 |
| 选中 2 项 + `required` | `form.checkValidity()` = true | true |
| 空选 + `required` | `checkValidity()` = false | false（隐藏控件退化为单个 `name="fruits"`） |
| 空选后选中 1 项 | 隐藏控件变 `fruits[0]` 且校验通过 | `fruits[0]` + true |
| `rovingFocus=false` 组容器 | 无 `tabindex` | `null` |
| `rovingFocus=false` 选项 | 各选项无 `tabindex`（原生逐个可 Tab） | 全 `null` |
| `rovingFocus=false` Tab 顺序 | 苹果 → 香蕉 → 樱桃 | `["苹果","香蕉","樱桃"]` |
| `rovingFocus=true` 组容器 | `tabindex="0"`（单停靠点） | `0` |
| `rovingFocus=true` 选项 | 全部 `tabindex="-1"` | 全 `-1` |
| `rovingFocus=true` 进入 / 离开 | 进入落首项，再 Tab 直接离开组 | entry=`苹果`，next≠`香蕉` |
| `rovingFocus=true` 方向键 | 苹果 → 香蕉 → 樱桃 → 上行回香蕉 | `苹果→香蕉→樱桃→香蕉` |
| 全部可选项禁用 + `selectAll` | 全选项 `disabled` 且 `aria-checked=false` | disabled=true / false |
| 全禁用时点击全选 | 模型不变 | 仍全 unchecked |
| `invalid` 分组根 | `aria-invalid="true"` | true |
| `invalid` 全选项 | `aria-invalid="true"` | true |
| `invalid` 普通选项 | 全部 `aria-invalid="true"` | 4/4 true |

- 键盘焦点可见性另测：`rovingFocus=true` 经 Tab 进入组后焦点落首项，子项 `:focus-visible` 实测 `outline: 2px solid rgb(37, 99, 235)`（宽 2px），焦点可见性未受损（RovingFocusGroup 容器的内联 `outline: none` 不构成可见性缺陷，焦点已即时转交子项）。
- 夹具为任务态产物，落 gitignored `test-results/m4-4-m4-5/`，**不进入提交**。

## 7. 控制台 / 网络

| 指标 | 期望 | 实测 |
| --- | --- | --- |
| `console.error` | 0 | 0 |
| `pageerror` | 0 | 0 |
| HTTP 状态码 ≥ 400 | 0 | 0 |

- 统计覆盖本轮全部导航：中英 × 三页、三档视口、亮 / 暗重复访问，以及夹具页。

## 问题清单

- **无 blocker / warning 级问题。**

## 观察项（OBSERVE，不计为问题）

1. **两个示例的提示文本拼接模型 value 而非 label**（suggest 级）：`/components/checkbox-group` 基础 demo 与 `/components/checkbox` 多选组合 demo 实测为「已选：apple、banana」（英文 `Selected: apple, banana`），而任务书预期为「已选：苹果、香蕉」。组件行为正确（模型按 value 增删、`aria-checked` 同步），属示例展示口径：以原始 value 呈现模型状态。若产品上期望展示标签，需在示例内做 value→label 映射；本批未改，归因「任务书预期与示例实现不一致」。
2. **空选 + `required` 时隐藏控件退化为单个 `name="fruits"`**（suggest 级）：Reka 对「空数组 + required」渲染单个 `name`（无下标）控件以便参与原生校验；只有存在选中值时才生成 `name[index]`。`docs/components/checkbox-group.md` 的「按 `name[index]` 为每个选中值生成隐藏控件」对「有选中值」成立，但未说明该退化形态，属文档完整性建议。
3. **`rovingFocus` 的 Tab 停靠点是分组容器（非语义 `div`）**：RovingFocusGroup 根容器 `tabindex="0"` 且带 Reka 内联 `outline: none`，键盘 Tab 进入后焦点立即转交首个子项（子项 focus-visible 缺省可见）。读屏仅播报子项复选框，容器不重复播报；实测无焦点丢失。记录为机制说明，无需处理。

## 本轮后跟进（记录写就后、提交前的工作区变更，未重复浏览器验证）

1. **OBS-1 关闭**：两个示例改为展示选项 label（新增 `selectedLabels` 计算属性），仅影响示例文案，组件行为未变，A / C 组结论不受影响；本记录中「已选：apple、banana」/「Selected: apple, banana」为**记录时点快照**，现行示例展示「已选：苹果、香蕉」/「Selected: Apple, Banana」。
2. **W1 / W2 由单测覆盖**：`DataTable` 的「`totalRecords` 变化保留用户选择的每页条数」与「受控分页下 `page` 载荷 `pageCount` 按新 rows 计算」改为单测断言（`data-table.features.test.ts`），未重走浏览器；A / D 组已实测的偏移保持路径（第 3 页（每页 5）→ 每页 10 落第 2 页）未变。
3. **OBS-2 关闭**：中英 `checkbox-group.md` 补「空选且 `required` 时隐藏控件退化为单个 `name`」。

## 未覆盖边界

- **视觉理解通道不可用**：reasoning 通道 400 Bad Request，仅本地 RapidOCR 文字层复核（`checkbox-group-basic-zh.png` / `data-table-rows-zh.png`），未做逐像素目视比对。
- **CheckboxGroup 未覆盖**：`optionLabel` / `optionValue` 自定义字段与函数映射、默认插槽自定义子项、`selectAllText` 覆盖态；`size` 的 sm / lg 档视觉差异；分组整体 `disabled`（本批仅覆盖「全部可选项禁用 → 全选禁用」路径）；`id` 关联外部 label；组内子项自带 `name` 不重复提交的文档声明未单独实测。
- **DataTable 未覆盖**：`rowsPerPageOptions` 为空数组时不渲染选择器、`lazy` / 服务端分页、受控 `rows` 下父级拒绝回写、`totalRecords` 变化与每页条数选择的交互；本批仅验证文档 demo 的 `[5,10,20]` × 23 条。
- **Checkbox 数组模型未覆盖**：数组模型下缺 `value` 时点击不改写模型（单测覆盖）；数组含重复值 / 非字符串 value。
- **其他**：RTL / 高对比模式 / 浏览器缩放 / 超窄视口（< 320px）；Firefox / Safari / 真机；`rovingFocus` 与 `loop` / `orientation` 组合；`pnpm test` 单测与构建产物 SSG DOM 逐页核对不在本 V 记录范围。

## 复现方式

```bash
# 1) 构建并预览文档站产物
pnpm docs:build
pnpm exec vitepress preview docs --port 4173   # 后台启动

# 2) 文档站主验证（112 项，输出 test-results/m4-4-m4-5/summary.json）
node test-results/m4-4-m4-5/validate.mjs

# 3) 一次性夹具（表单 name/required、rovingFocus、全禁用、invalid，另 18 项）
pnpm exec vite --config test-results/m4-4-m4-5/fixture/vite.config.mjs   # 127.0.0.1:5199
node test-results/m4-4-m4-5/fixture-test.mjs

# 4) 文档质量门
pnpm docs:check
```

- 脚本、夹具与截图位于 `test-results/m4-4-m4-5/`（已 gitignore，为任务态产物）；截图仅供人工复核，**关键实测值以本记录为准**。
- 判定：结论 **通过**（文档站 112 / 112 + 夹具 18 / 18 = 130 / 130，失败 0；console error / pageerror / HTTP ≥ 400 均为 0）。

## 截图清单

- `checkbox-group-basic-zh.png`：基础用法 demo（初始「苹果」选中）。
- `checkbox-group-selectall-zh.png`：全选 demo（点击全选后三项选中）。
- `checkbox-group-basic-zh-dark.png`：暗色基础用法 demo。
- `checkbox-array-model-zh.png`：Checkbox 多选组合 demo（数组模型）。
- `data-table-rows-zh.png`：DataTable 分页 demo（每页条数选择器）。
