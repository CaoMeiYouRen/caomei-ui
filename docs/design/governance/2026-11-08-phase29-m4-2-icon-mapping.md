# Phase 29 M4-2：内置图标映射表与覆盖入口

> 创建时间：2026-11-08
> 触发：Phase 29 M4-2（[Phase 29 登记批次](./2026-11-08-phase29-registration.md) §2）。
> 依据：[图标体系调研](./2026-11-07-phase28-m4-1-icon-system-research.md) §3 / §8；用户裁定 D3 ①（I1 + I2 + I3 + I4 文档面）。

## 1. 交付清单

| 面 | 内容 |
|:---|:---|
| 语义映射表 | 新增 `src/icons/internal-icons.ts`：**22 个语义键**（`src` 引用面 29 → 5：值导入 25 → 1）（calendar / check / chevron* / error / success / radio / danger / eye / eyeOff / upload / imageOff / info / loading / minus / plus / warning / dismiss）→ Lucide 组件 |
| 组件迁移 | **25 个组件文件**（含 DataTable）移除 `@lucide/vue` 直接导入，统一经 `useInternalIcons()` 消费映射表；DataTable 用 `<component :is>` 保留原 DOM / 属性，不改变布局 |
| 覆盖入口 | `provideIconOverrides()` / `useInternalIcons()` / `caomeiIconOverridesKey`；支持对象 / `ref` / getter；按语义名合并，未覆盖保持 Lucide；provide/inject、SSR 按请求隔离 |
| 语义边界 | Message `error`（CircleAlert）与 Toast `danger`（CircleX）保持独立，不合并；四语气视觉回归不受影响 |
| 插槽优先级 | `#icon` 插槽仍高于内建图标 / 覆盖项（组件模板未改插槽分支） |
| 导出 | 包根导出新增 `internalIcons` / `provideIconOverrides` / `useInternalIcons` / `caomeiIconOverridesKey` 与 3 个类型；**338 → 345**（`version-policy` 中英同步 333 → 345） |
| 文档 | 中英图标页新增「替换内置图标」章节与 `provideIconOverrides` 示例 |
| 测试 | 新增映射表单测 6 例 + 组件迁移契约 3 例；全量单测 / 视觉 / 计算样式通过 |

## 2. 实现要点

1. **单一映射表**：`internalIcons` 是唯一 `@lucide/vue` 导入点（除 `src/icons` 自身测试 / 文档示例）；组件只写 `icons.dismiss` 等语义名，后续替换图标集无需逐个组件改动。
2. **覆盖合并**：`provideIconOverrides()` 用 `computed(() => ({ ...internalIcons, ...toValue(source) }))`；`ref` / getter 变化会响应式更新；最近 provider 生效，无模块级可变单例。
3. **DataTable 特例**：排序 / 展开图标原本直接渲染 Lucide 组件（带 `:size="14"` / `aria-hidden`），改用 `<component :is="icons.chevronUp" />` 保持相同的 DOM 与属性，不引入 `CaomeiIcon` 包裹层，避免表格布局基线变化。
4. **脚本内消费**：Toast / Message / ConfirmDialog 的语气映射在 `computed` 中读取 `icons.value.*`；模板自动解包 computed，直接写 `icons.*`。
5. **映射表体积边界**：映射表是共享模块，首个使用内建图标的组件会带入全部 22 个 Lucide 图标；如需按需可后续拆分为按图标子模块（优化候选）。

## 3. 验证证据

| 项 | 结果 |
|:---|:---|
| `pnpm vitest run src/icons/internal-icons.test.ts` | **6 passed**（22 键齐全 / error ≠ danger / 部分覆盖 / ref 响应 / 渲染 / SSR 隔离） |
| Message / Toast 组件级断言 | **47 passed**（含 Message danger `lucide-circle-alert`、Toast success / danger `lucide-circle-check` / `lucide-circle-x`、覆盖响应性） |
| `pnpm vitest run test/contracts/icon-internal-map.test.ts` | **3 passed**（组件层无 `@lucide/vue` 导入 / ≥25 组件消费映射 / 引用语义名均已登记） |
| `pnpm test` | 通过（写录时点快照；新增映射 / 契约 / 组件断言） |
| `pnpm capture:styles` | **0 差异**（386 项）——组件渲染与计算样式不变 |
| `pnpm test:visual` | **42 passed**（含 Paginator 亮 / 暗基线） |
| `pnpm build && pnpm check:build` | 通过（24 个 exports 产物，无裸 `import.meta.env`） |
| `pnpm typecheck` / `lint:check` / `docs:check` / `lint:md:check` / `pnpm verify` | 通过 |

## 4. 风险与边界

1. **共享映射体积**：`internal-icons.ts` 导入全部 22 个 Lucide 图标；首个使用内建图标的组件会把整张映射表带入下游 bundle（单组件不再只含自身 1~3 个图标）。按需拆分属后续优化候选。
2. **覆盖范围**：`provideIconOverrides` 只作用于经映射表消费的内建图标；`#icon` 插槽 / 外部传入的 `icon` 组件不受影响。
3. **语义名冻结**：22 个语义名进入包根导出面，删除 / 改名属破坏性变更；新增语义键属向后兼容增量。
4. **DataTable 渲染路径**：使用 `<component :is>` 而非 `CaomeiIcon`，保持原 DOM；后续若统一包装需重新评估表格布局基线。
5. **嵌套 provider**：最近 provider 生效，不做跨层合并；应用级覆盖建议只在根 / 布局提供一次。
6. **映射表只读**：`internalIcons` 经 `Object.freeze` 导出，运行时不可改写。

## 5. Review Gate

- **audit-depth**：`standard`（22 键映射 + 25 文件迁移 + 覆盖 composable + 契约测试 + 文档）；时间盒 ≤ 10 分钟。
- **R1（`standard`）**：`Pass`（0 blocker / 3 warning / 5 suggest；实测约 9 分钟，未超 ≤ 10 分钟时间盒）——
  - W1 `version-policy` 中英包根导出数仍为 333：**已修**——同步为 345。
  - W2 Message / Toast 缺图标身份断言：**已修**——补 danger / success 的 `lucide-circle-alert` / `lucide-circle-check` / `lucide-circle-x` 断言。
  - W3 覆盖入口缺组件级响应性测试：**已修**——Message 补 `provideIconOverrides` ref 切换后重渲染断言。
  - S1 迁移计数：**已补**——`src` 引用面 29 → 5（值导入 25 → 1）；S2 tree-shaking 措辞改为共享表体积边界；S3 `internalIcons` 加 `Object.freeze`；S4 契约测试兼容双引号 / 动态 import 并限定 `useInternalIcons` 文件；S5 `#icon` 表述收窄为「仅覆盖对应位置」。
- **R2（`quick` delta）**：`Pass`（0 blocker / 0 warning / 0 suggest；实测约 3~4 分钟，未超 ≤ 6 分钟时间盒）——W1 / W2 / W3 与 S1 ~ S5 全部关闭。
- **复查基线**：本记录 §1 ~ §3；`src/icons/internal-icons.ts`；25 个组件 diff；`test/contracts/icon-internal-map.test.ts`；中英图标页；冻结面记录 §2.3。

## 6. 未覆盖边界

- 未拆分按图标子模块（体积优化候选）。
- 未实现 I3 图标尺寸 token / I4 构建期迁移指引（M4-3）。
- 未覆盖运行时字符串名加载（I5 条件触发）。
