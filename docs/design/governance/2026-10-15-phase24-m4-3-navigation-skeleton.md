# Phase 24 M4-3：导航骨架（Menu / SubMenu / MenuItem + Breadcrumb / BreadcrumbItem）

> 创建时间：2026-10-15
> 阶段条目：Phase 24 M4-3（主线 M4 组件缺口补齐）
> 范围依据：[Phase 24 范围扩展评估](./2026-10-13-phase24-scope-extension-evaluation.md) §10.1 **D2**（P0 + P1 四项）与 §10.2 登记；P1① 依据 = 两仓以上共识 + 结构性（`rss-impact-web` 与 `timing-push-admin` 各有 `el-menu` / `el-submenu` 与 `el-breadcrumb` 用量，前者另有自建 `Breadcrumb.vue`）。
> 边界声明：**零新增依赖**（Menu 子菜单展开复用既有 Reka `Collapsible` primitive；列表 / 面包屑为自建结构）；**零破坏性变更**。

## 1. 结论摘要

| 面 | 结论 |
|:---|:---|
| 组件与 API | `CaomeiMenu` / `CaomeiMenuItem` / `CaomeiSubMenu` + `CaomeiBreadcrumb` / `CaomeiBreadcrumbItem`（§2） |
| 语义取向 | **WAI-ARIA disclosure 导航**（`nav` + `ul[role=list]` + 就地展开子菜单），**不采用** `menu` / `menubar` 角色（§3.1） |
| 键盘契约 | 方向键序列 + `Home` / `End` / `Escape` + 纵向 `ArrowRight` / `ArrowLeft` 开合（§3.2） |
| `aria-current` | `CaomeiMenuItem.current` / `CaomeiBreadcrumbItem.current` → `aria-current="page"`（支持任意取值） |
| 注册面 | §11 / §5 / §7 迁移映射（两条）/ 中英侧栏 / 中英总览页 / Nuxt 与包导出 + `CollapsibleTrigger` 映射（§4） |
| 验证与判别力 | 单测 + a11y 夹具 + **真实 Chromium 键盘/折叠 E2E**（§5） |

## 2. 组件与 API

| 组件 | 关键属性 | 说明 |
|:---|:---|:---|
| `CaomeiMenu` | `orientation`（`vertical` 默认 / `horizontal`）、`label`、`as`（默认 `nav`） | 导航容器；`label` 映射 `aria-label`，**不内建文案** |
| `CaomeiMenuItem` | `href`、`disabled`、`current` | 有 `href` 渲染链接、否则按钮；`current` → `aria-current`（`true` 归一为 `page`） |
| `CaomeiSubMenu` | `label`、`v-model:open`、`default-open`、`disabled` | substance：`Collapsible` 承载展开 / 收起与 `aria-expanded` / `aria-controls` |
| `CaomeiBreadcrumb` | `label`、`separator`（默认 `/`） | `nav` + `ol`；分隔符为 `aria-hidden` 装饰元素 |
| `CaomeiBreadcrumbItem` | `href`、`current` | 有 `href` 渲染链接、否则纯文本（末级当前页） |

- **`SubMenu` 的开合状态在包装层显式合成**：`props.open ?? internalOpen`（`internalOpen` 以 `defaultOpen` 初始化）。理由见 §3.3。
- **与 `CaomeiDropdownMenu` 的分工**（组件页有对照表）：Menu = 导航（常驻列表 / 就地展开 / 无浮层档位）；DropdownMenu = 动作（触发器 + 浮层 / `--caomei-z-dropdown`）。

## 3. 实现要点

