# Phase 12 M1 手动发布执行与发布后校验（0.2.0）

> 状态：发布执行与发布后校验记录（2026-09-22）。**结论**：`caomei-ui@0.2.0` 已手动发布到 npm（`latest` = 0.2.0），tarball 形态与预期一致（含 `dist/styles/index.css`、**不含**旧单体 `dist/styles.css`），干净目录安装与四项子路径导入冒烟通过。发布动作由用户在本地执行，本记录收口「版本基线 / 发布执行 / 发布后校验 / 状态同步」四项证据。

## 1. 版本基线与发布说明

| 项 | 实测值 |
| --- | --- |
| 版本 | `package.json` `version = 0.2.0`（提交 `80df3b4`） |
| CHANGELOG | `CHANGELOG.md` 含 `# [0.2.0]` 段（提交 `3ef4182`），并在 `### 💥 BREAKING CHANGES` 明示形态变更 |
| Tag | **annotated** tag `v0.2.0`（`git cat-file -t v0.2.0` → `tag`；`git rev-list -n 1 v0.2.0` → `80df3b4`） |

CHANGELOG 的破坏性变更原文（摘）：移除 `caomei-ui/styles.css` 子路径导出、改用 `caomei-ui/theme.css`（基础层）；产物不再提供单体全量样式、组件样式随模块自带；基础层需显式引入或由 resolver / Nuxt 模块注入；产物以打包器消费为前提，裸 Node ESM 不能直接导入。

**下游修复指引（本批补入[发布指南 §9](../../guide/release.md)）**：把 `import 'caomei-ui/styles.css'` 改为 `import 'caomei-ui/theme.css'`；resolver / Nuxt 模块注入点须唯一以免重复注入；裸 Node ESM 须经打包器或 CSS stub 加载器。

## 2. 发布执行（本地手动）

- 方式：本地 `npm publish`（按[发布指南 §3](../../guide/release.md) runbook；**未启用 CI 自动发布**，`release.yml` 发布步骤保持关闭）。
- 发布产物（发布日志摘录）：`caomei-ui-0.2.0.tgz`，package size **171.5 kB**、unpacked size **780.0 kB**、**345 文件**、shasum `d29c75bd42eba89444b5ab7731f25d5543baeb71`。
- 发布时刻（registry）：`0.2.0` → **2026-09-22T12:21:29.423Z**。
- 失败路径：指南 §4 现覆盖 `401`（凭据失效）、`403`（版本已发布过，须改发新 patch 而非 unpublish）、`prepublishOnly` 中止（无 tarball 产出）三类。

## 3. 发布后校验

### 3.1 registry 状态

- `npm view caomei-ui version` → `0.2.0`；`dist-tags` → `{ "latest": "0.2.0" }`。
- `npm view caomei-ui@0.2.0` → `dist.fileCount = 345`、`dist.unpackedSize = 779993`、`dist.shasum` 与发布日志一致；`exports` 键为 `.`、`./nuxt`、`./resolver`、`./theme.css`、`./package.json`（**无 `./styles.css`**）。

### 3.2 已发布 tarball 内容核对（从 registry 下载后核对，非本地重建）

- `npm pack caomei-ui@0.2.0` → 171,451 B；`tar -tzf` 核对：`package/dist/styles/index.css` **存在**（`theme.css` 的落点）、`package/dist/styles.css` **不存在**。
- 顶层文件：`LICENSE`、`THIRD-PARTY-LICENSES`、`README.en-US.md`、`README.md`、`package.json`（与 `files` 声明一致）。

### 3.3 干净目录安装 + 四项子路径冒烟

干净临时目录 `npm install caomei-ui@0.2.0 vue@^3.5.0`（成功），以本仓 `scripts/release/register-css-stub.mjs` 作为 CSS stub 加载器执行：

| 子路径 | 结果 |
| --- | --- |
| `caomei-ui` | 载入成功，**88 个导出** |
| `caomei-ui/resolver` | `CaomeiUiResolver` 为 function |
| `caomei-ui/nuxt` | `caomeiUiNuxtModule` 为 function（需安装可选 peer `@nuxt/kit@^4`，未装时报 `Cannot find package '@nuxt/kit'`，属预期） |
| `caomei-ui/theme.css` | 解析到 `dist/styles/index.css`（**5,880 B**），含 `--caomei-color-primary` 与 `.caomei-root` |

### 3.4 消费方打包冒烟（文档所声明的消费路径）

