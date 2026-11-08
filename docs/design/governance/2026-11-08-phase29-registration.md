# Phase 29 登记批次记录

> 创建时间：2026-11-08
> 触发：用户就[下一阶段范围评估（第十三轮）](./2026-11-08-next-stage-scope-evaluation-13.md) §3 的 D1 ~ D5 决策点裁定为 **② / ① / ① / ① / ②**。
> 依据：[规划规范 §3 / §4](../../standards/planning.md)（阶段编号只在**授权启动**时分配；登记 = 用户决策后同步全部载体）。
> **本记录是该次登记的唯一口径载体**：`todo.md` / `roadmap.md` / `backlog.md` / 治理索引只引用本记录的结论。

## 1. 编号分配与构成

- **编号**：取授权启动时已有最大编号（Phase 28）+ 1 = **Phase 29**。
- **构成（6 条主线 / 8 条原子条目）**：动效基础层 **1** + 反馈与浮层动效 **1** + 导航与操作动效 **1** + 图标体系实现 **3** + Paginator 尺寸对齐 **1** + 动效验收与人工复核 **1**；对账 **1 + 1 + 1 + 3 + 1 + 1 = 8**。
- **取向来源**：D1 ② = ① + A3（导航与操作）；D2 ① 正交 `data-motion="expressive"` + 克制强度；D3 ① 图标 I1 + I2 + I3 + I4 文档面；D4 ① Paginator 高度 + 宽度（不含圆角）；D5 ② **本阶段不发布**——D1 ② 草案中的发布主线随之退出，构成由 9 条收敛为 8 条。
- **目标版本**：**本阶段不发布**（D5 ②）；`latest` 维持 `1.2.0`，版本积累至下一阶段。
- **优先级依据**：用户 2026-11-08 动效需求（反馈与浮层 → 导航与操作 → 表单输入 → 基础与布局 → 选择器 → 数据展示）、2026-11-07 图标体系需求、2026-11-08 Paginator 截图反馈；动效评估与图标调研均已完成，接口与批次边界可直接落地。

## 2. 逐条范围与验收口径

