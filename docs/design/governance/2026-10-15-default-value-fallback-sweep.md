# 「具名默认值压掉上层兜底」专项排查（M4-2 登记 follow-up）

> 创建时间：2026-10-15
> 来源：Phase 24 M4-2（Tooltip）与 M4-3（SubMenu）各踩中一次同类缺陷后登记的 follow-up——「其它浮层 / 包装组件是否存在同类『具名默认值压掉上层兜底』形态，需专项排查」。
> 性质：**只读排查**（本轮不改任何组件行为）。
> 授权：用户 2026-10-15 授权插队执行（不占阶段条目）。

## 1. 缺陷类定义

被包装的上游（Reka primitive 或本库自有 provider）按下式取值：

```
props.X ?? upstream.X
```

该式**只在 `props.X === undefined`（未传）时**才回落到上游配置。于是有两种把兜底压掉的写法：

1. **给根组件具名默认值**（如 `delayDuration: 700`）——「未传」不再是 `undefined`，上游 Provider 级配置被静默忽略；
2. **布尔型 prop 不声明 `default` 键**——Vue 的布尔转换会把「未传」解析为 `false`，效果同上（更隐蔽）。

## 2. 排查方法（可复算）

1. **权威上游清单**：`grep -o "[A-Za-z]*Provider" node_modules/reka-ui/dist/index.js | sort -u` 输出 8 行（组件型 5 + `inject*` 3）；取其中的**组件型 Provider**：`ConfigProvider` / `DrawerProvider` / `SelectProvider` / `ToastProvider` / `TooltipProvider`。
2. **本库覆盖面对账**：`grep -rln "TooltipProvider\|ToastProvider\|ConfigProvider" src/components --include=*.vue` → 恰 `tooltip-provider.vue` / `toast.vue` / `config-provider.vue` 三个文件。
3. **程序化交叉检查（核心判据）**：对 `src/components/**/*.vue` 逐个提取 ① `withDefaults(defineProps<…>(), { … })` 的**默认键**、② 兜底点（`props.X ??` 与 `:dir="X"` / `:locale="X"` 透传），取交集得**候选全量**。**过滤条件显式声明**：不预先排除「本库内部状态 / 数据来源」的兜底（`props.page ?? 1`、`props.totalRecords ?? data.length` 一类），一律先列入候选再人工复核——预排除会静默缩小受检面（本批即据此把候选数从 3 更正为 5）。
4. **语言兜底面单列**：`props.X ?? locale.value.Y` 是同一缺陷类中「上游」为内建 locale 的变体，单独反向检查这些 prop 是否被声明了**非 `undefined` 的具名默认**。
5. **多一跳转发面单列**：模板里的 `:locale="X"` 未必指向 Reka 根——也可能转发给**本库内部 panel**，再由 panel 转发给 Reka（`calendar.vue` → `calendar-panel.vue` → `CalendarRoot`）。这类不在「直接透传点」的检索式内，须另检「`withDefaults` 具名默认的 prop 名（camel 与 kebab 两种写法）在**模板任意位置**的出现」，**并覆盖整对象转发**（`v-bind="props"` / `v-bind="attrs"`）与经 computed 的间接转发——本轮实测整对象转发的模板仅 `calendar.vue` 一处（`v-bind="props"`），其余命中均由直接透传点覆盖。
6. **默认值声明形态清单**（**不是**「全部来源」的推理，而是逐形态核验）：本库的默认值只可能来自三处——`withDefaults` 默认键（89 个 `.vue`）、`defineModel` 默认值（22 处）、运行时对象式 `props`（仅 `_shared/panel-idref.ts` 一处，且**无** `default` 键）。三者均经人工复核：`defineModel` 的默认值只作用于本库自有双向绑定，均未指向 Reka 的 Provider / 上下文兜底 prop。
7. **候选逐条人工复核**：区分「真缺陷」与「`default: undefined` 的合规写法 / 文档化的独立 prop」。

复算命令：

```bash
grep -o "[A-Za-z]*Provider" node_modules/reka-ui/dist/index.js | sort -u
grep -rn "props\.[a-zA-Z]* ?? " src/components --include=*.vue --include=*.ts | grep -v "\.test\."
grep -rn ':dir="\|:locale="' src/components --include=*.vue | grep -v "\.test\."
grep -rn -A 16 "withDefaults" src/components/<候选文件>.vue
grep -rn "Context\.[a-zA-Z]*\.value" node_modules/reka-ui/dist/Tooltip/TooltipRoot.js
```

## 3. 结果

### 3.1 已修实例（历史，本批复核）

