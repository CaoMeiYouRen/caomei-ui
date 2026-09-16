# 长期任务

本文档登记**周期性治理任务**：动作会随开发推进反复发生、需要按固定节奏重复执行，而非一次性交付的候选。准入、编号与粒度规则见 [规划规范](../standards/planning.md)，本文档不重述。

> **定位**：本文档承载已认可方向、需按期重复执行的治理任务；与 [Backlog](./backlog.md) 的分工、准入与编号规则见 [规划规范](../standards/planning.md)。

## 1. 执行规则

制度定义与准入（方向认可、任务与批次、编号、触发义务、门槛纪律）见 [规划规范](../standards/planning.md)，本节只记录操作细则：

- **批次追加**：在已认可方向下，按任务的判定门槛直接把工作包登记为批次，无需重复走用户决策。
- **每轮范围自定**：一轮执行不要求清空任务；按「价值 × 风险 × 粒度」选取至少一个原子批次。
- **抽取复用受准则约束**：逻辑层抽取必须满足 [开发规范](../standards/development.md) 的「公共逻辑抽取与复用」小节。
- **未达门槛者不进入执行**：留在本表并标注缺口（待补取证 / 条件触发），不得为凑数纳入。

## 2. 任务台账

| 任务 | 判定门槛 | 触发时机 | 上次执行 | 状态 |
|------|----------|----------|----------|------|
| 代码复用治理 | 同一模式 ≥3 处且语义一致，且抽取后净收益为正 | 阶段收口前 / 发布前 | 2026-09-16（首轮） | 进行中 |
| 样式重复收敛 | 同一视觉效果在 ≥3 个组件重复，且已存在或可归纳为语义 token | 阶段收口前 / 发布前 | 未执行 | 待启动 |

### 2.1 代码复用治理

- **复用地**：组件间共享落 `src/components/_shared/`，对外公开能力落 `src/composables/`。
- **取证口径**（2026-09-16 快照，范围 `src/components`，执行时逐批复核）：
  - 标签属性转发：`rg -l "useLabelAttrs" src/components/*/*.vue | wc -l` → 12（整体透传 10 + `controlAttrs` 基座 2）。
  - 表单控件公共 props 契约：候选池 `rg -l 'size\?:|disabled\?:|invalid\?:|placeholder\?:' src/components/*/types.ts | wc -l` → 31 个 `types.ts`；首批取「四项字段齐备且含身份字段」的表单控件，复核 `rg -ln 'extends (FieldProps|FieldStateProps)' src/components/*/types.ts | wc -l` → 7（`password` 经 `Omit<InputProps, 'type'>` 间接继承，不计入）。
  - 聚焦控制：`rg -l 'useFocusControl' src/components/*/*.vue | wc -l` → 4。
  - ARIA 布尔假值：`rg -o ':aria-[a-z]+="[^"]*\|\| undefined"' src/components | wc -l` → 15。
  - locale 文本解析：`rg -o '\?\? locale\.value\.' src/components | wc -l` → 39。
- **描述收敛决策**（2026-09-16，首批）：公共 props 的 JSDoc 采用通用措辞（如「是否禁用」/ "Whether the control is disabled"）；组件特有约束不靠重复字段声明承载，改在组件 `types.ts` 的接口级注释保留（如 select-button 的 `role="group"` id 约束、select / multi-select / auto-complete 的 `id` / `name` 落点）。

| 批次 | 证据 | 规模 | 状态 |
|------|------|------|------|
| 标签属性转发（`label` 优先于透传 `aria-label`） | 12 个文件同构的 `forwardedAttrs`：整体透传 10 处 + `controlAttrs` 基座 2 处（checkbox / switch） | 12 文件 | 已交付 |
| 表单控件公共 props 契约（首批） | `size` / `disabled` / `invalid` / `placeholder` / `name` / `id` / `label` 内联重复，口径命令见上 | 7 文件 | 已交付 |
| 表单控件聚焦控制 | 4 个组件重复的 `focus` / `blur` 委托样板 | 4 文件 | 已交付 |
| 表单控件公共 props 契约（第二批） | `checkbox/types.ts`（size / disabled / invalid / name / id / label）、`radio-group/types.ts`（`RadioGroupProps` 同 6 字段，`RadioButtonProps` 另有 disabled / id / label）、`switch/types.ts`（disabled / name / id / label）；命令 `rg -n 'size\?:|disabled\?:|invalid\?:' src/components/{checkbox,radio-group,switch}/types.ts` | 3 文件 | 待执行（需逐组件核对特有描述与字段子集） |
| 标签属性转发（模板级 `:aria-label` 无条件覆盖） | 12 处模板级 `:aria-label="label"`（标签为空时渲染空属性，与已定契约反向） | 12 文件 | 待执行（含行为调整，需独立验收） |
| attrs 透传收敛 | 手写 `useAttrs()` 已收敛至 `stepper` / `slider` 2 处（二者语义不同，未达门槛） | 2 文件 | 未达门槛（不实施） |
| ARIA 布尔假值归一 | 15 处 `:aria-x="value \|\| undefined"`（规则已在开发规范单点定义，抽取后表达式变长） | 15 文件 | 未达门槛（净收益不为正） |
| locale 文本解析 | 39 处 `props.x ?? locale.value.ns.key`（props 名与路径逐处不同） | 17 文件 | 未达门槛（净收益不为正） |
| 选项列表渲染 | Select（`SelectItem`）1 份 + MultiSelect / AutoComplete（`ComboboxItem`）2 份，primitive 与插槽能力不同 | 3 文件 | 未达门槛（语义不一致） |
| 数值钳位 | 2 处 `clamp` | 2 文件 | 未达门槛（不实施） |

### 2.2 样式重复收敛

| 批次 | 证据 | 规模 | 状态 |
|------|------|------|------|
| 阴影与遮罩 token 迁移 | 13 处原始 `rgb`（遮罩 / 阴影），`check-design` 预算 13 | 10 文件 | 待执行（需先归纳阴影 token 档位） |
| 禁用态样式块 | 12 个 `.caomei-x--disabled` 同构块（`cursor` / `opacity` / 背景） | 12 文件 | 待执行 |
| Input 家族样式层共享 | 仅知 Password 已由 Input 派生并复用样式，其余各自维护 | — | 未达门槛（缺 ≥3 处同构取证），条件触发：出现样式分叉时补取证后启动 |

## 3. 执行记录

| 轮次 | 日期 | 范围 | 产出 | 证据 |
|------|------|------|------|------|
| 首轮 | 2026-09-16 | 治理规范落地 + 代码复用治理：标签属性转发 / 表单控件公共 props 契约 / 聚焦控制 | 开发规范与规划规范新增长期任务制度；`_shared` 新增 `useLabelAttrs` / `field` / `useFocusControl` | §2.1 取证口径与提交记录 |

> 2026-09-16 复评：ARIA 布尔假值归一、locale 文本解析、attrs 透传收敛三条由「执行中 / 待评估净收益」改判为「未达门槛」——依据为抽取后净收益不为正或语义不一致（见 §2.1 各批次证据列）；改判在已认可方向内由执行方判定。
