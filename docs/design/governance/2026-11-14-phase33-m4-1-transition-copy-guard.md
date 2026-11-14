# Phase 33 M4-1：文档站 transition 副本守卫

> 创建时间：2026-11-14
> 触发：用户「继续推进剩余条目」。范围与验收口径见 [Phase 33 登记批次](./2026-11-13-phase33-registration.md) §2 的 M4-1 行。
> 数据源：[文档站 demo 过渡恢复记录](./2026-11-13-phase32-m3-1-demo-transition.md) §2 的 25 行清单（选择器 / 过渡属性 / 来源）。

## 1. 交付

| 项 | 内容 |
|:---|:---|
| `scripts/governance/check-demo-transition-copies.mjs` | 新守卫：登记表 27 条（清单 25 行中 toolbar button / link、radio indicator / `::after` 两组各展开为 2 条），比较「选择器 → 基础层 `transition` 属性名集合」；副本必须逐属性 `!important` |
| `scripts/governance/check-demo-transition-copies.test.mjs` | 13 例：仓库现状、源漂移、副本漂移、组件新增未登记过渡、expressive 轴跳过、孤儿副本、受检面下界、解析器单测 |
| `package.json` | 新增 `check:demo-transition-copies`，并接入 `governance:check`（紧随 `check:demo-keyframes`） |

## 2. 校验口径

1. **登记一致性**：每个登记项在组件源与 `motion.css` 副本中各存在一条规则，两处 `transition` 属性名集合（`var()` 展开后）必须与登记完全一致。
2. **新增过渡拦截**：登记源文件内任何基础层 `transition` 规则（排除 `[data-motion='expressive']` 与 reduce 块、`transition: none`）都必须已登记；新增即失败。
3. **孤儿副本**：`motion.css` 中带 transition 的 demo 规则必须能在登记表找到对应项。
4. **受检面下界**：`MIN_TRANSITION_COPIES = 27`（即当前登记数，满足「≥25」验收；任一条目被移除都会失败）。
5. **特殊选择器**：`float-label` 的源写作 `.caomei-float-label :deep(> label)`，副本写作 `.caomei-float-label > label`，由 `demoSelector` 显式映射；`.caomei-field` 经 `var(--caomei-field-transition)` 间接声明，按同文件变量表展开。

## 3. 验证

| 项 | 命令 | 结果 |
|:---|:---|:---|
| 守卫现状 | `node scripts/governance/check-demo-transition-copies.mjs` | 通过（27 条与组件源一致） |
| 守卫单测 | `pnpm exec vitest run scripts/governance/check-demo-transition-copies.test.mjs` | 全绿（覆盖现状 / 源漂移 / 副本漂移 / 缺 `!important` / 新增未登记 / expressive 跳过 / 孤儿副本 / 下界 / 解析器） |
| **负向验证（CLI）** | 临时在 `badge.vue` 末尾追加 `.caomei-badge__probe { transition: color 150ms; }` → 重跑守卫 | **exit 1**（「未登记的组件过渡」）；还原后 exit 0 |
| 门禁接入 | `pnpm governance:check` | exit 0（含新步骤） |
| 静态检查 | `pnpm exec eslint`（脚本与测试） | 零 error |

## 4. 边界

1. **扫描面 = 登记表中的源文件**：新增组件 / 新文件中的过渡不会被自动发现；新增条目时需同时登记（登记表即受检面声明）。「组件新增过渡」的拦截范围是已登记文件内新增的选择器或属性。
2. 只比较**属性名集合**，不比较时长 / 缓动 / 值；`var()` 展开最多 3 层，覆盖 `--caomei-field-transition` 一类间接声明。
3. `[data-motion='expressive']` 与 `prefers-reduced-motion: reduce` 块不参与源扫描（前者是 expressive 专属、后者是压平分支）；demo 副本本身位于 reduce 媒体块内，按设计参与比较。
4. 不替代真实浏览器验证：`motion.css` 的过渡实际生效仍由 E2E / 文档站视觉验证承担；本守卫只防副本漂移。
5. **副本 `!important` 必检**（压过 VitePress 的 `* { transition-duration: 0s !important }`）；时长 / 缓动 / 具体值不校验。
6. 解析器边界：源侧不做逗号选择器拆分（同属性合并规则会报「源规则缺失」）；`transition-property` 长写法不在面内；`var()` 只按同文件变量展开（跨文件会以 `var(--x)` 名义报失败而非漏报）；`@-moz-keyframes` 等非白名单 at-rule 的伪规则可能漏出。
7. `docs:check:integrity` 按 `git ls-files` 枚举，新增 md 须先 `git add` 才进入其受检面（`lint-md` 已覆盖）。

## 5. Review Gate

- **审计声明**：R1 `standard`；单分区；时间盒 ≤10 分钟。
- **结论：`Pass`**（0 blocker / 2 warning / 6 suggest），warning 与建议均在同批关闭：
  - W1 索引摘要复述读数 → 已改为结论 + 链接；记录 §3 的用例计数改为「全绿」。
  - W2 副本缺 `!important` 不会被属性集合发现 → 已把「逐属性 `!important`」纳入校验并补负向用例（14 例全绿）。
  - S1 合并行表述（原写 toolbar / trigger）→ 改为 toolbar button / link、radio indicator / `::after`；S2 下界由 25 收紧到 **27**（任何条目移除都会失败，仍满足「≥25」验收）；S3 解析器边界写入 §4；S4 `root` 默认 `REPO_ROOT`；S5 未跟踪文件与 `docs:check:integrity` 的关系写入 §4；S6 本节回填。
- **复核证据**：`node scripts/governance/check-demo-transition-copies.mjs` 通过（27 条）；`vitest run` 14 例全绿；CLI 负向（临时新增过渡）exit 1；`pnpm governance:check` exit 0。
- **复查基线**：本记录 §1 ~ §4；`check-demo-transition-copies.mjs`（登记表 / 解析 / 校验）；同名测试；`package.json` 的 `check:demo-transition-copies` 与 `governance:check` 接线。