干净目录内以 Vite（`@vitejs/plugin-vue`）构建一个仅消费 `caomei-ui` + `caomei-ui/theme.css` 的最小应用：`vite build` 成功（2,738 modules），产物 CSS **12,203 B**（gzip 2.19 kB），含基础层（`caomei-root` ×1、`caomei-color-primary` ×30）与组件样式（`caomei-button` ×70）→ 打包器路径下「基础层 + 按需组件样式」均正确进入产物。

### 3.5 已知限制（复现确认）

- 裸 Node ESM `import('caomei-ui')` 报 `ERR_UNKNOWN_FILE_EXTENSION: .css`——`dist/index.js` 首行即 `import "./styles/index.css"`（`css.inject` 保留逐模块 CSS import）。该限制已在 CHANGELOG 破坏性变更段与发布指南 §9 声明；**不属缺陷**，消费前提为打包器或等效 CSS stub。

## 4. 已知偏差与观察项

- **tag 视图不含 0.2.0 的 CHANGELOG 段**：tag `v0.2.0` 指向版本提交 `80df3b4`，而 CHANGELOG 提交 `3ef4182` 在其后 → `git checkout v0.2.0` 得到的 `CHANGELOG.md` 尚无 0.2.0 段。[发布指南 §3](../../guide/release.md) 已规定正确次序（先提交「版本 + CHANGELOG」再打 tag），本次属执行次序偏差；已发布 tag **不重写**（指南 §8），故登记为观察项而非返工项。
- **CHANGELOG 存在空 `# Unreleased (2026-09-22)` 段**：生成器以 `outputUnreleased: true` 输出，无未发布提交时仍产出标题。属生成器健壮性候选，已登记 [Backlog](../../plan/backlog.md)。
- **`npm view` 偶发超时**：本次首次调用超时（>120s）、重试成功；记录口径以免误判为发布失败。

## 5. 状态同步

| 载体 | 同步内容 |
| --- | --- |
| 仓库根 `README.md`（VitePress 站外文件，按文档与演示站 §13 写成 code span） | 项目状态段：0.1.0（2026-09-19）→ 当前 0.2.0（2026-09-22，含破坏性形态变更与修复指引链接）；「当前最新版本」句改 `0.2.0` 并注明样式入口 |
| 仓库根 `README.en-US.md`（同上） | 同上（英文） |
| [快速上手](../../guide/getting-started.md) / [Getting Started](/en-US/guide/getting-started) | 版本号与样式入口口径同步（中英） |
| [发布指南 §4 / §9](../../guide/release.md) / [Release guide](/en-US/guide/release) | §4 补失败路径（403 版本已存在）；§9 补 0.2.0 破坏性变更、下游修复指引与消费前提（英文侧新增等价小节） |
| [路线图 §1](../../plan/roadmap.md) | 现状句：0.1.0 与 0.2.0 的发布事实与 `latest` 口径 |
| [待办归档](../../plan/todo-archive.md) | M1 交付与 Review Gate 结论（原 M1 状态行在阶段归档时移除，见 §7） |

## 6. 未覆盖边界

- 未做真实下游项目的接入验证（按 Phase 5 第二阶段决策后置，由下游迁移反馈驱动；回归机制属[路线图 Phase 8](../../plan/roadmap.md)）。
- 未验证 Nuxt 侧端到端（本记录只做 `caomei-ui/nuxt` 的模块工厂导入冒烟）；Nuxt 注入路径的完整验证由周期回归与本仓 `check:nuxt` 承担。
- 未做产物级的样式等价比对（该面由 M3-5 的计算样式取证装置与冻结基线承载）。
- registry 侧 `npm view` 的检索时间为 2026-09-22；下载的 tarball 与 shasum 已在本记录留痕，可复算。

## 7. Review Gate

- M1 批次（M1-1 / M1-2 / M1-3）经 `@code-reviewer` Review Gate **R1 Pass**（0 blocker / 2 warning / 1 suggest）；修复点 W01（状态行错位）/ W02（章节引用 §3→§4）已同批修正，记为「已修复未复审」。
- M1-2 为发布执行动作、无代码改动，**Gate 不适用**；M1-3 的 3 个文档提交（`fb0ac04` / `70c8e1f` / `d4c2753`）同批受审。
- 本结论为该批次唯一的可提交留痕（原结论随 `docs/plan/todo.md` 的 M1 状态行在阶段归档时移除）。

