# Phase 29 M4-3：图标样式 token 与迁移文档

> 创建时间：2026-11-08
> 触发：Phase 29 M4-3（[Phase 29 登记批次](./2026-11-08-phase29-registration.md) §2）。
> 依据：[图标体系调研](./2026-11-07-phase28-m4-1-icon-system-research.md) §4 / §5 / §6 / §8；用户裁定 D3 ①（I3 + I4 文档面）。

## 1. 交付清单

| 面 | 内容 |
|:---|:---|
| 图标 token | `theme.css` 新增 `--caomei-icon-size-sm/md/lg`（16 / 20 / 24px）与 `--caomei-icon-stroke-width`（2） |
| `CaomeiIcon` 档位 | `size="sm"|"md"|"lg"` 映射到 `caomei-icon--*` 类，字号走 token；其余数值 / 字符串保持原有透传 |
| 线宽 | 未显式传 `strokeWidth` 时 `.caomei-icon--default-stroke.lucide` 使用 token（只作用于 Lucide，自备 SVG 保留自身 `stroke-width`）；显式 prop 仍透传并优先 |
| 文档 | 中英图标页补尺寸档位、`样式定制` token 表、构建期接入（unplugin-icons / 自备 SVG / 品牌 logo）与 `pi pi-*` 映射；`design-spec` 将图标 token 从「规划」迁到「已实现」 |
| 冻结面 | 默认声明 **180 → 184**、披露钩子 **311 → 315**、有效冻结面 **425 → 429**（交集 66 → 70）；同批补记 M2-1 未同步的 7 个组件级默认变量 |
| 测试 | 图标单测补档位 / 默认线宽 2 例；新增 `test/contracts/icon-tokens.test.ts`（`:root` 唯一声明 + 组件引用 + Lucide 作用域 + 中英披露值对账） |

## 2. 实现要点

1. **容器 vs 独立图标**：容器内继续由 `font-size` 驱动 `1em`；独立图标用 `size="sm|md|lg"` 选择 token 档位，档位只设置 `font-size`，Lucide 的 `width/height: 1em` 随字号缩放。
2. **档位取值**：采用固定 px 阶梯 16 / 20 / 24，不采纳调研中「由字号 token 派生」的建议——独立图标档位不应随 `data-density` 漂移；容器内图标已由容器 `font-size` 驱动。`design-spec` §2.5 与图标页同步该取舍。
3. **线宽优先**：默认由 CSS token 控制（覆盖 Lucide presentation attr）；显式 `strokeWidth` 时不加 `--default-stroke` 类，保留原 prop 透传，避免破坏既有 API。选择器限定 `.lucide`——`icon` 允许接收任意组件，CSS 声明优先于 presentation attribute，不加限定会把自备 SVG 的 `stroke-width` 静默改成 2。
4. **迁移文档**：不引入 `@iconify/vue` 运行时；构建期接入分 unplugin-icons / 自备 SVG / 覆盖入口三条路径；`pi pi-*` 映射只列有直接对应的语义名，`imageOff` 明确标注无直接对应。
5. **token 计数修正**：M2-1 引入的 7 个组件级默认变量此前未进入冻结面增量注记，本批一并修正基数（180 / 425），历史 173 / 418 保持为 M1-1 时点值。

## 3. 验证证据

| 项 | 结果 |
|:---|:---|
| `pnpm vitest run src/icons/icon.test.ts test/contracts/icon-tokens.test.ts` | **24 passed**（三态 / a11y / SSR / 档位 / 默认线宽 + token 默认值、`:root` 唯一声明、Lucide 作用域与中英披露值对账） |
| `pnpm test` | 通过（写录时点快照） |
| `pnpm capture:styles` | 0 差异（386 项；图标默认态与既有组件不变） |
| `pnpm test:visual` | 42 passed（图标尺寸默认不变；新增档位为 opt-in） |
| `pnpm docs:check` / `lint:md:check` | 通过（中英新章节与示例引用有效） |
| 浏览器验证（docs preview） | 中英图标页档位 `sm / md / lg` 实测字号 **16 / 20 / 24px**、默认线宽 **2px**，无控制台错误；截图 `/tmp/opencode/icons-size-tiers.png` / `icons-size-tiers-en.png` |
| `pnpm build && pnpm check:build` / `pnpm verify` | 通过 |

