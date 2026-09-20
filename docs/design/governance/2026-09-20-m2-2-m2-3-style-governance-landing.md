# M2-2 / M2-3 样式治理落地记录（Phase 11）

- 类型：实现落地与等价验证记录
- 触发：Phase 11 M2-2「scoped 变量声明治理 + 档位死声明守护」与 M2-3「禁用态字面量守卫 + z-index token」
- 授权链：M2-1 门槛判定（[M2-1 盘点记录 §3.5 / §7](./2026-09-20-m2-1-component-quality-audit.md)）→ 用户 2026-09-20 裁定「**全面收敛**」→ [待办事项](../../plan/todo.md) M2-2 / M2-3 条目登记范围
- 关联：[待办事项 M2](../../plan/todo.md) ｜ [M2-1 盘点记录](./2026-09-20-m2-1-component-quality-audit.md) ｜ [设计规范 §2.5](../design-spec.md) ｜ [开发规范 §7](../../standards/development.md) ｜ [长期任务 §2.2](../../plan/recurring.md)
- 环境：Vue 3.5.x + Reka UI 2.10.4 + Vite 8.2.2（fixture 计算样式）；快照 2026-09-20
- 规模：工作区 27 文件（22 组件 + `theme.css` + `design-spec` / `development` / 两个守卫测试脚本）；另 5 个登记文档已暂存；本轮收口新增本记录 + 3 处小修（守卫注释路径化、`todo.md` token 词表补全、`scanRules` 语句型 at-rule + 3 条单测）

## 1. 结论速览

| 项 | 结果 |
| --- | --- |
| G2（`--caomei-<comp>-*` 声明须 `:where()`） | 收敛 `button` / `message` / `badge` / `tag` / `toast` / `drawer` / `dialog` / `confirm-dialog` / `radio-group` 共 **9 组件**（含 §3.5 扩张面） |
| G1（`:where()` 档位块只声明 CSS 变量） | 收敛 `auto-complete` / `multi-select` / `message` / `select` / `select-button` 共 **5 组件** |
| G4（数字 `z-index` 收敛为 `--caomei-z-*`） | 新增 **9 个** token，收敛全部 **21 处**（浮层 10 + 局部 5 + 变量/回退 6） |
| D1（同规则内被后写覆盖的死声明） | 删除 **4 处** `box-shadow` 死声明（auto-complete / multi-select 各 2） |
| 守卫（`check:design` G1~G4） | 新增 4 类机检 + 27 条单测（24 条正反例 + 3 条语句型 at-rule）；预算均 0 |
| 等价性（计算样式） | 既有矩阵 **216 项 0 差异** + 本轮新增几何 **10 项 0 差异**，合计 **226 项逐属性一致** |
| Review Gate | 一轮 **Pass**（2 warning / 7 suggest）；W1 由本轮采样补齐，W2 见 §6 |
| 质量门 | `pnpm verify` **exit 0**（73 文件 / 1403 tests）；`pnpm test:e2e` **exit 0**（54 passed）；`pnpm lint:md:check` / `pnpm governance:check` 见 §7 |

## 2. 授权链与登记范围

1. **M2-1 盘点判定**：M2-1 在实施前枚举发现同一缺陷类远超记录 §3 的登记消费点，给出 A（全面收敛）/ B（只改登记面）两选项与推荐（见 [M2-1 §3.5 / §7](./2026-09-20-m2-1-component-quality-audit.md)）。
2. **用户裁定（2026-09-20）**：选 **A（全面收敛）**——G1 含 `select` / `select-button`；G2 含 `dialog` / `confirm-dialog` / `radio-group`；G4 覆盖全部 21 处，并把局部层叠 token（`--caomei-z-raise` / `-pinned` / `-pinned-header`）补登[设计规范 §2.5](../design-spec.md)。
3. **登记落点**：[todo.md](../../plan/todo.md) M2 执行范围的「范围扩张（2026-09-20 用户裁定『全面收敛』）」段 + M2-2 / M2-3 条目表；[governance index](./index.md) 与 [M2-1 记录 §7](./2026-09-20-m2-1-component-quality-audit.md) 同步用户裁定。

