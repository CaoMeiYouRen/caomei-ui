# Phase 20 M2-2：文档站主题 CSS 纳入 lint 面

> 创建时间：2026-10-07
> 关联条目：[待办事项](../../plan/todo.md) Phase 20 **M2-2**（基建与治理守卫补口）
> 依据：`lint:css:check` 的 glob 原为 `src/**/*.{html,css,scss,sass,vue}`，`docs/.vitepress/theme/**` 不在面内（Phase 19 M3-2 新增的文档站隔离规则仅靠人工 + 一次性探针验证）；候选 B23
> 快照：本仓工作区（`pnpm verify` exit 0、`pnpm lint:css:check` exit 0）；**未推送**

---

## 1. 结论

- 把**文档站主题样式**纳入 Stylelint 受检面：`lint:css` / `lint:css:check` 的 glob 追加 `docs/.vitepress/theme/**/*.{css,scss,html,vue}`（覆盖 `.vitepress/theme` 下的 `*.css`、`*.vue` 组件 `<style>`）。
- 存量违规 **4 处**全部为**记号等价**改动，已 `--fix` 清零；`pnpm verify` 全绿。
- 顺带引号化 glob：未加引号时在 **bash（未开 globstar）** 下会被部分展开（实测 `src/**/*.{...}` 仅展开出少量真实文件），引号化后统一交由 Stylelint 展开（实测 `src/**` 展开 **90 文件**），消除该环境对 `src/**` 嵌套面的漏检风险（在 `dash` / `cmd` 下无此问题）。

---

## 2. 改动

### 2.1 受检面（`package.json`）

```diff
- "lint:css":       "stylelint src/**/*.{html,css,scss,sass,vue} --fix",
- "lint:css:check": "stylelint src/**/*.{html,css,scss,sass,vue}",
+ "lint:css":       "stylelint \"src/**/*.{html,css,scss,sass,vue}\" \"docs/.vitepress/theme/**/*.{css,scss,html,vue}\" --fix",
+ "lint:css:check": "stylelint \"src/**/*.{html,css,scss,sass,vue}\" \"docs/.vitepress/theme/**/*.{css,scss,html,vue}\"",
```

- 引号化后由 Stylelint 展开 glob，`src/**` 的嵌套文件（原 shell 展开可能漏检）一并纳入；实测 `stylelint "src/**/*.{...}"` 退出 0，无新增存量违规。

### 2.2 存量违规清零（记号等价，无视觉变更）

| 文件 | 规则 | 改动 |
|:---|:---|:---|
| `docs/.vitepress/theme/caomei-demo.css` | `media-feature-range-notation` | `@media (max-width: 959px)` → `@media (width <= 959px)` |
| `docs/.vitepress/theme/components/theme-preset-switcher.vue` | 同上 | `@media (max-width: 959px)` → `@media (width <= 959px)` |
| `docs/.vitepress/theme/components/showcase-grid.vue` | `alpha-value-notation` | `rgb(0 0 0 / 8%)` → `rgb(0 0 0 / 0.08)` |
| `docs/.vitepress/theme/components/showcase-grid.vue` | `comment-empty-line-before` | 注释前补空行 |

- 媒体查询范围记号（`width <= 959px`）为现代浏览器基线语法（Chrome 104+ / Safari 16.4+ / Firefox 102+），文档站仅面向现代浏览器；改动前后语义等价。

### 2.3 规范载体

- `docs/standards/development.md` §11 质量门：`pnpm lint:css` 条目补「受检面含 `src/**` 与文档站主题 `docs/.vitepress/theme/**`」。

---

## 3. 未纳入面与边界（显式）

