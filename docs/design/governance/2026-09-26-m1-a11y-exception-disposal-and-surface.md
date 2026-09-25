# M1 a11y 例外处置与受检面扩面交付与验证记录

> 阶段：Phase 14（质量与一致性收口）→ M1 a11y 例外处置与受检面扩面。
> 范围依据：[下一阶段范围评估 §10](./2026-09-25-next-stage-scope-evaluation.md)（用户裁定 D1~D10）；条目登记：[待办事项](../../plan/todo.md) Phase 14 M1。
> 快照日期：2026-09-26。审计与提交状态以待办事项与 `.session/` 任务态为准。

## 1. 范围与目标

处置 a11y 审计装置（`test/a11y/`，见 [M4-1 基线清单](./2026-09-22-m4-1-a11y-baseline-inventory.md)）的既有例外，并按用户决策 D3③（**只纳入可稳定驱动者**）把面板内导出与 `DataTable` 折叠分组 toggle 纳入受检面。非目标：不改造 Reka primitive、不改组件视觉、不引入定向豁免机制、Toast 焦点哨兵例外按 D2③ 维持现状。

## 2. 交付概览（4 条原子条目）

| 条目 | 处置 | 提交 |
| :--- | :--- | :--- |
| Calendar 根容器 `aria-label` 落点 | 补显式 `role="group"`（可访问名不变），例外清单删除该条 | `7a77bd5` |
| MultiSelect 关闭态空 `aria-controls` | 面板 idref 改为**本库持有面板 id**（两态取值确定），AutoComplete 同根因同修；例外清单删除该条 | `f6f5341` |
| Stepper 悬空 `aria-describedby` | 关联目标在位计数 → **条件输出**（含同元素 `aria-labelledby` / 标题缺席） | `f95b715` |
| 受检面扩面 | 12 个面板内导出 + DataTable 折叠 toggle 全部入受检面（判定表见 §4） | `2e75e53` / `eaff97c` |

**例外清单收窄**：`test/a11y/exceptions.ts` 由 3 条 → **1 条**（仅剩 `CaomeiToastProvider` 的 `aria-hidden-focus` ×2，按 D2③ 维持现状）。删除条目均带等价新增断言（组件两态测试），「例外外零违规」与「登记例外必须仍命中且 count 不变」双向断言继续生效。

## 3. 根因与机制（逐条）

### 3.1 Calendar `aria-label` 落点
Reka `CalendarRoot`（`CalendarRoot.js:282`）把 `aria-label` 绑在 Primitive 根（默认 `as: 'div'` → `role=generic`），ARIA 禁止 generic 承载名称 → axe `aria-prohibited-attr`。**处置**：以 `role="group"` 补显式 role（`role` 与显式 `label` 同为可访问名契约值，压过透传 attrs；覆盖回非可命名 role 会重新引入违规）。**真实 Chromium AX 复验**（e2e 夹具 4501 + CDP `Accessibility.getFullAXTree`）：`{"role":"group","name":"内联日历","ignored":false}`——名称可解析且落在可命名 role 上。

### 3.2 面板 idref（MultiSelect / AutoComplete / DropdownMenu 触发器）
Reka `ComboboxInput` / `ComboboxTrigger` 无条件绑定 `"aria-controls": rootContext.contentId`，而 `contentId` 是**非响应式字符串**、由面板挂载时才 `||= useId()`——关闭态渲染 `aria-controls=""`，开启态取值随渲染时序漂移（实测「点击输入框」与「点击触发器」两条事件路径分别表现为已指向面板 id / 仍为空）。**处置**：本库生成面板 id 并**注册进浮层上下文**（`_shared/panel-idref.ts`，桥接组件落在 Combobox 根子树内完成 inject），两态显式绑定——关闭态省略、开启态指向面板 id；注册使内容侧 `id`、`aria-controls` 与 Reka 内部 `document.getElementById(contentId)` 查找三者同源。下拉触发器为同根因，改为**预注册面板 id**（其 `aria-controls` 由 Reka 内部绑定提供两态，见 §6 边界）。**真实 Chromium 两态复验**：多选字段关闭态双 `null` / 开启态 `input=trigger=panelId`；下拉触发器关闭态 `null` / 开启态 `triggerControls=panelId`。

