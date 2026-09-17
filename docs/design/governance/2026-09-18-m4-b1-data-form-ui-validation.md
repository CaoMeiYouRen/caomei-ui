# M4「B1 增强·数据与表单类」批次浏览器验证（MultiSelect / Paginator / Button / ToggleButton）

- 日期：2026-09-18
- 范围：工作区未提交 diff 的 M4 批次——B1 数据与表单类 4 项 UI 可见改动（M4-1 `MultiSelect` 清除 + `#option` 插槽；M4-2 `Paginator` 每页条数选择器；M4-3 `Button` 角标；M4-7 `ToggleButton` 两态文案），另 M4-6 `Switch` 仅新增 `change` 事件（无渲染面变化，见下）
- 类型：组件新增 prop / slot / 事件与样式；本文件为 M4 批次 V 阶段（浏览器验证）记录
- 依据：[测试规范 §2.1 / §5.1](../../standards/testing.md)、[响应式设计 §3 / §4](../responsive.md)、[主题与样式设计 §4.1 / §5.1](../theming.md)、UI 验证 skill（`.github/skills/ui-validator/SKILL.md`）
- 被测对象：`src/components/multi-select/multi-select.vue`、`src/components/paginator/paginator.vue`、`src/components/button/button.vue`、`src/components/toggle-button/toggle-button.vue` 及其 `types.ts` / 单测；`docs/examples/{multi-select/clear,multi-select/option-slot,paginator/rows-per-page,button/badge,toggle-button/labels}.vue` 与 `docs/i18n/en-US/examples/**` 同名示例；`docs/components/*.md` 与 `docs/i18n/en-US/components/*.md`、`docs/design/design-spec.md`、`src/locale/*`

## 范围（scope）

| 维度 | 取值 |
| --- | --- |
| 被测 revision | HEAD `cbf5787`（已提交）+ 工作区未提交 diff（34 文件）；验证窗口内 `src/` 与示例未再改动 |
| 入口 / 产物 | `pnpm docs:build`（`vitepress build docs`）后 `pnpm exec vitepress preview docs --port 4173`（VitePress 1.6.4）；**服务的是本次构建产物**，非 dev SPA |
| 页面 | 中：`/components/multi-select`、`/components/paginator`、`/components/button`、`/components/toggle-button`；英：`/en-US/components/...` 对应四页 |
| 视口 | 桌面 1440×900、平板 1024×768、移动 375×812（分页器横向溢出三档全覆盖） |
| 主题 | 亮色 / 暗色（`colorScheme` + localStorage `vitepress-theme-appearance=dark` + `html.dark` 三处对齐） |
| 浏览器 | Chromium（Playwright 1.63 内置），容器内 `--no-sandbox --disable-dev-shm-usage`；`ignoreDefaultArgs: ['--hide-scrollbars']` |
| 取证脚本 | `test-results/m4-b1/validate.mjs`（主验证）+ `test-results/m4-b1/fixture/`（一次性 Vite 夹具，见 §7）；原始 JSON `summary.json` 与截图落 `test-results/m4-b1/`（均已 gitignore） |
| 视觉通道 | vision-augment reasoning 通道实测 400 Bad Request **不可用**；仅本地 RapidOCR 文字层复核 + 几何 / 计算样式 / ARIA 断言，**未做逐像素目视比对** |

- 结论：**通过**——**119 / 119 核对项通过，失败 0**（A 22 / B 8 / C 28 / D 28 / E 16 / F 12 / G 5）；console error / pageerror / HTTP ≥ 400 均为 **0**；观察项 3（均不计为问题）。
- M4-6 `Switch`：本批仅新增 `change` 事件，**无渲染面变化，无视觉判别力，显式跳过**（不以 DOM 断言伪造结论）；其行为契约由单元测试覆盖。

## 1. A：MultiSelect 清除按钮（M4-1）

示例页 demo 序号（`.vitepress-demo-plugin__container`，0 基）：`2` = 清除示例（中：`docs/examples/multi-select/clear.vue`，英：`docs/i18n/en-US/examples/multi-select/clear.vue`），初始 `v-model=['apple','banana']`。

### 1.1 存在性、可访问名与清除行为（中英各 11 项，全部通过）

| 核对项 | 期望 | 中文页实测 | 英文页实测 |
| --- | --- | --- | --- |
| 初始「有选中项且未禁用」→ 清除按钮存在 | 1 | 1 | 1 |
| 清除按钮 `aria-label` | 清除 / Clear | `清除` | `Clear` |
| 初始 demo 文本 | 已选值 | `当前值：apple、banana` | `Value: apple, banana` |
| 初始标签数 | 2 | 2 | 2 |
| 点击清除后 demo 文本 | 空态 | `当前值：（空）` | `Value: (empty)` |
| 点击后焦点落点 | 内层输入框 | `caomei-multi-select__input` | `caomei-multi-select__input` |
| 点击后清除按钮 | 随之移除（0） | 0 | 0 |

