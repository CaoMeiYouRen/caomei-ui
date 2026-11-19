# Phase 37 M3-1 交付记录：哨兵与 PrimeVue 陷阱统一

> 创建时间：2026-11-19
> 范围与验收口径的唯一载体：[Phase 37 登记批次](./2026-11-18-phase37-registration.md) §2 M3-1。本记录只承载口径核对与改动证据；不改库代码。

## 1. 改动

- `primevue-migration`「常见陷阱」表（中英）新增「选项空串值」一行：PrimeVue 允许 `''` 作为普通选项值，本库默认按契约外值处理（不渲染 + 开发期告警），需要真实值时加 `allowEmptyValue`；三态「未选择」与清除口径**只回链** [设计规范 §7](../design-spec.md)，本页不复述契约。
- 陷阱表定位：紧随「选项字段」行，保持 Select 家族差异集中、便于迁移时顺序阅读。

## 2. 哨兵复算

- 口径：`rg -n "value: 'all'" docs/examples docs/i18n/en-US/examples` 逐条核对。
- 结果：命中 6 处（`input-group/with-select.vue` ×2、`float-label/in.vue` ×2、`float-label/with-select.vue` ×2），全部写作 `'all'`；另检索 `value: 'any'` 与 `value: '__…__'` 形态无命中。
- 结论：无漂移、无异写，本批不做替换；示例中的「全部」哨兵维持 `'all'`。

## 3. 验证

- `pnpm lint:md:check` → 全绿。
- `pnpm docs:check:i18n-parity` / `pnpm docs:check:structure` → 全绿（中英同批改动，结构未变）。
- 未改 `src/**`，不涉及单测 / E2E / 浏览器验证。

## 4. Review Gate

**结论：Pass**（R1，`quick`，2026-11-19，0 blocker / 0 warning / 2 suggest）。

- 核验：陷阱行与 `design-spec.md` §7 及三组件 `types.ts` 一致，未二次承载三态 / 清除契约；哨兵复算可独立复现（六处 `'all'`，无其它写法）。
- suggest 处置：英文链接补 `(Chinese)` 标记并对齐「三态」措辞；`SelectButton` 例外维持留白（§7 已承载）。
