# 验证记录模板（references）

按本模板产出验证记录，保证评审与归档能复核同一口径。存放与追溯要求：

- 原始记录：`test-results/<scope>-validation.md`，截图与取证脚本同目录（该目录被 `.gitignore` 忽略）。
- 追溯要求：结论（核对项数 / 失败数 / 观察项数 / console 数）与**关键实测值**必须回写**已纳入版本控制**的位置——如 `docs/design/governance/**`、`docs/plan/**`（todo 或归档）等文档，或提交信息，依据[测试规范 §2.1](../../../../docs/standards/testing.md)。
- `test-results/`、`artifacts/`、`docs/.vitepress/dist/` 均在 `.gitignore` 内，**不能**作为上述回写落点。`artifacts/review-gate/` 仍是 `@code-reviewer` 的临时记录默认落点（按该 skill 约定使用），但它同样被忽略，因此不得作为结论的唯一留痕。
- 一条改动多次验证（复验 / 回归）时在同一份记录内追加以日期或轮次为标题的小节，并标注取代关系，避免审计链自相矛盾。

---

```markdown
# <范围> 浏览器验证报告

## 范围（scope）

| 维度 | 取值 |
| --- | --- |
| 被测 revision | <commit hash 或「工作区，源码 mtime 02:31」> |
| 入口 / 产物 | <dev 5174 \| preview 4173（dist 构建于 …）> |
| 页面（中文） | <`/components/<c>` 等> |
| 页面（英文） | <`/en-US/components/<c>` 等> |
| 示例 | <示例 1 基础用法 / 示例 2 …；已与 `.demo-row` 索引逐项核对> |
| 断点 | <桌面 1440×900 / 平板 834 / 移动 390×844> |
| 主题 | <亮 / 暗（emulateMedia + 站点 appearance）> |
| 动效 | <默认 / reduced-motion（动画类改动必填）> |

- 结论：**<通过 \| 不通过>**（核对项 N 条，失败 N，观察项 N，console error N）。
- 复现方式：

  ```bash
  pnpm docs:build
  pnpm docs:preview            # 默认 4173；需自定义端口时用 pnpm exec vitepress preview docs --port <port>
  node test-results/<scope>-validate.mjs
  ```

> 浏览器启动参数与等待 hydration 的约定见 [browser-cookbook.md](./browser-cookbook.md)。

## 逐项结论

| 核对项 | 结论 | 关键证据（实测值） |
| --- | --- | --- |
| 页面结构 / 内容 | | |
| 交互路径 | | |
| 响应式（含窄屏溢出） | | |
| 主题与 token 覆盖 | | |
| 可访问性 | | |
| 宿主稳定性（浮层 / portal 类必填） | | |
| CLS 归因 | | |
| console error / pageerror / HTTP ≥ 400 | | |
| 截图 | | |

## 观察项（OBSERVE）

| 观察 | 归因（上游 / 本次变更 / 已登记 follow-up） | 处置 |
| --- | --- | --- |
| | | |

## 未覆盖边界

- <未测视口 / 未测真机 / 视觉通道不可用 / 未跑构建产物 等，逐条写明>

## 截图清单

- `<file>.png`：<说明>
```
