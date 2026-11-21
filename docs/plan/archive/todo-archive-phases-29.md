# 待办归档（深度归档）：Phase 29

> 自 [todo-archive.md](../todo-archive.md) 主窗口迁出；迁移为机械操作（相对链接深度 `../` → `../../`，同目录 `./` → `../`），正文不改写。阶段交付权威记录见[治理索引](../../design/governance/index.md)。

## Phase 29：动效体系与图标体系落地（**2026-11-09 完成并归档；本阶段不发布**）

- 时间：2026-11-08 用户就[第十三轮范围评估](../../design/governance/2026-11-08-next-stage-scope-evaluation-13.md) §3 裁定 D1 ② / D2 ① / D3 ① / D4 ① / D5 ② 后登记；2026-11-09 交付 **6 条主线 / 8 条原子条目**并完成阶段归档（用户指令「开始阶段收口」）。
- 范围与授权：取 **动效 A1 + A2 + A3 + A8 + 图标 I1 ~ I3（含 I4 文档面）+ Paginator 尺寸**，构成对账 **1 + 1 + 1 + 3 + 1 + 1 = 8**；D2 ① 正交 `data-motion="expressive"` + 克制强度、D3 ① 图标三态 + 映射 + token、D4 ① 高度 + 宽度（不含圆角）、D5 ② **本阶段不发布**（`latest` 维持 `1.2.0`）。范围与验收口径的单一事实源见[Phase 29 登记批次记录](../../design/governance/2026-11-08-phase29-registration.md) §1 / §2。
- 非目标：动效 A4 ~ A7（表单 / 布局 / 选择器 / 数据展示）、图标 I5 运行时 peer、触摸目标 P1 / P2、RTL / 二期语言、长尾组件、破坏性 API 变更、Tailwind / UnoCSS、文档站多版本托管、Storybook；不发布、不推送。

### M1 动效基础层（1 条）

- **M1-1 motion tokens 与 `data-motion` 轴**：13 个 `--caomei-motion-*`（6 duration / 4 easing / 3 distance · scale），`minimal` 逐值等价、`expressive` 覆盖、`reduce` 压平；81 处裸时长迁移；新增 `check-motion-contract` 守卫 + 契约 / E2E 测试（提交 `076eb15`；[M1-1 记录](../../design/governance/2026-11-08-phase29-m1-1-motion-foundation.md)）。RG：R1 Pass → R2 Pass。`capture:styles` 0 差异、视觉 40、E2E 27、全量 3010。

### M2 反馈与浮层动效（1 条）

- **M2-1 Dialog / ConfirmDialog / Popover / DropdownMenu / Tooltip / Toast / Message / Alert**：expressive 下进出场、退场 DOM 保留与焦点回归、Toast 延迟移除；`overlay-motion` E2E 39 例（提交 `bf32784`；[M2-1 记录](../../design/governance/2026-11-08-phase29-m2-1-overlay-motion.md)）。RG：R1 Pass → R2 Pass。

### M3 导航与操作动效（1 条）

- **M3-1 Tabs / Accordion / Menu / Breadcrumb / Stepper / Toolbar / Button 族**：expressive 下内容淡入、高度动画、抬升与按压缩放；ButtonGroup 重置、SplitButton chevron；`navigation-motion` E2E 30 例（提交 `ee74dbf`；[M3-1 记录](../../design/governance/2026-11-08-phase29-m3-1-navigation-motion.md)）。RG：R1 Reject → R2 Pass。**后续收敛**：按人工复核意见取消 Button / Toolbar 悬浮位移，仅保留按压缩放（见 M6 段）。

### M4 图标体系（3 条）

- **M4-1 `CaomeiIcon` 三态与可访问名**：`icon` / `name` / registry、`provideIconRegistry`（SSR 隔离）、`label` > 透传 a11y > 默认 `aria-hidden`；包根导出 333 → 338（提交 `d7b2c50`；[M4-1 记录](../../design/governance/2026-11-08-phase29-m4-1-icon-adapter.md)）。RG：R1 Reject → R2 Pass。
- **M4-2 内置图标映射与覆盖入口**：22 个语义键收敛到 `src/icons/internal-icons.ts`，25 个组件移除 `@lucide/vue` 直接导入；`provideIconOverrides`（对象 / ref / getter，SSR 隔离）；包根导出 338 → 345（提交 `129758d`；[M4-2 记录](../../design/governance/2026-11-08-phase29-m4-2-icon-mapping.md)）。RG：R1 Pass → R2 Pass。
- **M4-3 图标样式 token 与迁移文档**：`--caomei-icon-size-{sm,md,lg}` + `--caomei-icon-stroke-width`，`size="sm|md|lg"` 档位；默认线宽仅作用于 Lucide；中英图标页补样式定制 / 构建期接入 / PrimeIcons 映射；冻结面 425 → 429（提交 `cb7caed`；[M4-3 记录](../../design/governance/2026-11-08-phase29-m4-3-icon-tokens.md)）。RG：R1 `standard` Pass（超时 3 分钟）→ R2 `quick` Pass。

### M5 Paginator 尺寸对齐（1 条）

- **M5-1 每页条数选择器尺寸**：高度统一到 `--caomei-paginator-control-size`（默认 / touch 均 32px）、默认宽度 6rem → 5rem、3 位数不裁切；新增亮 / 暗视觉基线（提交 `2ef42ab`；[M5-1 记录](../../design/governance/2026-11-08-phase29-m5-1-paginator-sizing.md)）。RG：R1 Pass → R2 Reject（`.session` 状态口径 / 视觉下界，已修）→ R3 Pass。

