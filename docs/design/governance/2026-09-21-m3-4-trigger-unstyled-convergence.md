# M3-4 触发器 `unstyled` 遗留收敛（date-picker / color-picker / split-button）

- 类型：阶段内原子条目交付记录（含真实浏览器触发结构等价证据）
- 触发：Phase 12 M3-4（Backlog 候选「触发器 `unstyled` 遗留收敛」）
- 关联：[待办事项](../../plan/todo.md) Phase 12 ｜ [下一阶段范围评估](./2026-09-21-next-stage-scope-evaluation.md) §9 ｜ [Popover 触发器](../../components/popover.md) ｜ [DropdownMenu 触发器](../../components/dropdown-menu.md) ｜ [开发规范 §7](../../standards/development.md)

## 1. 结论

- **改动面**：三处「直接使用 Reka primitive 触发器 + `as-child`」收敛为本库触发器组件——
  - `date-picker.vue`：`PopoverTrigger`（reka-ui）→ `CaomeiPopoverTrigger`（`as-child` + `unstyled`）
  - `color-picker.vue`：同上
  - `split-button.vue`：`DropdownMenuTrigger`（reka-ui）→ `CaomeiDropdownMenuTrigger`（`as-child` + `unstyled`，保留 `:disabled="disabled"` 透传）
- **收益（明确边界）**：① 三个组件不再直连 Reka 触发器，触发器行为变更可单点生效；② 库内改用**自己已文档化的公开用法**（`docs/components/popover.md` 与 `dropdown-menu.md` 均要求 `as-child` + `unstyled`），消除「文档要求用户这么做、库内自己不做」的内外不一致。**本收敛不新增 a11y 能力**——本库触发器目前是 Reka primitive 的薄包装（`inheritAttrs: false` + `$attrs` 透传 + `disabled` 映射 + `unstyled` 时不加外观类），不额外注入 aria / 事件。
- **等价证据**：真实 Chromium 触发结构 A/B **262 项逐属性 0 差异**（触发器属性快照 + 7 项计算样式，含**闭合 / 开合两态**），既有矩阵同批零漂移。
- **负向对照**：临时去掉 `color-picker` 的 `unstyled` → diff 报 **5 处差异**（内建类 `caomei-popover__trigger` 合并 + `color` / `font-size` 计算值漂移），证明探针对该回归灵敏、且 `unstyled` 在当前树确实生效。
- **质量门**：`pnpm verify` exit 0（1435 tests）；`pnpm test:e2e` exit 0（54 passed）；定向 3 组件 85 tests。

## 2. 改动面与依据

| 组件 | 改前 | 改后 | 说明 |
| --- | --- | --- | --- |
| date-picker | `PopoverTrigger as-child`（reka-ui 直连） | `CaomeiPopoverTrigger as-child unstyled` | 外观仍由自持 `<button class="caomei-date-picker">` 提供 |
| color-picker | `PopoverTrigger as-child` | `CaomeiPopoverTrigger as-child unstyled` | 外观仍由 `caomei-color-picker__trigger` 提供 |
| split-button | `DropdownMenuTrigger as-child :disabled` | `CaomeiDropdownMenuTrigger as-child unstyled :disabled` | 外观仍由 `CaomeiButton` 提供，避免与 ButtonGroup 拼接边框 / 圆角规则竞争 |

**`disabled` 传递链等价性（改前 / 改后逐值一致）**：date-picker 与 color-picker 改前**未**向触发器传 `disabled`（仅子 `<button>` 自带 `:disabled`），改后包装层默认 `false` → popover 包装映射为 `props.disabled || undefined` → Reka 收到「无 disabled」，与改前相同；split-button 改前 `:disabled="disabled"`、改后经包装层 `props.disabled` 透传同一布尔值。

**回归断言**：共新增 6 条——date-picker 1 条（`unstyled` 生效）、split-button 2 条（`unstyled` + 开合 `aria-expanded`）、color-picker 3 条（`unstyled` + 闭合 `aria-expanded=false` + 开合 `=true`）；date-picker 的开合接线由既有用例承担。`unstyled` 断言即「触发器 `classes()` 不含内建触发器外观类」。

