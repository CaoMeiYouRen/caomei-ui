# Phase 18 M2-3：富文本编辑器窄屏真实几何回归

> 创建时间：2026-10-01
> 关联条目：[待办归档](../../plan/todo-archive.md) Phase 18 **M2-3**（测试稳定性与质量装置消缺）
> 前序：`CaomeiRichTextEditor` 交付记录见 [2026-09-30 M1-3](./2026-09-30-m1-3-rich-text-editor.md)（其 V 阶段 P1 即本条目所守护的缺陷）
> 决策依据：用户 2026-09-30 裁定 **D4「全取」**——C33 把 `CaomeiRichTextEditor` 纳入 e2e 夹具并断言 mobile 档无页级横向溢出
> 快照：本仓工作区（`pnpm test:e2e --workers=2` 117 passed）；**未推送**

---

## 1. 结论

- 新增常驻 E2E `test/e2e/rich-text-editor-overflow.e2e.ts`，在 **mobile / tablet / desktop 三档视口**断言页级无横向溢出；`pnpm test:e2e --workers=2` 由 114 → **117 passed**（既有套件零回归）。
- 新增独立夹具入口 `/rich-text-editor.html`（`fixtures/rich-text-editor.{html,ts}` + `rich-text-editor-app.vue`），宿主为 `display: grid` 压力容器。
- **判别力自证**：回退根类 `min-width: 0` → mobile 档失败（`scrollWidth` **1013** vs 视口 390，溢出 **623**）；还原后 3 档全绿、`git diff -- src/` 为空。
- 声明级守卫（`test/contracts/rich-text-editor-layout.test.ts`）与本真实几何层断言**双层互补**；本条目不新增 `src/**` 改动、不改任何样式。
- 关闭 M1-3 记录登记的「真实几何层断言」候选（该候选已随 Phase 18 登记迁入 M2-3）。

---

## 2. 缺陷与守护对象

- **缺陷形态**：`CaomeiRichTextEditor` 根类曾只设 `width: 100%`。组件常作为 grid / flex 项使用，而编辑器内核工具栏为 `nowrap`、**min-content 宽度远大于视口**；缺 `min-width: 0` 时该项的自动轨道最小值取 min-content，把父容器与整页一并撑宽。
- **既有修复**（M1-3 P1，`min-width: 0`）：390 视口 `documentElement.scrollWidth` 1034 → 390。
- **既有守卫**：`test/contracts/rich-text-editor-layout.test.ts` 断言根类同时声明 `width: 100%` 与 `min-width: 0`（声明层，负向对照通过）。
- **缺口**：声明存在不等于布局生效——拼写漂移、被更高特异性规则覆盖、`min-width` 被后续改动移除等情形只有**真实几何**能暴露。本条目补该层。

---

## 3. 夹具（独立入口）

| 文件 | 作用 |
|:---|:---|
| `test/e2e/fixtures/rich-text-editor.html` | 独立入口页（Vite 多页，`/rich-text-editor.html`） |
| `test/e2e/fixtures/rich-text-editor.ts` | 入口脚本（挂载 App） |
| `test/e2e/fixtures/rich-text-editor-app.vue` | 夹具：`#rich-text-editor-narrow` → `.editor-host { display: grid }` + `CaomeiRichTextEditor` |

**为何独立入口而非并入共享夹具**：

- 编辑器内核（`md-editor-v3`）体积与运行期开销大，并入会让既有 100+ 常驻用例每次都加载内核；
- 内核的 console 噪声会与共享夹具的「页面不得产生 console error」断言耦合；
- 共享夹具的 DOM 顺序假设（如 ButtonGroup 紧邻 Dialog 触发器）不受影响。

该口径已写入 [测试规范 §4](../../standards/testing.md)（E2E 夹具条：带重依赖或高 console 噪声的组件走独立入口）。

---

## 4. 断言与判定面

| 断言 | 判据 |
|:---|:---|
| 压力面形态（前置守卫） | 宿主 `getComputedStyle(host).display === 'grid'`——宿主被改为 block / 选择器漂移时 fail-closed，避免四条几何断言静默通过 |
| 页级横向溢出 | `documentElement.scrollWidth - clientWidth <= 1` |
| `body` 横向溢出 | `document.body.scrollWidth - documentElement.clientWidth <= 1` |
| 编辑器根越出视口 | `editorWidth - viewportWidth <= 1` |
| 编辑器根越出宿主容器 | `editorWidth - hostWidth <= 1`（证明被压回轨道，而非把轨道撑宽） |

- 容差 1px 吸收子像素取整；内核挂载（`.md-editor` 可见）后才测量，保证 min-content 压力面成立（`loadEditor()` 先注入 `md-editor-v3/lib/style.css` 再渲染 `MdEditor`，故 `.md-editor` 可见即样式已生效，不存在「未加载即通过」的假通过路径）。
- 每个用例在 mobile / tablet / desktop 三个 project 下各跑一遍（`playwright.config.ts`）。
- 页面 error（console / pageerror）由用例级夹具收集并断言为空。

