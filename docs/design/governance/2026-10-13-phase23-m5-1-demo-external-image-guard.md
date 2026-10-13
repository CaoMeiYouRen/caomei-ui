# Phase 23 M5-1：文档站示例外部图片源守卫

> 阶段 / 条目：Phase 23 M5-1（治理载体与文档站守卫）。
> 裁定依据：[下一阶段范围评估（第七轮）](./2026-10-12-next-stage-scope-evaluation-7.md) §8.1 **D7**——治理侧纳入示例外链图片守卫与 Phase 22 缺记录补录。
> 来源链：Phase 22 M6-5「文档站示例外部图片依赖消除」的 **RG-S04**（缺「示例无外链图片源」的防复发载体）→ Backlog 候选「文档站示例外链图片守卫」（B29）→ 本条目。

## 1. 背景与触发

示例曾用 `picsum.photos` 等第三方图床作占位图：示例会随上游可用性 / 网络环境静默变破图，并给文档站引入不可控的隐私与合规面。Phase 22 M6-5 已把 10 个中英示例换成站点内置本地占位图（`docs/public/demo/*.svg` + `withBase`），但当时是**一次性人工清理、无门禁**——同一形态可静默复发（M6-5 审计即以 `RG-S04` 提出该防复发载体）。本条目把它变为**可机检约束**，接入 `docs:check`。

## 2. 规则与判定口径

| 规则 | 判定 | 处置 |
|:---|:---|:---|
| `external-image-source` | 示例面文件内出现 `http(s)://` URL 字面量（`EXTERNAL_URL_RE`） | error，命中即 exit 1 |
| `scan-scope-narrowed` | 受检示例文件数低于下界，或缺少中英任一侧示例目录覆盖 | error，命中即 exit 1 |

**口径为整文件扫描（fail-closed）**，理由：本仓示例的图片源惯用间接赋值（`const src = withBase('/demo/image-square.svg')` → `:src="src"`），只判 `src=` / `url()` 语法位置会漏掉「同一 idiom 改为外链」的形态——而这恰是复发的最短路径。当前示例面**零非图片外链**，故不引入放行名单；将来若确需非图片外链，比照 `docs:check:interpolation` 的登记表 + 反向校验形态扩展（见 [文档与演示站设计 §13](../../design/documentation-site.md)）。

## 3. 受检面与下界

| 项 | 值 |
|:---|:---|
| 受检面 | `docs/**/examples/**` 下受版本控制的示例 `.vue`（中英两侧） |
| 实测受检文件数 | **363**（2026-10-13） |
| 文件数下界 | `MIN_SCANNED_EXAMPLES = 300` |
| 必需前缀 | `docs/examples/` 与 `docs/i18n/en-US/examples/`（缺一即 `scan-scope-narrowed`） |
| 实现 | `scripts/docs/check-demo-external-images.mjs`（纯函数 + CLI，含注入式单测） |

## 4. 判别力自证

- **端到端负向对照（D 阶段实测）**：向真实示例注入外链（把 `docs/examples/image/basic.vue` 的 `const src = withBase('/demo/image-square.svg')` 改为 `const src = 'https://picsum.photos/640/360'`）→ 守卫 **exit 1** 并报 `docs/examples/image/basic.vue:10:external-image-source: …「https://picsum.photos/640/360」`；还原后 → **exit 0**（`受检 363 个示例文件，无外部图片源`），工作区回到注入前状态。注入面刻意选**变量赋值形态**，即第 2 节所述「只判语法位置会漏」的那一类。
- **单测 19 例**（`scripts/docs/check-demo-external-images.test.mjs`）：命中 http / https / 属性绑定 / 样式 `url()` / 模板字符串拼接；不命中本地占位图 / `data:` URI / 普通 import；同行多外链只报 1 处；受检面下界与中英前缀覆盖（含缺一侧失败）；夹具注入式负向对照（注入命中 → 移除通过）；CLI 退出码三类（非法目录 / 仓库自身 exit 0 / 非 git 仓库给受控错误）；**仓库现状回归保护**（受检数 ≥ 下界且当前零命中）。