### M6 动效验收与人工复核（1 条）

- **验收装置与 L1 ~ L4 矩阵**：`test/e2e/helpers/motion.ts`（有界帧轮询 + `pause()` + `currentTime`，无 `sleep`）+ `motion-acceptance.e2e.ts`（9 例 × 3 project = 27）；`check-motion-contract` 扩布局属性白名单（21 → 35 单测）；`theming.md` §5.3 补验收分层与示例；长任务 2 条 / 最大 66ms（提交 `4c28ad7` / `91d3948` / `22a0cd3`；[验收记录](../../design/governance/2026-11-09-phase29-m6-1-motion-acceptance.md)）。RG：R1 `standard` Pass（5 warning / 7 suggest）→ R2 `quick` Pass。
- **人工复核反馈修复**：文档站 VitePress 全局 `prefers-reduced-motion` 压平归因（非缺陷）；修复面包屑首项 4px 错位与子菜单触发器缺菜单项样式（宿主 `li + li` / `a` 规则 + 跨组件 scoped 不命中）；新增 `component-alignment` E2E 9 例（提交 `e042c68` / `d49ca39` / `e221abe`；[修复记录](../../design/governance/2026-11-09-phase29-m6-1-review-fixes.md)）。RG：R1 Reject → R2 Reject → R3 Pass → R4 Pass。
- **独立审查页与悬浮位移收敛**：`pnpm review:motion`（开发态，尊重系统 reduce）+ `pnpm review:build`（IIFE 内联单文件，file:// 可运行，审查用途忽略 reduce，自动演示）；Button / Toolbar 悬浮位移 4px → 1px → 取消（按压缩放 0.98 保留、220ms 过渡，CDP 断言），消费面维持 455 / 139 / 25（提交 `28096fd` / `8a05e76` / `6f39ea3` / `137865e`）。RG：R5 `quick` Pass；R6 `quick` Reject（计数不可复现）→ R7 `quick` Pass。
- **人工复核签字**：2026-11-09 用户确认动画效果并同意标记完成；五项清单通过，320 / 768 未单独目视（几何由响应式矩阵覆盖），reduce 人工面以 DevTools + 开发态页为准（提交 `4522442`）。RG：R1 Reject（旧状态残留）→ R2 Pass。

### 回扫口径（三段式）

- **机检面**：`check:governance-records` 495 个 md 历史规划指针无失效、55 条索引结论指针章节号一致；`check-links` 498 个 md 本地链接全部有效。
- **人工面**：`todo.md` / `roadmap.md` / `archive/index.md` / `recurring.md` / 治理索引逐处改指，无遗留进行中或归档待指令表述。
- **未处理面**：无；历史「阶段限定 + 复用编号」边界沿用既有登记，不在本批扩面。

### 阶段总结

- **提交**：登记 `2d98cee` → `076eb15` / `bf32784` / `ee74dbf` / `2ef42ab` / `d7b2c50` / `129758d` / `cb7caed` → M6-1 `4c28ad7` / `91d3948` / `22a0cd3` / `e042c68` / `d49ca39` / `e221abe` / `28096fd` / `8a05e76` / `6f39ea3` / `137865e` / `4522442`。
- **质量门**：`pnpm verify` exit 0（158 文件 / **3062 例**）；`capture:styles` **386 项 0 差异**；`test:visual` **42 passed**；定向 E2E：`motion-acceptance` 27、`navigation-motion` 30、`component-alignment` 9、`overlay-motion` 39（Chromium）；`pnpm build && pnpm check:build` 通过；文档站与治理链全绿。
- **长期任务**：阶段收口触发**第 32 轮**门槛复核（2026-11-09）——待执行批次 **0 项维持**；条件触发 **1 项维持**（表单控件公共 props 契约）；已判定不纳入 **5 项维持**；证据：`useLabelAttrs` 15 / `labelAttrs` 11 / 模板级 `:aria-label` 0 / 继承契约 12 / 含内联同名字段 36 / `useFocusControl` 4 / `useAttrs()` 14；数值钳位 2 处；§2.2 四组件共有声明 **0**，`tags-input` shell 声明 16 → **17**（+1 = Phase 29 M1-1 补齐的 reduce `transition: none`，非重复面）；`capture:styles` 386 项 0 差异。见[长期任务](../recurring.md) §3 第 32 轮。
- **wisdom 蒸馏**：新增 4 条可复用发现（文档站 reduce 压平归因 / scoped keyframes 哈希名 / 宿主 `li + li` 级联 / 确定性采样装置），活跃 4 条 < 20 阈值，未触发蒸馏；详见[归档批次记录](../../design/governance/2026-11-09-phase29-archive.md) §3。
- **归档批次审计**：经 `@code-reviewer` Review Gate `standard`；结论见归档批次记录 §5。
- **已知观察**：① 本阶段**不发布**，`latest` 维持 `1.2.0`，未推送（时点口径；其提交随后续批次推送 `master`）；② 图标 token 冻结面 429 → 430（`--caomei-menu-item-hover-color`），包根导出 345；③ 文档站 reduce 下仍按 VitePress 全局规则压平（无障碍行为），目视审查改用独立页面；单文件与录屏在 `artifacts/`（gitignored）；④ Chromium 单浏览器覆盖，Firefox / WebKit 未复跑。
- **后续候选**：动效 A4 ~ A7（[Backlog](../backlog.md) §1.10）、图标 I5（§1.9）、触摸目标 P1 / P2、RTL / 二期语言、长尾组件。