## 3. 取证方法与可复现材料

夹具与采集脚本沿用 `.temp/capture/`（**gitignored、不入库**；入库由 M3-5 承担）：

- 夹具新增 3 个用例（`m34:date-picker` / `m34:color-picker` / `m34:split-button`）。
- 采集新增：触发器**属性快照**（`tag` + 除 `data-v-*` 外全部属性，序列化为单属性便于逐项比较）+ 7 项计算样式（height / padding-left / border-top-width / border-top-left-radius / background-color / color / font-size），并在采集末尾（**须在 toast 采样之后**，见 §5）追加**开合态**采样。

命令（按序）：

```text
git worktree add /tmp/opencode/m34-baseline HEAD --detach
ln -s <repo>/node_modules /tmp/opencode/m34-baseline/node_modules
CAOMEI_SRC=/tmp/opencode/m34-baseline/src node .temp/capture/capture.mjs .temp/capture/m34-baseline.json
node .temp/capture/capture.mjs .temp/capture/m34-after.json
node .temp/capture/diff.mjs .temp/capture/m34-baseline.json .temp/capture/m34-after.json
```

## 4. 结果

- `diff` 输出：**`[diff] 0 差异：262 项逐属性一致`**（0 错误）。
- 触发器属性快照（两轮相同，`data-v-*` 已过滤）：
  - 闭合态：`BUTTON aria-expanded="false" aria-haspopup="dialog" aria-label="日期" class="caomei-date-picker caomei-date-picker--md" data-state="closed" type="button"`（color-picker 结构同形，仅 `aria-label="颜色"` 与 Reka 生成的 `id="reka-popover-trigger-*"` 取值不同；split-button 为 `aria-haspopup="menu"` 且类名含 `caomei-button` 系列）
  - 开合态：追加 `aria-controls="reka-popover-content-*"`（split-button 为 `reka-dropdown-menu-content-*`）、`aria-expanded="true"`、`data-state="open"`
  - **三类触发器均不含** `caomei-popover__trigger` / `caomei-dropdown-menu__trigger`，即 `unstyled` 生效
- 负向对照（去掉 `unstyled`）：5 处差异，其中 3 处为属性快照（内建类合并）、2 处为计算样式（`color` / `font-size` 被内建触发器皮肤改写）。

## 5. 边界与未覆盖

- **探针时序约束**：开合态采样必须放在采集末尾——若插在采集前段，会推迟 toast 采样（toast 为瞬时元素，默认时长内自动消失），导致 toast 段超时并使 6 项 toast 采样缺失（本轮首次实现即命中该坑，已修正并复跑）。
- **首次对比的假差异**：属性快照最初未过滤 `data-v-*`，三处 scoped 哈希（跨构建必然变化）被报为差异；过滤后归零。快照过滤规则须在后续入库时保留。
- 未做像素级截图比对（本轮验收口径为「触发结构等价 + 零视觉回归」，由属性快照 + 计算样式两态等价承载）；未覆盖面板内部内容与键盘导航路径（由既有单测与常驻 E2E 承担）。
- 采集装置位于 `.temp/`（gitignored），**当前无法从仓库直接复算**——由 M3-5 入库消除。

## 6. 后续（登记范围）

- **M3-5**：采集脚本 + 冻结基线入库（含 m34 段与 `data-v-*` 过滤规则）。
- Backlog 候选（本轮新增）：① 两个薄包装触发器对 `disabled=false` 的归一化不一致（popover `props.disabled || undefined` vs dropdown `props.disabled` 直传），且 date-picker / color-picker 未向触发器透传 `disabled`（属改进、非本轮范围）；② 「直连 Reka 触发器」的机检守卫（存在本库包装时禁止直连）。

## 7. 状态

2026-09-21：M3-4 实现完成，三处触发器收敛 + 262 项结构等价通过；质量门全绿。审计与提交状态以 [待办事项](../../plan/todo.md) 与 `.session/` 任务态为准。
