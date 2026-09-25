# M4-1 可访问性既有例外清单建立（axe-core × happy-dom）

- 类型：阶段内原子条目交付记录（含组件级 a11y 清单与逐条判定依据）
- 触发：Phase 12 M4-1（引入 axe-core 做可访问性断言，先建立并登记既有例外清单）
- 关联：[待办事项](../../plan/todo.md) Phase 12 ｜ [测试规范 §1](../../standards/testing.md) ｜ [Backlog §1.6](../../plan/backlog.md) ｜ [标签优先级统一（真实浏览器可访问名）](./2026-09-17-label-priority-unification-ui-validation.md)

## 1. 结论

- **载体**：`axe-core`（devDependency，版本以 `pnpm-lock.yaml` 为准；本轮实测 4.13.0）+ Vitest 的 `happy-dom` 环境，测试集中在 `test/a11y/`：
  - `fixtures.ts`：**受检面声明**（47 个夹具 + 三组登记表）；
  - `rules.ts`：**规则面**（16 条禁用规则逐条带理由，其余 axe 默认规则全部生效）；
  - `audit.ts`：挂载 → `axe.run(document.body)` → 卸载的单次审计（含 DOM 清理）；
  - `a11y.test.ts`：受检面守卫（穷尽性 / 渲染完备性 / 规则面）+ 逐组件审计并打印清单。
- **命令**：`pnpm test:a11y`（定向，53 tests / 6 秒级）／`pnpm test`（全量，自动包含）。
- **受检面口径（可复验）**：受检单位是**组件族根组件**（`src/components/<dir>` 的对外主组件 + `CaomeiIcon`），共 **47 个夹具**。对外导出（`src/nuxt/components.ts` 的 `caomeiComponents`，79 个，已由 `src/nuxt/components.test.ts` 与源码导出做漂移校验）按四组穷尽登记、由单测机检：
  | 组 | 数量 | 含义 |
  | --- | :-: | --- |
  | `A11Y_FIXTURES`（夹具根组件） | 47 | 每族一个最小可用夹具，逐组件跑 axe |
  | `COVERED_BY_FIXTURE` | 19 | 由夹具组合渲染、非根组件的导出（**运行期断言**「该夹具确实渲染了它」） |
  | `INTERACTION_ONLY_EXPORTS` | 12 | 需交互展开面板才渲染（受检状态为默认关闭态，故不在本轮受检面） |
  | `EXCLUDED_COMPONENTS` | 1 | `CaomeiConfigProvider`：不渲染自有 DOM（仅 provide + 透传插槽） |
  > 47 + 19 + 12 + 1 = 79 = `caomeiComponents`；四组互不重复，缺一即单测失败。
>
> **2026-09-22 快照**：2026-09-26 M1 处置后受检面已扩面（展开态审计单元 +3、`INTERACTION_ONLY_EXPORTS` 清空、导出总数 80），现状见[例外处置与受检面扩面记录](./2026-09-26-m1-a11y-exception-disposal-and-surface.md) §4。
- **既有例外清单（3 条，全部已裁定，无静默豁免）**：
  - **1 处违规**：`CaomeiToastProvider` 的 `aria-hidden-focus`（serious）× 2 节点 —— Reka `Toast/FocusProxy` 的**焦点哨兵**，上游有意模式；
  - **2 处待复核（incomplete）**：`CaomeiMultiSelect` 的 `aria-valid-attr-value`（关闭态 `aria-controls=""`）、`CaomeiCalendar` 的 `aria-prohibited-attr`（`aria-label` 落在无显式 role 的容器上）。两条均已用**真实 Chromium** 复验并给出判定依据（§3）。
- **清单可复验**：组件集 / 规则集 / 快照日期（2026-09-22）随本记录与代码声明一一对应；`pnpm test:a11y` 重跑即复现。
- **审计中另行发现 1 项行为观察**（非本轮例外，见 §5）：无 `CaomeiStepperDescription` 的步骤会让 Reka 触发器留下悬空 `aria-describedby`；已登记 [Backlog](../../plan/backlog.md)。
- **质量门**：见 §6。审计与提交状态以 [待办事项](../../plan/todo.md) 与 `.session/` 任务态为准。

## 2. 受检面与规则面