## 3. 改动清单（按治理面）

### 3.1 G2：`--caomei-<comp>-*` 声明 `:where()` 归零 + 基类 fallback

| 组件 | 改动要点 |
| --- | --- |
| `button.vue` | 删除基类 5 个 `--caomei-button-*` 预声明；`bg` / `fg` / `border` / `text` / `focus` 改为消费处 `var(--x, fallback)`；5 个 `--tone-*` 改 `:where()` |
| `message.vue` | 档位 `--sm/--md/--lg` 由直接声明 `padding` / `font-size` 改为声明变量 + 基类 fallback；5 个语气类改 `:where()`（同时属 G1） |
| `badge.vue` / `tag.vue` | 语气类改 `:where()` |
| `toast.vue` | 删除 viewport 的 `--caomei-toast-offset` / `-width` / `-z-index` 预声明，改消费处 fallback；`--caomei-toast-accent` 基类改 fallback；4 个语气类改 `:where()` |
| `drawer.vue` | 删除基类 `--caomei-drawer-size` / `--caomei-drawer-duration` 预声明；档位类改 `:where()`；动画 duration 改消费处 fallback |
| `dialog.vue` | 删除基类 `--caomei-dialog-width` 预声明 + 消费处 fallback；档位类改 `:where()` |
| `confirm-dialog.vue` | 删除基类 `--caomei-confirm-dialog-width` 预声明 + 消费处 fallback |
| `radio-group.vue` | `--invalid` 类改 `:where()` |

### 3.2 G1：`:where()` 档位块只声明 CSS 变量

| 组件 | 改动要点 |
| --- | --- |
| `auto-complete.vue` | `:where(--sm/--md/--lg)` 的 `min-height` / `padding` / `font-size` 改为 4 个变量，基类以 `var(--x, fallback)` 消费 |
| `multi-select.vue` | 同上（`min-height` / `padding-block` / `padding-inline` / `font-size`） |
| `message.vue` | 档位块只声明 `--caomei-message-padding-block/-inline` / `--caomei-message-font-size` |
| `select.vue` | `__field--sm/md/lg` 的 `font-size` 改为 `--caomei-select-field-font-size`，基类 fallback |
| `select-button.vue` | 档位块的 `height` / item `padding` / item `font-size` / item `min-height` 改为变量；媒体查询内档位块一并收敛 |

### 3.3 G4：`z-index` token 化

- `src/styles/theme.css`：新增 9 个 `--caomei-z-*`（§5）。
- 16 个组件文件由数字字面量 / 数字回退改为 `var(--caomei-z-*)`：`auto-complete` / `button-group` / `color-picker` / `confirm-dialog` / `data-table` / `date-picker` / `dialog` / `drawer` / `dropdown-menu-content` / `float-label` / `image` / `input-group` / `multi-select` / `popover-content` / `select` / `toast`。
- 浮层组件保留 `--caomei-<comp>-z-index` 覆盖钩子，未覆盖时回退 token；Image 内容取 `calc(... + 1)`。
- **新增覆盖钩子清单（本次 G1 / G2 引入，消费方迁移时按此覆盖）**：`message` → `--caomei-message-padding-block` / `-padding-inline` / `-font-size`；`select` → `--caomei-select-field-font-size`；`select-button` → `--caomei-select-button-height` / `--caomei-select-button-item-padding-inline` / `-font-size` / `-min-height`；`auto-complete` → `--caomei-auto-complete-min-height` / `-padding-block` / `-padding-inline` / `-font-size`；`multi-select` → 同型 4 个；`drawer` → `--caomei-drawer-size` / `-duration`；`dialog` / `confirm-dialog` → `--caomei-dialog-width` / `--caomei-confirm-dialog-width`；`button` → `--caomei-button-{bg,fg,border,text,focus}` 与 `--tone-*`；`badge` / `tag` / `toast` → `--caomei-<comp>-tone` / `-solid` / `-accent`。

