# 视觉回归测试字体确定化

> 创建时间：2026-11-06
> 触发：Weekly Regression run `42215583198`（headSha `90e1ea5`，`Image: ubuntu-24.04`）在 `Run visual regression baseline` 失败 4 例；根因是视觉基线依赖系统 CJK 回退字体，本地与 CI 字体集不同。
> 定位：本记录是「视觉测试字体固定」方案的单一事实源；基线装置的首批口径仍见 [2026-10-10 视觉基线装置记录](./2026-10-10-phase21-m3-1-visual-baseline-device.md)。

## 1. 背景

- 组件默认 `--caomei-font-sans: system-ui, -apple-system, sans-serif`，CJK 字形由操作系统 / runner 字体回退决定。
- 本地曾安装 `fonts-noto-cjk`，CI 的 `pnpm exec playwright install --with-deps chromium` 安装 Playwright deps 字体集（含 `fonts-wqy-zenhei`，不含 `fonts-noto-cjk`）；同一份基线在两种环境下的行盒 / 字形边缘不同。
- 失败面集中在 2026-11-03 / 11-04 新增的 `form` 与 `hit-target-390` 采样面；其余 30 张截图 + 3 条守卫因生成时环境一致而通过。

## 2. 方案

- **仓库内自带字体子集**（`test/e2e/fixtures/fonts/`）：
  - `caomei-test-latin.woff2`（`CaomeiTestLatin`，ASCII / Latin-1 / 常用标点）；
  - `caomei-test-cjk.woff2`（`CaomeiTestCJK`，夹具与组件文案 CJK）。
  - 来源 = Noto Sans CJK SC Regular（SIL OFL 1.1）；许可全文见 `test/e2e/fixtures/fonts/LICENSE-NotoSansCJK.txt`；生成命令见 `test/e2e/fixtures/fonts/README.md`。
- **只在视觉入口启用**：`test/e2e/fixtures/main.ts` 在 `?visual=1` 时设置 `data-visual`；`visual-fonts.css` 在该属性下把 `--caomei-font-sans` 覆盖为 `"CaomeiTestLatin", "CaomeiTestCJK", sans-serif`。E2E 夹具走默认系统字体，几何断言不受影响。
- **保留字体路径覆盖**：`font-latin` / `font-mixed` 采样面继续覆盖「Latin → CJK」回退链，只是把回退目标从系统字体换成了仓库内子集。
- **字体预检（cmap）**：`test/visual/font-coverage.ts` 用 `fontkit` 读取两个 woff2 的 cmap，对受检面文本逐字检查 `hasGlyphForCodePoint`。`document.fonts.check` 只反映字体是否可用，**不校验字形覆盖**，故不采用。守卫覆盖 `SAMPLE_SECTIONS` / `FORM_AXIS_CASES` 的实际目标、`textContent`、input / textarea 的 `placeholder` 与文本类控件 `value`（password 为掩码字符；hidden / checkbox / radio / range / color / file 不采集），以及打开后的 portal dialog；新增采样面若引入子集外字符，守卫失败并提示按 README 重新生成。伪元素与 canvas 文本不在 cmap 守卫范围。
- **基线重冻结**：`pnpm test:visual:update` 重生成 34 张，其中 30 张字节变化、4 张未变（checkbox / switch 各亮暗）。10 张存在尺寸变化（`form` 460→468、`hit-target-390` 450→460、`dialog` 170→176、`radio-button` 45→49、`select` 67→79），属测试字体行盒差异，非组件回归。`test:visual` 测试数 37 → **38**（34 张基线 + 4 条守卫）。

## 3. 验证

