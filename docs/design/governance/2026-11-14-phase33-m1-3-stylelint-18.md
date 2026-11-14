# Phase 33 M1-3：`stylelint` 18 + `stylelint-config-cmyr` 1.1 同批升级

> 创建时间：2026-11-14
> 触发：用户「继续推进剩余条目」。范围与验收口径见 [Phase 33 登记批次](./2026-11-13-phase33-registration.md) §2 的 M1-3 行。
> 同批约束：登记记录 §5 风险 2「`stylelint` 18 + config 1.1 分两次升级会产生不可绿的中间态」，本批一次完成。

## 1. 变更

| 项 | 内容 |
|:---|:---|
| `stylelint` | `17.16.0` → **`18.0.0`**（`^18.0.0`） |
| `stylelint-config-cmyr` | `1.0.0` → **`1.1.0`**（`^1.1.0`） |
| `stylelint.config.js` / npm 脚本 glob | **零改动** |
| 受检文件数 | 升级前 **525**（`--formatter json` 逐文件结果）→ 升级后 **525**，不缩面 |

`stylelint-config-cmyr@1.1.0` 已为 stylelint 18 调整组合：`stylelint-config-standard` + `stylelint-config-recommended-scss` 取代尚未兼容 18 的 `stylelint-config-standard-scss`（上游 issue #297，见该包 `index.js` 注释）。

## 2. 验收与证据

| 项 | 命令 | 结果 |
|:---|:---|:---|
| 全量样式检查 | `pnpm lint:css:check` | **exit 0**（零 error / warning） |
| 受检面复算（升级前） | 同一 glob + `--formatter json` | 525 files / 0 warnings |
| 受检面复算（升级后） | 同上 | 525 files / 0 warnings（与升级前逐项相同） |
| 规则生效性（负向探针） | 临时 `src/__stylelint-probe.css`（`color: #ffffff`）→ `stylelint src/__stylelint-probe.css` | **失败**（`color-hex-length: Expected "#ffffff" to be "#fff"`，exit 2），探针已删除 |
| 版本 | `pnpm exec stylelint --version` | `18.0.0` |

**规则面差分**（`stylelint --print-config src/components/button/button.vue`，分别用 17.16 + config 1.0 与 18.0 + config 1.1，比较 `rules` 键集合）：

- 规则数 **124 → 128**；
- **上游移除 1 条**：`declaration-block-single-line-max-declarations`（17 中取值 `[1]`；stylelint 18 已删除该规则，非本仓放宽）；
- **新增 5 条**：`at-charset-rule-no-invalid` / `selector-no-deprecated` / `selector-no-invalid` / `selector-no-unmatchable` 生效（`true`），`value-no-invalid` 被 config 1.1.0 置 `null`（该包注释说明为 SCSS 函数误报而关闭）；
- 本仓配置 / glob 未改动，其余规则取值逐项相同。

## 3. 边界与已接受的上游滞后

1. **peer 声明滞后**：`stylelint-config-cmyr@1.1.0` 依赖 `stylelint-config-recommended-scss@^17.0.1`（peer `stylelint ^17`）与 `stylelint-config-recommended@18.0.0`（peer `^17`）；registry 已有 `recommended-scss@18.0.0` / `recommended@19.0.0`（peer `^18`），但 config 1.1.0 未跟进。按验收「`stylelint-config-cmyr` 1.1.0、不放宽规则」不引入 override 强行换版本；`strictPeerDependencies: false` 下安装不受阻，全仓 525 文件实跑与探针均证明规则正常加载。**再评估触发**：`stylelint-config-cmyr ≥ 1.2.0` 或依赖树中 `stylelint-config-recommended-scss ≥ 18` 时复检，要求 `pnpm peers check` 的 stylelint 悬空清零。
2. **Node 下限**：stylelint 18 engines 为 `^22.22.2 || ^24.15.0 || >=26.0.0`；本机 `26.13.1` 满足。开发侧实际下限因此提升到 **22.22.2**（高于 eslint 的 22.13、vitest 的 22.12），已同步到 `docs/guide/development.md` 的环境要求；不改发布包 `engines`（消费者口径不变）。
3. 不放宽任何规则、ignore 或脚本 glob；`pnpm lint:css`（`--fix`）本批未执行，避免无关格式改动混入。
4. 样式源码零改动，`capture:styles` / 视觉基线不受影响。

## 4. Review Gate

- **审计声明**：第 1 轮；`audit-depth = deep`（依赖版本变更）；单分区；时间盒 ≤20 分钟。
- **结论：`Pass`**（0 blocker / 3 warning / 3 suggest），warning 均已在同批关闭：
  - W1 记录把配置文件写成 `stylelint.config.mjs`（实际 `stylelint.config.js`）→ 已改正。
  - W2「不放宽规则」缺规则面差分 → 已补 `--print-config` 对比：124 → 128，1 条上游移除、5 条新增（`value-no-invalid` 由 config 1.1.0 关闭并注明原因）。
  - W3 开发侧 Node 下限无载体 → `docs/guide/development.md` 已改为 `>= 22.22.2`（消费者侧 `engines` 不变）。
  - S1 索引摘要含受检文件数读数 → 已删除读数、只留结论；S2 peer 滞后再评估触发 → 已写明触发条件；S3 本地残留 stylelint 17 虚拟目录 → 解析面唯一（lockfile 0 处 `stylelint@17`、`pnpm exec stylelint --version` 18.0.0），受「禁止批量删除」红线约束未做整目录清理。
- **审计复核要点**：同批原子性（lockfile 无 `stylelint@17`、无 `stylelint-config-standard-scss`）；升级前后受检文件集合逐项相等（525 / 525，`parseErrors` / `invalidOptionWarnings` / `deprecations` 全空）；负向探针 exit 2；`--frozen-lockfile --lockfile-only` 通过。
- **复查基线**：本记录 §1 ~ §3；`package.json`（stylelint / config 字段）；`pnpm-lock.yaml`；`stylelint.config.js`（无 diff）；`docs/guide/development.md` 环境要求行。