### 2.1 受检面

| 维度 | 取值 |
| --- | --- |
| 受检单位 | 组件族根组件（`src/components/<dir>` 对外主组件 + `CaomeiIcon`） |
| 夹具数 | 47（**2026-09-22 快照**；预算锚点当时为 `A11Y_FIXTURE_BUDGET = 47`，由单测锁定，2026-09-26 扩面后为 51；每个夹具声明 `root` 并在运行期断言「确实渲染了根组件」） |
| 子部件覆盖 | 可无交互渲染的子部件并入所属族夹具（Toolbar / Stepper / Tabs / Accordion / RadioGroup 等，共 19 个导出，逐条登记 + 运行期断言） |
| 未纳入 | 12 个需交互展开面板的导出（逐条理由 + 触发点）与 1 个不渲染自有 DOM 的导出（理由），见表与 `fixtures.ts`（**2026-09-22 快照**；12 个面板导出已于 2026-09-26 全部入受检面） |
| 排除的取舍 | 不按「主观重要性」挑组件：本轮实测命中的两处例外分别落在 toast（焦点哨兵）与 calendar（`aria-label` 落点），说明违规与「主观重要性」不成正比；按主观清单取舍等于给受检面开静默豁免口子 |

**为什么 12 个面板内导出不进本轮**：它们只在浮层面板展开后渲染，属交互驱动面（时序敏感）。本轮受检状态统一为**默认（关闭）态**（`Dialog` / `Drawer` 例外：以 `:open="true"` 挂载以覆盖浮层打开态）。触发点见 §5。

### 2.2 规则面（16 条禁用，其余 axe 默认规则全部生效）

