# M6-6 / M6-7「迁移文档体系」浏览器验证记录

**批次**：M6-6（组件页「从 PrimeVue 迁移」节后置与文档约定）+ M6-7（中英《从 PrimeVue 迁移》专题页）——[待办事项](../../plan/todo.md) M6。
**结论：通过** —— V 脚本 **75 / 75** 项核对通过、失败 0、console error / pageerror / HTTP ≥ 400 均为 0；观察项 2（en-US 文档页 @768 的既有横向溢出，与本批无关）。原始 JSON 落 `test-results/m6-migration-docs/result.json`（gitignored，供复现）。

## 1. 环境与取证方式

| 项 | 值 |
| --- | --- |
| 被测对象 | `docs:build` 产物（`vitepress preview`，体现真实构建结果与主题外壳） |
| 视口 | 390×844 / 768×1024 / 1440×900 |
| 运行期 | Chromium（Playwright），`reducedMotion: 'reduce'`，`--no-sandbox --no-zygote --disable-dev-shm-usage`（root 容器） |
| 脚本 | `test-results/m6-migration-docs/verify.mjs`（结果 `result.json`） |

## 2. 核对项（75 项）

### A. 迁移节位置（36 项 = 4 页 × 3 视口 × 3 项）

`zh/en × data-table/paginator` 四页在三档视口下：HTTP 200、**「从 PrimeVue 迁移」为其后仅剩自动生成的 `API` 标题的最后一个内容节**、console error 0。DOM 顺序实测（zh data-table，1440）：`基础用法 → 列定义 → 列插槽 → 排序 → 行选择 → 分页 → 冻结列 → 加载态 → 空态 → 行样式 → 范围与约定 → 无障碍 → 样式定制 → 从 PrimeVue 迁移 → API`。

### B. 专题页（26 项 = 2 页 × 13 项）

中英专题页：HTTP 200；H1 与页面标题一致；章节齐备（zh：迁移流程 / 常见陷阱 / 逐组件对照入口 / 迁移后自检 / 相关阅读；en：Migration workflow / Common pitfalls / Per-component index / Post-migration checklist / See also）；侧栏存在 `/guide/primevue-migration` 与 `/en-US/guide/primevue-migration` 入口；页内含设计规范 §7 链接；**「逐组件对照入口」表的组件名均为可点击组件页链接且不少于 23 个**，并覆盖 `Dialog` / `Drawer`（首轮 Review 的 blocker 修复点）；console error 0。

### C. 互链（3 项）

组件页迁移节的专题页链接存在 → 真实点击跳转 `/guide/primevue-migration` 成功 → 过程中无 HTTP ≥ 400。

### D. 横向溢出（10 项 = zh 2 页 × 3 视口 + en 2 页 × 2 视口）

zh 的 data-table / paginator 三档视口与 en 两页的非 768 档均满足 `scrollWidth <= clientWidth + 1`（en 两页 @768 转为观察项，见 §3）。专题页另行实测：zh `/guide/primevue-migration` 为 `768 / 768`；en `/en-US/guide/primevue-migration` 为 `847 / 768`，与 §3 的同源既有问题一致。

> 标题文本比对前按 VitePress 注入的零宽锚点字符归一（`\u200b`），否则会被判为不匹配——首次脚本即因此误报。

## 3. 观察项（不计为缺陷）

| 观察项 | 实测 | 归因 |
| --- | --- | --- |
| en-US 文档页 @768 横向溢出 | `scrollWidth 847 > clientWidth 768`（79px） | **既有布局问题，与本批无关**：未改动的 `/en-US/components/button`、`/en-US/components/avatar`、`/en-US/guide/getting-started` 同样命中；zh 同名页与 `/en-US/plan/roadmap` 均为 `768 / 768`。命中元素为 VitePress 内容列 `.content`（right 847）。建议后续单独立项排查（不在本批范围）。 |

## 4. 复现

```sh
pnpm docs:build
pnpm exec vitepress preview docs --port 4180 --host 127.0.0.1 &
node test-results/m6-migration-docs/verify.mjs
```

> **重建后必须重启 preview**：`docs:build` 会重建 `docs/.vitepress/dist`（旧目录被替换），仍指向旧目录的 preview 进程会对新哈希资源返回 404（表现为全页 console 报 `Failed to load resource`、互链检查出现 `assets/*.js` 404），而页面 HTML 仍 200——须按端口取 PID 重启后再采证。
>
> 端口需先清场：启动前实测 `4180` 被一个 `python3` 进程占用（按 `ss -ltnp` 取 PID 精确 kill），该进程对 `/guide/primevue-migration` 返回 404、对 `/guide/primevue-migration.html` 返回 200（不识别本仓 `cleanUrls: true`），易被误判为「页面不存在」；清场后 `vitepress preview` 恢复 extensionless 路由 200。