- `pnpm test:visual:update` → **38 passed**；`pnpm test:visual` → **38 passed**。
- 保留 `fonts-noto-cjk` 时 `pnpm test:visual` → **38 passed**。
- 移除 `fonts-noto-cjk`、仅保留 Playwright deps 字体集后 `pnpm test:visual` → **38 passed**；证明基线不再依赖系统 CJK 字体。
- 字体加载负向对照：临时移走 `caomei-test-cjk.woff2` → 守卫在 `gotoVisual` 的字体加载阶段失败（`NetworkError`）；恢复后通过。
- cmap 逻辑自检：`findMissingGlyphs('\uE000', fonts)` → `[0xE000]`（私用区码点不在两个子集内）；`test/visual/font-coverage.test.ts` 覆盖 Latin / CJK / 其他符号 / 空白控制字符分支（5 例）。
- 装置负向对照：`VISUAL_NEGATIVE_CONTROL=1 pnpm test:visual` → **34 failed / 4 passed**（34 张截图全部报差异，4 条守卫通过）。
- `pnpm vitest run test/visual/font-coverage.test.ts` → **5 passed**（Latin / CJK / 其他符号 / 空白控制字符 / 扩展 A 分支）。
- `pnpm lint:check` / `pnpm typecheck` / `pnpm governance:check` / `pnpm verify` → exit 0；`pnpm test:e2e` → 466 passed / 4 skipped。
- 字体预检：受检面文本（含 placeholder、文本类控件 value 与 portal dialog）经 cmap 逐字检查无缺失；`--caomei-font-sans` 计算值含两个测试 family。

## 4. 未覆盖边界

- 未在真实 CI 运行新基线；首次推送后的 Weekly Regression 需确认 38 passed。
- 字体文件固定后，系统字体差异不再是假阳性源；浏览器 / 平台栅格化仍随 OS / Chromium 版本变化，基线仍须在与 CI 相同的浏览器 / 运行器环境生成。
- 子集只覆盖当前受检面文本；新增采样面引入新字符时须重新生成并通过字体守卫。字符收集脚本已改为收集受检面文本中不属于 Latin 子集的全部字符（含 `≤` / `①` / 箭头等符号），守卫报缺失时按 README 重新生成。
- cmap 守卫只覆盖 `textContent` / `placeholder` / 文本类 input 与 textarea 的 `value`（password 为掩码字符；hidden / checkbox / radio / range / color / file 的 value 不采集）；伪元素与 canvas 文本不在范围，新增时须单独登记。
- 原生日期 / 时间控件的 `value` 是 ISO 原始值、`button` / `submit` / `reset` / `file` 的可见标签不在当前采集范围；当前 34 个受检面均为库组件（文本 input / `textContent`），无此形态。新增原生控件采样面时须扩展守卫或显式登记边界。
- 未引入粗体子集；组件粗体由 Chromium 合成，跨环境一致性由同一字体文件保障。
- `96569f6` 的 4 张 CI 等价重冻结被本方案取代；本批最终合并为一次提交（未推送）。

## 5. Review Gate

- **audit-depth**：`standard`（视觉测试装置 + 字体二进制 + 34 张基线；时间盒 ≤ 10 分钟）。
- **R1（`standard`）：`Reject`**（1 blocker / 5 warning / 4 suggest）——B1 `document.fonts.check` 只校验字体可用性、不校验字形覆盖，守卫恒真；W2 重冻结后未复核装置负向对照；W3 字体许可文件缺版权 / 含 GPL 片段；W4 `.session` 仍是旧方案；W5 索引摘要复述读数；W6 记录与工作区事实（30/4、尺寸变化、门禁状态）不一致；S7-S10 为 `?visual=0`、路径、`Page` 导入、`96569f6` 关系。
- **R2（`standard` delta）：`Pass`**（0 blocker；B1 / W2-W6 / S7-S10 关闭；残留 3 warning：守卫未采集 input value、README 字符收集未覆盖符号、§5 待填；6 suggest 含单元测试、哨兵码点、字体 face 注册、clock 轴、措辞、最终树复跑）。
- **R3（`standard` delta）：`Pass`**（W1 / W2 / W3 关闭；新增 2 warning：`value` 采集过宽、`.session` 待同步；建议采纳单元测试负向断言、README 运行时文本提示、术语收紧）。
- **R4（`quick` delta）：`Pass`**（R3 的 2 warning 关闭；0 blocker / 1 warning / 2 suggest；残留 warning 为原生日期 / 按钮 / 文件控件可见文本边界，当前受检面无此形态，已在 §4 登记）。
- **复查基线**：`test/e2e/fixtures/fonts/`、`test/e2e/fixtures/visual-fonts.css`、`test/e2e/fixtures/main.ts`、`test/visual/components.visual.ts`、`test/visual/font-coverage.ts`、`test/visual/font-coverage.test.ts`、`playwright.visual.config.ts`、`docs/standards/testing.md`、`test/visual/__screenshots__/components.visual.ts/`。
