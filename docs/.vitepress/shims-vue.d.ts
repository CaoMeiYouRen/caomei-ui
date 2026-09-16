/**
 * `docs` 侧 `.vue` 模块的最小声明；作用与 `src/shims-vue.d.ts` 相同，供文档站独立的
 * tsconfig 使用（由该 tsconfig 中覆盖 `.vitepress` 目录的 include 命中）。
 *
 * 当前唯一受益点：`docs/.vitepress/theme/index.ts` 的 `Layout` 导入。
 * 同样具有「吞掉 `.vue` 路径解析错误」的边界，说明见 `src/shims-vue.d.ts`。
 */
declare module '*.vue' {
    import type { DefineComponent } from 'vue'

    const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
    export default component
}