| 条目 | 主线 | 范围 | 验收口径 |
|:---|:---|:---|:---|
| **M1-1** | 动效基础层 | motion tokens（duration / easing / distance / scale）；`minimal` 与现值逐项等价；正交 `data-motion="expressive"` 覆盖；`prefers-reduced-motion` 全局兜底（含 `field-shell.css`、`multi-select` / `tags-input` / `toast`）；`check-motion-contract` 守卫（含加载动画白名单）接入 `governance:check`；E2E 测试 helper；`theming.md` §5.3 | 缺省渲染零差异（逐选择器 computed transition / animation diff 为空，`capture:styles` 默认组 0 差异）；`data-motion="expressive"` 切换生效；4 个缺失 reduced-motion 来源补齐；守卫含裸时长 / 未登记动画 / 缺 reduce 的负向用例；不引入动效运行时依赖 |
| **M2-1** | 反馈与浮层动效 | Dialog / ConfirmDialog 进出场与退场 DOM、焦点回归；Drawer 收口；Popover / DropdownMenu / Tooltip 状态切换；Toast / Message / Alert 出现 / 消失；DropdownMenu 浮层唯一归本批；Toast reduced-motion（**仅新增进出场动画在 reduce 下的行为**；全局媒体查询兜底归 M1-1） | `getAnimations()` + `currentTime` 断言 enter / exit 时间轴；`reducedMotion: reduce` 下无位移 / 缩放（允许极短淡入）；退场 Presence 行为与 DOM 移除时机有记录；焦点回归不回归 |
| **M3-1** | 导航与操作动效 | Tabs（内容 / 指示器）、Accordion（高度动画成本评估后定形）、Menu / SubMenu、Breadcrumb、Stepper、Toolbar、Button / ButtonGroup / SplitButton（DropdownMenu 归 M2-1） | 指示器 / 内容切换、展开收起、连续切换可打断；reduce 下无位移 / 缩放；不引入布局抖动；Button 交互态唯一归本批、不在其他批次重复 |
| **M4-1** | 图标体系实现 | `CaomeiIcon` 三态（`icon` / `name` / registry）；`provideIconRegistry`（provide/inject、SSR 安全）；`icon` 由必填改可选（向后兼容）；`label` / `strokeWidth`；可访问名优先级 `label` > 透传 `aria-*` / `role` / `title` > 默认 `aria-hidden="true"` | 三态解析优先级（`#icon` 插槽 > `icon` > `name` > 开发期告警 + 空占位）单测固化；可访问名优先级单测固化；SSR 跨请求无注册表泄漏；既有 `Component` 用法零改动通过；联合类型取舍写入文档 |
| **M4-2** | 图标体系实现 | 新建 `src/icons/internal-icons.ts` 语义映射；25 个有值导入文件收敛（4 个仅提及文件改注释）；`provideIconOverrides` 应用级合并；保留 `#icon` 插槽优先级；禁止桶导出破坏 tree-shaking；**不得合并** Message `error`（`CircleAlert`）与 Toast `danger`（`CircleX`） | 组件层不再直接 `import` `@lucide/vue`（映射表唯一出口）；视觉回归覆盖 Message / Toast 四语气；覆盖入口未覆盖项回退 Lucide；导入面计数核对（25 / 29 / 22） |
| **M4-3** | 图标体系实现 | `--caomei-icon-size-sm/md/lg`、`--caomei-icon-stroke-width`；容器内继续 `font-size` 驱动 `1em`；中英组件页补三态 / 覆盖入口 / token；`pi pi-*`、自备 SVG、品牌 logo 的构建期迁移指引（原 I4 文档面） | 默认尺寸与现值一致（`capture:styles` 0 差异）；token 进入冻结面 / 计数载体；中英同步；文档不虚构未实现能力；不新增运行时依赖 |
| **M5-1** | Paginator 尺寸对齐 | 高度覆盖为 `var(--caomei-paginator-control-size)`（默认 / touch 均为 32px）；默认宽度 6rem → 5rem；**圆角不改**；E2E 尺寸断言（同实例高度相等、默认 / touch、390 / 768 / 1280 三档视口）；Paginator 亮暗视觉基线重冻结 | 同实例页码控件与选择器高度差 ≤ 0.5px；「100」不裁切；可访问名与键盘 / 焦点不回归；未提供 `rowsPerPageOptions` 时不渲染；视觉基线仅选择器几何变化 |
| **M6-1** | 动效验收与人工复核 | L1 ~ L4 验收矩阵；`getAnimations()` + `currentTime` 确定性采样；reduced-motion 双向断言；性能（longtask / 布局属性动画）与 a11y 审计；人工复核清单与录屏记录；主题文档与示例 | 矩阵覆盖 M1-1 ~ M3-1 已交付批次；采样无 `sleep` 依赖、可重复通过；人工复核记录含亮暗 / 多视口；A4 ~ A7 的验收边界写入文档、不重复建条目 |

## 3. 非目标（本阶段）

- 不实现动效 A4 ~ A7（表单输入 / 基础与布局 / 选择器 / 数据展示）；其验收随各自批次扩展。
- 不实现图标 I5（可选 `@iconify/vue` peer），维持条件触发；不引入任何图标运行时依赖。
- 不做触摸目标 P1 / P2、RTL、二期语言、长尾组件（Sidebar / ScrollPanel / BackTop / Rating / TimePicker）、`useDialog`、momei 根包接入。
- 不做破坏性 API 变更；不引入 Tailwind / UnoCSS；不做文档站多版本托管；不启用 Storybook。
- **本阶段不发布、不推送**（D5 ②）；`latest` 维持 `1.2.0`。

## 4. 载体同步与候选移出

| 载体 | 动作 |
|:---|:---|
| `docs/plan/todo.md` | 声明「当前进行中阶段：Phase 29」+ `## Phase 29 原子条目` 段（8 行，状态「待执行」） |
| `docs/plan/roadmap.md` | 阶段表新增 Phase 29 行；§1 当前态句改为「Phase 29 已登记、本阶段不发布」 |
| `docs/plan/backlog.md` | 移出 9 行（动效 A1 / A2 / A3 / A8；图标 I1 / I2 / I3 / I4；Paginator 每页选择器尺寸）；**46 → 37**（5 + 5 + 0 + 2 + 3 + 14 + 1 + 2 + 1 + 4 = 37） |
| `docs/design/governance/index.md` | 新增第十三轮评估与本记录两条索引 |
| `.session`（git-ignored） | `current_phase` / `active_plan` / `next_steps` / `decisions` 与 `runtime-state.json` 的 `plan_state` 同批同步 |

