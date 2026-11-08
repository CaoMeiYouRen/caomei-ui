# Phase 29 M1-1：动效基础层交付

> 创建时间：2026-11-08
> 触发：Phase 29 M1-1（[Phase 29 登记批次](./2026-11-08-phase29-registration.md) §2）。
> 依据：[动效体系评估](./2026-11-08-motion-system-evaluation.md) §3 / §4 / §6 / §8；用户裁定 D2 ①（正交 `data-motion="expressive"` + 克制强度）。

## 1. 交付清单

| 面 | 内容 |
|:---|:---|
| 动效 token | `src/styles/theme.css` 新增 13 个 `--caomei-motion-*`（6 duration + 4 easing + 3 distance / scale），默认值与迁移前硬编码逐项等价 |
| 动效轴 | `[data-motion='expressive']` 覆盖全部 13 个 token；不进入 `data-preset` 命名空间；与预设 / 明暗 / 密度正交 |
| 减弱动效 | `@media (prefers-reduced-motion: reduce)` 把 6 个时长压平为 `0s`、位移归零、缩放回 `1`；规则位于 `expressive` 之后，同特异性后者胜出 |
| 既有动效迁移 | **81 处**裸时长 / 缓动迁移到 token（组件 **79** + `field-shell.css` **2**），覆盖 **32 个组件文件**；`0.15s` / `150ms` / `0.12s` / `0.1s` / `0.18s` / `0.2s` / `0.3s` 与非默认 easing 全部收敛 |
| 缺失 reduce 来源 | 补齐 4 处：`field-shell.css`（共享字段层）、`multi-select.vue`、`tags-input.vue`、`toast.vue` |
| 契约守卫 | 新增 `scripts/governance/check-motion-contract.mjs`（接入 `governance:check`）+ 21 例单测 |
| 测试 | 新增 `test/contracts/motion-tokens.test.ts`（6 例）；`test/e2e/focus-and-motion.e2e.ts` 新增动效轴 / reduce 计算值断言（3 个 project 共 27 例） |
| 文档 | `docs/design/theming.md` 新增 §5.3 动效轴；`theme.css` 头注释与 token 注释同步 |
| 冻结面 | 默认声明 **160 → 173**、有效冻结面 **405 → 418**（173 ∪ 311，交集 66）；`version-policy` 中英与冻结面终审记录增量注记同步 |

## 2. token 契约

