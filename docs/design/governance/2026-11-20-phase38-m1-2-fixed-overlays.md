# Phase 38 M1-2 交付记录：固定定位件接入与 `dvh` 回退

> 创建时间：2026-11-20
> 范围与验收口径的唯一载体：[Phase 38 登记批次](./2026-11-20-phase38-registration.md) §2 M1-2。本记录只承载实现机制、验证证据与 Review Gate。

## 1. 实现

- **Drawer**（`src/components/drawer/drawer.vue`）：四个方向按开合方向把安全区 token 叠在**贴边侧内边距**上（left → `padding-left`、right → `padding-right`、top → `padding-top`、bottom → `padding-bottom`，均为 `calc(var(--caomei-space-4) + var(--caomei-safe-area-*, 0px))`）。左右向面板满高贴视口，纵向两端同样叠加 `padding-top` / `padding-bottom`，避免标题压进状态栏、底部操作区压进 home indicator。面板本身仍贴视口边，不按安全区收缩宽度 / 高度，左右向抽屉尺寸因此不随横屏圆角漂移；内边距落在滚动容器之外，内容滚到末段时不会压进安全区。上下向高度保持 `min(90vh, …)`，在 `@supports (height: 100dvh)` 内改用 `min(90dvh, …)`——`check:design` 禁止同规则重复声明，故回退走 `@supports` 而非重复属性。
- **Dialog / ConfirmDialog**（`src/components/dialog/dialog.vue`、`src/components/confirm-dialog/confirm-dialog.vue`）：`max-height` 保持 `85vh`，在 `@supports (max-height: 85dvh)` 内改为 `85dvh`；面板居中几何不变。登记口径只要求高度上限跟随动态视口，故不加安全区内边距。
- **Toast**（`src/components/toast/toast.vue`）：六个停靠位中**上三档**的 `top`、**下三档**的 `bottom` 叠加同侧安全区 token；左右偏移与宽度不叠加（横向避让留给消费方覆盖 `--caomei-toast-offset`）。视口 `max-height` 在 `@supports (height: 100dvh)` 内改用 `100dvh` 并扣除上下安全区。
- **BackTop**（`src/components/back-top/back-top.vue`）：`right` / `bottom` 在 `--caomei-back-top-{right,bottom}` 之上叠加同侧安全区 token。
- **Image preview**（`src/components/image/image.vue`）：预览内容与图片的两轴上限改为扣除安全区（`90vw - left - right`、`90vh|90dvh - top - bottom`，高度同理在 `@supports` 内切到 `dvh`）。关闭按钮**不叠加** token：面板已按安全区收缩并居中，按钮相对面板右上角固定 `--caomei-space-2` 即可（叠加会在面板内多内缩一层，Review Gate RG-W03）。
- **零差异口径**：四类 token 默认 `env(safe-area-inset-*, 0px)`，桌面且未声明 `viewport-fit=cover` 时为 `0px`；所有叠加均为 `calc(原值 + 0px)`，逐值等于改动前，故计算样式与视觉基线不动（§2 的 `capture:styles` 读数为证）。下面是新 `safe-area` 覆盖生效（34px）的情形，不是默认态。
- **文档**：中英移动端指南「安全区」节各补一条，写明固定定位件已内置消费 token、无需再套工具类，以及 `dvh` 的适用范围。
- **夹具与 E2E**：`test/e2e/fixtures/app.vue` 新增 `#safe-area-fixed`（左 / 上两向抽屉 + 40 段长内容底部抽屉），`test/e2e/safe-area-fixed.e2e.ts` 运行期把四个 token 覆盖为 `34px` 后逐件断言（8 例 × mobile / tablet / desktop 三档）。其中「`dvh` 回退以 `@supports` 声明」一例读 **CSSOM**：断言 6 处 `dvh` 声明都在 `CSSSupportsRule` 内、基础规则仍保留 `vh` 值、非 `@supports` 规则里不出现 `dvh`——静态视口下 `dvh == vh`，只靠计算值无法发现回退结构被删。

**文件面**：`git status --porcelain -uall` 读数 **13**（改动 11 + 新增 2）；扣除同批收口载体 3（本记录 / 索引 / `todo.md`）后实现面 **10 文件 / +418 行 / -12 行**（`drawer` +21、`image` +23/-4、`toast` +17/-6、`back-top` +7/-2、`dialog` +7、`confirm-dialog` +7、夹具 +63、E2E +271、中英指南各 +1），在[规划规范 §5](../../standards/planning.md) 的 10 文件 / 800 行内。逐文件行数以 `git diff --numstat` 与 `wc -l` 为准。登记估算 ≈8 未含 E2E 用例与中英指南，偏差在此登记。

## 2. 验证

