# M3-1 尺寸档位 `:where()` 归一化与计算样式等价验证

- 类型：阶段内原子条目交付记录（含真实浏览器等价证据）
- 触发：Phase 12 M3-1（28 条非 `:where()` 尺寸档位块归一化）
- 关联：[待办事项](../../plan/todo.md) Phase 12 ｜ [下一阶段范围评估](./2026-09-21-next-stage-scope-evaluation.md) §9 ｜ [M2-2 / M2-3 样式治理落地](./2026-09-20-m2-2-m2-3-style-governance-landing.md) ｜ [开发规范 §7](../../standards/development.md)

## 1. 结论

- **改动面**：8 个组件的 28 条非 `:where()` 尺寸档位块全部归一——基类改为 `var(--caomei-<comp>-<prop>, <默认回退>)` 消费，档位块改为 `:where(...)` 内只声明 CSS 变量；`check:design` 的 G1 / G2 在扩围后可阻断回流（本次未改规则面，属 M3-2）。
- **归零核验**：`rg -n "\.caomei-[a-z-]+(__[a-z-]+)?--(sm|md|lg)" -g '*.vue' src/components/ | rg -v ":where\("` → **0 命中**。
- **等价证据**：真实 Chromium 计算样式矩阵 **242 项逐属性 0 差异**，8 个改动组件全部落在对照面内，由两组构成：
  - 本次新增的 **`m31` 段 26 项**覆盖 **6 个组件**的尺寸几何——input、textarea（另含 `__control` 的 padding / font-size）、input-number（另含 `__button` 的 width / height）、date-picker、tag、badge，badge 另含 `dot` 的 md / lg；
  - **button 与 select 的尺寸几何由既有矩阵覆盖**——`button.*`（54 项）含 button 的 height / padding-left / font-size（`button-focus.*` 54 项为 focus-visible 的 outline 三属性，不承担几何），`size.select.*`（3 项）含 select 根的 height / padding / font-size。
- **质量门**：`pnpm verify` exit 0（1415 tests）；`pnpm test:e2e` exit 0（54 passed）；`pnpm lint:css:check` / `check:design` / `typecheck` 均通过。

## 2. 改动面

| 组件 | 归一化的档位块 | 基类消费落点 |
| --- | :-: | --- |
| button | 3（sm / md / lg） | `.caomei-button`（height / padding-x / font-size） |
| input | 3 | `.caomei-input`（height / padding-x / font-size） |
| textarea | 3 | `.caomei-textarea__control`（padding-y / padding-x / font-size）；档位变量声明在根类 `:where(.caomei-textarea--*)` |
| select | 3 | `.caomei-select`（height / font-size） |
| tag | 3 | `.caomei-tag`（height / padding-x / font-size） |
| badge | 4 | `.caomei-badge`（min-width / height / padding-x / font-size） |
| date-picker | 3 | `.caomei-date-picker`（height / padding-x / font-size） |
| input-number | 6（根 3 + `__button` 3） | 根 `.caomei-input-number`（height / font-size）+ `.caomei-input-number__button`（width，经档位变量驱动） |

**badge 复合选择器的特异性处理**：`.caomei-badge--dot.caomei-badge--lg`（结构修饰符 × 尺寸档位）改为 `.caomei-badge--dot:where(.caomei-badge--lg)`——`--dot` 保持常规特异性以确保仍胜过 `.caomei-badge--dot` 的 8px，尺寸部分经 `:where()` 归零；这是 28 条中唯一不能整体 `:where()` 的复合块。实测 `dot + lg` 仍为 `10px × 10px`（见 §4）。该复合块与 `.caomei-badge--dot` 同特异性、由**源序**决胜，顺序契约已写入源码注释；其可执行证据为计算样式矩阵的 `m31.badge-dot.*` 两项（happy-dom 单测无法证明层叠/源序结果，故不以其替代浏览器证据），M3-2 入库冻结基线后该契约变为可回归。

**默认值回退口径**：各组件 md 档位的几何值即基类 fallback（badge 的 md 字号为 `--caomei-font-size-sm`，与其它组件不同，已按原值保留）。新增的 `--caomei-<comp>-height / -padding-x / -font-size / -button-width` 与既有 `--caomei-<comp>-*` 钩子同形，属**新增覆盖能力**（消费方可在不改选择器特异性的前提下覆盖几何）。

## 3. 取证方法与可复现材料

夹具与脚本沿用 M2-2 的一次性采集装置（位于 `.temp/capture/`，**gitignored、不入库**；入库由 M3-2 承担）：

