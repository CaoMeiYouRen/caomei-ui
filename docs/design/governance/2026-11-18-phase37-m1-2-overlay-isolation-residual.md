# Phase 37 M1-2 交付记录：浮层隔离残余补齐

> 创建时间：2026-11-18
> 范围与验收口径的唯一载体：[Phase 37 登记批次](./2026-11-18-phase37-registration.md) §2 M1-2。本记录承载判定实测证据、实现边界与验证结果。

## 1. 判定实测（`disableOutsidePointerEvents`）

**结论：修复前实测面板在该配置下仍会关闭 → 按登记口径已修复，并补「点背景后浮层仍开 → Tab 仍不入背景」断言。**

- 夹具：`#panel-popover-pointer-isolation`（页面级 Popover，`disable-outside-pointer-events` 开启）。
- 测量时点与复现步骤：2026-11-18，Chromium（Playwright desktop 档）；打开面板 → 读取 `getComputedStyle(document.body).pointerEvents` → 以 `page.mouse.click` 打到**视口内固定点** `(4, 4)` → 读事件目标与面板可见性。
- 修复前读数：
  - 面板展开中 `document.body` 的 `pointerEvents` 计算值 = `auto`（Reka 未锁背景）；
  - `pointerdown` 命中目标为 `HTML`（背景处于 `inert`，命中链路已越过背景子树）；
  - 事件序列 `pointerdown` → `mousedown` → `click`，目标均为 `HTML`；
  - 点击后面板不可见 → **面板被关闭**。
- 根因（读 `node_modules/reka-ui/dist/Popover/PopoverContentNonModal.js` 确认）：非模态分支把 `disable-outside-pointer-events` **硬编码为 `false`** 传给 `PopoverContentImpl`，该 prop 在非模态 Popover 上不生效；`DismissableLayer` 的文档级 `pointerdown` / `focusin` 监听照旧触发 `dismiss`。
- 同源负向对照（本轮新增用例）：同一坐标点击**未锁定**的 Popover 会关闭——证明点击路径真实生效，锁定用例不是「什么都没发生」。

## 2. 实现

- **Popover 锁定背景**：`popover-content.vue` 在 `disableOutsidePointerEvents` 为 `true` 时，对 `pointerDownOutside` / `focusOutside` 调用 `event.preventDefault()`，阻止 Reka 的 `dismiss` 路径。`Escape`、触发器切换、面板内关闭按钮不受影响；该开关只改变「外部点击 / 聚焦是否关闭」，打开态的背景隔离不依赖它（隔离由 `useOpenStateIsolation` 在 `data-state="open"` 时无条件提供）。
- **模态分支口径**：模态 Popover 在 Reka 侧已通过 body 级 `pointer-events: none` 锁背景；显式开启该配置时同样不因外部点击关闭（语义与文档统一），并补单测锁定。
- **文档与类型**：中英 Popover 页补「开启后外部点击 / 聚焦不关闭，关闭该配置恢复既有口径」，并在无障碍节与基础用法句补同口径括注；`types.ts` 的 prop 注释同步为「锁定背景」，写明上游在非模态下忽略该配置、由本组件补齐。
- **夹具**：新增三个页面级锚点——`#panel-dropdown-menu-isolation`、`#panel-popover-isolation`、`#panel-popover-pointer-isolation`；背景断言面取既有 `#wrap-toolbar`。
- **E2E**（`test/e2e/overlay-panel-isolation.e2e.ts`，三视口 × 六条用例）：
  - DropdownMenu / Popover 各两条：展开隔离（背景 `aria-hidden` + `inert`、面板与触发器为保留根不被隔离、程序化聚焦背景按钮被拦截）、关闭回退（Escape 后隐藏且无残留）、Tab 后焦点不回到背景；
  - 锁定背景 Popover：视口内固定点点击后仍展开 → Tab 后仍展开 → 焦点不入背景 → Escape 关闭无残留；
  - 同源负向对照：同一坐标点击会关闭未锁定背景的 Popover。
- **单测**（`popover.test.ts`）：开启时文档级 `pointerdown` 不关闭、未开启时照旧关闭、模态分支同样不关闭；用例统一带「派发前面板已展开」的前置断言。

## 3. 边界与口径