### 3.4 D1：死声明清理

- `auto-complete.vue` 与 `multi-select.vue` 各删除 2 处被后写 `color-mix` 覆盖的 `box-shadow` token 声明（共 4 处）。

### 3.5 守卫（`scripts/governance/check-design.mjs` + 单测）

- 新增 4 类机检：G1 档位块属性、G2 scoped 变量声明、G3 禁用态 `opacity`（跳过 `@keyframes`）、G4 数字 `z-index`；预算均为 0。
- `check-design.test.mjs`：G1~G4 正反例 24 条（含元素修饰符 / 后代限定形态、结构型 `:where()` 不误报、全局 token 覆写放行）。
- 本轮 S2 收口：`scanRules` 增 `nextDelimiter`（跳过注释与字符串，按 `;` 优先切分语句型 at-rule，`@import` / `@charset` / `@layer` 无块形式不再吞掉后续规则）+ 3 条单测（`@import` 不吞规则 / 语句与带块 `@media` 混排 / 字符串内分号不作边界）。

### 3.6 文档

- [设计规范 §2.5](../design-spec.md)：层级 token 由「规划新增（待实现）」改为「已实现」表（9 token），并保留图标 / 焦点环等规划项。
- [开发规范 §7](../../standards/development.md)：新增 4 条规则（G2 `:where()` 声明、G1 档位块只声明变量、`--caomei-z-*` 层级、禁用态 `opacity`）。
- [todo.md](../../plan/todo.md)：M2-2 / M2-3 条目改写为扩张面 + 本轮补全 M2-3 的 9 个 token 清单；M2 执行范围补「范围扩张」段。
- [roadmap.md](../../plan/roadmap.md) / [backlog.md](../../plan/backlog.md) / [M2-1 记录 §7](./2026-09-20-m2-1-component-quality-audit.md) / [governance index](./index.md)：状态与用户裁定同步。

## 4. 等价证据（计算样式矩阵）

### 4.1 矩阵口径与采样点数

| 组 | 口径 | 点数 |
| --- | --- | --- |
| 尺寸矩阵 | auto-complete / multi-select / message / select / select-field / select-button / select-button-item × sm/md/lg | 21 |
| 小屏档位（媒体查询） | select-button / select-button-item × sm/md/lg（640px 视口） | 6 |
| 变体矩阵 | message 5 tone × 4 variant；badge / tag 各 5 tone × 3 variant | 50 |
| Toast | viewport z-index + 5 tone | 6 |
| Button（含强制 `:focus-visible`） | 3 variant × 6 tone × 3 size × 2（常态 / 聚焦） | 108 |
| Drawer / Dialog / ConfirmDialog | 各档 content + overlay | 4 / 4 / 2 |
| 局部层叠 | button-group / float-label / input-group / data-table th / td | 5 |
| radio-group（invalid 未选中项指示器） | `border-top-color` | 1 |
| 浮层面板 | select / multi-select / auto-complete / popover / dropdown / color-picker / date-picker / image overlay / image content | 9 |
| **小计（既有矩阵）** | | **216** |
| **本轮新增几何** | toast viewport 6 停靠位（width / max-height / top / left / right / bottom）+ drawer 四向（width / height / 四向偏移） | **10** |
| **合计** | | **226** |

### 4.2 抓取方式（含 worktree 基线）