---

## 5. 判别力（负向对照）

回退 `src/components/rich-text-editor/rich-text-editor.vue` 根类的 `min-width: 0` 后：

```text
[mobile] 窄屏下富文本编辑器不抬高页级横向溢出
Error: 页级横向溢出（scrollWidth 1013 / 视口 390）
Expected: <= 1
Received:    623
```

- 命中项为**页级溢出断言**，与缺陷形态一致；`desktop` / `tablet` 档在 1280 / 768 下同样成立（内核 min-content 仍大于视口）。
- 还原后 `git diff -- src/` 为空，`npx playwright test rich-text-editor-overflow` 三档 **3 passed**。
- **审计方独立复核（不改 `src/`）**：浏览器内注入 `.caomei-rich-text-editor { min-width: auto !important }`，390 视口实测 `scrollWidth 1013 / clientWidth 390`（溢出 623）、`editorWidth 989`、`hostWidth 342`——四条断言均越限，与调用方实测值逐项一致。
- **压力面守卫负向对照**：把夹具宿主改为 `display: block` → 用例在**前置守卫**处失败（`夹具压力面漂移：宿主须为 display: grid`），证明「夹具失能」不会被读成「契约成立」；还原后 3 passed。
- **与 M1-3 记录的数值差异**：M1-3 记录 390 视口 `scrollWidth` 为 1034，本夹具实测 1013。两处均为「同一缺陷形态在**不同宿主**下的实测值」，无事实冲突；差异归因于宿主容器形态与内容长度不同（内边距非唯一因子），不做逐项归因。

---

## 6. 规模与质量门

- **规模**：新增 4 文件（1 spec + 3 夹具）；文档载体 4 文件（本记录 + 治理索引 + `development.md` / `testing.md` 各 1 条口径）；`todo.md` 状态回填在 Review Gate Pass 后随本批收口进行。**零 `src/**` 改动**。
- **质量门（本批实测）**：
  - `pnpm test:e2e --workers=2` → **117 passed**（既有 114 + 本批 3，零回归）。
  - `eslint`（新增文件）exit 0；`vue-tsc --noEmit` exit 0。
  - 提交前复跑 `pnpm verify`（含 `test` / `governance:check` / `docs:check` 链）。
- **V 阶段（显式跳过）**：本批不改 `src/**`、无可见 UI 面；浏览器侧证据由新增的常驻 E2E 在真实 Chromium 中承载（三档视口实测）。

## 7. Review Gate 结论

- **R1（第 1 轮，`standard`）`Pass`**：0 blocker / 1 warning / 3 suggest。本地留痕 `artifacts/review-gate/2026-10-01-phase18-m2-3-rich-text-editor-geometry.md`。
- **审计方独立复核**（摘）：`npx playwright test rich-text-editor-overflow` 3 passed；`pnpm test:e2e --workers=2` **117 passed** exit 0；独立负向对照（浏览器注入 `min-width: auto !important`）实测 `1013 / 390 / 623`、`editorWidth 989`、`hostWidth 342`，与调用方逐项一致；`git diff --stat -- src/` 为空；`check:governance-records` OK。并判定**不存在假通过路径**（`.md-editor` 可见 ⇒ `style.css` 已注入生效）。
- **修复点（同批收口，记「已修复未复审」）**：
  - **RG-W01**（warning，压力面无 fail-closed 守卫）：宿主选择器钉到 `.editor-host` 并新增前置断言 `display === 'grid'`；负向对照（宿主改 `block`）在守卫处失败，已实测。
  - **RG-S01**（§6 文档载体计数与实际 diff 不一致）：改为「文档载体 4 文件」，并点明 `todo.md` 于 RG Pass 后回填。
  - **RG-S02**（1034 → 1013 归因不严谨）：收敛为「不同宿主实测值，归因于宿主形态与内容长度（内边距非唯一因子）」，不做逐项归因。
  - **RG-S03**（§8 理由与实际等待选择器不自洽）：改为「只判几何层、不判内核内部内容可达性」。
- **实测用时**：派发 `2026-10-01T14:16:25+08:00` → 留痕写入 `2026-10-01T14:21:14+08:00`，**≈ 4 分 49 秒**（≤ 10 分钟时间盒，未超）。
- **未覆盖边界**（采信调用方证据）：审计方未独立重跑 `eslint` / `vue-tsc` 与 `governance:check` 全链（仅 `check:governance-records` 段）。

---

## 8. 已知观察与边界

- 断言只判**页级 / 容器级几何**，不判内核工具栏内部的内容可达性（是否可滚动到末项）——后者属内容完整性，M1-3 V 阶段已一次性实测，未纳入常驻面。
- 夹具内容为短 Markdown；min-content 压力由**工具栏**（固定 nowrap）提供，与正文长度无关。
- 编辑器内核为可选 peer，夹具依赖 `devDependencies` 中的 `md-editor-v3`；若其被移除，夹具页面会退化为占位（`.md-editor` 不可见），用例将因等待超时而失败——属 fail-closed，非静默通过。
