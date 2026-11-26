# 直接依赖许可证策略门禁评估

> 创建时间：2026-11-26
> 触发：用户要求「依赖包 license 有变化，或改成有风险的协议（如 GPL、闭源）时告警或阻断」；用户随后划定范围为**直接依赖与 peer 依赖**，不覆盖传递依赖。
> 性质：**评估记录，不登记阶段**。落点为 [Backlog §1.6](../../plan/backlog.md) 候选；不改 `src/**`、不新增依赖。

## 1. 现状读数

> 以下为写录时点快照（2026-11-26）；包数与协议分布随依赖变化，引用时以实跑为准。

| 面 | 读数 | 取证 |
|:---|:---|:---|
| 既有入口 | `check:licenses` / `scripts/governance/check-licenses.mjs` | `package.json` |
| 受检范围 | `dependencies` 5 个 + `peerDependencies` 6 个 | `package.json` |
| 既有校验 | 声明文件存在、`files` 含声明、条目存在、`License:` 与安装版本一致、许可证全文归一化后逐字相等 | 脚本文件头注释与实现 |
| 实测协议分布 | 8 个 MIT、2 个 Apache-2.0、1 个 ISC；11 个包均带 LICENSE 文件 | 复用 `collectRequiredPackages()` 实跑 |
| 接入点 | `test.yml` 的 Quality job 直接执行 `pnpm governance:check`；`release.yml` 经 `pnpm verify`（内含 `governance:check`）；`prepublishOnly` 直接运行脚本 | `package.json`、`.github/workflows/test.yml`、`.github/workflows/release.yml` |
| 协议策略 | **无**：GPL 只要在声明文件中如实写成 GPL 即可通过 | `check-licenses.mjs` 无判定分支 |
| 变化检测 | **部分**：标识或正文与声明不符即失败；dependabot 不改声明文件，故自动升级路径上的协议变化已被拦住 | 同上 |

## 2. 缺口

- **G1 无协议策略**：这是本需求的全部实质内容。当前校验只保证「声明与安装一致」，不判断协议本身是否可接受；直接依赖换成 GPL / AGPL / 闭源包时，CI 与发布前门禁都不会失败。
- **G2 允许档内的同 PR 吸收**：维护者在同一 PR 内既升级依赖又同步声明文件时，**允许档内**的协议变化（如 MIT → Apache-2.0）不会失败，只体现为声明文件 diff；阻断档即使用户同步声明，也会被 §4 的策略层拦住。是否把这类允许档内变化也做成机检失败，见 §3 的方案 B′。
- **SPDX 表达式求值**：当前 11 个包都是单一标识，但双许可（`MIT OR GPL-2.0` 一类）一旦出现，纯字符串黑名单会同时误报与漏报。表达式求值随策略层一并落地。

## 3. 方案对比

| 方案 | 做法 | 覆盖 | 代价 | 结论 |
|:---|:---|:---|:---|:---|
| **A 最小策略层** | 在 `check-licenses.mjs` 增加 SPDX 判定，复用已读到的 `license` 字段 | 11 个直接依赖与 peer | 零新依赖、不新增入口、不改 CI | **必需** |
| **B′ 许可证标识基线** | 新增 `license-baseline.json`（仅 `name → license`），标识变化即失败 | 同 A，另覆盖允许档内的协议变化 | 普通版本升级无需改动；仅在协议变化时更新基线 | **可选，交用户裁定** |
| B 独立脚本 + 正文快照 | 新增 `check-license-policy.mjs`，基线另存协议正文 hash | 同 B′，另覆盖「标识不变但正文被改」 | 正文随依赖升级自然变化，合法升级也要改基线；新增第二个门禁入口 | 不取（正文变化已由 `check-licenses` 的全文相等校验承担） |
| C `actions/dependency-review-action` | 用 `allow-licenses` / `deny-licenses` | 仅 PR 增量 | 不校验现有树、不在本地与 `prepublishOnly` 生效、无法覆盖直接依赖全量 | 不取（可作未来第二道网） |

