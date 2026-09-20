# M1-3 样式按需形态落地与适配（Phase 11）

- 类型：实现落地与验证记录
- 触发：Phase 11 M1-3 条目——落地 `unbundle + css.inject`，完成四处适配（`exports` / resolver / Nuxt 模块 / `check:build` 断言）+ 文档口径同步 + `npm pack` 冒烟；并入 M1-2 §6 **D6**（`check:nuxt` 断言增强）
- 授权：D1~D6 的确认锚点为用户 2026-09-20 指令「提交后继续推进」（按 M1-2 §3 / §6 的建议值整体采纳；见 M1-2 §6 的确认说明）
- 关联：[待办事项 M1-3](../../plan/todo.md) ｜ [M1-1 构建路径 POC](./2026-09-20-m1-1-build-path-poc.md) ｜ [M1-2 入口语义与 dts 验证](./2026-09-20-m1-2-entry-semantics-and-dts-verification.md) ｜ [架构设计 §3 / §4 / §5](../architecture.md)
- 环境：tsdown 0.23.0 + @tsdown/css 0.23.0 + vite 8.2.2 + nuxt 4；快照 2026-09-20
- 规模：**38 文件 / +599 −65 行**（超 [规划规范 §5](../../standards/planning.md) 的 10 文件建议阈值，行数未超）；依据：同一入口语义需在构建 / `exports` / resolver / Nuxt 模块 / 断言 / 文档 / 记录间同步落地，拆批会出现「文档与产物口径相反」的中间态——Review Gate 已裁定**豁免成立**

## 1. 结论

1. **形态已落地**：`tsdown.config.ts` 改用 `unbundle: true` + `css.inject: true`；`exports` 以 `./theme.css` 取代 `./styles.css`；resolver 与 Nuxt 模块注入基础层；`check:build` / `check:nuxt` 断言（含新增判别力断言）与文档口径同步。
2. **验收达成**：`pnpm verify` 全链路通过；**resolver 消费路径已实测**（新增 `check:resolver` 并接入 `verify`）；消费侧两条路径在**真实包布局**下按需生效且基础层只有一份。
3. **两处自纠（本阶段发现并更正）**：
   - M1-1 §3.2 与 M1-2 §3 曾称「Vite 侧根导入会携带 tokens」——**误**（详见 §4.1）；
   - 上述结论一度泛化写为「打包器侧一致」——**过度泛化**：**esbuild 实测仍保留基础层**，故限定为「实测 Vite / rolldown 系与 Nuxt 侧一致」（详见 §4.2）。

## 2. 落地改动（按适配面）

| 面 | 文件 | 改动 |
| --- | --- | --- |
| 构建 | `tsdown.config.ts` | `unbundle: true` + `css.inject: true`；移除单体 `css.fileName`（unbundle 下 `css.splitting` 默认开启） |
| `exports` / 脚本 | `package.json` | `"./styles.css"` → `"./theme.css": "./dist/styles/index.css"`；新增 `check:resolver` 脚本并接入 `verify` |
| resolver | `src/resolver/index.ts` | `sideEffects` 由 `caomei-ui/styles.css` 改为 **`caomei-ui/theme.css`**；补 JSDoc 说明组件样式自带、此处只补基础层 |
| Nuxt 模块 | `src/nuxt/module.ts`、`src/nuxt/module.test.ts` | `injectStyles` 注入目标改为 **`caomei-ui/theme.css`**；注释明确基础层先于虚拟覆盖注入；断言同步 |
| `check:build` 断言 | `scripts/release/smoke-runtime.mjs`、`check-build.mjs`、`check-build.test.mjs` | 目标改为 `dist/styles/index.css`；**新增 `findMissingCssImports` 正向断言**（产物 JS 必须保留 CSS import，含 3 条单测，含反例） |
| resolver 实测 | **新增** `scripts/release/check-resolver.mjs`（纯函数，供单测导入）+ `check-resolver.run.mjs`（运行器，含动态 import）+ `check-resolver.test.mjs`（8 条） | 按 unplugin-vue-components 契约用 `dist/resolver.js` 的**实际返回值**驱动最小 Vite 构建，断言「基础层仅一份 + 组件样式在 + **未引入组件样式不混入**」；拆分原因：动态 import 会被 Vite import-analysis 注入 `/@vite/client`，带 shebang 的模块在 vitest 下解析失败 |
| 裸 Node 冒烟适配 | **新增** `scripts/release/css-stub-loader.mjs`、`register-css-stub.mjs`；`check-build.mjs` | `css.inject` 后产物含 CSS import，裸 Node 无法加载；冒烟用 loader 把 `.css` 短路为空模块（**不替代** §2 的正向断言与消费侧实测） |
| `check:nuxt` 断言（D6） | `scripts/release/check-nuxt.mjs`、`check-nuxt.test.mjs` | 新增 3 条标记：「基础层 token 已注入」「基础层根类已注入」「**主题覆盖晚于基础层**」（顺序断言，依赖层叠原理） |
| 文档口径 | `docs/design/architecture.md`（§3 / §4 决策反转留痕 / §5）、`README.md`、`docs/guide/{getting-started,local-linking,release,primevue-migration}.md`、`docs/standards/development.md`、`docs/design/{theming,design-spec}.md`、`docs/components/{confirm-dialog,toast}.md` + `docs/i18n/en-US/**` 对应 5 处 | 入口语义、构建形态、基础层必须显式提供、子路径导出清单、故障排查项、裸 Node ESM 限制 |
| 记录 / 工具链 | **新增** 本记录；`docs/design/governance/index.md`、`docs/plan/todo.md`、`docs/plan/backlog.md`；`eslint.config.js`（ignores 补 `.temp/**`，避免 `check-resolver` 夹具被当源码扫描）；就地更正 M1-1 / M1-2 记录 | 索引与规划状态同步；两处结论更正 |