- 存在性条件 `showClear && 有选中项 && 未禁用` 的**「未禁用」分支**不在文档 demo 组合内，改由一次性 Vite 夹具在真实 Chromium 中实测（§7，5 / 5 通过）。

### 1.2 压窄换行：清除按钮与标签不重叠且仍可点击（刀刃项）

把字段 `--caomei-multi-select-max-width` 内联压到 `90px` 后实测：

| 核对项 | 中文页实测 | 英文页实测 |
| --- | --- | --- |
| 字段盒宽 | 90px（`left 397.5`，`height 98.38`） | 90px |
| 标签顶边去重 | 2 行：`[1273, 1296]` | 2 行：`[1413, 1436]` |
| 输入行顶边 | 1319（> 标签首行） | 1459 |
| 清除按钮 rect | `14×14` @ `top 1347.38` | `14×14` |
| 与任一标签 rect 相交 | 0 / 2 | 0 / 2 |
| 清除按钮宽高 > 0（仍可见） | 14×14 | 14×14 |
| 窄态点击后 | 文本转到空态、焦点回输入框、按钮移除 | 同左 |

- 结论：清除按钮是字段内的**常规 flex 成员**，标签换行（本实测两标签各占一行）后它随输入行流动，与标签几何不相交且可点击，未复现「绝对定位压在标签上」。

## 2. B：MultiSelect `#option` 插槽（M4-1）

demo 序号 `3` = 自定义选项示例。点击字段展开面板后实测（面板挂 body，按 `.caomei-multi-select__content .caomei-multi-select__item` 断言）：

| 核对项 | 期望 | 中文页实测 | 英文页实测 |
| --- | --- | --- | --- |
| 面板项数 | 3 | 3 | 3 |
| 每项含自定义 SVG 图标（`item-label svg`） | 3/3 | 3/3 | 3/3 |
| 每项命中示例 scoped `.demo-option`（非纯文本回退） | 3/3 | 3/3 | 3/3 |
| 面板项文本 | `option.name` | 草稿 / 已发布 / 已下线 | Draft / Published / Archived |

- 面板项结构为 `span.demo-option > svg + 文本`，说明自定义插槽内容确实渲染，而非回退到映射文本。

## 3. C：Paginator 每页条数（M4-2）

demo 序号 `3` = 每页条数示例（`total=96`，`rowsPerPageOptions=[10,20,50]`，`v-model:page` / `v-model:items-per-page`）。

### 3.1 选择器几何与可访问名（中英各 1 组）

| 核对项 | 期望 | 中文页实测 | 英文页实测 |
| --- | --- | --- | --- |
| `.caomei-paginator__rows-per-page` 存在 | 1 | 1 | 1 |
| client rect 宽度（6rem） | 96±1px | `rect 96` / `client 96` / `offset 96` | 96 |
| 选择器可访问名 | 每页条数 / Rows per page | `getByRole('combobox', { name: '每页条数' })` = 1 | `Rows per page` = 1 |

- `--caomei-paginator-rows-width` 在元素上无内联声明（实测 computed 为空），宽度来自 `width: var(--caomei-paginator-rows-width, 6rem)` 的 fallback，与设计注释「覆盖钩子不预声明默认值」一致。

### 3.2 偏移保持语义（中英各 4 项，对齐 PrimeVue `first`）

| 步骤 | 期望 | 中文页实测（`aria-current="page"` / 区间文本） | 英文页实测 |
| --- | --- | --- | --- |
| 切到第 3 页 | 首行偏移 20 | 区间 `当前显示：21–30 / 96` | `Showing 21–30 / 96` |
| 每页 10 → 20 | 第 2 页，`21–40 / 96` | 当前页 `2`，`当前显示：21–40 / 96` | `2`，`21–40 / 96` |
| 每页 20 → 50 | 偏移不足一页 → 第 1 页，`1–50 / 96` | 当前页 `1`，`当前显示：1–50 / 96` | `1`，`1–50 / 96` |

### 3.3 三档视口横向溢出（中英各 6 项）

| 视口 | 分页器 `scrollWidth / clientWidth` | 页面 `scrollWidth / clientWidth` | 判定 |
| --- | --- | --- | --- |
| 1440 | 646 / 646 | 1425 / 1425 | 通过（真实滚动条占位 15px） |
| 1024 | 567 / 567 | 1009 / 1009 | 通过 |
| 375 | 270 / 270 | 360 / 360 | 通过 |

- 窄屏下 `.caomei-paginator` 自动换行（`flex-wrap: wrap`），无水平溢出；中英数值一致。

