# 待办归档（深度归档）：Phase 40

> 从主窗口迁出：2026-11-27（Phase 45 归档时）。正文逐字保留，仅链接深度机械调整。

## Phase 40：国际化收口、P1 组件广度与 `1.4.0` 发布（**2026-11-21 完成并归档；已发布 `1.4.0`**）

- 时间：2026-11-21 用户就[第二十四轮范围评估](../../design/governance/2026-11-21-next-stage-scope-evaluation-24.md) §4 裁定 D0 ③ / D1 ④ / D2 ① / D3 ① 后登记；同日交付 **4 条主线 / 15 条原子条目**并完成阶段归档（用户指令「开始归档」）。
- 范围与授权：国际化收口 **4** / P1 组件广度 **6** / 发布收口 **3** / 规划载体收口 **2**，构成对账 **4 + 6 + 3 + 2 = 15**；阶段末发布 `1.4.0`。范围与验收口径的唯一载体见 [Phase 40 登记批次](../../design/governance/2026-11-21-phase40-registration.md) §1 / §2；发布与下游复验见 [M3-2 / M3-3 记录](../../design/governance/2026-11-21-phase40-m3-2-m3-3-release-and-downstream.md)。
- 非目标：Form 校验能力、国际化二期 7 语、Tree / TreeSelect、RTL、DataTable 虚拟滚动、移动端第二波、宽屏视觉基线 / `xl` 断点、P2 高级组件、P2 单 Demo 抽屉、依赖与工具链升级、新增运行时依赖、破坏性 API、自动发布、2.0。

### M1 国际化收口（4 条）

- **M1-1 日期 / 时间 locale 跟随**（`11a43b15`）：`DatePicker` / `Calendar` 的 `locale` 缺省消费 `useLocaleCode()`，`weekdayFormat` / `hourFormat` 按语言惯例推导；显式 prop 优先。
- **M1-2 数字 / 体积本地化**（`dd3afe54`）：`InputNumber` 透传 locale；`Paginator` 数字与 `FileUpload` 体积改用 `Intl`；`de-DE` 小数逗号与 `kB` 单位。
- **M1-3 可访问名补口与 10 语台账**（`bd30a2fa`）：`table.columnResize` / `fileUpload.remove` 两键纳入 10 语；默认 zh-CN 文案不变。
- **M1-4 支持语言与翻译状态表**（`e0e44efa`）：中英 locale 页新增 10 语分发 / 键覆盖 / 复核状态总表，README 各补一行回链；订正命名空间为 34。

### M2 P1 组件广度（6 条）

- **M2-1 / M2-2 Transfer**（`e0d2af6a` / `fec985c9`）：双栏候选 / 已选、搜索、禁用与受控值集合；`transfer` locale 6 键 ×10 语；中英页 / 示例 / 登记面。
- **M2-3 / M2-4 Cascader**（`649dfcdf` / `6bd6aa48`）：组合封装多级列、`changeOnSelect`、清除、禁用；`cascader` locale 2 键 ×10 语；中英页 / 示例 / 登记面。
- **M2-5 / M2-6 Timeline**（`679c7e5b` / `80275581`）：`ol` / `li` 语义、单侧 / 交替、反转与语气色；中英页 / 示例 / 登记面。

### M3 发布收口（3 条）

- **M3-1 发布前门槛复核**（`d1dee7f2` / `50e23e09` / `7ee8f7ce`）：`pnpm verify` 全链通过；首跑周回归因覆盖率 `89.97%` 与 E2E 30 分钟超时失败，补 Cascader 边界测试与放宽 E2E 超时后 `44909361461` success。
- **M3-2 `1.4.0` 发布**（发布提交 `2de2f8d9`）：Release run `44913800718` success；npm `latest` = `1.4.0`，tag `v1.4.0`，GitHub Release 已建；`docs:check:version` 通过。
- **M3-3 下游兼容复验**（`017cf9b5`）：Downstream run `44914670234` success，dependfix / caomei-auth / momei 三仓均通过。

### M4 规划载体收口（2 条）

- **M4-1 存量分片改名**（`0f07c91a`）：19 个 `phase-*.md` → `todo-archive-phases-*.md`，链接目标同批重指；剥离链接目标后正文零改写。
- **M4-2 归档索引守卫**（`a2e24f12`）：新增 `check:archive-index`（命名 / 覆盖 / 悬空 / 重复 / 下界）与 9 例单测，接入 `governance:check`。

### 阶段总结

- **4 条主线 / 15 条原子条目全部交付**；`1.4.0` 已发布，`latest` 由 `1.3.0` 升至 `1.4.0`。
- **质量门**：`pnpm verify` 全绿（194 文件 / 3655 例）；VitePress 构建成功；`capture:styles` **399 项 0 差异**；Weekly Regression `44909361461` success；Release `44913800718` success；Downstream `44914670234` 三仓 success。
- **Review Gate**：登记 R1 Pass；15 条逐项 Pass；M3-1 复核批次 R1 Pass；发布与下游记录 R1 Pass；归档批次结论见 [Phase 40 归档批次](../../design/governance/2026-11-21-phase40-archive.md) §5。
- **长期任务**：第 **44** 轮（1.4.0 发布后）与第 **45** 轮（Phase 40 收口）——见 [长期任务](../recurring.md)。
- **wisdom 蒸馏**：活跃 **20 条**达到阈值，已全部压缩进[经验归档](../../design/governance/experience-archive.md)；`check:distill-archive` 15 段对账通过。

### 未覆盖边界

- **`1.4.0` 产物不含发布后修正**：新组件 `labelAttrs` 修正（`90c4c67f`）在 tag 之后，进入下一 patch；不回改 tag。
- **真实设备**：OTP 短信自动填充 / 输入法、设备预览的 iOS `dvh` 与触摸滚动未做真机验证。
- **Cascader 能力边界**：不内置搜索、远程加载与虚拟滚动；方向键列间移动未实现（Tab + Enter/Space 可用）。
- **E2E 时长**：周回归 E2E 作业 30 分钟会超时，已放宽到 60 分钟；若后续接近 60，再评估拆分。

### 遗留与后续候选

- **issue #71（规划文档模型 v1）**：进度表、分片改名、机检已落地，`roadmap-phases-*.md` 未采纳；需回写结论并关闭。
- **issue #73（破坏性提交人工审查）**：新提案，待研判；不属 Phase 40 范围。
- **下一 patch**：包含 `labelAttrs` 修正；是否发 `1.4.1` 待用户裁定。
- **momei 页面级反馈**：仍等待外部反馈；不阻塞阶段归档。
- 其余条件触发候选见 [Backlog](../backlog.md)；启动需用户明确授权。
