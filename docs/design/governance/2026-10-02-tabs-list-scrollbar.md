# TabList 多余纵向滚动条修复（触发器 -1px 越界 × overflow 轴计算）

> 触发：用户 2026-10-02 报告「Tabs 选项卡的导航中存在不必要的滚动条」（附 2 张文档站截图，箭头指向列表右侧的纵向滚动条；列表右侧仍有大段空白，与内容宽度无关）。
> 性质：**非阶段条目**（用户直接工作指令为授权锚点；当前无进行中阶段，见[待办事项](../../plan/todo.md)）。留痕：本记录 + [治理索引](./index.md) + [Backlog](../../plan/backlog.md)（顺带发现的指示条裁剪缺陷）+ `.session/current-task.yaml` + 提交历史。
> 范围载体：[Tabs 组件页](../../components/tabs.md)（中英）、`src/components/tabs/tabs-list.vue`、声明层契约与真实几何守卫、[开发规范 §7](../../standards/development.md)。

---

## 1. 根因

两条各自成立的声明相遇，产出一条本不该存在的滚动条：

| 位置 | 声明 | 原意 |
|:---|:---|:---|
| `tabs-list.vue` 列表基类 | `overflow-x: auto` | 长触发器列表横向滚动（窄屏必需） |
| `tabs-trigger.vue` 触发器 | `border-bottom: 2px solid` + `margin-bottom: -1px` | 2px 激活指示条压住列表 1px 下边框 |

1. **只声明一轴时另一轴被计算为 `auto`**：`overflow-x: auto` 会把另一轴的 `visible` 按 CSS overflow 计算规则改成 `auto`（实测：样式表里从未出现 `overflow-y`，计算值却是 `auto`）。
2. **触发器边框盒向下越出内容盒 1px**：`align-items: center` 的居中以外边距盒为准，而 `margin-bottom: -1px` 只压缩外边距盒、不压缩边框盒 → 触发器边框盒底边必然落在列表**内容盒**底边之下 1px（这正是「下划线压住下边框」所依赖的越界）。实测列表内容盒 36.594px，触发器边框盒 37.594px。
3. **两者相遇即 `scrollHeight > clientHeight`**：`scrollHeight` 38 / `clientHeight` 37 → 1px 可滚动纵向溢出 → 滚动条；滚轮落在列表上还会把内容顶起 1px。

列表本身**不需要**任何纵向滚动，故该滚动条是纯多余产物。

---

## 2. 取证

| 项 | 取值 |
|:---|:---|
| 页面 | 文档站 `/components/tabs`（基础用法 demo，3 个标签）与 E2E 夹具 `/` 的 `#tabs-horizontal` |
| 环境 | `vitepress@1.6.4` dev（本地端口 5199）+ Playwright 1.63.0 捆包 Chromium，1280×900；容器内 root 需 `--no-sandbox --no-zygote --disable-dev-shm-usage` |
| 快照 revision | `135d632` |
| 探针落盘 | `test-results/tabs-list-scrollbar/`（gitignored；`verify.mjs` + `report.json` + 截图） |

### 2.1 修复前（改动已在源码中撤销以复现，见 §3.4 负向对照）

| 观测量 | 修复前 | 修复后 |
|:---|:---|:---|
| 计算 `overflow-x` / `overflow-y` | `auto` / **`auto`** | `auto` / **`hidden`** |
| `scrollHeight` / `clientHeight` | 38 / 37 | 38 / 37（越界仍在，只是不再可滚） |
| 纵向滚轮后的 `scrollTop` | **1** | **0** |
| 横向滚轮后的 `scrollLeft` | 240（横向能力正常） | 240（不变） |
| 横向溢出 | 文档页 `scrollWidth == clientWidth`（582）——**与横向溢出无关** | 同 |
| 三档视口 1280 / 768 / 390 | 均 `verticalOverflowPx = 1` | 同（纵向不可滚） |