- **仅文档站主题目录** `docs/.vitepress/theme/**`：`docs/**` 下的其它样式（示例 `.vue` 的 `<style>`）不在组件库交付面、也未纳入本批；示例样式由 `docs:check:example-refs` 的形态守卫与 `docs:build` 承载。
- **不引入文档站专属豁免**：当前 `stylelint-config-cmyr` 规则下无违规，未新增 overrides；若将来 VitePress 覆盖需要 `!important`，再按需登记规则级豁免。
- **`lint-staged` 未纳入 CSS**：提交钩子仍只跑 ESLint（`*.{js,ts,vue}`），CSS 改动由 `pnpm lint:css:check` / `pnpm verify` 在提交前手动或 CI 拦截（沿用 [Git 规范](../../standards/git.md) §5）。

---

## 4. 规模、质量门与 Review Gate

- **规模**：`package.json`（+2 −2）、`docs/.vitepress/theme/caomei-demo.css`（+1 −1）、`docs/.vitepress/theme/components/showcase-grid.vue`（+2 −1）、`docs/.vitepress/theme/components/theme-preset-switcher.vue`（+1 −1）、`docs/standards/development.md`（+1 −1）；文档载体（本记录 + 治理索引 + `todo.md` 状态回填）。**零组件库 `src/**` 改动**。
- **质量门（本批实测）**：
  - `pnpm lint:css:check` **exit 0**（新增文档站主题面纳入后）；文档站主题 glob 命中 **6 文件**（主题根层 `.css` / `.vue` + 组件子层 3 个 `.vue`），`src/**` 引号化后 Stylelint 展开 **90 文件**，均 0 warning。
  - 纳入前会命中的实证：对基线提交 `5d3ce82` 的文件内容走 `stylelint --stdin-filename`，旧内容触发 **4 处**违规（与 §2.2 逐条一致）。
  - `pnpm verify` **exit 0**（`lint:check` / `lint:css:check` / `lint:md:check` / `typecheck` / `typecheck:docs` / `test` **111 文件 / 2212 例** / `build` / `check:build` / `check:resolver` / `check:nuxt` / `docs:build` / `docs:check:i18n-routing` / `governance:check` 全绿）。
  - 记号等价（构建侧实证）：`docs:build` 产物中范围记号残留 **0**（esbuild 已降级为 `@media(max-width:959px)`），交付物无浏览器支持回归。
- **V 阶段**：本批为 lint 配置扩面 + 记号等价修正，无可见行为变更；记号等价性由规则语义（媒体范围记号 / alpha 小数）保证，未另走 `@ui-validator`。
- **Review Gate**：见 §5；本地留痕 `artifacts/review-gate/2026-10-07-phase20-m2-2-docs-theme-stylelint.md`。

## 5. Review Gate 结论

- **R1（第 1 轮，`standard`）`Pass`**：0 blocker / 0 warning / 3 suggest。审计方独立以「最小生效性验证命令」核实：文档站主题 glob 命中 **6 文件** 0 warning；基线提交 `5d3ce82` 的文件内容走 `stylelint --stdin-filename` 复现旧内容 **4 处**违规；引号化后 `src/**` 展开 **90 文件** 0 warning；构建产物范围记号残留 **0**。
- **实测用时**：派发 `2026-10-08T00:16:10+08:00`；返回时点未单独取戳，以记录回填写入为界，**≈ 10 分钟内**（≤ 时间盒）。
- **同批收口（记「已修复未复审」）**：
  - **RG-S1**（§1 shell 展开表述过强）：限定为「bash（未开 globstar）下部分展开」，并补实测文件数（90）。
  - **RG-S2**（`todo.md` 完成态先于 Pass）：本批完成态与 RG 结论同批提交；后续条目按「Pass 后回填」执行。
  - **RG-S3**（§4 预引用 artifact）：F 阶段落盘 `artifacts/review-gate/2026-10-07-phase20-m2-2-docs-theme-stylelint.md`。
- **未覆盖边界**（采信调用方证据）：审计方未复跑完整 `pnpm verify`、未做视觉对比（改动无可见行为，跳过 `@ui-validator` 合理）；`docs/examples/**` 等示例样式面显式不在本批（§3）。