| 类别 | 禁用规则 | 理由 |
| --- | --- | --- |
| 页面级结构（6） | `region` / `landmark-one-main` / `page-has-heading-one` / `bypass` / `document-title` / `html-has-lang` | 审计对象是**组件**而非页面：组件不自带页面骨架（landmark / h1 / title / lang），这些规则在本受检面下恒不成立 |
| 依赖布局引擎（10） | `color-contrast` / `color-contrast-enhanced` / `target-size` / `focus-order-semantics` / `scrollable-region-focusable` / `css-orientation-lock` / `link-in-text-block` / `avoid-inline-spacing` / `frame-focusable-content` / `frame-tested` | 无布局引擎（JSDOM / happy-dom）下给不出有效结果：axe 的 JSDOM 支持说明点名 `color-contrast` 不可用，其维护者在 [axe-core#4021](https://github.com/dequelabs/axe-core/issues/4021) 列出更多「在 JSDOM 下无意义」的规则；其余条目按「依赖布局 / 媒体查询 / iframe」逐条自证 |

禁用清单是**唯一事实源**（`DISABLED_RULES`），由单测断言「逐条带理由且不重复」；规则 id 拼错不会静默失效（axe 对未声明规则 id 直接抛错）。新增 / 移除禁用规则必须同步本表。

## 3. 既有例外清单（3 条）

| 组件 | 规则 | 类型 | 命中 | 判定 | 依据 |
| --- | --- | --- | :-: | --- | --- |
| `CaomeiToastProvider` | `aria-hidden-focus` | violation（serious） | 2 节点 | **接受（上游有意模式）** | 命中节点为 `<span aria-hidden="true" tabindex="0" style="position: fixed; …clip-path: inset(50%)…">`（无 `data-v-*` / 无 `data-hidden`，非本库标记）；根因是 Reka `Toast/FocusProxy`（`node_modules/reka-ui/dist/Toast/FocusProxy.js`）渲染的 `VisuallyHidden` + `tabindex="0"` **焦点哨兵**——用于 toast 视口的键盘导航兜底，axe 无法区分「有意哨兵」与「误隐藏可聚焦内容」 |
| `CaomeiMultiSelect` | `aria-valid-attr-value` | incomplete | 1 节点 | **接受（关闭态空引用，开启态正确）** | 命中节点为 Reka `ComboboxTrigger`（其根类即 `.caomei-multi-select__icon`，清单输出按元素名显示为 `button`）。真实 Chromium 实测：关闭态 `aria-controls=""`、开启态 `aria-controls="reka-combobox-content-v-32"` 且与面板 `id` 逐字一致；`aria-expanded` / `aria-haspopup="listbox"` 两态均正确。按 IDREF 语义，空值解析为「无引用对象」、不构成错误绑定，开合语义不受影响。**处置（2026-09-26）**：已按 M1 修复并从例外清单删除该条（面板 idref 由本库持有面板 id，两态取值确定；见[例外处置与受检面扩面记录](./2026-09-26-m1-a11y-exception-disposal-and-surface.md) §3.2） |
| `CaomeiCalendar` | `aria-prohibited-attr` | incomplete | 1 节点 | **接受（Chromium 下名称可解析，规范上仍属偏差）** | 命中节点 `.caomei-calendar`（`role=generic` 容器带 `aria-label`）。真实 Chromium AX 树实测：`role=generic`、`name="日历, 2026年9月"`、`ignored=false`——名称可解析；但 ARIA 规范上 `generic` 不应承载名称，故记为**已裁定例外 + 修复候选**（补显式 role 或把标签落到具备 role 的元素）。**处置（2026-09-26）**：已补显式 `role="group"` 并从例外清单删除该条（可访问名不变；见[例外处置与受检面扩面记录](./2026-09-26-m1-a11y-exception-disposal-and-surface.md) §3.1） |

**修复候选（2026-09-26 处置后余留）**：Reka 焦点哨兵与 `aria-hidden-focus` 的规则面冲突（上游反馈或 `inert` 可行性，用户裁定 D2③ 维持现状）→ [Backlog](../../plan/backlog.md)。其余三条（② MultiSelect 空 `aria-controls`、③ Calendar `aria-label` 落点、④ Stepper 悬空 `aria-describedby`）已按 M1 修复交付，见[例外处置与受检面扩面记录](./2026-09-26-m1-a11y-exception-disposal-and-surface.md)。

## 4. 复现方法

```text
pnpm test:a11y        # 受检面守卫 + 逐组件审计并打印清单（违规 / 待复核 / 通过项计数）
pnpm test             # 全量单测（自动包含 a11y 审计）
```

清单输出形态（`--reporter=verbose` 下逐行打印，便于与本节对账）：

```text
[a11y] CaomeiToastProvider V=1 I=0 P=17
   V aria-hidden-focus (serious) x2 :: div[role="region"] > span:nth-child(1)
```

**真实浏览器复验（§3 两条例外的判定依据）**：复用仓库内 `test/capture/fixture` 夹具驱动 Chromium——读取 `.caomei-multi-select__icon` 的 `aria-controls`（关闭 / 开启两态）与 `.caomei-calendar` 的 CDP AX 节点（`Accessibility.getPartialAXTree`）。探针为一次性脚本（`.temp/`，不入库），按 [测试规范 §2.1](../../standards/testing.md) 的要求，**实测取值已内联于 §3**；探针可通过「起 `test/capture/fixture`（端口 4521）→ 读上述属性 / AX 节点」复算。

## 5. 边界与未覆盖

- **受检状态为默认（关闭）态**：`Dialog` / `Drawer` 以 `:open="true"` 挂载（覆盖浮层打开态），但 12 个面板内导出（`DropdownMenu*` / `PopoverContent` / `PopoverArrow` / `PopoverClose` / `SelectGroup`）**不在受检面**——需交互驱动、时序敏感。触发点：浮层展开态的 a11y 断言（Backlog 候选）。
- **依赖布局的规则全部禁用**（对比度 / 触摸目标 / 焦点顺序等）：这些面继续由 `@ui-validator` 的真实浏览器验证与既有 Backlog 项（对比度遗留项、实底前景 token 配对复核）承担，本装置不重复也不替代。
- **happy-dom 与真实浏览器的 DOM 差异**：本轮已实测一处（`MultiSelect` 开启态的 `aria-controls` 在 happy-dom 中为空、在 Chromium 中正确）——故凡涉及「引用型 ARIA 属性取值」的判定，均以真实 Chromium 复验为准（§3 两条例外即如此取证）。
- **`passes` 计数不等于覆盖充分**：47 个夹具中 `CaomeiAvatar` / `CaomeiBadge` / `CaomeiCard` / `CaomeiDataView` / `CaomeiIcon` / `CaomeiSkeleton` / `CaomeiTag` 等仅剩文档级基线（`aria-hidden-body`）——这些组件本身不含可判定的 ARIA 结构。**「覆盖是否充分」由穷尽性机检 + 渲染完备性断言 + 清单逐条对账承担，不由 `passes` 承担**。
- **审计中另行发现的行为观察（已登记 Backlog，未计入例外）**：步骤缺 `CaomeiStepperDescription` 时，Reka 触发器仍输出指向该 id 的 `aria-describedby` → 悬空引用（axe 判 `aria-valid-attr-value` incomplete）。文档形态的步骤（Title + Description）不触发；本轮夹具按文档形态编写，故不计入例外，另登记修复候选。**处置（2026-09-26）**：已按 M1 修为条件输出（无描述 / 无标题步骤省略对应引用型属性）。
- **保留的设计取舍（复审已确认理由成立）**：① `audit.ts` 每次审计后兜底清空 `document.body`——它是有意的跨夹具隔离（改为断言「组件自身已清理」会因 Reka portal 残留引入假失败，且该面属浮层生命周期而非 a11y 判定面）；② `A11yFixture.definition` 保持 `unknown` + 调用处 cast（非 `any` 逃逸）——替代方案是为 VTU 泛型做类型体操，收益低；泛型 SFC 的 props 推断由组件自身单测承担。
- **未做像素级截图比对**（本条目验收口径为「清单可复验 + 未裁定项不静默豁免」）。
- **门禁断言（例外外零违规）不在本条目**：本条目只产出清单与受检面守卫，断言与门禁接线由 M4-2 承担（避免清单未定就上断言造成噪声）。

## 6. 质量门

- `pnpm lint:check` / `pnpm typecheck` / `pnpm test:a11y`（53 tests）/ `pnpm test` / `pnpm verify`（exit 0）/ `pnpm lint:md:check` / `pnpm governance:check` / `pnpm docs:check` 见提交前实测记录；`axe-core` 新增为 devDependency（无运行时依赖变化）。
- 受检面自检：每个夹具都断言「渲染出了声明的根组件与子部件」，未登记 / 未渲染的导出会让单测失败（穷尽性对 `caomeiComponents` 机检）。
- 顺带修复（测试基建卫生）：`vitest.config.ts` 补 `.temp/**` 到 `exclude`——本轮一次性探针（`*.test.mjs`）曾被全量单测收录并致失败，该目录已由 ESLint 与 gitignore 忽略，测试发现面此前未对齐。
- 规模实测：`git diff --cached --numstat` = 11 文件 / **+576 −6**（另有 `pnpm-lock.yaml` +9 行为生成物，按 [规划规范 §5](../../standards/planning.md) 不计入）：装置 459 行（夹具 233 / 规则面 80 / 审计器 35 / 测试 111）+ 本记录 99 行 + 载体同步 18 行（`vitest.config.ts` 6 / 索引 1 / backlog 3 / todo 5 / `testing.md` 1 / `package.json` 2）。文件数超出 [规划规范 §5](../../standards/planning.md) 的 10 文件指引 1 个：本条目跨装置（4）/ 记录（1）/ 测试配置（1）/ 规划与规范载体（5）四类，任一类缺失都会让「清单可复验」或「口径收口」落空，拆分会产出不构成独立验收的碎片。

## 7. 状态

2026-09-22：M4-1 装置与清单产出完成（47 夹具 / 79 个对外导出穷尽登记 / 3 条例外逐条裁定 / 4 条修复候选入 Backlog）。**Review Gate（并发分区：A 装置 / B 文档收口）**——R1 两分区均 Reject（受检面声明与公开导出不一致、守卫不校验导出完备性）→ 修复（四组穷尽登记 + 运行期渲染断言 + 口径收口）→ **R2 Pass（blocker 归零）**；R2 的 2 warning（`fixtures.ts` 头注释旧口径、`COVERED_BY_FIXTURE.fixture` 无守卫）与 2 suggest（反向穷尽性断言、取舍说明落位）已同批修正，按 [AI 协作规范 §3.4](../../standards/ai-collaboration.md) 记为「已修复未复审」。审计与提交状态以 [待办事项](../../plan/todo.md) 与 `.session/` 任务态为准。