### 3.3 Stepper 引用型属性条件输出
Reka `StepperTrigger`（`StepperTrigger.js:84-85`）无条件绑定 `aria-describedby`（描述）与 `aria-labelledby`（标题），两个 id 只在对应部件渲染时落 DOM——部件缺席即悬空引用。**处置**：步骤内在位计数（`stepper-presence.ts`，部件挂载 +1 / 卸载 -1）→ 目标缺席时省略属性、在场时保持 Reka 取值；显式非空取值优先。**真实 Chromium 三态复验**（经 Vite `/@fs/` 通道在真实浏览器挂载）：有标题有描述两引用均解析 / 无描述省略 `aria-describedby` / 无标题省略 `aria-labelledby`。

## 4. 可驱动性判定表（受检面扩面）

判定口径：能否在审计环境（axe × happy-dom）**稳定**把该导出带进审计 DOM。实测证据见 §5。

| 受检对象 | 驱动形态 | 判定 | 处置 |
| :--- | :--- | :--- | :--- |
| `CaomeiDropdownMenuContent` / `Group` / `Item` / `CheckboxItem` / `RadioGroup` / `RadioItem` / `Label` / `Separator`（8） | 受控 `open`（`v-model:open` + ref） | **可稳定驱动**（展开后 500ms 实测稳定） | 入受检面（展开态单元，不渲染触发器，见 §6.2） |
| `CaomeiPopoverContent` / `Arrow` / `Close`（3） | 受控 `open` 在 happy-dom 下**初始化即自关闭**（点击触发器亦打不开）；改用公开属性 `force-mount` | **可稳定渲染**（面板内容进入 axe 作用域：关闭态 P=8 → P=15） | 入受检面（`force-mount` 形态；差异边界见 §6.3） |
| `CaomeiSelectGroup` | Select 面板在 happy-dom 下无法稳定展开（无 `force-mount` 透传）；组件可独立稳定渲染 | **可稳定渲染**（独立形态 V=0 I=0 P=11） | 入受检面（独立形态） |
| `DataTable` 折叠分组 toggle | props 直接可达（`row-group-mode="subheader"` + `group-rows-by` + `expandable-row-groups`） | **可稳定驱动** | 入受检面（夹具 `requiredSelectors` 断言） |

**不可稳定驱动项**：无（`INTERACTION_ONLY_EXPORTS` 清空，组语义保留为「不可稳定驱动、维持登记 + 触发点」）。受检面差集（对外导出 **80** 个 = 2026-09-22 基线 79 + 2026-09-23 `TagsInput` 增量 1 → 四组穷尽登记 51 夹具 + 28 组合覆盖 + 0 不可驱动 + 1 不渲染自有 DOM）由 `a11y.test.ts` 对 `caomeiComponents` 机检 + 反向校验兜底；新增受检项以 `requiredSelectors` 断言「确实进入审计 DOM」。

## 5. 验证与证据