| 位置 | 形态 | 现状 |
|:---|:---|:---|
| `src/components/tooltip/tooltip.vue` | Reka `TooltipRoot` 的兜底五项（成员集合）：`delayDuration` / `disabled` / `disableHoverableContent` / `disableClosingTrigger` / `ignoreNonKeyboardFocus`。依据 `node_modules/reka-ui/dist/Tooltip/TooltipRoot.js:56-60` 的 `props.X ?? providerContext.X.value`——**该处源码行序为** `disableHoverableContent` / `disableClosingTrigger` / `disabled`（内部变量名 `disableTooltip`，prop 名同为 `disabled`）/ `delayDuration` / `ignoreNonKeyboardFocus`；**本库声明顺序为** `delayDuration` / `disabled` / `disableHoverableContent` / `disableClosingTrigger` / `ignoreNonKeyboardFocus`（见 `tooltip.vue` 与 `types.ts`） | **已修**（M4-2）：五项一律声明 `default: undefined`，并补 `disableClosingTrigger` 使 Provider 级兜底可达；注释写明两种压掉兜底的写法的成因 |

> 口径更正（R1 复审发现）：`skipDelayDuration` **不属此列**——它是 Reka `TooltipProvider` 侧的 prop（`grep -rln skipDelayDuration node_modules/reka-ui/dist` 命中 `Tooltip/TooltipProvider.{js,cjs}`、`NavigationMenu/NavigationMenuRoot.{js,cjs}` 与两处类型声明 `index4.d.ts` / `index4.d.cts`；**运行时代码中不含 `TooltipRoot`**），`TooltipRoot` 侧无该键，故它只在本库 Provider 组件上暴露，不在 Root 的兜底链内。

### 3.2 程序化交叉检查的 5 个候选——全部消解

| 候选 | 判定 | 依据 |
|:---|:---|:---|
| `menu/sub-menu.vue` 的 `open` | **假阳性** | 声明为 `open: undefined`（M4-3 刻意写法，注释即写明布尔型 prop 无 `default` 键会被 Vue 归一为 `false`），「未传」保持 `undefined` ⇒ 兜底链完好 |
| `tags-input/tags-input.vue` 的 `clearLabel` | **假阳性** | 声明为 `clearLabel: undefined`，故 `props.clearLabel ?? locale.value.tagsInput.clear` 的语言兜底可达 |
| `data-table/data-table.vue` 的 `page` | **假阳性** | 声明为 `page: undefined`，`props.page ?? 1` 的兜底可达 |
| `data-table/data-table.vue` 的 `totalRecords` | **假阳性** | 声明为 `totalRecords: undefined`，`props.totalRecords ?? props.data.length` 的兜底可达 |
| `date-picker/date-picker.vue` 的 `locale` | **非缺陷（文档化的独立 prop）** | 具名默认为 `defaultLocale` 并**有意**与注入的内建文案语言解耦：`docs/components/date-picker.md` 的「**已知差异（有意）**」段声明「`locale` **仅**控制日期 / 日历语言，与内建文案语言相互独立，需要一致时显式传入」，设计规范 §7 迁移条目的对应表述为「**已知行为差异**」（同款口径，措辞不同；「默认取组件库默认语言」一句出自 `docs/components/calendar.md`） |

### 3.3 多一跳转发的同形落点（§2 第 5 步的产出）

| 位置 | 形态 | 判定 |
|:---|:---|:---|
| `calendar/calendar.vue` 的 `locale` | 与 `date-picker.locale` **完全同形**，多一跳：`calendar.vue`（`locale: defaultLocale`）→ `calendar-panel.vue` 的 `:locale="locale"` → Reka `CalendarRoot` | **非缺陷（文档化的有意解耦）**：`docs/components/calendar.md` 与设计规范 §7 有同款口径；且 `calendar-panel.vue` 头注释已声明「默认值由两个公开入口各自声明，未传项依赖 Reka 默认（当前逐项一致，勿在此处重复声明避免漂移）」 |

### 3.4 语言兜底面（`props.X ?? locale.value.Y`）

反向检查全部此类 prop（41 处）是否声明了**非 `undefined` 的具名默认**——**零命中**：多选清除文案、数字输入增减文案、密码强度文案、表格空态 / 全选 / 展开分组等**均无具名默认值**，语言兜底链完好。

> 口径说明（R1 复审发现的自相矛盾）：`tags-input.clearLabel` 在 `withDefaults` 中**有**该键，但值为 `undefined`（与 §3.2 同条），按「非 `undefined` 具名默认」口径才为 0 命中；本行已按该口径书写。

### 3.5 `dir` 透传面

`dropdown-menu` / `slider` / `stepper` / `tabs` / `radio-group` / `toolbar` 六处 `:dir="dir"` 均**无具名默认值**，故使用方经 Reka `ConfigProvider` 注入的 `dir` 不会被本库压掉。

## 4. 结论