## 4. D：Button 角标（M4-3）

demo 序号 `6` = 角标示例（`Add` 累加计数；`Notifications` 用 `badge=count>0 ? String(count) : undefined`；`Inbox` 用 `badge=String(count)` + `badgeTone="danger"`）。

### 4.1 出现、内容与宿主稳定性（中英各 7 项）

| 核对项 | 期望 | 中文页实测 | 英文页实测 |
| --- | --- | --- | --- |
| 初始 `Notifications` 角标 | 0（`badge=undefined`） | 0 | 0 |
| 初始 `Inbox` 角标内容 | 0 | `0` | `0` |
| 点击 `Add` 1 次 | 两个角标内容 = 1 | `Notifications=1, Inbox=1` | 同左 |
| 点击 `Add` 3 次 | 两个角标内容 = 3 | `3 / 3` | `3 / 3` |
| 角标出现前后 `.demo-row` `clientWidth` | 不变 | 646 → 646 | 646 → 646 |
| 角标出现前后按钮几何 | delta = 0 | `dl=0, dt=0, dw=0, dh=0`（文档坐标口径） | 同左 |
| 角标出现前后 CLS 新增 | 0 | 0 | 0 |

### 4.2 不裁切、色调与指针行为（中英各 7 项）

| 核对项 | 期望 | 实测（中 = 英） |
| --- | --- | --- |
| 角标相对按钮外扩（top / right） | badge 越界 | badge top `423` < 按钮 top `432`；badge right `585.23` > 按钮 right `576.23`（20×20 角标） |
| 祖先 `overflow`（角标 → `html`） | 全 `visible` | 无裁切祖先 `[]`；按钮自身 `overflow: visible` |
| 角标完整落在 demo 预览容器内 | true | true |
| `pointer-events` | `none` | `none` |
| 默认 `neutral` vs `badgeTone="danger"` 背景色 | 不同 | `neutral rgb(82, 82, 91)` vs `danger rgb(220, 38, 38)` |
| 角标类名 | 语义 + 按钮钩子 | `caomei-badge caomei-badge--neutral … caomei-button__badge` / `… --danger … caomei-button__badge` |

- 角标为绝对定位外扩、`pointer-events: none`，不参与布局、不改变按钮尺寸，宿主 `.demo-row` 与按钮位置在出现前后 delta 均为 0。

### 4.3 暗色复验

| 核对项 | 实测 |
| --- | --- |
| 两支角标可见且内容 = 1 | `["1","1"]` |
| `neutral` / `danger` 背景色仍不同 | `rgb(82, 82, 91)` / `rgb(220, 38, 38)` |
| 外扩几何 + `pointer-events` | `top 423 < 432`、`right 585.23 > 576.23`、`pe=none` |

## 5. E：ToggleButton 两态文案（M4-7）

demo 序号 `2` = 两态文案示例。

| 核对项 | 期望 | 中文页实测 | 英文页实测 |
| --- | --- | --- | --- |
| 初始可见文本 = `offLabel` | 固定 / Pin | `固定` | `Pin` |
| 初始可访问名 | `offLabel` | `getByRole('button', { name: '固定' })` = 1 | `Pin` = 1 |
| 初始 `aria-pressed` | false | `false` | `false` |
| 点击后可见文本 = `onLabel` | 已固定 / Pinned | `已固定` | `Pinned` |
| 点击后可访问名 | `onLabel` | `已固定` = 1 | `Pinned` = 1 |
| 点击后 `aria-pressed` | true | `true` | `true` |
| 再点回退 | `offLabel` | `固定`（可访问名同） | `Pin`（可访问名同） |

- 可访问名随可见文本同步变化，用 `getByRole('button', { name })` 逐态取证；两态文案「需同时提供」的分支（只传其一 → 回退默认插槽）由单测覆盖，未在本真机记录内扩面。

## 6. F：亮 / 暗主题复验（F0×4 + F1–F8）

`html.dark` 生效于四页（F0 各 1 次，共 4 次）。暗色关键数值：

| 项 | 实测 |
| --- | --- |
| MultiSelect 清除按钮存在 + `aria-label` | `1 / 清除` |
| MultiSelect `#option` 插槽 SVG | 3/3 项含自定义 SVG |
| Paginator 每页条数选择器宽度 | 96px（`≈6rem` 不变） |
| Paginator 选择器可访问名 | `每页条数` = 1 |
| Button 角标可见 + 色调差异 | `["1","1"]`；neutral vs danger 背景色不同 |
| ToggleButton 两态文案 | `固定 → 已固定` |

- 亮色为各组基线；暗色复验关键数值与可见性均与亮色一致，无主题相关回归。

## 7. G：一次性夹具——`showClear + disabled` 分支（真实 Chromium）