| token | `minimal`（= 迁移前） | `expressive` | `reduce` |
|:---|:---|:---|:---|
| `--caomei-motion-duration-instant` | `100ms` | `120ms` | `0s` |
| `--caomei-motion-duration-fast` | `120ms` | `160ms` | `0s` |
| `--caomei-motion-duration-base` | `150ms` | `220ms` | `0s` |
| `--caomei-motion-duration-emphasis` | `180ms` | `240ms` | `0s` |
| `--caomei-motion-duration-slow` | `200ms` | `300ms` | `0s` |
| `--caomei-motion-duration-slower` | `300ms` | `400ms` | `0s` |
| `--caomei-motion-ease-standard` | `ease` | `cubic-bezier(0.2, 0, 0, 1)` | 不变 |
| `--caomei-motion-ease-out` | `ease-out` | `cubic-bezier(0.2, 0, 0, 1)` | 不变 |
| `--caomei-motion-ease-in-out` | `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | 不变 |
| `--caomei-motion-ease-linear` | `linear` | `linear` | 不变 |
| `--caomei-motion-distance-sm` | `0px` | `4px` | `0px` |
| `--caomei-motion-distance-md` | `0px` | `8px` | `0px` |
| `--caomei-motion-scale-from` | `1` | `0.96` | `1` |

- **迁移映射**：`0.15s` / `150ms` → duration-base；`0.12s` → duration-fast；`0.1s` → duration-instant；`0.18s` → duration-emphasis；`0.2s` / drawer 回退 `200ms` → duration-slow；`0.3s` → duration-slower；`ease` / `ease-out` / `ease-in-out` / `linear` → 对应 easing token。
- **公开覆盖钩子保留**：`--caomei-drawer-duration` 与 `--caomei-float-label-transition-duration` 仍可覆盖，回退值改为嵌套 motion token（未覆盖时逐值等价）。
- **加载类循环动画不进 token**：button / auto-complete / progress-spinner / progress-bar / image pulse / skeleton 的 `0.6s` ~ `2.4s` 保留组件级声明（含 reduce 降速），由守卫白名单登记。

## 3. 守卫契约

`check-motion-contract` 校验：

1. 默认 / `expressive` / `reduce` 三组声明齐全，默认值与 reduce 归零值精确匹配；
2. `src/**` 的 `transition` / `transition-duration` / `transition-delay` / `animation` / `animation-duration` / `animation-delay` 不含裸时长（含多行声明与 `var()` 回退内的字面量）；
3. 禁止 `transition: all`；
4. 被消费的 `--caomei-motion-*` 必须已登记（防拼写漂移）；
5. 4 个必选 reduce 来源必须含 `prefers-reduced-motion: reduce`；
6. 受检面下界：含动效声明文件 ≥ 25、声明 ≥ 60（当前 35 / 102）。

**加载类白名单**：`caomei-button-spin` / `caomei-auto-complete-spin` / `caomei-progress-spinner-spin` / `caomei-progress-bar-indeterminate` / `caomei-image-pulse` / `caomei-skeleton-pulse` / `caomei-skeleton-wave`；逗号分隔的 `animation` 逐项判定（白名单项不豁免同条其它项）。`animation-duration` / `animation-delay` 的字面量按「文件 + 值」双条件放行（`auto-complete` / `progress-spinner` 的 `1.6s`、`progress-bar` / `skeleton` 的 `2.4s`），其它值一律失败。

## 4. 验证证据

| 项 | 结果 |
|:---|:---|
| `pnpm capture:styles` | **0 差异**（386 项逐属性与冻结基线一致）——`minimal` 计算样式等价 |
| `pnpm test:visual` | **40 passed**（亮暗 / 视口 / 预设 / 区间面板基线不变） |
| `pnpm exec playwright test test/e2e/focus-and-motion.e2e.ts` | **27 passed**（3 project：轴切换、reduce 0s、既有默认 / reduce 路径） |
| `pnpm test` | **154 文件 / 3010 例通过** |
| `pnpm typecheck` | 通过 |
| `pnpm lint:check` / `pnpm lint:css:check` / `pnpm lint:md:check` | 通过 |
| `pnpm docs:check` | 全绿（含版本面 / 链接 / i18n 对账） |
| `pnpm governance:check` | 全绿（含新增 `check:motion-contract`） |
| `pnpm verify` | 通过（含构建 / resolver / Nuxt / docs build / governance 全链） |

## 5. 风险与边界

1. **task 粒度**：本批 47 个文件（34 `src/**` + 8 文档 / 配置 + 1 E2E + 4 守卫 / 测试 / 记录）超过 10 文件建议阈值；新增约 **1173 行**（迁移与文档 +253、守卫 / 单测 / 契约测试 / 本记录 920）亦超过 800 行建议阈值。理由是**单一语义 token 迁移 + 常驻守卫**——拆分会产生「token 与裸时长并存」的不可绿中间态，且守卫无法在中间态接入（无基线白名单会直接失败）。
2. **distance / scale token 暂无消费点**：本轮只定义、不在既有动画中使用（既有位移如 Toast `-4px` 必须保持 minimal 逐值不变），由 M2-1 / M3-1 在新增 expressive 动效时消费。
3. **显式 reduce 与全局 token 双保险**：4 个来源保留显式 `transition: none` / `animation: none`，其余 token 化动效由全局时长归零覆盖；不引入 `*` 选择器级 `animation: none`，避免误伤加载类。
4. **冻结面扩张**：13 个 token 进入默认声明集合；`version-policy` 与冻结面终审记录已按实测 173 / 418 更新，历史时点值不回改。
5. **视觉基线**：本轮未重冻结（`minimal` 终态不变，`test:visual` 40 例通过）；M2 / M3 新增进场 / 退场后再按差异重冻结。

## 6. Review Gate

- **audit-depth**：`standard`（跨 34 个 `src/**` + 守卫 / 测试 / 文档；以机械迁移为主，含 token 契约与冻结面变更）；时间盒 ≤ 12 分钟。
- **R1（`standard`）**：`Pass`（0 blocker / 3 warning / 5 suggest；实测约 11 分钟，未超时间盒）——
  - W1 批次计数偏差：81 处（组件 79 + 共享层 2）、46 文件、约 1170 行；**已按实测订正**（本记录 §1 / §5 与索引摘要）。
  - W2 守卫判别力盲区：**已修**——改为全文扫描（多行声明）、纳入 `transition-duration` / `transition-delay` / `animation-delay`、逗号列表逐项判定、`animation-duration` 按「文件 + 值」双条件放行；补 4 例负向单测（现行 21 例）。
  - W3 文档超前于实现：**已修**——`theming.md` §5.3 标注 distance / scale 与 `ease-in-out` / `ease-linear` 为 M2-1 / M3-1 预留、当前未消费。
  - S4 reduce 选择器补 `[data-preset='minimal']`：**不采纳**——与 `preset-minimal` 契约「该选择器在 `theme.css` 只出现一次」冲突；预设文档要求挂在根元素，非根 `data-preset="minimal"` 属文档外边界。S5 E2E 新增局部容器挂载与「局部 expressive + reduce」两例；S7 `development.md` §7 补守卫条目；S8 复核为**误报**（`float-label.vue` 末尾已有 reduce 块，仅迁移了回退值）；S6 常量双写登记为后续 follow-up（守卫与契约测试各自维护期望值，改值需两处同步）。
- **R2（`quick` delta）**：`Pass`（0 blocker / 1 warning / 2 suggest；实测约 2 分 40 秒，未超 ≤ 6 分钟时间盒）——R1 的 W1 / W2 / W3 与 S4 / S5 / S7 / S8 全部关闭；S6 维持 follow-up。新增 warning 为记录内两处过期计数（「17 例单测」→ 21、「21 passed」→ 27），**已同批订正**；新增 suggest 为 `transition-delay` / `animation-delay` 缺独立负向用例、索引摘要未复写全部计量，留作后续守卫增强 follow-up。
- **复查基线**：本记录 §1 ~ §4；`src/styles/theme.css`；`scripts/governance/check-motion-contract.mjs`；`test/contracts/motion-tokens.test.ts`；`test/e2e/focus-and-motion.e2e.ts`；`docs/design/theming.md` §5.3；`docs/guide/version-policy.md` 中英。

## 7. 未覆盖边界

- 未对每个组件逐一做人工动效复核（属 M6-1 / A8 验收批次）。
- 未新增 expressive 专属位移 / 缩放效果（属 M2-1 / M3-1）。
- Portal 面板的局部 `data-motion` 不穿透已在文档声明，未新增 E2E（与 `data-density` 同一边界）。
- 未执行真实下游应用的 `data-motion` 观感验证（属阶段人工复核）。