传递依赖扫描（`pnpm licenses list --prod` 一类的全树方案）按用户划定范围**不取**；将来若扩面，需重新评估 dev 依赖与弱 copyleft 的口径。

## 4. 实施要点

**策略分档**：

| 档位 | 标识 | 处置 |
|:---|:---|:---|
| 阻断 | `GPL-*` / `AGPL-*` / `SSPL*` / `BUSL*` / `Elastic-*` / `CC-BY-NC-*` | error |
| 阻断 | `UNLICENSED` / `SEE LICENSE IN ...` / `LicenseRef-*` / 无 `license` 字段 | error（需人工确认后登记） |
| 阻断 | 未识别标识 | error（fail-closed，防拼写变体绕过） |
| 告警 | `MPL-*` / `LGPL-*` / `EPL-*` / `CC-BY-*` / `Artistic-*` / `Python-*` | warning |
| 通过 | `MIT` / `ISC` / `Apache-2.0` / `BSD-*` / `0BSD` / `CC0-1.0` / `MIT-0` / `BlueOak-1.0.0` / `Unlicense` | 无输出 |

**实现约束**：

- SPDX 表达式按 `OR`（任一允许即可）与 `AND`（全部允许）求值，括号与 `WITH` 子句至少不被当成未知标识硬失败。
- 档位按「阻断 → 告警 → 通过」顺序匹配，命中阻断即不再评估告警档：`CC-BY-NC-*` 必须落在阻断档，不得被 `CC-BY-*` 前缀降级为告警；测试面同时覆盖两者。
- 允许清单先于档位匹配：`EXTRA_ALLOWED_LICENSES` 命中即通过，使 `UNLICENSED` / `LicenseRef-*` 这类本会落在阻断档的标识存在经人工确认后的放行路径；放行条目须经 Review Gate。
- 允许清单：`scripts/governance/license-policy.mjs` 内的 `EXTRA_ALLOWED_LICENSES` 常量（数组）与主干允许集合同等对待；每条须带行内注释写明协议全称与放行理由，新增条目随改动走 Review Gate。不另建 JSON 文件，避免与模块内策略表形成第二份事实源。
- 行为变更：「有 LICENSE 正文但缺 `license` 字段」在现有脚本中只记 warning（`check-licenses.mjs`），策略层取 error；属有意收紧。
- 判定逻辑抽为纯函数模块 `scripts/governance/license-policy.mjs`，由 `check-licenses.mjs` 调用；输出沿用既有 `errors` / `warnings` 结构，不改命令行契约。
- 接入点保持不变（`governance:check` + `prepublishOnly`），CI 工作流零改动。
- 测试面（约 10 例）：GPL 阻断、AGPL 阻断、`MIT OR GPL-2.0` 通过、`MIT AND GPL-2.0` 阻断、`CC-BY-NC-4.0` 阻断、`CC-BY-4.0` 告警、无 `license` 字段阻断、未知标识阻断、MPL 告警、`EXTRA_ALLOWED_LICENSES` 放行。
- 文档同步：[安全规范 §6](../../standards/security.md) 把「引入 copyleft 前须确认并记录」改写为可执行门禁描述，并注明检查入口。

## 5. 风险与边界

| 项 | 风险 | 处置 |
|:---|:---|:---|
| 元数据说谎 | `package.json` 写 MIT、LICENSE 正文实为 GPL | 正文 hash 能测「变没变」、测不出「是不是 GPL 正文」；新增依赖仍靠人工看，不引入许可模板指纹 |
| 可选 peer 未安装 | 本地未装 peer 时既有脚本已报「未安装，无法核对」，策略层沿用 | 不在本批次改变该行为 |
| 既有告警升为阻断 | 「有 LICENSE 正文但无 `license` 字段」现为 warning，策略层取 error | 有意收紧，测试面已覆盖；升级前核对现有 11 个包均声明了 `license` 字段 |
| 弱 copyleft 口径 | MPL / LGPL 属文件级 / 动态链接，是否阻断取决于分发形态 | 本库不内联依赖源码，取告警；如用户改判再升为阻断 |
| 自动合并 | 策略阻断会让违规升级 PR 停在 CI | 合法升级不触发（标识与正文未变），dependabot 自动合并路径不变 |
| 范围 | 传递依赖不在面内 | 用户已裁定；扩面需重新评估 dev 依赖口径 |
| 闭源识别 | 私有 registry 包可能只有 `UNLICENSED` 或自定义 `LicenseRef-` | 按阻断处理，维护者确认后可加入允许清单并留痕 |