文档 demo 无 `showClear + disabled` 组合，为覆盖「未禁用」条件，另建一次性 Vite 夹具（`test-results/m4-b1/fixture/`，gitignore）：

| 场景 | 期望 | 实测 |
| --- | --- | --- |
| `showClear` + 有选中 + 未禁用 | 清除按钮存在 | true（tags=1） |
| `showClear` + 有选中 + `disabled` | 清除按钮不存在 | false（tags=1，`--disabled` 类 + `input.disabled=true`） |
| `showClear` + 无选中 + 未禁用 | 清除按钮不存在 | false（tags=0） |
| 禁用字段确实禁用 | 类名 + `input.disabled` | 两者均 true |
| 启用字段非禁用 | 类名 + `input.disabled` | 两者均 false |

- 夹具 5 / 5 通过，console error 0。夹具为任务态产物，落 gitignored `test-results/m4-b1/fixture/`，**不进入提交**。

## 8. 控制台 / 网络

| 指标 | 期望 | 实测 |
| --- | --- | --- |
| `console.error` | 0 | 0 |
| `pageerror` | 0 | 0 |
| HTTP 状态码 ≥ 400 | 0 | 0 |

- 统计覆盖本轮全部导航：中英 × 四组件页、三档视口、亮 / 暗重复访问，以及夹具页。

## 问题清单

- **无 blocker / warning 级问题。**

## 观察项（OBSERVE，不计为问题）

1. **`--caomei-paginator-rows-width` 未登记在组件文档「样式定制」表**（suggest 级）：`docs/components/paginator.md` 与英文版列出的 `--caomei-paginator-*` token 未包含本批新增的 `--caomei-paginator-rows-width`（实测默认生效 96px）。渲染无缺陷，属文档完整性建议。
2. **角标示例中 `Inbox` 在 count=0 时即有角标**：示例用 `badge=String(count)`（`"0"` 为真值）演示 `badgeTone="danger"`，故「点击 Add 后角标出现」严格成立的是 `Notifications`（`undefined → "1"`）。属示例按数量显隐的有意对比，非缺陷。
3. **角标可见性依赖祖先不裁切**：角标外扩到按钮矩形之外，若下游容器 `overflow: hidden/clip` 会裁切；当前 demo 祖先链全部 `overflow: visible`。建议在角标文档补一句使用约束（本批未改）。

## 未覆盖边界

- **视觉理解通道不可用**：vision-augment reasoning 通道实测 400 Bad Request，仅本地 RapidOCR 文字层复核；未做逐像素目视比对，结论以几何 / 计算样式 / ARIA 文本为准。
- **未覆盖 RTL / 高对比模式 / 浏览器缩放 / 超窄视口（< 320px）**：与本批改动无关，未扩面。
- **Paginator 每页条数未覆盖**：选择器 `disabled` 传递、`rowsPerPageLabel` 覆盖态、`total` 非整页边界（如 50 档尾页）与「选项未选中值」路径；本批仅验证文档 demo 的 `[10,20,50]` × `total 96`。
- **MultiSelect 未覆盖**：真机上 `clearLabel` 覆盖态、受控父级拒绝更新时清除按钮保留的焦点路径（单测覆盖）；`#option` 的 `selected` 参数可见差异未单独断言。
- **Button 角标未覆盖**：空串 / 长文本 / `max` 截断（属 `Badge` 自身能力）、`rounded` / `block` 与角标叠加、移动视口。
- **ToggleButton 两态文案未覆盖**：只传单一 prop 的回退分支（单测覆盖）、`size` 组合。
- **未做构建产物 SSG DOM 级核对**：`pnpm docs:build` 作为质量门单独运行，产物静态 DOM 逐页核对不在本 V 记录范围。
- **M4-6 `Switch`**：仅新增 `change` 事件、无渲染面变化，显式跳过（无视觉判别力）。

## 复现方式

```bash
# 1) 构建并预览文档站产物
pnpm docs:build
pnpm exec vitepress preview docs --port 4173   # 后台启动

# 2) 主验证（119 项，输出 test-results/m4-b1/summary.json）
node test-results/m4-b1/validate.mjs

# 3) 一次性夹具（showClear + disabled，另 5 项）
pnpm exec vite --config test-results/m4-b1/fixture/vite.config.mjs   # 127.0.0.1:5199
node test-results/m4-b1/fixture-test.mjs

# 4) 文档质量门
pnpm docs:check
```

- 脚本、夹具与截图位于 `test-results/m4-b1/`（已 gitignore，为任务态产物）；截图仅供人工复核，**关键实测值以本记录为准**。
- 判定：结论 **通过**（119 / 119，失败 0；console error / pageerror / HTTP ≥ 400 均为 0）。
