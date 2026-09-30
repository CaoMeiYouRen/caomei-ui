# 组件画廊侧栏接入、RichTextEditor 独立分组与画廊卡片对齐修复

> 触发：用户 2026-09-30 报告三项体验问题（附截图）——① 组件画廊页未进侧栏；② RichTextEditor 作为「外部依赖 / 高级组件」应单独成组说明；③ 画廊卡片上（预览）下（文本）两部分在相邻卡片间未对齐。
> 性质：**非阶段条目**（用户直接指令为授权锚点；当前无进行中阶段，见[待办事项](../../plan/todo.md)）。留痕：本记录 + 治理索引 + `.session/current-task.yaml` + 提交历史。
> 范围载体：[文档与演示站 §11 / §16](../documentation-site.md)、中英侧栏（`docs/.vitepress/config.ts`）、中英组件总览页、画廊登记表、画廊渲染组件、侧栏不变式守卫（`scripts/docs/check-docs-structure.mjs`）。

---

## 1. 用户决策（两项结构口径）

| 决定项 | 取值 |
|:---|:---|
| 组件画廊在侧栏的落位 | 放**组件区**「总览」之后；**删除指南侧栏的旧条目**（入口唯一） |
| RichTextEditor 的形态 | 新建**第 7 个组件分组「高级组件 / Advanced」**（承载外部依赖内核类组件，当前仅 `RichTextEditor`），置于 6 个组件分组之后、能力说明之前 |

---

## 2. 交付

### 2.1 侧栏与分区（§11 从「6 组 + 头 1 / 尾 1」扩为「7 组 + 头列表 2 + 尾列表 1」）

- `docs/design/documentation-site.md`：§11 分组表新增「高级组件 / Advanced | RichTextEditor」行（表末 = 最终位次）、从「表单输入」行移除 `RichTextEditor`；非组件分组清单由「总览（前）+ 能力说明（后）」扩为「**总览 → 组件画廊 →** 7 个组件分组 **→ 能力说明**」并登记位次；§16 的「不进组件侧栏」口径**反转**为「进组件侧栏 + 入口唯一」，并写明侧栏不变式的对应扩展；顺带订正 §11 中「总览页成员无机检」的陈旧表述（该面由 `check:components-overview` 覆盖，无机的只是组件设计 §5 清单）。
- `docs/.vitepress/config.ts`：中英组件侧栏各加 `组件画廊 / Component Gallery`（「总览」后）与 `高级组件 / Advanced` 组（末尾组件组），并从「表单输入 / Form Inputs」移除 RichTextEditor；**中英指南侧栏删除** `组件画廊 / Component Gallery` 条目（入口唯一）。
- `docs/components/index.md`：引言「分为 6 组」→「7 组」；RichTextEditor 条目移入新的 `## 高级组件` 段（置于「导航与操作」之后、「能力说明」之前）。
- `docs/i18n/en-US/components/index.md`：两处列表（Translated component pages / Chinese documentation）中的 `RichTextEditor` 均移至**末位**，与 §11 登记顺序一致。
- `docs/.vitepress/showcase-registry.json`：RichTextEditor 的 `group` 改为 `{ zh: '高级组件', en: 'Advanced' }`，登记项移至表末（分组顺序 + 组内字母序口径不变）。

### 2.2 画廊卡片对齐（用户问题 ③）

- 根因：`.caomei-showcase__preview` 只声明 `min-height: 168px`，预览区高度**随演示内容变化**（`Card` 演示比 `Button` 高）→ 同一行卡片的「组件名 / 描述」起始线错开。
- 修复（两步）：① 预览区改为**固定 `height: 168px`**（溢出在预览区内滚动），并在样式内以注释钉住「该声明是承重声明」的理由；② 居中方式由 `align-items: center` 改为**安全居中**（`align-items: stretch` + `.caomei-showcase__stage { margin: auto }`）——R1 审计实测发现 `height` + center 组合会把高于容器的演示（Card / DataTable / RichTextEditor）**顶部推出可视区且永久不可达**（`stageTop` 分别为 −4.69 / −39 / −80.5px），改安全居中后顶部可达、`maxScroll` 完整（49 / 118 / 201）。
- V 阶段实测（真实 Chromium，修复前后同一夹具对照）：同行 `[Button, Card]` 的 `name` 起始线差 **zh 49.39px / en 77.39px → 0**；预览区高度由 `168 / 217~245` → **`168 / 168`**；卡片底边差与高度差均归零。超高演示顶部可达性由**新增的常驻 E2E** 锁定（见 §2.4）。
- **常驻回归（本批新增）**：`test/e2e/gallery.e2e.ts` 增用例「同行卡片对齐且溢出预览顶部可达、可滚到底」——断言同一网格行的 `name` 起始线与预览区高度唯一、且每个溢出预览在 `scrollTop = 0` 时 `stageTop ≥ 0` 与 `maxScroll > 0`（把本批痛点与 R1 回归一并变成护栏；`pnpm test:e2e:gallery` 覆盖，断言 `docs:build` 产物）。

### 2.3 守卫与测试（不变式扩展）

