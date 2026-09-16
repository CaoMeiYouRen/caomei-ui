/**
 * 供原生 TypeScript 解析 `.vue` 模块的最小声明。
 *
 * `vue-tsc` 经 `@vue/language-core` 解析 SFC，类型精确；而 ESLint 的 type-aware
 * projectService 走原生 TypeScript，无此声明时 `.vue` 导入会退化为 `any`，
 * 使 `mount()` 返回 `VueWrapper<any, any>`，在测试中触发大量 unsafe 族误报。
 * 声明存在时 `vue-tsc` 仍优先使用 SFC 真实类型，本文件只影响原生 TS 解析链。
 *
 * 已知边界：通配环境模块声明会让任何以 `.vue` 结尾的说明符都能解析——路径拼错（目标不存在）
 * 不再报 TS2307，`vue-tsc` 会静默通过。该类错误由 `pnpm build`（tsdown 解析入口）与
 * `pnpm test`（Vite 模块解析）兜底。
 */
declare module '*.vue' {
    import type { DefineComponent } from 'vue'

    const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
    export default component
}