- `pnpm lint:check` / `pnpm typecheck` → 通过。
- `pnpm exec stylelint "src/components/{drawer,dialog,confirm-dialog,toast,back-top,image}/*.vue"` → 通过；`pnpm lint:css:check` / `pnpm lint:md:check` → 通过。
- `pnpm exec vitest run src/components/{drawer,dialog,confirm-dialog,toast,back-top,image}` → 7 文件 / 159 例全部通过（happy-dom 无布局引擎，几何契约由 E2E 承担）。
- `pnpm capture:styles` → **0 差异：399 项逐属性与冻结基线一致**（桌面 1280×800，token 回落 `0px`）。5 次复跑中 2 次报 `trigger.split-button-menu.closed` 的 tooltip `aria-describedby` 差异（与本批 CSS 无关的装置时序抖动），复跑归零。
- `pnpm exec playwright test test/e2e/safe-area-fixed.e2e.ts` → **24 / 24 通过**（desktop 8 + mobile 8 + tablet 8）。
- `pnpm governance:check` → 全链通过（`check:design` 的「无同规则重复声明」检查促成本批改用 `@supports`，而非重复 `max-height` / `height`）。
- **负向验证 1**：把 BackTop 的 `bottom` 临时改回不带安全区的 `var(...)` → `BackTop 右下偏移叠加安全区` 1 例失败，还原后恢复通过。
- **负向验证 2**：完整删除 Drawer 的 `@supports (height: 100dvh)` 块 → 仅 `dvh 回退以 @supports 声明` 1 例失败（几何类用例在静态视口下 `90vh == 90dvh`，仍通过），还原后恢复通过。
- 回归交叉：`drawer-convergence` / `overlay-interaction` 桌面档 7 例全通过。

## 3. Review Gate

**结论：Pass**（R1 `standard`，2026-11-20，0 blocker / 4 warning / 3 suggest；实测用时约 **2 分 59 秒**，未超 `standard` 档 ≤10 分钟时间盒）。R1 的 4 条 warning 已同批收口，suggest 处置见下；R2 delta 复核见本记录 §3.2。

### 3.1 R1 处置

- **RG-W01**（交付记录文件面与行数不可复算）→ 按 `git status --porcelain -uall` / `git diff --numstat` / `wc -l` 实测重写：全量 13 文件、实现面 10 文件 / +418 / -12，并注明载体 3 件不计入实现面。
- **RG-W02**（左右向抽屉只补贴边侧，顶 / 底仍压状态栏与 home indicator）→ left / right 面板补 `padding-top` / `padding-bottom` 的安全区叠加；E2E 四向用例对左右向追加两条纵向断言。
- **RG-W03**（Image preview 关闭按钮重复让位）→ 关闭按钮恢复 `--caomei-space-2`；E2E 断言改为 `8px`；中英指南与 §1 措辞同步收窄为「按四周安全区收缩可用边界」。
- **RG-W04**（`dvh` 分支无判别力）→ 不走源文本契约测试，改在 E2E 读 CSSOM 断言「`dvh` 仅在 `@supports` 内、基础规则保留 `vh`」；负向验证见 §2 第 2 条。
- **RG-S01**（索引摘要复述门禁读数）→ 索引去掉实例数，改为「三档视口逐件断言」。
- **RG-S02**（§4 的「见 §3 交接项」悬空）→ 本节补齐 R1 处置与交接，§4 改指真实条目。
- **RG-S03**（`todo.md` 先于 Gate 标记）→ 状态切换随本次提交同批落地，审计结论已为 Pass。

### 3.2 R2 复核

**结论：Pass**（R2 `quick`，2026-11-20，仅查 R1 修复点；实测约 **3 分钟**，在 ≤5 分钟时间盒内）。RG-W01 ~ RG-W04 与 S01 / S02 全部关闭。R2 另指出两处文档残留，已同批收口：

- 索引摘要仍写「关闭按钮偏移接入安全区」→ 已改为「两轴上限接入安全区」，与实现和 §1 一致。
- §3.2 占位符与 §4 承接项无落地链接 → 本节回填结论；§4 的两项写明承接方式（真机验收无条目、随阶段末执行；夹具遮挡建议另立条目、待裁定），不写成已登记。
- R2 对 §2「负向验证 2」的计数提出异议（删块后几何用例不应失败）→ 已按干净删除复跑修正为 1 例，证据见 §2。

## 4. 残留与后续

- `dvh` 与 `vh` 在静态视口下计算值相同，本批只能证明「回退结构存在且几何等于 `min(90%, 档位)`」；地址栏动态收起的真实差异无自动化条目，随阶段末真机验收执行。
- 既有 `test/e2e/back-top.e2e.ts` 的「滚动超过阈值显示、点击回顶并隐藏」在**干净 HEAD（`89f0fc6`，未含本批改动）**同样超时：两个 `BackTop` 夹具（阈值 50 与视觉基线 `threshold="-1"`）固定定位在同一坐标（1224, 744, 40×40），后渲染的视觉基线按钮拦截了前者的点击（该夹具添加于 `d81dc43`，2026-11-15）。与本批改动无关，未在本条目内处置（改动会混入无关逻辑）；建议另立修复条目，**当前未登记，需用户裁定**。
- `capture:styles` 采样面未新增「token 覆盖 34px」的具名条目——本批以 E2E 逐件断言代替；是否把安全区覆盖纳入冻结基线，留待阶段末评估（改动需同批更新 `capture.test.mjs` 的键预算）。
