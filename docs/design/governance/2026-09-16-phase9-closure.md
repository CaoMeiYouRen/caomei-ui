# Phase 9 收口与遗留清单

> 状态：阶段收口记录（2026-09-16）。汇总 Phase 9「发布前收口」的交付结果、待用户决策项、已登记待执行项与已知偏差。
> 关联：[待办事项](../../plan/todo.md) ｜ [长期任务台账](../../plan/recurring.md) ｜ [Backlog](../../plan/backlog.md) ｜ [路线图](../../plan/roadmap.md) ｜ [待办归档](../../plan/todo-archive.md)

## 1. 交付摘要

| 主线 | 条目 | 结果 |
| --- | :-: | --- |
| M1 文档站信息架构 | 3/3 | 侧栏 6 分组 + 组内字母序（中英同序）；能力说明三页归位 `/components/`；新增 zh 组件总览页 |
| M2 默认主题主色改蓝 | 2/2 | 亮 `#2563eb` / 暗 `#60a5fa`（实测 5.17:1 / 7.73:1）；配套实底前景整改与语义别名 |
| M3 演示动画 opt-in | 2/2 | 加载指示全站恢复 + 演示区 opt-in；取舍与验证记录落盘 |
| M4 公共逻辑抽取 | 4/4 | 长期任务机制落地 + 首轮三项抽取（标签属性转发 12 处 / 公共 props 契约首批 7 文件 / 聚焦控制 4 处） |
| M5 ESLint 严格化 | 3/3 | 显式类型族启用；unsafe 族收敛（189 → 0）；切换 `vue/strict` 并固化零告警门禁 |

阶段内另完成：长期任务机制（规划规范 §8 + 台账）、session wisdom 蒸馏（24 条全部迁移）、Phase 9 M4 第二批契约迁移（阶段收口触发）。

## 2. 待用户决策项

### 2.1 需明确裁定的契约变更

- **`update:modelValue` 事件签名放宽为 `File[] | null`**（M5-3，file-upload）
  - 背景：`modelValue: null` 在改动前会崩溃，修复时把「可能为 null」写成契约。
  - 影响：下游写显式 `@update:model-value="files = $event"`（`files: File[]`）时需自行判空。
  - 选项：① 接受（尚未发布，无存量下游）；② 追加运行时归一（把 `null` 转 `[]` 后再 emit）。

### 2.2 长期任务下一轮范围（台账 §2 待执行批次）

- **表单控件公共 props 契约（后续候选）**：`date-picker` / `color-picker` / `slider` / `toggle-button` / `file-upload`（5 文件）
- **标签属性转发（模板级 `:aria-label`）**：12 处无条件覆盖，与已定「空值不覆盖」契约反向，**含行为调整**，需独立验收
- **样式重复收敛**：阴影与遮罩 token 迁移（13 处 / 10 文件）、禁用态样式块（12 文件）

### 2.3 阶段方向（需授权才登记）

- Phase 5 第二阶段（首版发布 / 首个下游接入）：待 npm 凭据等外部前置
- Phase 7 第二阶段（momei 迁移闭环 + P1 增强）：按用户决策「先收口再迁移」，现排在本阶段之后
- Phase 8（下游兼容性回归）：稳定使用后启用
- Backlog §1.1~§1.8 未决策候选（组件增强 P2、国际化语言矩阵与 RTL、移动端与响应式、治理项等）

## 3. 已登记待执行项（无需再次决策）

| 项 | 落点 | 来源 |
| --- | --- | --- |
| `toast.test.ts:90` 的 `findComponent({ name: 'ToastRoot' })` 同契约未统一 | 长期任务台账（unsafe 族系列后续批次） | M5-2 Review 建议 |
| 规划载体同步 AI 资产（`todo-manager` skill / `product-manager` agent 未含长期任务台账；`AGENTS.md` 受保护需明确指示） | Backlog §1.6 | M4 规范落地 Review |
| 总览页 ↔ 侧栏 parity 无自动守卫 | Backlog §1.6（文档站锚点校验与侧栏不变式） | M1 条目 3 Review |
| 文档站锚点校验对齐 VitePress slugify | Backlog §1.6 | M1 条目 1 Review |
| 测试隔离与偶发失败（并发下偶发 flaky） | Backlog §1.6 | 既有候选 |
| 对比度遗留项（soft 变体文本、calendar weekday、toast icon、预设品牌色例外） | Backlog §1.6 | M2 V 阶段 |

## 4. 已知偏差与风险（记录在案，不阻塞）

- **覆盖缩减**：`playground/nuxt/**` 为独立 Nuxt fixture（自带 `node_modules`、不在 projectService 内），已与根 tsconfig 的 `exclude` 对齐后从 lint 忽略；该目录不再受任何规则覆盖。
- **规则分层**：测试文件整类豁免 `no-unnecessary-condition`（断言链统一使用可选链，末段类型可证非空，属已接受的确定性折衷）；`prefer-nullish-coalescing` 对原始类型放行（字符串「空值即回退」为既有语义）。
- **通配 `.vue` 声明边界**：任何 `.vue` 结尾的说明符都会解析成功，路径拼错不再报 TS2307，由 `pnpm build` 与 `pnpm test` 兜底；边界已写入声明注释。
- **文件粒度超限记录**：M5-3（32 文件）与 M1 条目 2+3（16 文件）为原子变更，切换 / 迁移与收敛不可分割，任一拆分点门禁不通过；判定依据已写入对应提交正文。
