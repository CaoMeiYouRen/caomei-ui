# Phase 20 M1-1：Tabs 纳入计算样式采样面

> 创建时间：2026-10-07
> 关联条目：[待办事项](../../plan/todo.md) Phase 20 **M1-1**（测试装置与覆盖扩面）
> 装置本体：`test/capture/`（夹具 / 运行器 / 冻结基线）；装置落地记录见 [2026-09-22 采集装置迁移](./2026-09-22-m3-5-computed-style-capture-landing.md)
> 依据：Phase 19 M3-1 显式声明「`capture:styles` 采样面不含 Tabs，指示条视觉变更仅由 E2E 像素断言承载」（[2026-10-06 Tabs 指示条裁剪修复](./2026-10-06-phase19-m3-1-tabs-indicator-clipping.md)）；本轮新建候选 N1
> 快照：本仓工作区（`pnpm capture:styles` 0 差异、`pnpm test test/capture` 全绿）；**未推送**

---

## 1. 结论

- 计算样式采集装置的采样面由 **302 项扩展到 308 项（+6）**：新增 Tabs 横向 / 纵向各 3 项（列表分隔线 + 激活触发器指示条 + 非激活触发器）。
- **Tabs 指示条可稳定采样**（横向 / 纵向激活态由 `model-value` 静态指定，无交互时序；瞬态动画属性按既有原则排除），故**不**适用「以常驻 E2E 为唯一承载」的替代边界。
- 冻结基线重取后，`pnpm capture:styles` 复跑 **0 差异（308 项逐属性与基线一致）**；单测 `capture.test.mjs` **17 例全绿**（含受检面预算 302 → 308）。
- **判别力自证**：两轮负向对照（回退列表分隔线 / 指示条宽度；回退激活色）各命中 **3 处差异**（§5）。
- 本批**零 `src/**` 改动**、零 token 色值变更、零既有采样项改动；基线变更仅为**新增键**与 `capturedAt`（§4）。

---

## 2. 采样面变更（逐项有据）

采样键与运行器声明一一对应；属性按「**组件契约承载**」选取，全部为组件 CSS 自持值（不随夹具输入变化）。

### 2.1 新增采样项（6 项）

| 采样键 | 选择器 | 采样属性 | 依据（契约） |
|:---|:---|:---|:---|
| `tabs.horizontal.list` | `.caomei-tabs__list` | `overflow` / `padding-bottom` / `box-shadow` / `border-bottom-width` | 横向列表轴对契约（`overflow: auto hidden`）、内边距盒 1px 分隔线（`padding-bottom: 1px` + 内阴影）、`border-bottom` 归零 |
| `tabs.horizontal.trigger-active` | `.caomei-tabs__trigger[data-state="active"]` | `border-bottom-width` / `border-bottom-color` / `color` / `font-weight` | 激活指示条 2px 主色（`--caomei-tabs-indicator` → `--caomei-color-primary`）+ 激活文字主色 + `font-weight: 500` |
| `tabs.horizontal.trigger-inactive` | `.caomei-tabs__trigger:not([data-state="active"])` | `border-bottom-width` / `border-bottom-color` / `color` | 非激活指示条 2px 透明（占位、不变布局）+ 文字弱色 |
| `tabs.vertical.list` | `.caomei-tabs__list` | `overflow` / `padding-bottom` / `box-shadow` / `border-right-width` | 纵向列表两轴 `visible`、重置横向分隔线、保留 `border-right` 1px |
| `tabs.vertical.trigger-active` | `.caomei-tabs__trigger[data-state="active"]` | `border-right-width` / `border-right-color` / `border-bottom-width` / `color` / `font-weight` | 纵向激活指示条 2px 主色；`border-bottom-width: 0` 锁定纵向覆盖；`color` 与横向同口径采样（防将来纵向专属色覆盖回归） |
| `tabs.vertical.trigger-inactive` | `.caomei-tabs__trigger:not([data-state="active"])` | `border-right-width` / `border-right-color` / `border-bottom-width` / `color` | 纵向非激活指示条 2px 透明 + 覆盖归零 + 文字弱色 |

### 2.2 稳定性判定（瞬态 / 动画属性排除）