## 6. 成本与规模

- 新增 `scripts/governance/license-policy.mjs`（策略表与表达式求值，约 60–80 行）。
- `scripts/governance/check-licenses.mjs` 增量约 10 行（调用判定并合并输出）。
- 若纳入 B′：新增 `license-baseline.json`（条目数与直接依赖条数一致）与约 10 行比对逻辑。
- 新增测试约 10 例；[安全规范 §6](../../standards/security.md) 改写一句。
- 零新依赖、离线可跑、无网络访问；单次运行耗时与现有一致。
- 不写工期估算；规模按[规划规范 §5](../../standards/planning.md#_5-任务粒度约束) 的 10 文件阈值衡量，属单条原子条目。

## 7. 落点

- [Backlog §1.6](../../plan/backlog.md)：新增「直接依赖许可证策略门禁」候选，范围与触发条件见该行，完整档位见本记录 §4。
- 本记录不登记阶段、不改 `todo.md` / `roadmap.md`、不改 `src/**`、不新增依赖。

## 8. Review Gate

**R1（`standard`，2026-11-26）**：**Reject** —— 1 blocker / 5 warning / 4 suggest。

- **B1**：索引摘要复述门禁读数（协议分布），违反索引「摘要口径」；已改为「现状读数见记录 §1」。
- **W1**：§1 接入点取证写成「`test.yml` 与 `release.yml` 的 `verify` 链」与实现不符；已按两个 workflow 的实际步骤改写。
- **W2**：§8 占位语料不被守卫识别，索引指针会静默通过；本轮改为回填实际结论，索引标「同批回填」。
- **W3**：`CC-BY-NC-*` 与 `CC-BY-*` 前缀重叠可能被降级为告警；§4 补「阻断优先、命中即止」并加两例测试。
- **W4**：未知标识 fail-closed 缺少放行载体；§4 定义 `EXTRA_ALLOWED_LICENSES` 与注释留痕要求。
- **W5**：G2 未限定「允许档内」、B 方案代价描述不成立；已限定范围并把 B 拆为 B′（仅标识基线）/ B（正文快照）。
- **S1 ~ S4**：已同批采纳（写录时点快照、告警升阻断说明、backlog 评分依据与客观触发条件、闭源标识枚举）。

**R2（`standard`，2026-11-26）**：**Pass** —— 0 blocker；R1 的 B1 / W1 ~ W5 / S1 ~ S4 全部关闭，无复发项。实测用时约 2 分 40 秒（调用方回填，≤ 10 分钟时间盒）。

R2 follow-up（非阻断）：允许清单先于档位匹配（使闭源 / 自定义标识存在放行路径）；backlog 行补 `Elastic-*` 与 §4 枚举对齐。

**R3（`quick`，2026-11-26，第 3 轮确认审计）**：**Pass** —— 0 blocker / 0 warning / 0 suggest。覆盖 R2 之后落地的 4 处改动：§4 允许清单优先级、§8 回填、backlog 阻断枚举补 `Elastic-*`、索引指针改为「见本记录 §8」；逐项与 R2 结论一致，未引入新矛盾。审计工件留于本地 `artifacts/review-gate/`（被 `.gitignore` 忽略），轮次结论以本行为准。

**R4（`quick`，2026-11-26，第 4 轮独立复核）**：**Reject** —— 1 blocker / 1 warning / 4 suggest；blocker（本节缺覆盖最终修订的 R3 行，已按工件回填）与 warning（§7 档位指针不全，已改为完整档位见 §4）已同批修复、**未复审**；4 条 suggest 中「R2 用时归属」已同批修复，其余 3 条（`BSD-4-Clause` 落档、§4 现在时表述、§1 缺复算命令）转为 follow-up，待该候选启动时随实现批次处理。
