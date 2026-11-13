# Phase 33 M3-4：Select 长列表面板滚动可达性

> 创建时间：2026-11-14
> 触发：用户报告下游 caomei-auth「修改手机号」国家码下拉——弹窗内选项很多时面板被撑高、越出视口且无法滚动。属**直接影响可用性的 blocker 级缺陷**，按[规划规范 §3.5](../../standards/planning.md) 插队例外登记为 Phase 33 M3-4（执行期追加）。
> 登记口径：[Phase 33 登记批次](./2026-11-13-phase33-registration.md) §1 / §2。

## 1. 根因

`.caomei-select__viewport` 只有 `padding`，**没有高度上限**（`overflow-y: auto` 已存在但 `clientHeight === scrollHeight`，永远不产生滚动）。选项多时面板自然高度远超视口；模态（Dialog / Drawer）已锁页面滚动，超出视口的部分因此不可达。

同族对照：`multi-select` / `auto-complete` 的视口均有 `max-height: 15rem`；`date-picker` 面板用 `--reka-popover-content-available-height` 收敛。Select 是唯一缺上限的浮层列表。

## 2. 修复

`src/components/select/select.vue` 的 `.caomei-select__viewport`：

```css
max-height: min(15rem, var(--reka-select-content-available-height, 15rem));
overflow-y: auto;
overscroll-behavior: contain;
```

- `--reka-select-content-available-height` 由 Reka 的 SelectContent 写入（popper 可用高）；缺失时回退 15rem，保持旧行为；
- 取 `min(15rem, 可用高)`：既与选择器家族一致，又在矮视口下不越出屏幕；
- `overscroll-behavior: contain` 避免滚到边界后把滚动手势链给页面。

## 3. 验证

| 项 | 结果 |
|:---|:---|
| 修复前（对话框内 60 选项，1280×800，注入 `max-height: none` 复现） | 视口 `clientHeight = scrollHeight = 1568`、面板底边 **1869**（> 视口 800）、无法内部滚动 |
| 修复后（同场景） | 视口 `clientHeight = 248`（`max-height` 240 + `content-box` 的 8px padding）/ `scrollHeight = 1568`、面板顶 / 底 **299 / 549**（均在 800 内）、滚轮可改变 `scrollTop`（E2E 断言） |
| 常驻 E2E `test/e2e/select-long-list.e2e.ts` | 3 passed（三视口）：内部滚动、面板不越出视口、滚轮改变 `scrollTop`、键盘 `End` 后末项可见 |
| **负向验证**（临时还原 CSS 后运行同一用例） | **失败**（内部滚动断言不成立），修复后恢复通过 |
| `pnpm exec vitest run src/components/select` | 64 passed |
| 相关 E2E（overlay-stacking / field-overflow / selector-motion / density） | 60 passed |

## 4. 边界

1. 上限取 15rem 与「可用高」的较小值；如需更高列表，使用方可覆盖 `.caomei-select__viewport` 的 `max-height`（非 scoped 规则，特异性低）。
2. 只改 Select；MultiSelect / AutoComplete 已有 15rem 上限、DatePicker 已按可用高收敛，不在本条范围。
3. 虚拟滚动不在本条范围（选项量级由使用方控制）。
4. 不改变 `bodyLock` 语义与面板 z-index 档位。
5. 面板视口上限 15rem ≈ 9 项，更多选项改为内部滚动（用户可见行为变化）；Reka 的 `SelectViewport` 注入隐藏滚动条样式（与 MultiSelect / AutoComplete 一致），桌面端可发现性偏弱，若下游反馈再评估显式细滚动条。
6. 本条行为变化需在 `1.3.0` release note 记录（由 M5-1 发布条目统一落盘 `docs/release-notes/1.3.0.md`）。

## 5. Review Gate

- **audit-depth**：R1 `standard`（组件样式修复 + 常驻 E2E + 阶段执行期追加，≤10 分钟），R2 `quick`（只复查修复点）。
- **R1**（`standard`）：`Reject`（1 blocker / 3 warning / 7 suggest）。
  - blocker：`roadmap.md` §1 仍写「11 条」，与阶段表行 / `todo.md` / 登记记录 / 索引的「12 条」冲突 → 已改为「原登记 11；2026-11-14 执行期追加 M3-4 后为 12」。
  - warning：`.session` 阶段态未同步 → 已同步 12 条与 M3-4；记录测量值与夹具不可复现 → 改为夹具实测（`clientHeight 248` = 240 + content-box padding、`scrollHeight 1568`、面板 299–549）并补负向对照；组件页缺面板高度说明 → 中英各补一段 + 记录登记 release note 交接。
  - suggest：E2E 补触发器 id / poll / 顶边断言 / 键盘 `End`；注释措辞与家族一致；登记记录历史计数加时点标注 → 全部采纳。
- **R2**（`quick`）：`Pass`（0 blocker / 3 warning）——R1 一项 blocker 与三项 warning 关闭；新增 warning 为两处 E2E 断言判别力（空 `expect.poll`、`End` 断言复用滚轮结果）与 `.session` 残留 → 已改为 `scrollHeight > clientHeight` 轮询、末项 `toBeInViewport()`、`.session` 摘要与 `next_steps` 更新。
- **复查基线**：本记录 §1 ~ §4；`src/components/select/select.vue` 的 viewport 规则；`test/e2e/select-long-list.e2e.ts` 与夹具 `#select-long-list`；`docs/plan/{todo,roadmap}.md`；`docs/design/governance/2026-11-13-phase33-registration.md`；`docs/components/select.md` 与 en-US 同页。