## 3. 验证结果

| 项 | 结果 |
| --- | --- |
| `pnpm build` | 337 文件 / 715.21 kB；基础层 `dist/styles/index.css` 5,640 B |
| `pnpm test` | **1384 passed**（含新增断言单测） |
| `pnpm check:build` | 通过；**负向验证**：临时删除 `dist/index.js` 首行 CSS import 后报错 `dist/index.js 未保留 CSS import（css.inject 未生效？）`（判别力成立，已还原） |
| `pnpm check:resolver` | **通过**：resolver 注入生效，产物 CSS 含组件样式与基础层各一份；**负向验证**：把 resolver 的 `sideEffects` 置空后重建 → 报 `产物 CSS 缺少基础层 token（--caomei-color-bg:）——resolver 的 sideEffects 未生效`（exit 1），已还原；另有 8 条单测覆盖基础层 0 份 / 重复 / 未引入组件混入 / 期望值无法派生 四条失败路径 |
| `pnpm check:nuxt` | 通过（含 3 条新增标记，顺序断言成立） |
| `pnpm verify` | **exit 0**（lint / lint:css / lint:md / typecheck / typecheck:docs / test / build / check:build / check:resolver / check:nuxt / docs:build / i18n-routing / governance） |
| `npm pack --dry-run` | **341 文件 / 750.5 kB unpacked**（基线 11 文件 / 676 kB） |

### 3.1 Nuxt 侧（模块注入 theme + 组件样式自带）

- 产物 CSS：基础层 `--caomei-color-bg:` **9 处**（= 基础文件自身数量）、`--caomei-color-primary: #123456` **1 处**且**晚于基础层**、`.caomei-button` 63 处、`.caomei-root` 1 处；
- 重复检查：`#2563eb` 产物 2 处 = `dist/styles/index.css` 自身 2 处 → **基础层仅一份**。

### 3.2 消费侧（**真实包布局**：tarball 解包进 `node_modules` + Vite 构建）

| 消费形态 | 产物 CSS | 内容判定 | gzip |
| --- | --- | --- | --- |
| 仅根导入 `import { CaomeiButton } from 'caomei-ui'` | 7,536 B | 组件样式在（`.caomei-button` 63 / `.caomei-badge` 34）；**基础层 0 命中** | 1.48 KB |
| **resolver 路径**（`check:resolver`：按 resolver 返回的 `from` + `sideEffects` 驱动） | — | 组件样式在 + 基础层 `--caomei-color-bg:` **9 处（一份）** | — |
| 手写等价：根导入 + `import 'caomei-ui/theme.css'` | 13,176 B | = 7,536 + 5,640，基础层 `:root` 1 处 → 只有一份 | 2.34 KB |
| 对照：旧形态全量 `styles.css` | 167,585 B | — | 25.60 KB |

