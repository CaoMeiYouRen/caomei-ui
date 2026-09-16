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
  - 标签属性转发：`rg -l "props\.label \? \{ 'aria-label': props\.label \} : \{\}" src/components | wc -l` → 9；另有 1 处等价形态使用 computed 文案（`progress-bar.vue` 的 `label.value`），并入本批 → 合计 10。
  - ARIA 布尔假值：`rg -o ':aria-[a-z]+="[^"]*\|\| undefined"' src/components | wc -l` → 15。
  - attrs 透传：`rg -l 'const attrs = useAttrs\(\)' src/components | wc -l` → 13（含 `_shared/use-attr-forwarding.ts` 自身，排除后 12）。
  - locale 文本解析：`rg -o '\?\? locale\.value\.' src/components | wc -l` → 39。
  - 说明：以上为纯语法口径，只覆盖 `forwardedAttrs` computed 形态；模板级 `:aria-label="label"` 与 `controlAttrs` 基座形态另列批次（见下表），需逐处核对语义后单独验收。

| 批次 | 证据 | 规模 | 状态 |
|------|------|------|------|
| 标签属性转发（`label` 优先于透传 `aria-label`） | 10 个文件同构的 `forwardedAttrs` computed（取值源为 `props.label` 或等价 computed 文案） | 10 文件 | 已交付 |
| 标签属性转发（模板级 `:aria-label` 与 `controlAttrs` 基座形态） | `input.vue` / `select.vue` 等模板级 `:aria-label="label"`（**无条件覆盖**，与已定契约反向，属行为调整）；`checkbox.vue` / `switch.vue` 以 `controlAttrs` 为基座的同优先级形态 | 待补取证 | 待执行（含行为调整，需独立条目与验收） |
| ARIA 布尔假值归一 | 15 处 `:aria-x="value \|\| undefined"` | 15 文件 | 执行中 |
| attrs 透传收敛（手写 `useAttrs()` → 统一转发） | 12 文件手写，`useAttrForwarding` 仅 9 个组件消费 | 12 文件 | 执行中 |
| locale 文本解析 | 39 处 `props.x ?? locale.value.ns.key`（props 名与路径逐处不同） | 17 文件 | 待评估净收益 |
| 选项列表渲染 | Select / MultiSelect / AutoComplete 各 1 份 | 3 文件 | 待评估 DOM 一致性 |
| 数值钳位 | 2 处 `clamp` | 2 文件 | 未达门槛，不实施 |

### 2.2 样式重复收敛

| 批次 | 证据 | 规模 | 状态 |
|------|------|------|------|
| 阴影与遮罩 token 迁移 | 13 处原始 `rgb`（遮罩 / 阴影），`check-design` 预算 13 | 10 文件 | 待执行（需先归纳阴影 token 档位） |
| 禁用态样式块 | 12 个 `.caomei-x--disabled` 同构块（`cursor` / `opacity` / 背景） | 12 文件 | 待执行 |
| Input 家族样式层共享 | 仅知 Password 已由 Input 派生并复用样式，其余各自维护 | — | 未达门槛（缺 ≥3 处同构取证），条件触发：出现样式分叉时补取证后启动 |

## 3. 执行记录

| 轮次 | 日期 | 范围 | 产出 | 证据 |
|------|------|------|------|------|
| 首轮 | 2026-09-16 | 代码复用治理：标签属性转发 / ARIA 布尔假值 / attrs 透传收敛；同步落地治理规范 | 见对应提交 | §2.1 取证口径与提交记录 |
