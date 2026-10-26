# Phase 26 M5-2 Select 示例可访问名与文档站 axe 抽检（交付记录）

> 创建时间：2026-10-27
> 依据：[2026-10-26 执行期追加与 1.0 发布门禁](./2026-10-26-phase26-ui-gate-planning.md) §2.2 / §2.3 / §2.4；[Refactoring UI 自检](./2026-10-26-refactoring-ui-self-check.md) §4.4 / §4.5。
> 定位：Phase 26 M5 插队批次第 2 条的交付记录；M5 收口自检（G0）由批次记录汇总，本记录只覆盖本条。

## 1. 交付范围

- **中文 Select 示例（`docs/examples/select/`，7 文件 / 17 个触发器）**：为每个 `CaomeiSelect` 补 `label`（映射 `aria-label`），名称表达字段用途而非复述 placeholder：
  - `basic.vue`「水果」/ `clear.vue`「水果（可清除）」/ `object-options.vue`「分类」/ `option-slot.vue`「发布状态」；
  - `sizes.vue`「水果（小 / 中 / 大尺寸）」；`states.vue`「水果（禁用 / 校验失败 / 含禁用选项）」；
  - `value-slot.vue`「水果（value 插槽 / ·图标 / ·占位 / ·小 / 中 / 大尺寸）/ 水果（value + option 插槽）」——按 value 插槽语境命名，避免与 `sizes.vue` 重名。
  - 画廊复用 `select/basic.vue`，不额外计数（画廊 Select 卡随之获得可访问名）。
- **文档站 axe 抽检脚本（新增）**：`scripts/docs/check-docs-axe.mjs` + `scripts/docs/check-docs-axe.test.mjs`（17 例）+ `package.json` 的 `docs:check:axe` 手动入口；`docs/design/documentation-site.md` 新增 §17。
- **画廊预览区键盘可达（同批范围扩张，见 §4）**：`docs/.vitepress/theme/components/showcase-grid.vue` 的预览区常驻 `tabindex="0"` + `role="group"` + 中英可访问名，并补 `:focus-visible` 焦点环；`test/e2e/gallery.e2e.ts` 新增中英「预览区键盘可达并呈现焦点环」用例。
- **上一批构建阻断修复**：`docs/design/governance/2026-10-27-phase26-m5-1-data-table-keyboard-scroll.md` 正文裸写的 `<caption>` 改为不含标签的表述（VitePress 把 `.md` 当 Vue 模板编译，会导致 `docs:build` 失败），并在该记录追加 §8 补记。
- **Backlog 登记**：§1.6 新增「文档站 a11y 抽检矩阵外示例」（`input-group/with-select.vue`，低优先级）。

## 2. 脚本设计（`check-docs-axe`）

- **取证链路**：`docs/.vitepress/dist` 已构建 → 端口预检 → 起 `vitepress preview`（`process.execPath` + CLI 文件路径，跨平台无 shell）→ Chromium 注入 axe-core → 按页面矩阵审计 → 有违规 / 受检面收窄 / 规则未生效 / 基础设施失败即 exit 1。
- **默认矩阵（5 页 / 2 条 WCAG 规则）**：`/components/data-table`、`/components/select` 中英、`/components/showcase` 中英；规则 `button-name` + `scrollable-region-focusable` 对全部登记页统一执行。只取 WCAG 规则面，不纳入 best-practice / experimental（`focus-order-semantics` 对可聚焦滚动容器必然命中）。
- **抗静默收窄（两层）**：
  1. DOM 层：每页「就绪选择器 + 最小命中数」下界（`data-table 14 / select 17 / showcase 15`）；
  2. 规则层：每页「规则 × 最小适用节点数」（适用 = 通过 + 违规 + 待复核），规则不适用同样失败。
  `--rules` 收窄时跳过未审计规则的适用性判定（不误报）。
- **其他守卫**：端口占用预检（VitePress preview 不实现 `--strictPort`）；预览服务器提前退出 / spawn 失败 / 加载超时 fail-closed；`finally` 中 close browser 与 stop server 互不跳过，SIGTERM → 3s → SIGKILL 并等待退出；`--report` 仅允许仓库内路径，JSON 附 `head` / `distIndexMtime` / 各规则三计 / `outcome`。
- **门禁位置**：不接入 `verify` / `docs:check` / `governance:check`（依赖浏览器与构建产物）；G0 采信退出码与 `--report` 报告，是否常驻另行评估。

## 3. 验收核对

| 登记验收项 | 结果 | 证据 |
| --- | --- | --- |
| zh `/components/select` axe `button-name` 为 0 | 达成 | `check-docs-axe --pages=select-zh,showcase-zh`：select 受检 17，`button-name` 通过 21 / 违规 0；`scrollable-region-focusable` 通过 1 / 违规 0 |
| zh `/components/showcase` axe `button-name` 为 0 | 达成 | 同次运行：showcase 受检 15，`button-name` 通过 15 / 违规 0；`scrollable-region-focusable` 通过 5 / 违规 0 |
| 脚本在 zh select / showcase 范围退出码 0 | 达成 | `pnpm docs:check:axe --pages=select-zh,showcase-zh` → exit 0，报告落 `test-results/docs-axe/m5-2-zh.json` |
| 不以 placeholder 代替可访问名 | 达成 | 17 个 `label` 逐条不复述 placeholder；`label` 经 `labelAttrs()` 只输出 `aria-label` |
| 无可见布局变化 | 达成 | 示例仅新增 `aria-*`，无可见文本 / 布局参与；画廊 13 条浏览器回归（含四档视口无横向溢出、对齐）全过 |