1. **语义取向（有意，非角色套用）**：采用 WAI-ARIA **disclosure 导航**模式——`nav[aria-label]` + `ul[role="list"]`（`list-style: none` 会移除 Safari 列表语义，故显式声明）+ 触发器 `aria-expanded` / `aria-controls`。**不采用** `role="menu"` / `"menubar"`：该角色描述的是「应用动作菜单」，用于导航链接会误导读屏器（这也是与 PrimeVue `Menubar` 的角色差异，已在 §7 与组件页显式登记）。
2. **键盘契约（容器统一接管）**：`ArrowUp` / `ArrowDown`（纵向）与 `ArrowLeft` / `ArrowRight`（横向）在「可聚焦目标」间移动（**不循环**，到端点即停）；`Home` / `End` 跳首末；纵向 `ArrowRight` 展开并在**面板挂载后的下一帧**把焦点移入首项（`Presence` 挂载可能晚一帧，故按帧重试）；纵向 `ArrowLeft` / `Escape` 收起并把焦点交回触发器；`Enter` / `Space` 由原生控件语义承担。收起面板由 Presence **卸载**，其子项天然脱离键盘序列与可访问树——这一「无需额外可见性过滤」的简化已写入实现注释。
3. **开合状态合成（含两处默认值陷阱）**：`SubMenu` 的 `open` 为显式 prop + `update:open` 事件，`props.open ?? internalOpen`；`internalOpen` 以 `defaultOpen` 初始化。**不采用**「交上游非受控兜底」与「模型带具名默认值」两条路径：前者依赖 `props.open === undefined` 这一上游内部判定（行为不自明），后者会恒传 `false` 把 `defaultOpen` 静默压掉——与 M4-2 的 Tooltip 默认值缺陷**同源**（该族在两批各中一次，已在本批以显式合成形态规避）。
4. **列表结构合法性**：`CollapsibleRoot` 以 `as="li"` 渲染，面板为 `li > div > ul`，避免在 `ul` 下插入非 `li` 元素破坏列表语义（首版曾以 `div` 包裹 `li`，本批自查修正）。
5. **样式约束合规**：项外观对链接与按钮同构（复位 + 悬停 / 焦点 / 当前态）；`--caomei-menu-*` / `--caomei-breadcrumb-*` 只作为带回退值的覆盖钩子；无原始色值 / 无数字 `z-index`。

## 4. 注册面同步与守卫联动

| 面 | 载体 / 联动 |
|:---|:---|
| 组件分区单一事实源 | §11「导航与操作」追加 `Breadcrumb` / `Menu`（组内字母序：Accordion、Breadcrumb、DropdownMenu、Menu、Stepper、Tabs、Toolbar） |
| 组件设计清单 | §5 各追加一行（`Menu` / `Breadcrumb`，子件在说明列点名）；**行名只列已登记组件名**，避免子件名进入 §5 → `check:design-catalog` 的子部件允许名单**无需扩面** |
| 迁移映射单一事实源 | §7 追加 `> Menu 迁移映射` 与 `> Breadcrumb 迁移映射`（含角色差异与 Element Plus `el-menu` 差异指向） |
| 中英侧栏 / 总览页 | `docs/.vitepress/config.ts` 两处 sidebar + 中英 `components/index.md` |
| Nuxt / 包导出 | `src/nuxt/components.ts`（5 个导出）+ 根 barrel `src/index.ts` |
| **Reka 触发器映射** | `check-reka-trigger-usage` 的 `WRAPPED_REKA_TRIGGERS` 登记 `CollapsibleTrigger → menu/sub-menu.vue`（防其它组件直连 Reka 同名触发器） |
| 响应式受检清单 | `responsive.e2e.ts` 的 `CASE_SECTION_IDS` 追加 `menu-navigation`（无横向溢出断言覆盖新夹具段） |

## 5. 验证与判别力

- **单测**：`src/components/menu/menu.test.ts`（16 例）+ `src/components/breadcrumb/breadcrumb.test.ts`（8 例）—— 列表 / 导航语义、`aria-label` 缺省、项形态（链接 / 按钮）、`aria-current` 三态、禁用项不入序列、`aria-expanded` / `aria-controls`、`default-open`、受控 `update:open`、`disabled` 不展开、方向键 / Home / End（顶层）、分隔符（首项不渲染 / 可定制 / `aria-hidden`）。
- **a11y 夹具**：新增 `CaomeiMenu`（含 `CaomeiMenuItem` / `CaomeiSubMenu` 子件）与 `CaomeiBreadcrumb`（含 `CaomeiBreadcrumbItem`）两个单元，夹具预算随增量上调；`pnpm test:a11y` 通过（无新增例外）。
- **真实 Chromium E2E**：新增 `test/e2e/menu-navigation.e2e.ts`（**8 用例 × 3 project**）—— 列表语义与当前项、方向键 / Home / End 焦点序列（含端点不越界）、**折叠态子项不入序列**、`ArrowRight` 展开并把焦点移入首项、`ArrowLeft` / `Escape` 收起并交回焦点、展开后继续遍历、**面包屑首项分隔符隐藏 / 其余可见 / 末级 `aria-current`**。
  - **为什么必须真实浏览器**：面板挂载 / 卸载由 `Presence` + rAF 驱动，happy-dom 下内容不渲染（实测确认），故「展开入面板 / 收起回触发器 / 折叠态不入序列」三条契约只在真实 Chromium 可判定；单测只保留可稳定驱动的部分（触发器属性与顶层焦点序列），该分工已写入 spec 文件头。
  - **焦点搬移的竞态处置**：断言改用 `expect.poll`（面板挂载晚一帧），避免单次读数偶发失败。
