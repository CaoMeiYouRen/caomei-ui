# RichTextEditor 工具栏下拉菜单左侧留白归因（宿主文档站样式泄漏）

> 触发：用户 2026-10-02 报告「RichTextEditor 工具栏的下拉框前面有一小部分空白」，要求判定该留白来自 `md-editor-v3` 自带样式还是本项目样式覆盖（附截图）。
> 性质：**非阶段条目**（用户直接指令为授权锚点；当前无进行中阶段，见[待办事项](../../plan/todo.md)）。**本轮只做归因、不做修复**——修复候选按规划规范 §3 登记 [Backlog](../../plan/backlog.md) §1.6，等用户决策。
> 范围载体：[富文本编辑器组件](../../components/rich-text-editor.md)、`md-editor-v3@7.1.0` 自带样式、`vitepress@1.6.4` 默认主题样式、文档站演示页的 `.vp-doc` 正文作用域。

---

## 1. 结论

**不是 caomei-ui 组件的样式覆盖。** 留白由两段叠加而成，主要来源是**文档站宿主的正文列表样式泄漏进内核浮层**：

| 段 | 值 | 归属 |
|:---|:---|:---|
| `.md-editor-menu` 左边框 | 1px | `md-editor-v3` 自带 |
| `.md-editor-menu` 的 `padding-left` | **20px** | **文档站 VitePress 默认主题**（`.vp-doc ul, .vp-doc ol { padding-left: 1.25rem }`） |
| `.md-editor-menu-item` 的 `padding-left` | **10px** | `md-editor-v3` 自带（`.md-editor-menu-item { padding-inline: 10px }`） |
| 合计：下拉外框左缘 → 首项文字左缘 | **31px**（= 1 + 20 + 10） | — |

组件侧零参与：`src/components/rich-text-editor/rich-text-editor.vue` 的样式块只有 `.caomei-rich-text-editor`、`.caomei-rich-text-editor__status` 与 `:deep(.md-editor) { border-radius; border-color }` 三条，**不含任何菜单 / 下拉相关声明**。换到不含 `.vp-doc` 的下游应用时，同一菜单只剩内核自带的 1px 边框 + 10px 内边距（即内核对齐后的默认形态；**该下游表现为推断，未实测**，见 §4）。

---

## 2. 取证

### 2.1 复现环境

| 项 | 取值 |
|:---|:---|
| 页面 | 文档站演示页 `/components/rich-text-editor`（`<demo vue="../examples/rich-text-editor/basic.vue" />`，渲染在 `.vp-doc` 内） |
| 服务 | `npx vitepress dev docs --port 5199`（`vitepress@1.6.4`） |
| 浏览器 | Playwright 捆包 Chromium（`@playwright/test@1.63.0`），视口 1280×900；容器内 root 运行需 `--no-sandbox --no-zygote --disable-dev-shm-usage` |
| 内核 | `md-editor-v3@7.1.0`（devDependency） |
| 快照 revision | `135d632` |
| 测量手法 | 菜单 `<ul>` 常驻 DOM（仅加 `.md-editor-dropdown-hidden`），故**无需悬停**即可读计算样式；另悬停「图片」工具栏项截图核对与用户截图一致后写入结论 |

测量脚本为一次性工具，取数后已删除（不进仓库）。**说明**：本记录只做机制归因，未改动任何 `src/**`、`docs/.vitepress/**` 与测试。

### 2.2 实测值（真实 Chromium 计算样式）

| 元素 | 属性 | 实测 |
|:---|:---|:---|
| `.md-editor-menu`（`ul`） | `padding-left` / `padding-inline-start` | `20px` |
| `.md-editor-menu` | `padding-right` | `0px` |
| `.md-editor-menu` | `margin-top` / `margin-bottom` | `16px` |
| `.md-editor-menu` | `list-style-type` | `disc` |
| `.md-editor-menu-item`（`li`） | `padding-left` / `padding-right` | `10px` / `10px` |
| `.md-editor-menu-item` | `list-style-type` | `none`（故 `ul` 的 `disc` 未渲染出项目符号） |
| `.md-editor-menu-item`（第 2 项） | `margin-top` | `8px` |

几何（同一帧）：`ul` 外框 `x = 815`、宽 `90px`、高 `98px`；第 1 个 `li` 的 `x = 836`；首项文字左缘 `x = 846`。即 815 → 846 = **31px**。

### 2.3 命中 `.md-editor-menu` 且声明了内边距 / 外边距 / 列表样式的规则（CSSOM 枚举，逐条列出）

| 选择器 | 声明 | 特异性 | 来源 |
|:---|:---|:---|:---|
| `ol, ul` | `list-style: none; margin: 0; padding: 0` | (0,0,1) | VitePress 默认主题 `base.css` 重置 |
| `.vp-doc ul, .vp-doc ol` | `padding-left: 1.25rem; margin: 16px 0` | **(0,1,1)** | VitePress 默认主题 `components/vp-doc.css` |
| `.vp-doc ul` | `list-style: disc` | (0,1,1) | 同上 |
| `.md-editor-menu` | `margin-block: 0; margin-inline: 0; padding-block: 0; padding-inline: 0` | (0,1,0) | `md-editor-v3/lib/style.css` |