- **审计装置**：`pnpm test:a11y` 58 例全绿。新受检单元审计结果：`CaomeiDropdownMenuContent V=0 I=0 P=18`、`CaomeiPopoverContent V=0 I=0 P=15`、`CaomeiSelectGroup V=0 I=0 P=11`、`CaomeiDataTable V=0 I=0 P=20`（含折叠 toggle）。
- **真实 Chromium 复验**（一次性探针 `.temp/`，按 M4-1 §4 先例）：Calendar AX 树、多选字段两态、下拉触发器两态、Stepper 三态——全部符合契约（实测值内联于 §3）。
- **axe 判定边界实证**（最小复现）：「`aria-haspopup` + `aria-controls`」**恒判 needsReview**（`controlsWithinPopup`「Unable to determine if aria-controls referenced ID exists ... while using aria-haspopup」）——haspopup + 有效值仍命中、无 haspopup + 空值不命中，与取值正确与否无关。
- **质量门**：`pnpm lint:check` / `pnpm typecheck` 全绿；定向测试 215 例全绿（multi-select / auto-complete / stepper / select / dropdown-menu / a11y）；`pnpm test:a11y` 连续复跑稳定。
- **Review Gate**：4 条原子条目各 1 轮 **Pass**（0 blocker）。M1-1 3 suggest（措辞 / role 契约留痕 / 记录同步）同批收口；M1-2 3 suggest（空值语义 / 注册回写 / 断言收紧）同批收口；M1-3 1 warning + 3 suggest（SSR 取舍以冒烟断言锁定 / 空值语义 / 动态断言 / 共享形态下沉备忘）同批收口；M1-4 1 warning + 2 suggest（不可达接线清理 / 注释精度 / force-mount 边界登记）同批收口。审计用时：M1-1 实测约 8 分 13 秒（发起时间戳事后计算），其余三条目未逐一回填实测值、目测均在 10 分钟时间盒内。

## 6. 边界与已知取舍

1. **SSR 取舍（Stepper）**：在位计数在挂载期登记，SSR 直出 HTML 不带 `aria-describedby` / `aria-labelledby`（含描述步骤亦然），关联水合后建立。服务端与客户端首帧一致（均省略）故无 hydration mismatch；描述内容在触发器内可读。已以 SSR 冒烟断言锁定该行为（`stepper.test.ts`）。
2. **`haspopup + aria-controls` 不在 axe 覆盖内**（工具固有边界，见 §5 实证）：展开态菜单单元不渲染触发器（触发器由关闭态夹具 + 组件两态单测覆盖），避免把工具边界登记为组件例外。
3. **Popover `force-mount` 与真实展开态的差异**：`data-state=closed`、无开合焦点行为、定位样式由 Popper 决定；受检覆盖的是**面板内容**的 a11y 结构，不等价于展开态全量行为。
4. **下拉触发器的「显式非空取值优先」不可达**：Reka `DropdownMenuTrigger` 内部绑定经 `Slot` 合并（子节点胜）遮蔽 fallthrough，两态实际由面板 id 预注册 + Reka 自身条件绑定达成；该契约仅适用于无内部绑定的接线点（多选 / 自动完成字段）。
5. **同类悬空引用（已登记、未修）**：① `CaomeiDropdownMenuGroup` / `CaomeiDropdownMenuRadioGroup` 无内嵌 `CaomeiDropdownMenuLabel` 时 `aria-labelledby` 悬空（需 slot 形态在位检测，拟将 Stepper 机制下沉 `_shared/`）；② `CaomeiAccordion` 折叠触发器关闭态 `aria-controls=""`、展开后收起时悬空（Reka `Collapsible` 同类时序，需独立设计）。触发点：受检面扩面到相关形态时一并处置。见 [Backlog](../../plan/backlog.md)。
6. **共享机制形态**：`stepper-presence.ts` 目前为组合件内部共享状态；若 §6.5① 落地需下沉 `src/components/_shared/` 与 `use-label-attrs` 同层归口。

## 7. 复现方法

```text
pnpm test:a11y                 # 受检面守卫 + 逐组件审计（打印违规 / 待复核 / 通过项计数）
npx vitest run test/a11y       # 同上（定向）
```

真实浏览器复验（§3 各条）：起 `test/e2e/fixtures`（端口 4501）后运行 `.temp/` 下一次性探针（不入库）；Calendar 用 CDP `Accessibility.getFullAXTree`，其余读 DOM 属性两态。探针口径可按 §3 的实测值复算。