## 4. 风险与边界

1. **档位与容器字号**：同一元素上的 `font-size` 是覆盖关系而非相乘；同时设置容器 `font-size` 与 `size="md"` 时以档位覆盖为准，文档要求二选一。
2. **`stroke-width` CSS 默认**：token 只覆盖 `.lucide` 根节点；自备 SVG 保留自身 `stroke-width`，需要统一时显式传 `strokeWidth` 或改 SVG 属性。
3. **`size` 保留值**：`sm` / `md` / `lg` 成为档位保留值，此前透传给自定义图标组件的用法属语义变化，已记入 `version-policy` 中英的组件公开契约段。
4. **PrimeIcons 映射**：`pi-*` 名称随 PrimeIcons 版本可能变化；文档只列常见对应，`imageOff` 无直接对应。
5. **token 冻结面**：4 个图标 token 进入公开冻结面；删除 / 改名属破坏性变更。M2-1 的 7 个组件级变量同批补记，历史记录不回改。
6. **未引入运行时依赖**：`@iconify/vue` 仍为条件候选（I5），本批不新增 peer / 运行时依赖。

## 5. Review Gate

- **audit-depth**：`standard`（主题 token + 图标组件档位 + 中英文档 / 示例 + 冻结面计数）；时间盒 ≤ 10 分钟。
- **R1（`standard`）**：`Pass`（0 blocker / 5 warning / 4 suggest；实测约 13 分钟，超 ≤ 10 分钟时间盒约 3 分钟）——
  - W1 token 契约判别力不足：**已修**——改为 `:root` 块全量比对 + 4 个 `var()` 引用断言 + 中英「样式定制」段落值对账。
  - W2 冻结面消费面口径断链：**已修**——补记消费面 443 → 454 / 未披露 132 → 139（已声明 107 → 114）。
  - W3 档位硬编码 px 与调研建议冲突：**已修**——记录 §2 与 `design-spec` §2.5 明确「固定 16/20/24 阶梯、不随 density」，不采纳派生建议；§4 风险项另记保留值与线宽边界。
  - W4 `radio` 映射不准：**已修**——`pi-circle-fill` → `pi-circle-on`。
  - W5 `todo` 未回填：RG 后同批处理。
  - 建议项已采纳：保留值 / `1em` / 线宽覆盖说明、措辞订正、`Phase 29 M1-1` 标注、示例档位 caption、英文页浏览器取证。
- **R2（`quick` delta）**：`Pass`（0 blocker / 1 warning / 5 suggest；实测约 4 分钟，未超 ≤ 5 分钟时间盒）——
  - W1 默认线宽类无条件命中任意 `icon` 组件，会覆盖自备 SVG 的 `stroke-width`：**已修**——选择器限定 `.caomei-icon--default-stroke.lucide`，契约测试断言限定存在且无裸 `.caomei-icon--default-stroke {`；中英图标页与 `design-spec` 同步「仅 Lucide」。
  - S1 `:root` 外重声明缺判别力：**已采纳**——契约测试改为「图标 token 全文件只声明一次」。
  - S2 `design-spec` §2.5 标题语义错位：**已采纳**——改为「层级 / 图标 token（已实现）与规划新增 token」，章节号不变。
  - S3 记录内部不一致（测试数 / suggest 数 / 重复编号）：**已修**——本记录同步订正。
  - S4 缺 RG 工件：**已补**——`artifacts/review-gate/2026-11-08-phase29-m4-3-icon-tokens.md`。
  - S5 `version-policy` 未记 `size` 保留值：**已采纳**——中英组件公开契约段各补一句迁移说明。
- **复查基线**：本记录 §1 ~ §3；`src/styles/theme.css`；`src/icons/{icon.vue,types.ts}`；中英图标页与 sizing / 示例；`design-spec` §2.5；冻结面记录 §2.4。

## 6. 未覆盖边界

- 未在真实 Nuxt 下游接入 `unplugin-icons` 验证（文档为构建期路径说明）。
- 未为 `imageOff` 提供 PrimeIcons 等价物。
- 未引入运行时字符串加载（I5 条件触发）。