同类纵向声明：`.vp-doc li + li { margin-top: 8px }`（VitePress 默认主题 `components/vp-doc.css`），命中下拉的第 2 / 3 项。

### 2.4 DOM 链（说明为什么宿主样式能命中内核浮层）

下拉**未做 teleport**，仍是文档正文的后代节点：

```
ul.md-editor-menu
└ div.md-editor-dropdown-overlay
  └ div.md-editor-dropdown.md-editor-dropdown-hidden
    └ div.md-editor-toolbar-left
      └ div.md-editor-toolbar → div.md-editor-toolbar-wrapper
        └ div.md-editor.caomei-rich-text-editor__editor
          └ div.caomei-rich-text-editor
            └ div.demo-stack
              └ section.vitepress-demo-plugin-preview.vp-raw
                └ … → div.vp-doc._components_rich-text-editor
                  └ main.main → …
```

### 2.5 复算命令

```sh
# 1) 本库与文档站主题均无菜单 / 下拉覆盖（快照 135d632，输出应为空）
git grep -n "md-editor-menu\|md-editor-dropdown" 135d632 -- src/ docs/.vitepress
# 2) 内核自带菜单样式（md-editor-v3@7.1.0）
grep -n -A4 "md-editor-menu" node_modules/md-editor-v3/lib/style.css
# 3) 文档站宿主正文列表样式（vitepress@1.6.4）
grep -n -A4 "vp-doc ul" node_modules/vitepress/dist/client/theme-default/styles/components/vp-doc.css
```

---

## 3. 机制

1. **特异性落败**：内核用 `.md-editor-menu { padding-inline: 0 }`（0-1-0）声明「菜单列表自身不带内边距」，但 VitePress 的 `.vp-doc ul`（0-1-1）优先级更高，`padding-left: 1.25rem` 胜出 → 列表被额外顶入 20px。VitePress 自带的 `ol, ul { padding: 0 }` 重置是元素级（0-0-1），同样输给 `.vp-doc ul`，起不到抵消作用。
2. **作用域未隔离**：文档站把演示组件直接渲染在 `.vp-doc` 正文容器内，而 `.vp-doc` 的正文排版规则是**后代选择器**（不区分是否为第三方组件内部节点）；下拉又未 teleport，于是被一并命中。组件库侧未做防御性样式（本库对内核的覆盖面有意收敛在容器圆角 / 描边，见[富文本编辑器组件页](../../components/rich-text-editor.md)「依赖与样式定制」）。
3. **内核自身另有 10px**：`.md-editor-menu-item { padding-inline: 10px }` 是内核的既定设计，两条叠加即 31px 观感。
4. **同源纵向效应**：`.vp-doc ul { margin: 16px 0 }` 与 `.vp-doc li + li { margin-top: 8px }` 让下拉比内核设计更松（实测第 2 项 `margin-top: 8px`），属同一根因的第二表现面。

---

## 4. 边界与未覆盖

- **未覆盖面：下游应用**。本次实测只在文档站进行；不含 `.vp-doc` 的下游页面上，留白应只剩内核自带的 1px + 10px（由 §2.3 命中规则集合与 §1 的组件样式实况推断，未做下游侧实测）。
- **未覆盖面：其他宿主排版体系**。任何对 `ul` / `li` 施加纯度高于 (0,1,0) 的全局正文样式的宿主（如带 prose 样式的文章页）都可能复现同类泄漏；本条只给出机制与判据，不宣称已穷尽宿主形态。
- **未覆盖面：其他内核浮层**。仅核查「图片」下拉；内核的标题 / 表格 / katex 等下拉与 `ul.md-editor-menu` 同构，机制同源但未逐个实测，故不进本记录的实测清单。
- **未做处置**：本轮不改 `src/**`、不改文档站主题、不改内核样式，也不新增守卫或测试——修复归属（文档站作用域隔离 vs 组件层防御性覆盖）属用户决策项，已在 [Backlog](../../plan/backlog.md) §1.6 登记。

---

## 5. 处置状态

| 项 | 状态 |
|:---|:---|
| 归因 | **完成**（本记录 §1~§3） |
| 修复 | **未执行**（用户本轮只要求归因；按规划规范 §3 默认路径不自动升级为阶段条目） |
| 候选登记 | [Backlog](../../plan/backlog.md) §1.6「文档站正文列表样式泄漏进第三方内核浮层」 |
| 待决策项 | 修复层归属：① 文档站作用域隔离（把 `.vp-doc` 正文列表样式收窄到正文选择器，或为内核浮层还原列表内边距）；② 组件层防御性覆盖（`CaomeiRichTextEditor` 以 `:deep()` 复位菜单内边距）。裁定后另立修复条目 |

---

## 6. 留痕面

- 本记录 + [治理索引](./index.md) 条目 + [Backlog](../../plan/backlog.md) 候选行 + 提交历史；`.session/current-task.yaml` 于收尾时同步（本批为非阶段条目，见文首「性质」）。