- `scripts/docs/check-docs-structure.mjs`：首尾固定条目由「单头 + 单尾」扩为**头列表 / 尾列表**（`heads: [总览, 组件画廊]`、`tails: [能力说明]`），组件分组切片改用新助手 `componentGroupsOf()`；新增 `checkSidebarEdgesAgainstSection()`——**首尾条目名称须出现在 §11 正文**（防守卫白名单与登记章节脱钩）；组件条目数统计不再把画廊头计入组件条目。
- `scripts/docs/check-docs-structure.test.mjs`：夹具补入画廊头；新增「头列表条目缺失 / 指向错误」与「首尾白名单与 §11 正文对账」两组用例；仓库不变量断言 `tableGroups === 7`。
- `scripts/docs/check-showcase-registry.test.mjs`：仓库不变量断言同步为 7 组（其余对账全部由 §11 表驱动，无需改动）。

---

## 3. 质量门

| 项 | 实测 |
|:---|:---|
| `pnpm verify` | **exit 0**（102 文件 / **2126 例**；较上批 +2 = 本批新增守卫用例） |
| `docs:check` | **11 段全绿**（`pnpm docs:check`）；其中**稳定项**：structure **侧栏 7 组 / 48 个组件条目**、showcase **14 项 / 覆盖 7 个分组**、config-links 162 条、parity 60 对。**md 类计数随文档增删变化（含本记录自身），故不在本记录复写**——需要时以该命令输出为准（同批口径见 [归档批次记录](./2026-09-30-phase17-archive.md) §8 的单点来源约定） |
| `governance:check` | exit 0 |
| `capture:styles` | **245 项 0 差异**（画廊样式属文档站主题，不在采样面；无组件样式改动） |
| `test:a11y` | 59 例（该套件受检面为 `src` 组件；本批只改文档站主题组件与配置，未新增 / 修改受检组件，故沿用既有结果） |

---

## 4. 边界与未覆盖

- **画廊卡片对齐 / 可达性的守卫形态**：已由**常驻 E2E**（`test/e2e/gallery.e2e.ts` 新用例）锁定为回归护栏；仍缺的是「文档站主题 CSS 的**声明层** lint / 契约」覆盖（`docs/.vitepress/theme/**` 不在 stylelint 受检面内，该缺口在 [Backlog](../../plan/backlog.md) §1.6「文档站主题 CSS 的 lint 覆盖」在册，本批未扩张）。
- **§5 组件清单未按新分组重排**：`docs/design/components.md §5` 是 **Tier 分层**清单（非侧栏分组），RichTextEditor 行保持原位；其行内已标注「可选 peer 依赖」。
- 未触及：`RichTextEditor` 组件实现、示例、组件页正文；指南侧栏其余条目。

---

## 5. Review Gate

两分区并发审计（§3.2：分区 A 规划 / 对外文档载体；分区 B 守卫、渲染修复与验证证据），各 `standard`、时间盒 10 分钟。

- **R1**：分区 A **`Reject`**（1 blocker：`documentation-site.md §11` 末段把「组件清单对账已在 Backlog 在册」当作既成事实，但 Backlog 并无该候选——改写陈旧表述时把旧句式套到了新对象上；另 3 warning + 2 suggest）；分区 B **`Reject`**（1 blocker：**本批修复引入的渲染回归**——固定高度配合 `align-items: center` 会把高于容器的演示顶部推出可视区且**永久不可达**，实测 `stageTop`：Card −4.69 / DataTable −39 / RichTextEditor −80.5px；另 1 warning + 3 suggest）。合并取最严 = `Reject`。
- **修复**：① Backlog 新增「组件设计 §5 组件清单对账」候选行（使 §11 指针落地）；② §11 末段收尾句与守卫枚举同步（唯一无机检面只剩 §5）；③ 画廊预览区改**安全居中**（`align-items: stretch` + `.stage { margin: auto }`）并新增**常驻 E2E**（`test/e2e/gallery.e2e.ts`：同行对齐 + 溢出预览顶部可达 / 可滚到底，zh/en 各 1 条）；④ 守卫补 `sidebar-edge-config-empty`（heads / tails 全空不得平凡通过）并钉住「英文名须出现在 §11 正文」的契约；⑤ `check-components-overview` 注释口径 6 组 → 表驱动；⑥ 记录质量门改「稳定项 + 复算命令」、`test:a11y` 措辞订正、§2.1 标题口径订正；⑦ en 总览第二处列表顺手补回缺失的 `CheckboxGroup`（既有缺口）。
- **R2**（`standard`，仅复审修复点）：**`Pass`**——R1 两个 blocker 与其余 warning / suggest 除「`.session` 留痕」外全部闭合且经独立实测复现；R2 新提 2 条 suggest（§11 收尾句旧句式、索引摘要漏记安全居中步骤）**已同批收口**；B1 判别力经负向对照验证（注入原缺陷组合后新 E2E **必失败**：Card −4.69 / −18.69、DataTable −39、RichTextEditor −80.5）。`.session` 留痕为**提交硬前置**，已在收尾时落地（见 §6）。
- 用时：R1 发起 `11:35:37Z`（两分区并发返回）；R2 发起 `12:11:10Z`、审计方自报上界约 14–15 分钟（含 `docs:build` + 全量测试 + gallery E2E + 真实 Chromium 量测），超 10 分钟 soft 盒，作为审计分级校准信号记录。

## 6. 留痕面

- 本记录 + [治理索引](./index.md) 条目 + 提交历史；`.session/current-task.yaml` 与 `runtime-state.json` 于提交前同步（本批为非阶段条目，见文首「性质」）。

---

## 7. 规模（唯一口径）

- **口径**：`git diff eea4746..<本批提交> --numstat`（base = 本批起点提交 `eea4746`；含本记录）。数字在提交后由回填写入本行——记录自身内容与规模计数互相包含，故按仓库既有「回填提交号与规模口径」的做法延后测量。
