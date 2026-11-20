# Phase 38 M1-1 交付记录：安全区 token 与工具类

> 创建时间：2026-11-20
> 范围与验收口径的唯一载体：[Phase 38 登记批次](./2026-11-20-phase38-registration.md) §2 M1-1。本记录只承载实现机制、验证证据与 Review Gate。

## 1. 实现

- **token**：`src/styles/theme.css` 新增 `--caomei-safe-area-{top,right,bottom,left}`，默认 `env(safe-area-inset-*, 0px)`；页面未声明 `viewport-fit=cover` 或运行在桌面时回落到 `0px`。
- **工具类**：`src/styles/index.css` 新增 `.caomei-safe-area-{top,right,bottom,left,x,y}`，把 token 写成同侧 `padding-*`；`-x` / `-y` 各覆盖左右 / 上下两侧，`var()` 带 `0px` 回落，不使用 `padding` 简写（简写会连带清零未涉及的对侧）。
- **边界（已写入代码注释与中英指南）**：应用工具类会把该侧 `padding` 赋成 token 值，**不保留宿主原值**（桌面 token 为 `0px`，等价于清零该侧内边距）；六个类均为 `(0,1,0)` 单类选择器，基础层先于组件 / 业务样式加载，同特异性下后声明者胜出，需要确定性覆盖时提高特异性或直接 `calc()` 组合 token。
- **文档**：设计规范 §2.3 token 表新增安全区行；架构的 `caomei-ui/theme.css` 入口说明补工具类原语；移动端指南中英新增「安全区」节与同一示例（token 覆盖 `34px` / `16px`，安全区带以 `background-clip: content-box` + primary 浅混色显形）。
- **契约测试**：`test/contracts/safe-area-tokens.test.ts`（12 例）守 4 个 token 的 `env()` 值、6 个工具类的属性 / 方向、`-x` / `-y` 覆盖两侧、禁用 `padding` 简写；真实几何由后续固定定位件接入的逐件 E2E 与 `capture:styles` 承担（测试注释已声明分层）。

**文件面**：`git status --porcelain -uall` 读数 **12**；扣除同批收口载体 3（本记录 / `index.md` / `todo.md`）后实现面 **9 文件 / +322 行**（theme 10 / index 39 / 设计规范 1 / 架构 1 / 指南中英各 31 / 示例中英各 58 / 契约测试 94），在[规划规范 §5](../../standards/planning.md) 的 10 文件 / 800 行内。登记估算 ≈4 未含中英示例与契约测试，偏差在此登记。

## 2. 验证

- `pnpm lint:check` / `lint:css:check` / `lint:md:check` → 通过。
- `pnpm typecheck` / `pnpm typecheck:docs` → 通过。
- `pnpm build` → 通过；`dist/styles/index.css` 实测 `safe-area` 18 处。
- `pnpm capture:styles` → **0 差异：399 项逐属性与冻结基线一致**（桌面 1280×800）。
- `pnpm governance:check` → 全链通过；`pnpm check:planning-numbers` 0 命中。
- `pnpm exec vitest run test/contracts/safe-area-tokens.test.ts` → 12 / 12；负向验证：把 `.caomei-safe-area-bottom` 改为 `padding-top` → 1 例失败，还原后 12 / 12 通过。
- 浏览器实测（文档站 `/guide/mobile`，390×844，临时 Playwright 探针 + 截图）：三个演示区计算 `padding-*` 命中 `34px` / `16px` / `0`；根元素 `--caomei-safe-area-top` 计算值为 `0px`（桌面 `env()` 回落）。截图见 `/tmp/opencode/safe-area-demo.png`（本地一次性产物，不入库）。

## 3. Review Gate

**结论：Pass**（R1 `standard`，2026-11-20，0 blocker / 4 warning / 3 suggest）。实测用时约 **9 分 43 秒**，未超 `standard` 档 ≤10 分钟时间盒。

- **W1**「零差异」与「设置 padding」自相矛盾 → 已把零差异限定为「仅引入基础层、不使用工具类」，并在注释与中英指南写明桌面应用工具类等于清零该侧内边距。
- **W2** 层叠顺序依赖未声明 → 已在 `src/styles/index.css` 注释与中英指南补单类选择器 / 加载顺序 / 确定性覆盖路径。
- **W3** 示例中安全区带与标签同色融合 → 外框改 primary 浅混色、标签改白底描边，重新截图确认 34px 带可辨。
- **W4** 只有一次性浏览器探针 → 新增 `test/contracts/safe-area-tokens.test.ts` 契约守卫并做负向验证；真实几何留给后续固定定位件接入的 E2E（登记 §2 已含该验收）。
- **suggest**：S1 工具类 `var()` 补 `0px` 回落；S3 架构入口说明补工具类原语；S2 文件面偏差已在 §1 登记。

**R2**（`quick`，仅审修复点，实测约 2 分钟，未超 ≤5 分钟时间盒）：**Pass** —— W1 ~ W3 与 S1 / S3 全部关闭；W4 降级为已知分层取舍（声明层契约 + 几何由后续 E2E 承担）；无新引入问题。

## 4. 残留与后续

- 安全区 **真实几何**（`env()` 取值链、`viewport-fit=cover` 页面）未在真机 / 移动模拟器实测；由后续固定定位件接入的逐件 E2E 与真机验收承接。
- 暗色主题下的示例配色、`docs:check:axe` 与 `test:visual` 未覆盖该示例（装饰性内容，风险低）。