- 本缺陷类在本库**只有 Tooltip 一处历史实例，且已在 M4-2 修复并留下成因注释**；本轮程序化排查未发现新增落点。
- 防复发载体已有**三条**，互为补充，故不新增守卫（避免与既有载体重复）：
  1. **代码侧**：`tooltip.vue` 的注释写明两种压掉兜底的写法与成因；
  2. **测试侧**：M4-2 的「Provider 级配置对未传该项的后代生效」断言；
  3. **代码侧（既有，本批回链）**：`calendar-panel.vue` 头注释声明「默认值由两个公开入口各自声明、未传项依赖 Reka 默认、勿在 panel 重复声明以免漂移」——即本类的正向约束。

## 5. 边界与后续

1. **未包装 Reka `ConfigProvider`**：本库的 `CaomeiConfigProvider` 提供的是**自有**文案 / 语言，不转发 Reka 的 `dir` / `locale` / `useId` / `teleportTo` / `scrollBody` / `nonce`（后三项经 `Teleport` 等内部消费）。使用方需要这些能力时应自行在外层包裹 Reka 的 `ConfigProvider`（Reka 的 inject 沿祖先链查找，不受本库组件影响）。若日后要内建该转发，属新增能力，须先走范围评估。
2. **`ToastProvider` 不在本类内**：本库 `CaomeiToastProvider` 自身即 provider（默认值落在本库侧），单条提示的 `duration` 以 `undefined` 传入，由 Reka 回落到本库 provider 值（Reka 侧为 `typeof props.duration === 'number' ? props.duration : providerContext.duration.value`）⇒ 不存在「压掉上游」的形态。
3. **未覆盖**：`DrawerProvider` / `SelectProvider` 为 Reka 内部组合件（非面向使用方的 provider），未纳入排查面；本库自有注入链（`provideLocale` / `useToast` / `useConfirm`）未做同类「默认值压掉注入值」的交叉检查（它们是本库自有实现，取值口径由各自单测覆盖）；Reka 侧未逐组件穷举全部上下文兜底点，仅按本库实际转发形态定向检索——「本类仅 Tooltip 一处」因此是**基于本库转发形态的定向结论**，非全量证明。

## 6. Review Gate

- **audit-depth**：`quick`（本批零 `src/**` 行为改动，仅一份治理记录 + 索引条目）。
- **R1（`quick`）：`Reject`**（**1 blocker / 4 warning / 4 suggest**）。
  - **RG-B1（blocker，已关闭）**：§3.1 的五项枚举**错列 `skipDelayDuration`（属 Provider 侧）并漏列 `disabled`**；依据与修复见 §3.1 的「口径更正」注记。
  - **RG-W1（已关闭）**：「3 个候选」在该记录自身规则下不可复算（实算为 5）→ §2 第 3 步补**显式过滤条件**，§3.2 补 `data-table` 两行，候选数更正为 5。
  - **RG-W2（已关闭）**：排查面遗漏同形落点 `calendar.vue` → 新增 §2 第 5 步「多一跳转发面单列」与 §3.3 该行。
  - **RG-W3（已关闭）**：§2 第 6 步原为「即全部默认值来源」的推理（无效：`defineModel` 默认值 22 处、运行时对象式 props 一处）→ 改为**默认值声明形态清单 + 逐形态人工复核结论**。
  - **RG-W4（已关闭）**：§3.4「零命中」与 §3.2 自相矛盾 → 明确口径为「**非 `undefined` 的具名默认**」并加脚注。
  - **RG-S1~S4（已采纳）**：Provider 命令输出取组件型 5 项；出处措辞逐页分离；ConfigProvider 未转发项补全；防复发载体由两条更正为**三条**（回链 `calendar-panel.vue` 头注释）。
- **R2（`quick` delta，范围冻结）：`Pass`**（0 blocker；1 warning + 4 suggest）。
  - **RG-W2 残留（已关闭）**：§2 第 5 步的判据按字面复算得不到自身样例（`calendar.vue` 走 `v-bind="props"` 整对象转发）→ 判据已补「覆盖整对象转发与经 computed 的间接转发」，并写下实测「整对象转发仅一处」。
  - **RG-S1 / S2 / S3 / S4（已采纳）**：枚举补源码行序与 `disabled` 的变量名说明；`skipDelayDuration` 的命令输出补全；`date-picker` 引文改为逐页分离（原为两页拼接）；**本段即 RG 段落的补录**。
- **R2 复核要点**：候选 5 项经独立复算与记录一致；`defineModel` 22 处逐条抽查均未指向 Provider 兜底 prop；`v-bind="props"` 全仓仅 `calendar.vue` 一处；`withDefaults` 文件数 89、语言兜底 41 处、`:dir` 六处均与记录一致。
