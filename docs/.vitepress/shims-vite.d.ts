/**
 * `docs` 侧对 Vite 客户端类型的最小引用。
 *
 * 作用：让文档站内的 `.ts` / `.vue` 能用 `import.meta.glob` 等 Vite 编译期 API
 * （`ImportMetaEnv` / `ImportMeta.glob`）。根 tsconfig 未声明 `types`，且文档站 tsconfig
 * 只 include `docs/**`，故需在此显式引用；否则 `vue-tsc -p docs/tsconfig.json` 报
 * `Property 'glob' does not exist on type 'ImportMeta'`。
 *
 * 边界：`vite/client` 同时声明了一批资产模块（`*.css`、`*.svg` 等），会吞掉这些路径的
 * 解析错误——与 `shims-vue.d.ts` 的 `*.vue` 声明同类风险，属于该引用的已知代价。
 */
/// <reference types="vite/client" />