### 2.2 像素级对照（激活项下方逐行颜色，1 CSS px = 1 行）

| 变体 | 行 480（指示条） | 行 481 | 结论 |
|:---|:---|:---|:---|
| 修复前（`overflow-y: auto`） | `rgb(37,99,235)` 主色 | `rgb(229,231,235)` 分隔线 | 与修复后逐值一致 |
| `overflow: visible` 负向对照 | 主色 | **主色**（指示条 2px、分隔线被盖住） | 证明 `-1px` 越界的设计意图 |
| 修复后（`overflow: auto hidden`） | 主色 | 分隔线 | **与修复前像素级一致** |

即：本修复**不改动任何像素**，只把「不可见但可滚」变成「不可见且不可滚」。

### 2.3 复算命令

```sh
# 1) 本仓 TabList 的全部 overflow 声明（快照 135d632，修复前只有 overflow-x）
git grep -n "overflow" 135d632 -- src/components/tabs
# 2) 触发器的越界来源
git grep -n "margin-bottom\|border-bottom" 135d632 -- src/components/tabs/tabs-trigger.vue
```

---

## 3. 交付

### 3.1 修复（一个声明 + 承重注释）

`src/components/tabs/tabs-list.vue`：列表基类的 `overflow-x: auto` 改为**成对**的 `overflow: auto hidden`，并补承重注释（机制 + 实测值 + 两道守卫的路径）；纵向覆盖块补注释钉住 `overflow: visible` 不可裁剪的理由（纵向指示条同样依赖 `margin-right: -1px` 的 1px 越界压住右边框）。

写作用简写而非两条长写：Stylelint 的 `declaration-block-no-redundant-longhand-properties` 要求合并；两轴取值因此直接可读（`<x> <y>`）。

### 3.2 声明层契约

`test/contracts/tabs-list-overflow.test.ts`（新增）：解析 `.caomei-tabs__list` 与纵向覆盖两个规则块的**有效两轴取值**（先 `overflow` 简写、后长写覆盖；解析前剥离注释，避免承重注释里的字样被当声明；取值含 `var()` 等不可判定形态时 fail-closed 返回 `null` → 用例失败），断言基类为「横向 `auto` + 纵向 `hidden`」、纵向覆盖为两轴 `visible`。

### 3.3 真实几何与用户滚动守卫

- `test/e2e/fixtures/app.vue` 新增 `#tabs-list-overflow`（定宽 `min(20rem, 100%)` + 现实长度文案 → 三档视口下横向必然溢出；含横向与纵向两个 TabList），并显式断言**夹具前置条件**（纵向 1px 可滚动溢出 + 横向溢出），否则断言无判别力。
- `test/e2e/tabs-list-overflow.e2e.ts`（新增，2 用例 × mobile / tablet / desktop = 6 tests）：
  - 横向列表：`overflow-x` 为 `auto`、`overflow-y` 不得为可滚动值；**行为断言**——纵向滚轮不得改变 `scrollTop`，横向滚轮仍须改变 `scrollLeft`（正对照，证明滚轮事件确实被投递并处理，避免纵向的「0」退化为恒真）。
  - 纵向列表：两轴计算值均为 `visible`（回归 `:where(.caomei-tabs--vertical)` 覆盖不被裁剪）。

### 3.4 判别力（负向对照）

| 对照 | 结果 |
|:---|:---|
| 契约测试：`git checkout -- src/components/tabs/tabs-list.vue`（还原修复前） | **1 failed / 1 passed**（失败点正是「缺纵向 `hidden`」；纵向覆盖断言不受影响，符合预期）→ 恢复后 2 passed |
| E2E：同上还原源码 | **3 failed / 3 passed**（横向用例在三个 project 全失败，失败于「纵向不得为可滚动值」；纵向用例不受影响）→ 恢复后 6 passed |
| E2E 行为断言的独立判别力 | 浏览器内注入 `overflow-y: auto`（等价修复前）：三档视口 `scrollTop` 均由 0 变 1；注入 `hidden` 后恒为 0（`test-results/tabs-list-scrollbar` 落盘同一手法） |