**负向验证（证明规则有判别力）**：全矩阵运行 exit 1，仅 `/en-US/components/select`（`button-name` 通过 4 / 违规 17）与 `/en-US/components/showcase`（通过 14 / 违规 1）失败——英文示例由 M5-3 承接，属预期；`scrollable-region-focusable` 在 5 页全部为 0（含 M5-1 的文档站 API 表格补丁）。

## 4. 范围扩张：画廊预览区可聚焦

- **动因**：脚本在 zh `/components/showcase` 实测到 2 处 `scrollable-region-focusable`——预览区固定 `height: 168px` + `overflow: auto`（卡片对齐的承重声明），但不可聚焦，键盘用户无法滚动溢出内容。
- **处置**：预览区按滚动区处理，常驻 `tabindex="0"`、`role="group"`、名称「<组件名> 预览 / preview」，焦点环 `outline-offset: -2px` 内缩避免被卡片 `overflow: hidden` 与圆角裁切；`gallery.e2e.ts` 覆盖中英「溢出前置 → 聚焦 → `ArrowDown` 滚动 → CDP 强制 `:focus-visible` 断言 `solid` / `2px` / 非透明 / `-2px`」。
- **代价（已披露）**：即使不溢出的预览也多一个 tab 停靠点（每页固定 15 个），条件化（溢出时才可聚焦）列为后续项，见 `documentation-site.md` §16。

## 5. 验证证据

- `pnpm docs:build`：exit 0（修复裸 `<caption>` 前为 exit 1）。
- `pnpm docs:check:axe --pages=select-zh,showcase-zh`：exit 0；报告 `test-results/docs-axe/m5-2-zh.json`。
- 全矩阵 `node scripts/docs/check-docs-axe.mjs`：exit 1（仅 en-US 两页 `button-name`）；报告 `test-results/docs-axe/full-matrix-pre-m5-3.json`。
- `pnpm test:e2e:gallery`：13 passed（含中英预览区键盘可达 / 焦点环）。
- `pnpm exec vitest run scripts/docs/check-docs-axe.test.mjs`：17 passed；`pnpm test`：142 文件 / 2742 tests 通过。
- `pnpm typecheck:docs` / `pnpm docs:check` / `lint-md` / `eslint` / `stylelint` / `check-planning-numbers`：全 exit 0。
- 本地产物（gitignored）：`test-results/docs-axe/*.json`、`test-results/e2e-gallery/`。

## 6. Review Gate

- **R1（`standard`，两分区并行，13 文件 > 8）**：分区 A（示例 / theme / 设计文档）**Pass**，分区 B（脚本 / 测试 / `package.json`）**Pass**；合并结论 **Pass**（0 blocker）。warning：预览区焦点环缺实测证据；`<caption>` 构建阻断未留痕且证据缺 `docs:build`；脚本抗收窄不覆盖规则适用性、端口未预检、`finally` 回收顺序、showcase 下界过松、失败路径单测缺失。
- **R2（`quick` delta）：`Pass`**。上述修复点落地（规则适用数、端口预检、SIGTERM/SIGKILL、下界 15、15 例测试、报告元数据、`--report` 边界、waitForFunction 就绪、焦点环 E2E、记录补记、value-slot 重命名、backlog 行、§16 代价）；残留 `stopServer` 信号分支与 `minApplies` 语义两条 warning。
- **R3（`quick` delta）：`Pass`**。`stopServer` 补 `signalCode`；适用数改为「通过 + 违规 + 待复核」；残留「新增单测实际未插入」「`--rules` 收窄误报」两条 warning。
- **R4（`quick` delta，显式新增 1 轮预算）**：**Pass**。补齐缺失单测、`evaluateOutcome(entries, activeRules)` 跳过未审计规则、JSDoc / `..foo` 正例 / gallery `finally` / §17 失败语义；0 blocker / 0 新 warning。
- **用时实测**：采用「发起前宿主时间戳」记录轮次起点——R1 `02:08:59`（两区并行）、R2 `02:21:00`、R3 `02:32:16`、R4 `02:37:54`；**各轮纯审计用时未逐轮落盘**（发起后未即时采结束时间戳），本轮不作为时间盒核验依据，列为流程改进项。
- **复查基线**：`d59800a` + 当前工作区（13 文件：11 改 + 2 新增）。

## 7. 未覆盖边界

- 英文示例（`docs/i18n/en-US/examples/select/` 17 个触发器）仍无名，由 M5-3 承接；全矩阵在 M5-3 完成后由 G0 复跑。
- 矩阵外页面（`/components/input-group` 等）的示例可访问名未纳入脚本，已登记 Backlog。
- 未验证 Firefox / WebKit 的焦点环与方向键行为；预览区焦点环的暗色主题与 375px 窄屏外观未单独取证（§17 已声明同类边界）。
- `--rules` 传入「未在任何页面登记」的规则时，规则层抗收窄会被跳过（默认门禁不受影响），列为 follow-up。
- 未量化 best-practice / experimental 规则面的违规增量（按 WCAG 规则面取证）。

## 8. 教训

- **`docs:build` 必须进证据清单**：上一批的裸 `<caption>` 只有 `docs:build` 能拦住，而该批证据清单恰好缺它；已在 M5-1 记录 §8 补记。
- **文本替换式编辑必须验证落位**：R3 发现「新增单测」因替换串 typo 静默未插入，说明批量 `replace` 需要断言或事后计数。
- **审查轮次用时须在返回时即时采集**：本轮只记录了发起时间戳，导致时间盒数据不完整；后续在子代理返回后立刻取时间戳。
