# Phase 27 M6-3 发布前置与后置门禁交付记录

> 创建时间：2026-11-04
> 依据：[Phase 27 登记批次记录](./2026-11-03-phase27-registration.md) §2 的 M6-3。
> 定位：Phase 27「CI 发布链路」第 3 条的交付记录；本记录是发布前 / 后门禁与失败语义的唯一载体。

## 1. 前置门禁（publish job）

- `pnpm check:security-alerts`：`SECURITY_ALERTS_TOKEN` 缺失、critical 存在、high 未修复 / 未留痕豁免即中止（安全规范 §2.1）。
- `pnpm verify`：lint / typecheck / test / build / docs / governance 全链。
- `pnpm test:coverage` + `pnpm check:coverage`：覆盖率四项阈值。
- 凭据写入（npm / git）安排在质量门之后、发布动作之前，缩小 token 暴露窗口。

## 2. 后置门禁（publish 后）

新增 `scripts/release/verify-publish.mjs`：

1. 调用 `manual-release verify --version=<v> --tag=latest`：dist-tag、tarball shasum、解包 `package.json`、tarball 内 README 版本句（3 次 / 5s 退避重试）；
2. `npm view caomei-ui@<v> exports --json`：键数必须为 **13**，且键集合与本地 `package.json` 一致；
3. **API 差分为强制项**：workflow 捕获发布前 `latest`（失败 / 空值即发布前中止），并恒传 `--require-base`；无基线、基线等于目标版本均 exit 1；
4. 任一步失败 → 脚本 exit 1 → workflow 标红。

## 3. 失败语义

| 失败点 | 行为 |
| :--- | :--- |
| 安全告警 token 缺失 / high+ 未处置 | publish 前中止，不执行任何发布动作 |
| `verify` / 覆盖率失败 | publish 前中止 |
| 上一 `latest` 读取失败 / 为空 | publish 前中止（不允许无基线发布） |
| dist-tag / shasum / README / exports 13 / 键集合 / API 差分失败 | 发布后 job 标红；summary 提示包可能已发布、重跑同版本会 403 |
| `verify-publish` 参数非法 / 无 base 且 `--require-base` | exit 1 |

## 4. 验证证据

- `pnpm exec vitest run scripts/release/verify-publish.test.mjs` → **9 passed**（exports 解析 / 非对象拒绝 / 13 字面量 + package.json 一致 / 键集合 / require-base flag / 版本校验 / 无 base 中止 / base=version 拒绝 / 正常路径顺序与 `--base` 透传）。
- `pnpm lint:check` / `pnpm typecheck` / `pnpm lint:md:check` / `pnpm governance:check` → **exit 0**（2026-11-04 提交前批次）。
- YAML 结构：publish job 步骤顺序为 分支 → 安全门禁 → verify → 覆盖率 → 凭据 → 版本重检 → 记录上一版本 → Publish → verify-publish → failure summary。

## 5. Review Gate

- **audit-depth**：`standard`（发布门禁 + 后置校验 + workflow 接线）；R2 / R3 为 `quick` delta。时间盒：R1 ≤ 8 分钟，delta ≤ 4 分钟。
- **R1（`standard`）：`Reject`**（1 blocker / 5 warning / 6 suggest）——blocker：上一 `latest` 捕获失败被吞，API 差分静默跳过且 summary 宣称通过；warning：中文指南旧前置、失败 summary 误导、核心门禁路径缺行为断言、registry 无重试、验收未闭环。
- **R2（`quick` delta）：`Pass`**（0 blocker / 0 warning；B01、W01/W02/W04/W05、S01/S06 关闭；W03 残留核心路径断言）。
- **R3（`quick` delta）：`Pass`**（0 blocker / 0 warning；W-R2-01 / W-R2-02 / S-R2-01 全部关闭）。
- **用时实测（宿主时钟）**：R1 发起 `2026-11-04T15:15:28Z`、返回 `15:22:03Z` ≈ **6 分 35 秒**（≤ 8 分钟）；R2 发起 `15:26:04Z`、返回 `15:27:43Z` ≈ **1 分 39 秒**；R3 发起 `15:29:40Z`、返回 `15:31:05Z` ≈ **1 分 25 秒**（均 ≤ 4 分钟）。
- **验收边界**：实现级 Review Gate 已通过；「门禁在 CI 实跑并留证据」需首次真实发布 run，`todo.md` 的 M6-3 保持「待执行」直至 run 链接与 summary 回填。
- **复查基线**：`.github/workflows/release.yml`、`scripts/release/verify-publish.mjs` + 测试、两份指南 §5、本记录、`docs/design/governance/index.md`。

## 6. 未覆盖边界

- **真实 CI run 未执行**：安全门禁实跑、发布后 registry 校验、API 差分与 failure summary 需首次真实发布取证。
- `SECURITY_ALERTS_TOKEN` 需配置为仓库 / environment secret；缺失时按设计 fail-closed。
- `verify-publish` 的 API 差分使用发布前 `pnpm verify` 构建的 `dist`；若发布链未构建 `dist` 会失败。
- exports 期望值固定为 13；后续版本若调整 exports 需同步更新 `EXPECTED_EXPORTS`。
