# Phase 36 M2-3 交付记录：列宽持久化示例与契约说明

> 创建时间：2026-11-17
> 范围与验收口径的唯一载体：[Phase 36 登记批次](./2026-11-17-phase36-registration.md) §2 M2-3。本记录只承载示例形态、边界与验证证据。

## 1. 交付

- **新增示例**：`docs/examples/data-table/column-sizing-persist.vue` 与 `docs/i18n/en-US/examples/data-table/column-sizing-persist.vue`。
  - 挂载后从 `localStorage` 读取并恢复 `columnSizing`；点「保存」时写回；
  - 解析失败、越界（`60`–`480px`）、类型不符、缺字段一律回退默认值；
  - 存储不可用时降级为「仅本次会话生效」并提示；
  - 「默认 / 紧凑」预设与「恢复默认」演示写入与清除。
- **文档**：中英 DataTable 组件页「列宽调整与持久化」节各补一段说明并链接新示例；Phase 35 M2-2 的 `column-sizing.vue` 保持不变。
- **契约**：不新增公共 API；库内不写存储、不提供拖拽手柄（与既有「列宽交互由使用方实现」一致）。

## 2. 边界

| 边界 | 处置 |
|:---|:---|
| 存储键 / 默认值 / 越界策略 | 使用方职责，示例内自带并在注释与页面文案中标注 |
| `localStorage` 不可用（隐私模式 / SSR） | 读取失败回退默认值；写入失败只提示、不抛错 |
| 服务端渲染 | 读取放在 `onMounted`，SSR 首帧使用默认值，避免水合不一致 |
| 拖拽手柄 | 不在本示例范围（M2-1 承接） |

## 3. 验证

- `pnpm docs:check:example-refs` → OK：557 个 md / 445 处示例引用 / 424 个示例文件均存在且形态合法。
- `pnpm docs:check:i18n-parity` → OK：73 对页面全部对账。
- `pnpm typecheck:docs`（`vue-tsc -p docs/tsconfig.json`）→ 通过。
- `pnpm lint:md:check` / `pnpm governance:check` 全绿。
- **浏览器取证**（`vitepress preview` + Chromium，1280×800，中英两页）：示例已渲染、`.demo-stack` 计算样式 `display: flex` / `row-gap: 12px`、按钮组内 4 个按钮。
- 修复期间发现的渲染缺陷：两个 `<demo>` 块之间缺空行会被 Markdown 视为同一 HTML 块，第二个示例不渲染（构建无报错）——已补空行并在两页复验。

## 4. Review Gate

- **R1（`standard`）**：Reject —— 1 blocker（`.demo-stack` 无样式定义，示例退化为裸块流）/ 3 warning（登记「拖拽后写回」与交付不符；文档写入时机漏「恢复默认清除存储键」；无浏览器取证）/ 3 suggest（英文示例中文注释、`in` 走原型链、未用按钮组）。
- 同批修复：补 scoped 样式并改用 `CaomeiButtonGroup`；登记 §6.3 更正 M2-3 写回时机；中英文案补清除路径；英文注释改英文；`key in` 改 `Object.hasOwn`；补中英两页浏览器取证；补 `<demo>` 空行修复示例不渲染。
- **R2（`standard`）**：Pass —— blocker 关闭，两页示例渲染与间距实测通过。