## 5. 接线与段数同步

- `package.json` 新增 `docs:check:demo-external-images`，并把它追加进 `docs:check` 链（位于 `docs:check:showcase` 与 `docs:check:line-count` 之间）→ **`docs:check` 段数 11 → 12**。
- [文档与演示站设计 §13](../../design/documentation-site.md) 新增守卫条目（规则、fail-closed 口径、下界与背景）。

## 6. 附带改动：示例外链消除收尾

守卫接入后即可判定示例面的**最后一处**外链：`docs/examples/rich-text-editor/upload.vue` 与其英文镜像的 uploader 演示返回 `https://cdn.example.com/<name>`（保留域名，不可解析）——该返回值会被写入 Markdown 并渲染成图片，实际表现为**破图**。两文件同批改为返回站点内置本地占位图：

```ts
const uploader = (files: File[]): Promise<string[]> =>
    Promise.resolve(files.map(() => withBase('/demo/image-square.svg')))
```

演示语义（uploader 契约 = 返回值直接写入 Markdown）不变，去掉外部依赖。**这是本批对示例代码的唯一改动**（2 文件）。

## 7. 已知边界（有意）

- **非图片外链一并禁止**：口径按整文件 fail-closed，示例里的普通外链（如 `href`）同样命中。当前示例面零此类引用；若将来需要，按第 2 节扩展登记表。
- **运行时拼接的外链不在面内**：把协议 / 域名拆成多段在运行时拼接、或经环境变量注入的外链，文本守卫无法识别（固有边界）。
- **文档 `.md` 正文内的外链图片不在面内**：本守卫只覆盖 `examples/`；`.md` 页正文的示例引用存在性由 `docs:check:example-refs` 覆盖，二者互补。

## 8. 质量门

本批为**守卫脚本 + 单测 + 配置接线 + 文档**（零 `src/**`）：

- `pnpm docs:check` **12 段全绿**（新增段 `OK：受检 363 个示例文件，无外部图片源`）；
- `pnpm lint:md:check` / `pnpm governance:check`；`pnpm verify` 常驻链（含新增单测）。

## 9. Review Gate

R1 **两分区并发审计**（[AI 协作规范 §3.2](../../standards/ai-collaboration.md)：本批 12 文件 / +550 −12 触发并发阈值，按模块划分）——**本条目落在「分区 A：守卫 / 单测 / 配置接线 / 文档站 §13 / 示例」**，`standard` **`Pass`**（0 blocker / 0 warning / 2 suggest）；**分区 B（治理与规划载体）亦 `Pass`**（结论见 [M5-2 记录](./2026-10-13-phase23-m5-2-phase22-record-backfill.md)）。**汇总取最严 → 本批次整体 `Pass`**。

分区 A 的 2 条 suggest **均同批采纳**（记「已修复未复审」）：

- **RG-S01**（suggest，首次）漏判面未登记——`EXTERNAL_URL_RE` 只匹配**小写** scheme，大写 scheme（`HTTPS://`）与协议相对形态（`//host/path`）不命中，而文件头「已知边界」未列。**处置**：并入守卫「已知边界（有意）」注释（属故意绕过形态、非无意回归，故不加正则收紧）。
- **RG-S02**（suggest，首次）整文件 fail-closed 的未来误报面——非图片外链（`<a href>`）与内联 SVG 命名空间 URL 会被一并判失败。**处置**：同注释登记「当前仓零命中，需放行时按 `docs:check:interpolation` 的登记表 + 反向校验形态扩展」。

**实测用时**：分区 A ≤ **2 分 14 秒**（发起 `18:40:49`，早于分区 B 发起时刻返回；§3.2 总时间盒 = 各分区最大值 ≤ 10 分钟，未超）。审计工件：`artifacts/review-gate/2026-10-13-phase23-m5-1-demo-external-image-guard.md`（本地态、git-ignored）。