- **未移出项**：动效 A4 ~ A7（下阶段）；图标 I5（条件触发）；Paginator 页码报表 / DataTable 其余候选 / 质量小项（3 项）/ 触摸目标 P1 · P2 等维持 Backlog。
- **候选池计数口径**：`backlog.md` §1 由 **46 → 37**；移出 9 行、无新增。本记录与[第十三轮评估](./2026-11-08-next-stage-scope-evaluation-13.md) §1 的 **46** 为**登记前产出时点值**；登记后为 **37**（见上），后续以 `backlog.md` 实际数据行为准。

## 5. 风险与前置

1. **token 等价面**：M1-1 的 `minimal` 必须与现值逐选择器等价，任何时长 / 缓动漂移会放大到 20+ 组件；以 computed diff 与 `capture:styles` 双证据约束。
2. **动效测试确定性**：`getAnimations()` 依赖有界等待与 `pause()` + `currentTime`；退场在 Portal / Presence 下的 DOM 保留时机须逐组件取证，禁止 `sleep` 兜底。
3. **图标重构面**：M4-2 触及 25 个文件，超过[规划规范 §5](../../standards/planning.md) 的 10 文件建议阈值；按组件族拆 2 ~ 3 个提交，或按「单一语义映射收敛」声明整体批次理由，由 Review Gate 判定。
4. **公开契约**：`CaomeiIcon` 的 `icon` 可选化与 `name` / `strokeWidth` / `label`、`data-motion` 轴进入冻结面；须同步 `version-policy` / 冻结清单 / token 计数载体。
5. **视觉基线**：M2-1 / M3-1 / M4-2 / M4-3 的浮层与图标变化、M5-1 的 Paginator 几何变化需重冻结；默认组 / `minimal` 组不得变化。
6. **版本面**：本阶段不发布（D5 ②），`latest` 维持 `1.2.0`；阶段收口时**不得**执行 `pnpm release` 或推送，除非用户另行明确授权。
7. **长期任务**：阶段收口前须执行门槛复核轮并留痕。

## 6. Review Gate

- **audit-depth**：`standard`（规划载体登记 + 跨载体计数 + 候选池变更，零 `src/**` / 零测试 / 零配置）；时间盒 ≤ 8 分钟。
- **R1（`standard`）**：`Pass`（0 blocker / 2 warning / 3 suggest；实测约 7 分钟，未超时间盒）——W1 第十三轮评估 §1 的候选池差值算式漏记 Phase 28 移出 5 行（42 + 8 + 1 ≠ 46）；W2 `.session/runtime-state.json` 的 `verification_state.reason` 残留 Phase 28「无进行中阶段」文案；S1 评估 §1 的 46 缺点时值显式标注；S2 `backlog.md` §1.1 缺 Paginator 尺寸移出注记；S3 M1-1 / M2-1 的 Toast reduced-motion 归属可读作重叠。**已修**：W1 改为「42 → Phase 28 移出 5 → 37 → +8 +1 = 46」并标注点时值；W2 同步为 Phase 29 登记态；S1 本记录 §4 补点时值说明；S2 §1.1 补注记；S3 M2-1 限定为「新增进出场动画在 reduce 下的行为」、全局媒体查询归 M1-1。
- **R2（`quick` delta）：`Pass`**（0 blocker / 0 warning / 1 suggest；实测约 2.5 分钟，未超 ≤ 5 分钟时间盒）——R1 的 2 warning / 3 suggest 全部关闭；新增 suggest 复核为**误报**（原文即「再自动效」，无笔误），不做改写。
- **复查基线**：本记录 §1 / §2 / §4；`docs/plan/todo.md` 当前状态句与条目表；`docs/plan/roadmap.md` §1 与阶段表行；`docs/plan/backlog.md` §1 逐段计数；[第十三轮评估](./2026-11-08-next-stage-scope-evaluation-13.md) §3.1 / §5；`docs/design/governance/index.md` 两条摘要。