## 4. 取舍、风险与已知限制

### 4.1 更正：基础层不随根导入携带

M1-1 §3.2 与 M1-2 §3 曾写「Vite 消费者从包根命名导入时生效（产物含 tokens / 预设）」——以真实包布局复测判定为**误**：仅根导入的 7,536 B 产物中 `:root` 0 命中、`--caomei-color-bg:` 0 命中。两处记录已就地更正。

### 4.2 更正：该现象按打包器而异，不得泛化

Review Gate 独立复测发现：**esbuild** 下基础层**仍被保留**（`--caomei-color-bg:` 9 命中），与 Vite / rolldown 系相反。故相关表述统一限定为「**实测 Vite / rolldown 系**（与 Nuxt 侧一致）」，并在 [架构设计 §3](../architecture.md) 同步该限定。

### 4.3 已知限制与残留（已披露）

| 项 | 说明 |
| --- | --- |
| 裸 Node ESM 不能直接加载产物 | 产物携带 CSS import，Node 无法加载 `.css`；不经打包器的 Node 脚本 / 裸 SSR 不可用（Vue 应用与 Nuxt 经打包器，不受影响）。冒烟用 loader 适配，并在快速上手（中英）披露 |
| 基础层必须显式提供 | 组件样式随模块自带，但 tokens / 暗色 / 预设不会随 JS 图携带（Vite / rolldown 系）。已由 resolver（默认注入 `theme.css`）与 Nuxt 模块（`injectStyles: true`）覆盖推荐路径；**手写导入须自行 `import 'caomei-ui/theme.css'`** |
| `AGENTS.md` 残留旧入口 | `AGENTS.md` 第 57 行仍列 `caomei-ui/styles.css`；该文件受保护（其 §9.1 要求用户明确指示方可修改），**本轮未改**。需用户授权同步为 `caomei-ui/theme.css`（或保留并另行登记） |
| 发布体积结构 | tarball 文件数 11 → **341**、解包 676 → **750.5 kB**；主体为逐模块 JS/DTS 与 **74 个含 SFC scope hash 的 CSS**（M1-1 §3.1 已说明该类文件名属包内相对导入、非 `exports` 目标） |
| 未覆盖 | webpack / rspack 未实测；未验证「CSS-only」纯 `<link>` 场景（方案 A 已放弃单体聚合）；`presets/*.css` 未拆分（依 D4） |
| 负向判别力未固化 | `check:resolver` 的「清空 `sideEffects` → 重建 → 报错」目前为人工重演（本次已实测）；建议后续固化为可重复脚本或 CI 手检项（follow-up） |
| CHANGELOG 披露路径 | `CHANGELOG.md` 由 semantic-release 生成，故入口变更（`./styles.css` → `./theme.css`）以**提交信息带 `BREAKING CHANGE:`** 披露 |

## 5. 与 M1-2 待验项 / D6 的对应

| 待验项 | 本章处置 |
| --- | --- |
| ① 消费方 `dts` 解析 | M1-2 已验（bundler / node16 双模式）；本阶段 `verify` 的 `typecheck` / `typecheck:docs` 复跑通过 |
| ② 入口语义 | D1~D5 落地（§2）并写入架构设计 §3 / §4 / §5 |
| ③ Nuxt 双注入与顺序 | 实测无重复、覆盖生效且后置（§3.1）；注入目标与注释已固定 |
| D6 `check:nuxt` 断言增强 | **两条均已落地**：「基础层 token / 根类存在」+「主题覆盖晚于基础层」的顺序断言（§2） |

## 6. 证据声明

- 机检：`pnpm test`（1376）、`pnpm verify` exit 0（含 `docs:check`：integrity / links / line-count）、`npm pack --dry-run`；
- 实测：Nuxt 产物 CSS 计数（§3.1）、真实包布局 Vite 构建（§3.2）、`check:resolver`、`check:build` 负向验证（§3）；
- 未留痕项：未产出独立浏览器验证记录（改动为构建形态与入口，无组件视觉变更；`check:nuxt` 覆盖 SSR 产物标记）——像素级回归属常驻 E2E 范畴（Backlog 候选）。