> **证据产物位置与可复现性（审查 S2 登记）**：抓取脚本与快照（`capture.mjs` / `capture-geometry.mjs` / `diff.mjs` / `baseline.frozen.json` / `after.json` / `geometry-*.json` / Vite 夹具）全部位于 `.temp/capture/`（gitignored，不入库），基线 worktree 在 `/tmp/opencode/m2-baseline`。**故本记录的等价结论不可从仓库直接复算**，需按本节流程重建夹具；如需事后审计，建议后续把采样脚本 + `baseline.frozen.json` 入库（候选已登记 [Backlog §1.6](../../plan/backlog.md)）。

- 既有 216 项：改动前抓 `baseline.frozen.json`，改动后抓 `after.json`（同一 fixture，`http://127.0.0.1:4511/`）。
- 本轮新增 10 项：基线**不是** frozen 文件（该文件无对应键），故以 `git worktree add /tmp/opencode/m2-baseline HEAD` 取改动前源码，fixture 的 Vite alias 经 `CAOMEI_SRC` 指向 worktree 的 `src`、`node_modules` 软链复用主仓；「改动前」`geometry-before.json` 与「改动后」`geometry-after.json` 由**同一采样脚本**抓取（仅源码根不同，`source` 字段已留痕）。
- **负向对照**：临时把 worktree 的 drawer `--md` 档改为 `421px` 重抓，diff 命中 **8 处差异**（drawer 四向 width/height 与偏移），证明采样确实读取 worktree 源码；还原后重抓恢复 0 差异。

### 4.3 diff 结果

| 对比 | 结果 |
| --- | --- |
| `baseline.frozen.json` ↔ `after.json` | **0 差异：216 项逐属性一致**（`errors` 0） |
| `geometry-before.json` ↔ `geometry-after.json` | **0 差异：10 项逐属性一致**（`errors` 0） |
| 负向对照 `geometry-negctl.json` ↔ `geometry-after.json` | **8 处差异**（仅在人为改档时命中，已还原） |

## 5. 新增 token 清单与设计规范 §2.5 补登

| token | 值 | 消费点 |
| --- | --- | --- |
| `--caomei-z-raise` | `1` | button-group / float-label / input-group 焦点成员抬升 |
| `--caomei-z-pinned` | `2` | data-table 冻结列数据单元格 |
| `--caomei-z-pinned-header` | `3` | data-table 冻结列表头 |
| `--caomei-z-sticky` | `10` | 词表预留（暂无消费点） |
| `--caomei-z-overlay` | `1000` | dialog / confirm-dialog / drawer 遮罩 + select / multi-select / auto-complete 面板 |
| `--caomei-z-modal` | `1001` | dialog / confirm-dialog / drawer 内容 + color-picker 面板 |
| `--caomei-z-dropdown` | `1050` | dropdown-menu / popover / date-picker 面板 |
| `--caomei-z-tooltip` | `1060` | 词表预留（暂无消费点） |
| `--caomei-z-toast` | `1100` | toast 视口 + image 预览遮罩（内容 `calc(+1)`） |

[设计规范 §2.5](../design-spec.md) 已补登「层级 token（已实现）」表，并对齐 M2-1 §7 裁定的局部层叠 token；`check:design` 的 `z-index` 预算为 0。

## 6. 守卫规则面与残余风险（W2 登记）