- **采样稳定**：夹具以 `model-value="account"` **静态**指定激活项，初始渲染即为终态；`color` / `border-*-color` 虽声明了 `transition`，但**无状态变更**即无插值窗口，采集前的 250ms 稳定等待已覆盖。两轴激活态各自独立用例呈现，不在运行期切换取值。
- **有意不采样**：`transition` / `animation` 相关瞬态属性（指示条 / 文字颜色的过渡中间值）不纳入；指示条**越界裁剪**属几何关系（越出内容盒 1px、落在内边距盒内），由 `tabs-indicator.e2e.ts` 的真实几何 + 像素断言承载，计算样式只固化其静态结果（`padding-bottom` / `border-bottom-width` / `box-shadow`）。

---

## 3. 夹具与运行器改动

| 文件 | 改动 |
|:---|:---|
| `test/capture/fixture/app.vue` | 新增第 16 段 Tabs 夹具：横向 / 纵向各一组（`data-cap="tabs:horizontal"` / `tabs:vertical"`），激活态静态指定；补齐 `CaomeiTabs` 家族导入与覆盖范围注释 |
| `test/capture/capture.mjs` | 新增 `TABS_*` 属性集（6 组）与 6 条采样声明，纳入受检面不变量 |
| `test/capture/capture.test.mjs` | 受检面预算 `DECLARED_KEY_BUDGET` 302 → **308**；前缀覆盖断言新增 `tabs.` |
| `test/capture/baseline.json` | 重冻结：新增 6 键 + `capturedAt` 更新（chromium 153.0.8010.12、视口 1280×800） |

- **采样顺序**：Tabs 属静态采样段（`STATIC_SAMPLES`），排在需交互的采样之前，无时序依赖。

---

## 4. 冻结基线与复跑

| 项 | 实测 |
|:---|:---|
| 采样面 | **308 项**（原 302 + 新增 6），键唯一性由单测锁定 |
| 重冻结 | `pnpm capture:styles:freeze` → `冻结基线写入 test/capture/baseline.json（308 项，chromium 153.0.8010.12）` |
| 复跑 | `pnpm capture:styles` → `0 差异：308 项逐属性与冻结基线一致` |
| 单测 | `pnpm test test/capture/capture.test.mjs` → **17 passed**（1 文件） |

新增键基线实测值（摘）：`tabs.horizontal.list` `overflow auto hidden` / `padding-bottom 1px` / `box-shadow rgb(229, 231, 235) 0px -1px 0px 0px inset` / `border-bottom-width 0px`；`tabs.horizontal.trigger-active` `border-bottom-width 2px` / `border-bottom-color rgb(37, 99, 235)` / `font-weight 500`；`tabs.horizontal.trigger-inactive` `border-bottom-color rgba(0, 0, 0, 0)`；`tabs.vertical.list` `overflow visible` / `border-right-width 1px`；`tabs.vertical.trigger-active` `border-right-width 2px` / `border-right-color rgb(37, 99, 235)`。

- **基线 diff 仅含新增键 + `capturedAt`**（`+37 −1`；逐行核对无既有键值漂移，符合「扩面后既有值不漂移」不变量）。

---

## 5. 判别力（负向对照）

「基线纳入某形态」不等于「该形态的规则生效」——拼写错误的选择器与不存在的规则同样表现为稳定值，只有**故意回退契约**才会暴露。两轮对照（改动后即还原）：

| 对照 | 回退内容 | `pnpm capture:styles` 结果 |
|:---|:---|:---|
| ① 列表分隔线 + 指示条宽度 | `tabs-list.vue` 横向 `padding-bottom: 1px` → `0`；`tabs-trigger.vue` 基类 `border-bottom: 2px` → `3px` | `tabs.horizontal.list` `padding-bottom`；`tabs.horizontal.trigger-active` / `trigger-inactive` `border-bottom-width` —— 共 **3 处** |
| ② 激活色（含纵向对称覆盖） | `tabs-trigger.vue` `[data-state='active']` 的 `border-bottom-color` 与 `color` → `--caomei-color-danger` | `tabs.horizontal.trigger-active` `border-bottom-color` + `color`；`tabs.vertical.trigger-active` `color` —— 共 **3 处** |

