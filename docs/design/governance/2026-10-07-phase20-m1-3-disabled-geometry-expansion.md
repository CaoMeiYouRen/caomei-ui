# Phase 20 M1-3：禁用态几何扩面补全

> 创建时间：2026-10-07
> 关联条目：[待办归档](../../plan/todo-archive.md) Phase 20 **M1-3**（测试装置与覆盖扩面）
> 依据：Phase 19 M1-4 的「未纳入面」——禁用态尺寸不变仅覆盖 7 个代表组件，其余组件禁用态尺寸未逐一对（[2026-10-05 P3 几何 / 交互层装置](./2026-10-05-phase19-m1-4-geometry-interaction-devices.md) §5）
> 快照：本仓工作区（`test:e2e` 312 passed、`pnpm verify` exit 0）；**未推送**

---

## 1. 结论

- 禁用态几何受检面由 **7 对扩到 18 对**（新增 **11 对**）：SelectButton / RadioButton / ToggleButton / Slider / Tag / MultiSelect / AutoComplete / TagsInput / DatePicker / Password / FileUpload。
- 新增「受检面下界守卫」（`MIN_DISABLED_PAIRS = 18`），防止成对数被静默收窄。
- 负向对照：回退 3 个代表组件的禁用态几何 → **9 处失败**（3 组件 × 3 视口）；还原后全绿。
- 本批**零 `src/**` 改动**（负向对照的临时改动已还原）；常驻 E2E 由 **276 增至 312 passed**（+11×3 成对 + 3 下界守卫）。
- **附带夹具修复**：为 `#disabled-size` / `#badge-layout` 宿主补 `min-width: 0`（含子元素）——新增字段族子元素的内禀最小宽会把移动端模拟的布局视口顶宽 2px，令 `responsive.e2e.ts` 的极窄探针（200px）可用宽收敛用例失去判别力；补后恢复。

---

## 2. 受检面变更（逐项有据）

### 2.1 新增禁用对（11 对，选择器取自各组件根 / 代表元素）

| 组件 | 选择器 | 禁用标记来源 |
|:---|:---|:---|
| SelectButton | `.caomei-select-button` | Reka `ToggleGroupItem` 子项 `data-disabled`（根元素无标记，守卫经后代命中） |
| RadioButton | `.caomei-radio-button[value="a"]` | `data-disabled` |
| ToggleButton | `.caomei-toggle-button` | `data-disabled` |
| Slider | `.caomei-slider` | `.caomei-slider--disabled` |
| Tag | `.caomei-tag` | `.caomei-tag--disabled` |
| MultiSelect | `.caomei-multi-select` | `.caomei-multi-select--disabled` |
| AutoComplete | `.caomei-auto-complete` | `.caomei-auto-complete--disabled` |
| TagsInput | `.caomei-tags-input` | `.caomei-tags-input--disabled` |
| DatePicker | `.caomei-date-picker` | `.caomei-date-picker--disabled` |
| Password | `.caomei-password` | 内部 `input[disabled]` |
| FileUpload | `.caomei-file-upload` | `.caomei-file-upload--disabled` |

### 2.2 判别力前置守卫

- 沿用既有口径：每对先断言禁用态**确有**禁用标记（`[disabled]` / `[aria-disabled="true"]` / `[data-disabled]` / `--disabled` 类），并断言默认态**不得**出现禁用标记（防两侧同态假通过）。
- 全部 11 对由运行器首轮实测通过（标记检出 / 反向守卫均成立）。
- **预置值说明**：默认 / 禁用两侧共享同一状态，保证两侧显示内容一致（DatePicker 两侧同置固定日期以覆盖「已填充」态；MultiSelect / AutoComplete / TagsInput / Select 两侧同置空值）。对其余带内部恒禁用子元素（如 Paginator 首页 / 上一页按钮在首页恒禁用）的组件，本批**不纳入**以免与默认态反向守卫冲突。

---

## 3. 夹具与规格改动

| 文件 | 改动 |
|:---|:---|
| `test/e2e/fixtures/app.vue` | `#disabled-size` 新增 11 对默认 / 禁用用例（22 个宿主）+ 预置状态（Segment / Radio / Slider / Multi / Auto / Tags / Date / Password）+ 宿主 `min-width: 0` 修复 |
| `test/e2e/disabled-size.e2e.ts` | `DISABLED_PAIRS` 7 → 18；新增「受检面下界守卫」用例（`MIN_DISABLED_PAIRS = 18`）；更新规格头部说明 |

- 新增用例均落在既有 `#disabled-size`（`flex-wrap` + `width: 15rem`）内，档位 / 内容 / 宿主两侧一致，仅 `disabled` 不同。

---

## 4. 未纳入面与边界（显式）