- **夹具**：`.temp/capture/app.vue` 新增「尺寸档位归一化矩阵」段（`m31:*` 标记），覆盖 input / textarea / input-number（`controls` prop）/ date-picker / tag / badge 的 sm / md / lg，以及 badge `dot` 的 md / lg。
- **采集**：`.temp/capture/capture.mjs` 新增对应读取（`SIZE_PROPS` + textarea `__control` 的 padding / font-size + input-number `__button` 的 width / height）。
- **基线对照**：`.temp/capture/vite.config.ts` 支持 `CAOMEI_SRC` 指向 HEAD worktree，从而在同一夹具下分别采集改动前 / 改动后的计算样式。

命令（按序）：

```text
git worktree add /tmp/opencode/m3-baseline HEAD --detach
ln -s <repo>/node_modules /tmp/opencode/m3-baseline/node_modules   # worktree 无依赖，需链接
CAOMEI_SRC=/tmp/opencode/m3-baseline/src node .temp/capture/capture.mjs .temp/capture/m3-baseline.json
node .temp/capture/capture.mjs .temp/capture/m3-after.json
node .temp/capture/diff.mjs .temp/capture/m3-baseline.json .temp/capture/m3-after.json
```

## 4. 结果

- `diff` 输出：**`[diff] 0 差异：242 项逐属性一致`**（exit 0）。
- M3-1 目标项 **26 项**（`m31.*`）全部在对照面内，含：
  - `m31.textarea-control.*`（padding-top / right / bottom / left / font-size）
  - `m31.input-number-button.*`（width / height，如 md = `36px × 34px`）
  - `m31.badge-dot.md`（`8px × 8px`）、`m31.badge-dot.lg`（`10px × 10px`，验证复合选择器特异性未被削弱）
- 既有 216 项**同批零漂移**，即本次归一化未影响其它消费点。其构成：`button.*` 54 + `button-focus.*` 54（含 button 的 height / padding-left / font-size 与 focus-visible outline——**button 档位几何的对照面**）、`variant.*` 55（message / badge / tag / toast 配色）、`size.*` 27（auto-complete / multi-select / message / select / select-field / select-button / select-button-item 各 3 项 = 21，另含 select-button 与 select-button-item 的小屏档位各 3 项 = 6；其中 `size.select.*` 为 **select 档位几何的对照面**）、`z.*` 15（浮层 z-index 与局部层叠）、`drawer.*` 4 / `dialog.*` 4 / `confirm.*` 2 / `radio-group-invalid.*` 1。

## 5. 边界与未覆盖

- 未做**像素级截图比对**（本条目验收口径为「计算样式逐项等价」，与 M2-2 同口径）；视觉面的回归由既有常驻 E2E（54 项，多视口）与上述几何 / 排版属性等价共同覆盖。
- M2-2 的 **10 项独立几何探针**（toast 视口 6 / drawer 四向 4）本次**未重跑**，故 242 项 = 本次新增 26 + 既有主矩阵 216，不含该 10 项（M2-2 的「226 项」= 216 + 10）。这些探针所属组件不在本次 8 个改动组件面内，其相关对照项已在 216 中零漂移。
- 采集依赖 `.temp/` 中的一次性装置，**当前无法从仓库直接复算**——该缺口即 M3-2 的交付范围（采样脚本 + 冻结基线入库）。
- 归一化使档位几何成为可覆盖变量，属能力新增而非行为变更：**受控枚举内**的默认路径逐值不变已由 242 项等价证明。
- **枚举外取值的边界变化（已知、预期降级）**：基类现带 md 兜底，运行时传入受控枚举外的 `size`（可绕过 TS 校验）由原先的「无几何声明（高度塌陷为内容高）」变为「md 几何」。该路径不在采样面内，记录于此以免被读作零变化。

## 6. 后续（登记范围）

- **M3-2**：`check:design` 的 G1 / G2 规则面按本次收敛面扩围 + 采集脚本与冻结基线入库（消除 §5 的复算缺口）。
- **M3-3**：重复声明（死声明）机检守卫与同类残留清理（残留面须重新取证）。
- **M3-4**：触发器 `unstyled` 遗留收敛。

## 7. 状态

2026-09-21：M3-1 实现完成，28 条归零 + 242 项计算样式等价通过；质量门全绿。**Review Gate 两轮**：R1 Reject（唯一 blocker 为本记录对等价矩阵覆盖构成的错述——把 button / select 也计入新增 `m31` 段；代码实现本身经审查方独立复算确认等价）→ 修正记述口径后 **R2 Pass（blocker 归零）**，R2 的非阻塞项（`size.*` 枚举漏 `select-button-item`、M2-2 独立几何探针的口径差异、两处措辞）已同批修正，按 [AI 协作规范 §3.4](../../standards/ai-collaboration.md) 记为「已修复未复审」。提交状态以 [待办事项](../../plan/todo.md) 与 `.session/` 任务态为准。