### 3.5 规范与组件文档

- [开发规范 §7](../../standards/development.md)：新增 TabList 轴对契约条（含机制与两道守卫）；并把「组件 scoped 规则不得为几何属性声明样式」一条改为**限定在「为单点封顶 / 裁剪」**并显式开例外——「作为组件契约的滚动容器轴对声明」允许，条件是成对声明 + 源码注释 + 契约守卫。原措辞与本组件既有的 `overflow-x: auto` 已互相矛盾，本次一并收口，避免仓库内并存两套口径。
- [Tabs 组件页](../../components/tabs.md)（中英）：样式定制节补「滚动行为」说明——列表是**横向**滚动容器（故不提供 `scrollable` / `showNavigators` 滚动导航按钮）、不出现纵向滚动条、纵向排布不滚动。

---

## 4. 边界与未覆盖

- **顺带发现的独立缺陷（未修，已登记）**：容器裁剪把「2px 指示条压住分隔线」变成「1px 指示条 + 下方仍是分隔线」——`overflow` 非 `visible` 时会在**内边距盒**处裁剪，触发器那 1px 越界被削掉；§2.2 的 `overflow: visible` 负向对照即设计意图的证据。修法属**视觉变更**（指示条视觉厚度 1px → 2px、激活项下方分隔线消失），按规划规范 §3 不擅自升级，已登记 [Backlog](../../plan/backlog.md) §1.1（候选：列表补 `padding-bottom: 1px` + 分隔线改内边距盒底边背景线，可保持总高与像素位置逐值不变）。
- **`capture:styles` 采样面不含 Tabs**：本批 `capture:styles` 262 项 0 差异**不构成**本组件的证据（该面未采样 TabList），故本次以「声明层契约 + 真实几何 / 滚动行为 E2E」承载回归；扩展采样面（含 `DECLARED_KEY_BUDGET` 与基线重冻结）不在本批范围。
- **未做下游实测**：下游应用（momei / dependfix）的装载形态未验证；结论基于本仓源码与文档站 / 夹具三处真实 Chromium 实测。
- **未逐一排查其它滚动容器**：本次只核查 TabList；同类「只声明单轴」写法是否存在于其它组件未做全库扫描（本批已把该口径写入开发规范 §7，后续新增滚动容器按规范核对）。

---

## 5. 质量门

> 计数口径：**易变计数不复写**——受版本控制的 md 数 / 代码区行数 / 记录数会随任意文档增删（含本记录与后续批次）漂移，故只保留稳定项并给出复算命令（同口径见 [画廊批次记录](./2026-09-30-showcase-nav-and-alignment.md) §3）。

| 项 | 实测 |
|:---|:---|
| `pnpm verify` | **exit 0**（lint:check / lint:css:check / lint:md:check / typecheck / typecheck:docs / test **104 文件 2157 例** / build / check:build / check:resolver / check:nuxt / docs:build / docs:check:i18n-routing / governance:check 全绿） |
| `pnpm test:e2e --workers=2` | **123 passed**（既有 117 + 本批 6，零回归） |
| `pnpm test:a11y` | 59 passed（受检面为 `src` 组件，本批未改组件语义 / 属性） |
| `pnpm capture:styles` | 262 项 0 差异（**限制见 §4**：采样面不含 Tabs） |
| `docs:check` | 11 段全绿（integrity **297** 受版本控制 md / links **299** md / structure 257 页 / interpolation 257 等） |
| `check:design` | 通过（组件样式规则 796 → **799** 条、声明 2669 → **2685** 条，均在预算内） |
| `check:governance-records` | OK（记录与索引双向一致、规划指针无失效；计数为易变项，以命令输出为准） |
| `check-docs-git-revision` | 通过（revision 全为持久 ref；md / 代码区行 / 命令数为易变项，以命令输出为准） |
| `governance:check` | exit 0（全链） |