- **门禁**：`check:design` / `check:overlay-z-index` / `check:class-prefix` / `check:reka-trigger-usage` / `check:design-catalog` / `check:components-overview` / `check:migration-consistency` / `docs:check` 全绿；`pnpm verify` exit 0；`pnpm test:e2e` 全绿（含新增 spec）。

## 6. 载体同步

1. **新增载体**：`src/components/menu/**`、`src/components/breadcrumb/**`、中英组件页（`menu.md` / `breadcrumb.md`）、中英示例（`menu/{basic,orientation}.vue` / `breadcrumb/{basic,separator}.vue`）、`test/e2e/menu-navigation.e2e.ts`、本记录。
2. **修改载体**：§4 表列各面 + `test/a11y/fixtures.ts` + `test/e2e/fixtures/app.vue`（新增 `#menu-navigation` 段）+ `test/e2e/responsive.e2e.ts`。
3. **自查修正（首版 → 终版）**：① `CollapsibleRoot` 由 `div` 包裹 `li` 改为 `as="li"`（列表语义）；② `defaultOpen` 因模型默认值失效 → 改为显式状态合成；③ 焦点移入面板由单帧 `nextTick` 改为按帧重试（实测面板晚一帧挂载）。
4. **未改**：`docs/.vitepress/showcase-registry.json`（画廊为策展子集，未登记本批组件）；`docs/plan/roadmap.md` §1 现状句（阶段收口统一重写）。

## 7. 质量门

- `pnpm verify` **exit 0**（含 lint / lint:css / lint:md / typecheck / typecheck:docs / test / build / check:build / check:resolver / check:nuxt / docs:build / governance:check）。
- `pnpm test:e2e` 全绿；`pnpm test:a11y` 通过。

## 8. 边界（显式声明）

1. **不提供「整栏折叠为图标」**（Element Plus `collapse`）：本组件的「折叠」指子菜单展开态；整栏收起属使用方形态编排。
2. **不提供 `unique-opened`**（同级同时只展开一个）：多个 `SubMenu` 可同时展开；需要互斥时由使用方经 `v-model:open` 组合表达。
3. **不提供内建路由跳转**（Element `router` / `route`）：用 `href` 或自行组合 `RouterLink`。
4. **不提供分隔符插槽**（面包屑）：分隔符经 `separator` prop 定制（元素级自定义可经 CSS 覆盖）。
5. **不接管方向键的「循环」**：到端点即停（可预测优先；需要循环时使用方可在外层拦截并重定向焦点）。
6. **组件不内建文案**（`label` 未传则不渲染 `aria-label`）：未引入 locale 命名空间——本批组件只渲染使用方内容，无可内建文案；同一页面多个导航区时需逐区提供可访问名。
7. **子菜单为单层展开容器**：多层嵌套需逐层声明 `SubMenu`（与 PrimeVue `TieredMenu` 的差异见 §7）。
8. **`SubMenu` 的 `defaultOpen` 与受控 `open` 的优先级**：`open` 已接管时 `defaultOpen` 不生效（后者只作未受控初值）。

## 9. Review Gate