| 边界 | 处置 |
|:---|:---|
| DropdownMenu 模态性 | 本库 `CaomeiDropdownMenu` 默认 `modal: false`，夹具未开模态；本文件两个未锁定锚点（DropdownMenu / 非锁定 Popover）在 Tab 移出后关闭，锁定背景的 Popover 不关闭，隔离语义一致 |
| Tab 断言的判别力 | 面板经 Portal 挂在 `body` 末尾，其后没有可聚焦节点，「Tab 不回到背景」在隔离失效时也可能成立；**隔离的判别力由「背景按钮无法以 `focus()` 获得焦点」承担**（移除 `inert` 后必然失败），Tab 断言只锁方向 |
| Tab 与关闭通道的顺序 | **未开启锁定背景**的非模态浮层 Tab 移出即关闭（E2E 正对照），故「Escape 关闭」在 Tab 之前单独验证，避免面板已关闭导致断言恒真 |
| `focusOutside` 分支 | jsdom 下该分支不触发（实测未开启配置时 `focusin` 派发不关闭面板，无法构成对照），故不做 jsdom 假通过用例；该分支由 E2E 的 Tab 移出路径双向覆盖——未锁定时 Tab 后关闭（正对照）、锁定时 Tab 后仍展开 |
| 触发器等保留根 | `useOpenStateIsolation` 把面板与触发器都作为保留根，两者都不被隔离 |
| 既有行为 | 未开启该配置时行为不变：外部点击照旧关闭（单测负向对照 + E2E 对照用例双证） |
| 受检面登记 | 三个新锚点是简单容器，横向溢出由 `responsive.e2e.ts` 的**页面级**断言覆盖，故未登记到该文件的逐 section 清单；`overlay-panels.json` 的受检面是模态内锚定浮层，与页面级锚点无关，`check:overlay-z-index` 通过 |

## 4. 验证

- `pnpm exec playwright test test/e2e/overlay-panel-isolation.e2e.ts` → 全绿（三视口 × 六条用例）。
- `pnpm vitest run src/components/popover/popover.test.ts` → 全绿，新增用例逐条为：开启配置时外部点击不关闭、未开启时外部点击照旧关闭、模态 Popover 开启该配置时同样不因外部点击关闭（均带「派发前面板已展开」前置断言）。
- `pnpm lint:check` / `pnpm typecheck` / `pnpm lint:md:check` / `pnpm governance:check` / `pnpm check:planning-numbers` 全绿。
- `pnpm docs:build` 全绿（新记录与中英组件页进入构建的 dead-link 校验面）。
- 修复前后对照：修复前锁定用例在「点击背景后仍可见」处失败，修复后通过；对照用例证明同一坐标的点击路径有效。

## 5. 残余

- 只覆盖 Chromium 三视口；Firefox / WebKit 与 `pointerType: touch` 的延迟分支未验证。
- 程序化 `element.focus()` 由 `inert` 拦截（E2E 已断言被拦截）；`forceMount` 常驻面板与 Dialog 内嵌锁定 Popover 未单独覆盖。

## 6. Review Gate

**结论：Pass**（R2，`standard`，2026-11-18）。

- R1 分区 A（实现与测试，`standard`）：**Reject** —— 1 blocker（锁定背景用例缺「Tab 仍不入背景」断言）+ 4 warning（Tab 循环无判别力且面板首 Tab 即关闭 / DropdownMenu 模态性前提错误 / 点击坐标在视口外 / 模态分支行为未登记未测试）+ 5 suggest。
- R1 分区 B（文档与治理载体，`standard`）：**Reject** —— 1 blocker（单测计数「四条」与实物 3 条不符且无逐条清单）+ 5 warning（`focusOutside` 覆盖声明未落地 / 非模态 Tab 关闭的全称判断被锁定背景反例推翻 / 夹具注释模态性冲突 / 中英新句信息量不对等 / 既有绝对句未随新能力限定）+ 3 suggest。
- 修复：锁定用例补 Tab 断言；删除三次 Tab 循环并把 Escape 验证前移；模态性与点击坐标改为视口内固定点 + 同源负向对照；未锁定 Tab 用例补「Tab 后关闭」正对照；中英组件页新句与无障碍 / 基础用法补同口径括注；`types.ts` 注释同步；记录 §2 / §3 的因果归属与计数改为逐条清单。
- **R2（`standard`，复审）**：分区 A **Pass**（全部 blocker / warning 关闭；新增 1 warning：夹具注释仍写「模态菜单」→ 同批修正）；分区 B **Pass**（blocker 与上轮 warning 全部关闭；新增 3 warning 已同批处置——新引用的节名改为「组合件 API」/「Composite component API」、Tab 关闭的全称判断按锁定背景拆分、本条 Gate 台账补登分区 B 结论）。
- 未覆盖边界：Firefox / WebKit、`pointerType: touch` 延迟分支、`forceMount` 常驻面板、Dialog 内嵌锁定 Popover；断言可失败性由「同源未锁定路径实测 + 源码分支证据」推定，未做源码变异实测。