1. **G1 生效面 = `:where()` 档位块**：规则面为「首个复合选择器以 `:where(.caomei-<comp>[__<el>]--<受控枚举修饰符>)` 开头」的规则。**非 `:where()` 的尺寸档位块不在 G1 / G2 拦截面内**——W2 登记为 **28 条 / 8 个组件（27 条单一尺寸档位块 + 1 条复合块 `.caomei-badge--dot.caomei-badge--lg`）**（input-number 6、textarea 3、tag 3、select 3、input 3、date-picker 3、button 3、badge 4 = 3 单一 + 1 复合），**当前是生效的**（声明 `height` / `padding` / `font-size` 等几何属性），属「档位类未 `:where()` 归一化」的规范偏差，**非可见缺陷**。复算口径：扫描 `src/components/**` 中命中 `\.caomei-<comp>[__<el>]--(sm|md|lg)` 且不含 `:where(` 的规则，得 **28 条**——含第 28 条 `.caomei-badge--dot.caomei-badge--lg`（结构修饰符 `--dot` 与尺寸 `--lg` 的复合块，声明 `width` / `height`），即 27 条单一尺寸档位块 + 1 条复合块。
2. **结构型 `:where()` 按设计排除**：`skeleton` / `tabs` / `data-table` 等 `:where()` 为低特异性布局覆盖（修饰符不属受控枚举），不纳入 G1。
3. **语义映射取舍**：`--caomei-z-overlay` 兼「遮罩」与「同值浮层面板（Select / MultiSelect / AutoComplete）」；`--caomei-z-modal` 兼「模态内容」与「ColorPicker 面板」；`--caomei-z-toast` 兼「Toast 视口」与「Image 预览遮罩」；`--caomei-z-sticky` / `--caomei-z-tooltip` 为无消费点预留。均为**等值改写**（逐项计算值等价）。
4. **覆盖路径收窄（有意取舍）**：G1 档位默认值的载体由 `:where()` 块（特异性 0）迁至 scoped 基类 `var(--x, fallback)`（特异性 0,2,0）。默认渲染零漂移；消费方若原以普通类覆盖档位几何，现需改走**变量钩子**（如 `--caomei-auto-complete-min-height`），与[开发规范 §7](../../standards/development.md) 的「消费处 `var(--x, fallback)`」一致。

## 7. 门禁与审计

| 命令 | exit / 结果 |
| --- | --- |
| `pnpm verify` | **exit 0**（lint / lint:css / lint:md / typecheck / typecheck:docs / **test 73 文件 1400 passed** / build / check:build / check:resolver / check:nuxt / docs:build / i18n-routing / governance:check） |
| `pnpm test:e2e` | **exit 0**（54 passed，21.2s） |
| `pnpm exec vitest run scripts/governance/check-design.test.mjs` | **exit 0**（27 passed） |
| `pnpm check:design` | **exit 0**（四类守卫 0 命中） |
| `pnpm lint:md:check` / `pnpm governance:check` | 见 §9 收口复跑 |

- **Review Gate**：一轮 **Pass**（2 warning / 7 suggest）。W1（toast viewport 几何与 drawer 非右向采样缺失）由本轮 §4 的 10 项几何采样补齐（0 差异）；W2 登记见 §6。

## 8. 未做事项

1. **§6 第 1 条的 28 条（27 单一 + 1 复合）非 `:where()` 尺寸档位块未收敛**：它们不在 G1 / G2 拦截面内且当前生效（规范偏差、非可见缺陷）；是否纳入后续批次**待用户裁定**。若纳入，需另行评估「档位几何改变量 + 基类 fallback」的等价面与 `input-number` / `textarea` 后代限定形态。
2. **交互 / 键盘面未做实测回归**：本次仅为声明方式与层级的等价重构，交互验收仍属 `@ui-validator` 与常驻 E2E 范畴（既有 54 条 E2E 已通过）。
3. `--caomei-z-sticky` / `--caomei-z-tooltip` 为预留 token，**无消费点**；后续接入 Sticky / Tooltip 时需回填消费关系。

## 9. 状态

2026-09-20：M2-2 / M2-3 **已产出**——G1 / G2 / G4 / D1 按用户裁定的扩张面落地，新增 G1~G4 守卫与语句型 at-rule 切分，等价矩阵 226 项 0 差异（含 worktree 基线负向对照），质量门全绿。W2 的 28 条（27 单一 + 1 复合）非 `:where()` 档位块未收敛（待用户裁定）；D1 同类残留 8 处 / 4 组件与 scanner 漏检路径已登记 Backlog；W1 已闭环。收口复跑：`pnpm lint:md:check` exit 0、`pnpm governance:check` exit 0。
