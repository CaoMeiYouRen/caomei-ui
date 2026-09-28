# M3-7 文档站链接守卫补口（`docs:check:links` 覆盖站点范围外链接）

> 创建时间：2026-09-28
> 条目：Phase 16 **M3-7**（治理装置留痕与守卫补口；用户 2026-09-28 追加授权，原登记 14 条 → 15 条）
> 背景：M1 附带修复（`b43bbe5`）暴露一处守卫缺口——上一批次遗留的、指向仓库根 `AGENTS.md` 的 markdown 链接被 `docs:build` 判死链，而 `docs:check:links` 放行（该边界此前记录在 [文档与演示站设计 §13](../documentation-site.md)）。用户 2026-09-28 指令「`docs:check:links` 应该拦截指向仓库根 `AGENTS.md` 的 VitePress 死链」。
> 快照：本仓 `b43bbe5`（M1 交付后）。本记录为 M3-7 的唯一交付口径。

---

## 1. 范围与依据

- **目标**：`docs:check:links` 对 `docs/` 下的相对链接新增「站点范围外」检查——解析目标落在仓库内但在站点 srcDir（`docs/`）之外时失败（VitePress 会因其不在 `srcDir` 内报 dead link，使 `docs:build` 失败）。
- **非目标**：不改 `docs:build` 的 VitePress dead-link 校验；不引入 `ignoreDeadLinks` 白名单；不扩大为 reference-style 链接 / 裸 HTML `<a href>` 检查（仍由 `docs:build` 兜底）。
- **登记**：`todo.md` / `roadmap.md` 已由 14 → **15** 条（M3 6 → 7）；评估记录 §8.2 追加授权说明。

## 2. 实现

- `scripts/docs/check-links.mjs`：在「超出项目范围（路径穿越）」检查之后，对 `isUnderDocs` 的文件新增判定——`relative(docsRoot, targetFile)` 命中 `=== '..' || startsWith('..' + sep)`（按分隔符锚定，避免 `docs/..foo/**` 假阳性）即报 `文档站链接目标超出站点范围（VitePress 判为死链），请改用行内代码或站点内路径`，并跳过后续解析。文件头「校验内容」清单补第 6 条。
- 放置顺序保证「省略 `.md` 的跨根链接」（如 `../../AGENTS`）也在回退解析前命中，不会被「目标不存在」掩盖。
- `docs/design/documentation-site.md` §13：把「不能替代 VitePress dead-link 校验」改写为「已覆盖站点范围外链接」，并保留受检面边界（reference-style / 裸 HTML 不在面内，`docs:build` 仍是终态校验）。

## 3. 证据

- **负向对照（真实仓库）**：注入 `docs/__negative-control.md`（含 `[AGENTS](../AGENTS.md)`）→ `pnpm docs:check:links` **exit 1**，消息 `docs/__negative-control.md:3 文档站链接目标超出站点范围（VitePress 判为死链）…: ../AGENTS.md`；删除后复跑 **exit 0**（当时 263 md 全部有效；加入本记录等文件后终态 264 md，见门禁）。
- **单测**：新增 `scripts/docs/check-links.test.mjs`（**13 tests**）——覆盖跨根（含 `.md` 回退形态）、站点内首段以 `..` 开头的目录不被误判（分隔符锚定）、非 docs 文件允许跨根、docs 内互链、站点根路径解析，以及既有规则（目标不存在 / 路径穿越 / 本地绝对路径 / 锚点缺失）不回退；另设受检面下界（`collectMdFiles` ≥ 200 且含 `docs/design/documentation-site.md`）与「仓库现状无跨根链接」断言。
- **仓库现状**：可复算依据为 `node scripts/docs/check-links.mjs` **exit 0**（264 md 全部有效，即 0 处跨根链接）与单测「仓库现状无跨根链接」通过；独立扫描脚本 `test-results/scan-cross-root.mjs`（gitignored）仅作辅助复核，实测同为 0 处，故新规则不产生存量修复面。
- **门禁**：`pnpm verify` **exit 0**（2026-09-28T20:59:09 → 21:03:16，含修复点落地后的终态复跑）：**89 文件 / 1850 tests**；`docs:check` 10 段（integrity 265 md / links 264 md / structure 226 页 / parity 59 对 / interpolation 226 md）；`check:governance-records` 79 记录与索引一致 / 264 md 指针无失效；`check:planning-numbers` 0 命中。

## 4. Review Gate 记录

- **R1（第 1 轮，`standard`，时间盒 ≤ 10 分钟）：`Pass`（0 blocker / 1 warning / 2 suggest）**。实测用时上界 **≤ 3 分 31 秒**（发起 2026-09-28T20:55:06+08:00；审计返回后调用方立即进入修复、**未在返回时点单独取戳**（口径偏差），以修复完成取戳 20:58:37 为上界），未超时间盒。
  - 审计方独立复现：`pnpm exec vitest run scripts/docs/check-links.test.mjs` 12 passed；`node scripts/docs/check-links.mjs` exit 0（264 md，无假阳性）；隔离 fixture 复现跨根报错；`check:governance-records` 79 记录与索引一致；`check:planning-numbers` 0 命中；新记录完整未截断、§4 未预写未发生结论。
  - **W1（首次）**：`index.md` 中评估记录导航摘要仍写「14 条原子条目（M3 6）」，第 4 载体未回填 → **已同批修正**为追加现行口径（14 → 15，M3 7），保留原登记时点表述。
  - **S1（首次）**：`check-links.mjs` 新判定的 `startsWith('..')` 未按分隔符锚定，对 `docs/..foo/**` 病态路径假阳性 → **已同批修正**为 `=== '..' || startsWith('..' + sep)`，并补 1 条单测（**13 tests**）。
  - **S2（首次）**：记录 §3「0 处」引用 gitignored 脚本不可复算 → **已同批修正**为点名可复算命令（`node scripts/docs/check-links.mjs` exit 0 + 单测），扫描脚本降为辅助。
  - 3 条 finding 记为「**已修复未复审**」（R1 即 Pass、无 blocker，按既有惯例同批修正）。
  - **未覆盖边界（审计方声明）**：未重跑 `pnpm verify` / `docs:build`（采信调用方声明）；未在 Windows CI 实机验证路径分隔符（静态推演 + fixture）；reference-style / 裸 HTML 不在受检面；未写 `artifacts/review-gate/`（按调用方「只审查、不改文件」约束）。
  - **follow-up**：`isUnderDocs`（`check-links.mjs` 第 120 行）沿用同形态弱点，按范围冻结未改，见 §5。

## 5. 边界与未覆盖

- 守卫按**文件系统解析**做快速反馈；`docs:build` 的 VitePress dead-link 校验仍是终态判据，两者不互相替代。
- 受检面不含 reference-style 链接与裸 HTML `<a href>`（既有边界，未扩大）。
- 非 `docs/` 的 Markdown（根 `README.md`、`AGENTS.md`、`.github/**`）不受该规则约束——它们不参与文档站构建。
- **follow-up（本轮未扩面）**：`check-links.mjs` 的 `isUnderDocs` 判定（文件是否在 `docs/` 下）沿用 `!relative(docsRoot, file).startsWith('..')` 形态，对 `docs/..foo/**` 这类病态路径有同一弱点；仓库无此类路径、实际影响 ≈ 0，登记为后续候选。