- 两轮均进程 exit 1（`ELIFECYCLE`）；还原后 `git diff -- src/` 为空、复跑 **0 差异**。
- 对照点落在**新增采样项**上（含纵向 `color`），证明新选择器与属性确实被采集且具备判别力。

---

## 6. 未纳入面登记收口

- Phase 19 M3-1 记录 §5 与采集装置侧原登记明列「采样面不含 Tabs，不构成本组件证据」；本批即该未纳入面的执行：Tabs 指示条几何与列表分隔线全部纳入。
- **历史记录不回改**：Phase 19 M3-1 与相关记录的「不含 Tabs」为产出时点口径；装置侧「当前采样面」以本记录为唯一载体。
- **剩余边界**：指示条的**裁剪几何**（越界像素）与**像素级行色**仍由 `test/e2e/tabs-indicator.e2e.ts` 承载，计算样式装置只固化静态契约值，二者互补不重复。

---

## 7. 规模、质量门与 Review Gate

- **规模**：装置侧 4 文件（`baseline.json` +37 −1 / `capture.mjs` +27 / `fixture/app.vue` +50 −2 / `capture.test.mjs` +2 −2），文档载体 2 文件于本批改动（本记录 + 治理索引）；`todo.md` 状态回填于 Review Gate 通过后执行（属待回填项）。**零 `src/**` 改动**、零 token 色值变更。基线为生成物（6 个新增键 + `capturedAt`）。
- **质量门（本批实测）**：
  - `pnpm capture:styles` **308 项 0 差异**（chromium 153.0.8010.12 / 视口 1280×800）。
  - `pnpm test test/capture/capture.test.mjs` **17 passed**。
  - 负向对照两轮各 **3 处差异**、还原后 0 差异（§5）。
  - `pnpm verify` **exit 0**（`lint:check` / `lint:css:check` / `lint:md:check` / `typecheck` / `typecheck:docs` / `test` **110 文件 / 2203 例** / `build` / `check:build` / `check:resolver` / `check:nuxt` / `docs:build` / `docs:check:i18n-routing` / `governance:check` 全绿）。
- **V 阶段（显式跳过）**：本批零 `src/**` 改动、无可见 UI 面，按 PDTFC+ 显式跳过 `@ui-validator`；**浏览器侧证据由采集装置承载**（`capture:styles` 在真实 Chromium 中采集并比对 308 项）。
- **Review Gate**：见 §8；本地留痕 `artifacts/review-gate/2026-10-07-phase20-m1-1-tabs-capture-face.md`。

## 8. Review Gate 结论

- **R1（第 1 轮，`standard`）`Pass`**：0 blocker / 1 warning / 2 suggest。审计方独立复核 `declaredKeys()` = 308、`baseline.entries` = 308、6 个 `tabs.*` 键齐全、**基线 diff 仅新增键 + `capturedAt`（无既有值漂移）**、`capture.test.mjs` 17 例、选择器与 `src/components/tabs/*` 契约逐项对应、`index.md` 登记唯一且链接有效。
- **实测用时**：派发 `2026-10-07T20:54:41+08:00` → 返回 `2026-10-07T20:57:12+08:00`，**≈ 2 分 31 秒**（≤ 10 分钟时间盒，未超）。
- **同批收口（记「已修复未复审」）**：
  - **RG-W1**（warning，staged 与工作区不一致）：记录定稿后重新 `git add`，使 staged == 工作区再提交。
  - **RG-S1**（suggest，纵向触发器未采样 `color`，与横向不对称）：纵向 active / inactive 属性集补 `color`（键数不变，仍 308），重冻结基线，并新增第 ② 轮负向对照证明纵向 `color` 具备判别力（§5）。
  - **RG-S2**（suggest，§7「文档载体 3 文件」含尚未改动的 `todo.md`）：§7 改为「本批改动 2 文件 + `todo.md` 于 RG 通过后回填（待回填项）」，保持时点口径。
- **未覆盖边界**（采信调用方证据）：审计方未重跑 `pnpm verify` 全链、未重放负向对照突变（受只读约束）、未在真实 Chromium 独立复现 0 差异；均以键数 / 预算 / 基线逐值对账与静态推演交叉佐证。