---

## 6. Review Gate

单分区审计（未触发并发分区条件：核心改动集中在单个组件目录），`audit-depth` = **`standard`**（模块内逻辑 / 样式改动 + 守卫 + 文档，未触及发布、安全、鉴权、数据写入、运行时 / 发布配置、依赖版本或审计协议本身），时间盒 **≤ 10 分钟**，第 1 轮。

- **结论：`Pass`**（0 blocker / 1 warning / 2 suggest）。
- **审计方独立复核**：定向契约测试 `2 passed`、定向 E2E `6 passed`（三档各 2）、`check-governance-records` / `check-docs-git-revision` / `check-standards-redundant --strict` / `check-design` 全绿；并援引 MDN 确认 `overflow` 两值语法为「第一值 = x、第二值 = y」且「一轴 `visible`、另一轴非 `visible` / `clip` 时该轴计算为 `auto`」——即本记录与修复的语义前提成立。
- **无 blocker 的独立理由**：① 根因覆盖正确（x/y 顺序经真实 Chromium 计算值 + MDN 双重确认，纵向覆盖保持 `visible` 未被裁剪）；② 守卫有判别力且非恒真（E2E 硬断言夹具前置条件 + 横向滚轮正对照托住纵向 `scrollTop === 0`；契约测试对 `var()` / 单轴 / 超长多值一律 fail-closed）；③ 最低验证矩阵满足，`capture:styles` 不采样 Tabs 的边界已诚实声明、未被当作本组件证据；④ 夹具新 section 追加末尾、未进 `responsive.e2e.ts` 的 `CASE_SECTION_IDS`，全量 e2e 123 passed 零回归。
- **修复点（同批收口）**：warning「§5 计数为记录落盘前快照」→ 采纳：§5 改为**只保留稳定项**（易变计数一律不复写、给出复算命令，与 [画廊批次记录](./2026-09-30-showcase-nav-and-alignment.md) §3 的既有口径一致），从根上消除「记录自身参与计数」的漂移类；suggest「契约测试的基类规则正则只取首个匹配、对后置重复基类 fail-open」→ 改为行首锚定 + **断言规则块唯一**（并补负向对照：注入重复基类规则 → 用例失败、还原后通过）；suggest「规范示例用长写、源码用简写」→ 在 [开发规范 §7](../../standards/development.md) 契约条内写明可写简写 `overflow: auto hidden`（两值语法「横 纵」）及 Stylelint 会要求合并长写。
- **用时实测**：发起 `2026-10-02T01:01:13+08:00`（`date -Is`），审计工件落盘 `01:05:25` → 实测约 **4 分 12 秒**，**未超** 10 分钟时间盒。
- 工件：`artifacts/review-gate/2026-10-02-tabs-list-scrollbar.md`（本地态，gitignored）。

---

## 7. 留痕面

- 本记录 + [治理索引](./index.md) 条目 + [Backlog](../../plan/backlog.md) 候选行 + 提交历史；`.session/current-task.yaml` 于收尾时同步（非阶段条目，见文首「性质」）。

---

## 8. 规模与提交

- **规模**：**10 文件 / +466 −2**（口径：`git diff --cached --numstat` 逐文件实测，范围为本批 10 个文件；**含本记录自身与新增的两道守卫**）。逐文件：`tabs-list.vue` +14 −1 / `tabs-list-overflow.test.ts` +104 / `tabs-list-overflow.e2e.ts` +111 / `fixtures/app.vue` +78 / `development.md` +2 −1 / `tabs.md`（中）+2 / `tabs.md`（英）+2 / 本记录 +150 / `index.md` +2 / `backlog.md` +1。
- **提交**：`568b042`（本批 10 文件 / +466 −2；未推送）。本记录随该批提交，故哈希由本次回填提交补入。