- **Paginator**：首页 / 上一页控件在首页恒为禁用，默认态即含 `[disabled]`，与「默认态不得有禁用标记」反向守卫冲突；纳入需专门的页状态编排，本批不纳入。
- **纯展示 / 无禁用语义组件**：Message / Card / Divider 等无 `disabled` 形态，不适用。
- **交互态禁用**（需先打开浮层 / 选中文件才出现禁用子元素）：不在本批。

---

## 5. 判别力（负向对照）

对 3 个代表组件（形态各异：开关类 ToggleButton、展示类 Tag、选择类 RadioButton）在禁用态规则上追加几何声明（默认态无此声明）：

| 对照 | 回退内容 | `playwright test disabled-size` 结果 |
|:---|:---|:---|
| ToggleButton / Tag / RadioButton | 禁用态规则分别加 `height: 48px` / `height: 40px` / `padding-top: 6px` | **9 failed**（3 组件 × mobile / tablet / desktop），失败点为「禁用态外盒几何与默认态不相等」 |

- 还原后 `git diff -- src/` 为空、规格复跑全绿（18 对 × 3 视口 + 3 下界守卫 + 2 角标用例 × 3 视口 = 63 passed）。

---

## 6. 规模、质量门与 Review Gate

- **规模**：2 文件（`test/e2e/disabled-size.e2e.ts` +25 −1 / `test/e2e/fixtures/app.vue` +152）+ 文档载体（本记录 + 治理索引 + `todo.md` 状态回填）。**零 `src/**` 改动**。
- **质量门（本批实测）**：
  - `pnpm test:e2e --workers=2` → **312 passed**（既有 276 + 本批 36 = 11×3 + 3），零回归。
  - `pnpm verify` **exit 0**（`lint:check` / `lint:css:check` / `lint:md:check` / `typecheck` / `typecheck:docs` / `test` **110 文件 / 2203 例** / `build` / `check:build` / `check:resolver` / `check:nuxt` / `docs:build` / `docs:check:i18n-routing` / `governance:check` 全绿）。
  - 负向对照 **9 处失败**、还原后全绿（§5）。
  - `check:planning-numbers` **0 命中**。
- **过程事件**：新增字段族子元素后 `#disabled-size` 的内禀最小宽把移动端模拟布局视口顶宽 2px（222 → 224），令 `responsive.e2e.ts` 极窄探针（200px）的浮层可用宽收敛用例判别力失效；经临时诊断脚本定位（多选 / 自动完成字段宽 200），以宿主 + 子元素 `min-width: 0` 修复（诊断脚本用后即删）。
- **V 阶段**：本批为**测试装置扩面**，浏览器侧证据由新增常驻 E2E 在真实 Chromium（三视口）中承载；未改 `src/**`、无可见 UI 行为变更，故不另走 `@ui-validator`。
- **Review Gate**：见 §7；本地留痕 `artifacts/review-gate/2026-10-07-phase20-m1-3-disabled-geometry-expansion.md`。

## 7. Review Gate 结论

- **R1（第 1 轮，`standard`）`Pass`**：0 blocker / 2 warning / 2 suggest。审计方独立复核 18 选择器 ↔ 18 组夹具逐一对应、各根 / 子元素的禁用标记来源、`MIN_DISABLED_PAIRS = 18` 一致、负向对照构成（3 × 3 = 9）自洽、`min-width: 0` 修复仅在 <240px 极窄探针生效且对两侧对称、Paginator 不纳入理由成立、`check:planning-numbers` 0 命中、零 `src/**` 改动。
- **实测用时**：派发 `2026-10-07T22:11:29+08:00` → 返回 `2026-10-07T22:16:13+08:00`，**≈ 4 分 44 秒**（≤ 10 分钟时间盒，未超）。
- **同批收口（记「已修复未复审」）**：
  - **RG-W1**（SelectButton 禁用标记归因不实）：§2.1 改为「Reka `ToggleGroupItem` 子项 `data-disabled`（根元素无标记，守卫经后代命中）」。
  - **RG-W2**（DatePicker 预置值理由不实）：§2.2 改为「两侧共享同一状态以保证显示内容一致」（删除错误的「清除按钮 disabled」依据）。
  - **RG-S1**（§5 计数口径）：补「2 角标用例 × 3 视口」，消歧。
  - **RG-S2**（下界守卫的间接夹具开销）：**未采用**——单独以 `base` 承载会与文件级 `afterEach` 的 `pageErrors` 参数冲突（Playwright 钩子文件级生效），保留在 auto 夹具内（3 次多余导航代价可接受）。
- **未覆盖边界**（采信调用方证据）：审计方未重跑 `pnpm test:e2e` / `pnpm verify`、未独立复现负向对照、未实测 11 项在 tablet/desktop 的绝对几何；以选择器 / 标记 / 结构映射静态核验与调用方 312 passed 证据交叉佐证。