- **audit-depth**：两轮均 `standard`（新增组件族 + 门禁映射（配置类）+ 测试装置与文档同步）。单分区（同一交付面）。
- **R1（`standard`）：`Reject`**（**2 blocker / 1 warning / 4 suggest**）。审计方读码 + 盒外只读探针取证。
  - **RG-B1（blocker，已关闭）**：面包屑分隔符的「setup 期序号登记」在**动态项集**下与 DOM 位置脱钩——`v-for` + `:key` 换键 / 删首项后，新首项拿到 `index > 0` 而渲染出**前置分隔符**（实测 3 项得 3 个分隔符、首项前有 `/`）。风险：面包屑最常见用法即「布局层常驻 + 响应式数组驱动」，且现有单测与 E2E 均未覆盖该形态。→ **采纳修复方向**：**移除序号登记**，改为「每项各渲染一个 `aria-hidden` 分隔符装饰元素 + 首项由 **CSS 按渲染位置** `:first-child` 隐藏」；**约束载体** = 单测「动态项集（换键 / 删首项）下分隔符数量与位置一一对应」+ E2E「首项隐藏 / 其余可见」。
  - **RG-B2（blocker，已关闭）**：`focusableTargets()` 只排除 `aria-disabled`，而 `CaomeiSubMenu` 的禁用触发器是**原生 `disabled`**（Reka 只输出 `disabled` / `data-disabled`）⇒ 原生禁用元素 `.focus()` 为 no-op，键盘序列在**中段禁用子菜单**处静默堵死，与其 JSDoc「不进入键盘序列」相反。→ **采纳**：过滤条件同时排除两种禁用形态；**约束载体** = 单测「中段禁用的子菜单不阻塞键盘序列（原生 disabled 形态）」（审计方独立判该载体**足够**，E2E 无需增设禁用项）。
  - **RG-W1（warning，已关闭）**：治理记录单测计数与实物差 1（7 → 8 / 23 → 24）。
  - **RG-S1 ~ S4（已关闭）**：`CollapsibleTrigger` 映射条目补「内部规范消费者（非对外包装）」注释；中英组件页补「收起以焦点位于面板内为前提」；`Home` / `End` 空序列不再 `preventDefault`；单测注释根因改写（`aria-controls` 首帧空串的成因是「触发器首帧早于内容 setup」）。
  - **附带（已落实）**：E2E 的当前页选择器由 `#menu-navigation [aria-current="page"]` 收窄为 `.caomei-menu [aria-current="page"]`（新增面包屑段后二者都含当前页）。
- **R2（`standard`，仅审 R1 修复点）：`Pass`**（**0 blocker / 1 warning / 1 suggest**，两条均已同批收口）。审计方独立复跑：`vitest run src/components/{menu,breadcrumb}` **26 passed**、`playwright test test/e2e/menu-navigation.e2e.ts --list` → **24 tests** 且全量 **24 passed**（含面包屑场景，以真实 scoped CSS 判定首项分隔符 `display:none`）；并以 happy-dom 定点实证原生禁用元素 `.focus()` no-op（佐证 RG-B2 载体判别力）；逐条判 R1 的 2 blocker / 1 warning / 4 suggest **全部关闭**。
  - **RG2-W1（warning，复发类，已关闭）**：新增 E2E 用例后，两处治理载体的 E2E 计数变陈旧（`7 用例 × 3 project` → 实为 8 × 3）且 §5 描述清单遗漏面包屑场景 → 改正为 **8 用例 × 3 project** 并补入场景；审计方指出该类计数**不在现有门禁面内**（`check-governance-counts` 只对「文档引述常量 ↔ 代码常量」），故按 follow-up 记录（见下）。
  - **RG2-S1（suggest，已采纳）**：`breadcrumb.test.ts` 文件头注释残留「项序号」表述（该机制已随 RG-B1 移除）→ 改为「分隔符文本」。
- **实测用时**：R1 / R2 均未超各自时间盒（10 / 6 分钟；返回时点以宿主后续可观测时点为界）。
- **未覆盖边界（审计方声明）**：① 未独立复跑 `pnpm verify` / `pnpm test:e2e` / `pnpm test:a11y`（采信调用方读数）；② RG-B2 的「真实 Chromium 中焦点停在禁用项前」为合成结论（由序列含禁用项 + 原生 `disabled` 不可聚焦推导，未在浏览器夹具复现）；③ en 示例与 en 组件页只核结构对等与路径存在。
- **新范围 follow-up（登记，不阻断）**：治理载体中的「`N 用例 × M project`」类 E2E 计数**未被现有门禁对账**——是否纳入 `check-governance-counts`（与就近点名的 spec 做 `--list` 交叉核对）或写入 Review Gate 必查项，属独立批次决策，本批不自动进候选池。
