# Phase 19 M1-3c：声明层契约与 checkbox 采样（M1-3 收口）

> 创建时间：2026-10-05
> 关联条目：[待办事项](../../plan/todo.md) Phase 19 **M1-3**（设计一致性口径裁定与守卫落地；本记录为子批 **3c**，M1-3 至此全部交付）
> 依据：[Phase 18 M3-1 评估 §5](./2026-10-01-phase18-m3-1-design-consistency-evaluation.md) P2 / [设计规范 §6](../design-spec.md)
> 边界：新增声明层契约（`test/contracts/**`）+ capture `checkbox.*`；除 §6 的 Textarea 措辞修正外**零 `src/**` 行为改动**。

---

## 1. 结论

- 落地 **3 项声明层契约**（DataView 根规则 / CheckboxGroup 禁用态 / 字段 invalid 语义），均含**仓库现状断言**与内嵌负向用例。
- capture 扩入 **checkbox**（三档尺寸 + 分组间距），采样面 **297 → 302（+5）**。
- 修正 §6 一处**新发现的措辞漂移**（Textarea `resize`）。
- 契约入 `pnpm test`（随 `verify` 链；`governance:check` 本身不含 test）；capture 经周级回归常驻。

## 2. 声明层契约（`test/contracts/`）

| 契约文件 | 契约（§6） | 判定 | 仓库现状 |
| --- | --- | --- | --- |
| `data-view-root.test.ts` | 内容区不设内边距与背景 | 根规则 `.caomei-data-view` 不得声明 `padding*` / `background*`；`__header` / `__footer` / `__empty` / `__loading` 的内边距合法 | 通过 |
| `checkbox-group-disabled.test.ts` | 禁用态不在分组层叠加透明度 | 根 / `--` 修饰规则不得声明 `opacity`（`__` 子部件不在受检面） | 通过 |
| `field-invalid-semantics.test.ts` | 校验态用类 / 属性驱动的 invalid 语义 | `field-shell.css` 必须存在 `.caomei-field--invalid` 钩子；钩子不得以色值类命名（`--danger` 等）；invalid 规则不得用 `#hex` / `rgb()` / `hsl()` 字面量 | 通过 |

每项均以「纯判定函数 + `it.each` 正反用例 + 仓库现状断言」结构（同 `field-shell.test.ts`），并剥离 CSS 注释避免假阴性。

## 3. capture 扩采样（+5）

| 键 | 选择器 | 属性 | 实测值（亮） |
| --- | --- | --- | --- |
| `checkbox.{sm,md,lg}` | `.caomei-checkbox__control` | 宽 / 高 / 圆角 | `16/18/20px` + 圆角 `4px`（`radius-sm`） |
| `checkbox-group.gap` | `.caomei-checkbox-group` | `gap` | `8px`（`space-2`） |
| `checkbox-group.options.gap` | `.caomei-checkbox-group__options` | `gap` | `8px`（`space-2`） |

## 4. §6 措辞修正（新发现漂移）

- **漂移**：§6 原写 Textarea「`resize` 固定 `none`」，但实现为 `resize` prop（**默认 `vertical`**）、仅 `autoResize` 时固定 `none`（`textarea.vue:16 / :44`；组件 `types.ts` 与迁移映射节均已如此声明，单测 `textarea.test.ts` 已覆盖两态）。
- **处置**：按 M1-1 惯例**对齐 §6 措辞**为「`autoResize` 时 `resize` 固定 `none`，否则由 `resize` prop（默认 `vertical`）决定」。
- 因此 §5 P2 的「Textarea 默认 `resize: none`」契约前提不成立；该行为已由既有单测覆盖，**不另立声明层契约**（resize 经内联 `:style` 表达，非 CSS 声明面）。

## 5. 负向对照（判别力）

- **契约（仓库级）**：临时回注 `data-view` 根 `padding` / `checkbox-group` 根 `opacity` / `field-shell` 色值类钩子，三条仓库现状断言**各自失败**（3 failed）；还原后 3 passed、`git diff -- src/` 为空。内嵌 `it.each` 另含正反用例，覆盖 `padding` 长写（`padding-block-start` / `padding-inline-end`）、CSS 命名色（`red`）与扩展色值类（`--yellow` / `--danger`）等易漏形态。
- **capture**：回注 `checkbox` 圆角 `radius-sm → md` + 分组 `gap` `space-2 → space-3` → `capture:styles` 报 **5 处差异**（三档圆角 + 两处 gap）；还原后 **302 项 0 差异**。

## 6. 质量门

| 门禁 | 结果 |
| --- | --- |
| `pnpm vitest run test/contracts/*.test.ts` | 3 文件 / 19 passed |
| `pnpm capture:styles` | **302 项 0 差异** |
| `pnpm vitest run test/capture/capture.test.mjs` | 17 passed |
| `pnpm lint:check` / `pnpm typecheck` | exit 0 |

## 7. Review Gate 结论

- **R1（`standard`）`Pass`**：0 blocker / 2 warning / 2 suggest。审计方独立复跑契约（19 passed）与 capture（302 项 0 差异）、双向负向对照、`declaredKeys()`=302、`baseline.json` 值与实现逐项一致；核实 Textarea 默认 `vertical` / `autoResize → none` 与 §6 新措辞、`types.ts`、迁移节、单测一致；判定「不立声明契约」成立。
- **同批收口**：warning ① DataView 判定漏 `padding-block-start` 等多段长写 → 正则放宽为 `padding[\w-]*` + 补负例；warning ② invalid 判定对 CSS 命名色 / 扩展色值类过松 → 扩展 `COLOR_NAMED_HOOK_RE` / `RAW_COLOR_RE` + 补负例；suggest ① 接线措辞订正为「随 `verify` 链，`governance:check` 本身不含 test」；suggest ② 11 文件规模经审计判定**无需拆分**（单一逻辑变更 + 强制同步载体）。
- 留痕：`artifacts/review-gate/2026-10-05-phase19-m1-3c-declaration-contracts.md`（本地态）。

## 8. 未纳入面与边界

- 契约只覆盖**声明层**；真实几何 / 交互由 capture 与常驻 E2E 承担（既有分工）。
- 采样面 297 → 302 属预期扩容；暗色 / 移动档位不采样（既有边界）。
- Textarea 的 3 项契约以外，本批不新增其它 P2 项；`invalid` 属性的组件侧使用面（14 组件）未逐组件断言（依赖 `field-shell` 语义契约 + a11y 用例）。
