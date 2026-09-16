import { defineConfig } from 'eslint/config'
import cmyr from 'eslint-config-cmyr/vue'
import vueStrict from 'eslint-config-cmyr/vue/strict'

/**
 * 需类型信息的规则（显式类型族、unsafe 族）依赖 typescript-eslint plugin 与 type-aware
 * languageOptions；这两者只随 `vue/strict` 提供——`vue` 预设的 tseslint 规则块仅覆盖
 * `ts/tsx/mts/cts`（不含 `.vue`），直接在项目块里引用会因 plugin 未注册而配置失败。
 *
 * 因此这里只取 strict 的**配置骨架**（`@typescript-eslint` plugin 块与 `projectService` 块），
 * 丢弃其 rules，使规则可按批次逐步启用；收敛完成后再整体切换 `vue/strict` 并删除本 shim。
 *
 * 范围收窄到已纳入 tsconfig 的 `src/**` 与 `docs/**`；`playground/**` 属本地演示环境、
 * 配置文件不在 projectService 内，均不纳入类型族范围。
 */
const TYPE_AWARE_FILES = ['src/**/*.{ts,vue}', 'docs/**/*.{ts,vue}']
const strictBlocks = (Array.isArray(vueStrict) ? vueStrict : [vueStrict])
    .filter((block) => block.plugins?.['@typescript-eslint'] || block.languageOptions?.parserOptions?.projectService)
    .map(({ name, plugins, languageOptions }) => ({
        ...(typeof name === 'string' ? { name } : {}),
        files: TYPE_AWARE_FILES,
        plugins,
        languageOptions,
    }))

// 骨架提取依赖 eslint-config-cmyr 的内部结构；上游结构漂移会让 type-aware 能力静默消失，
// 使 type-aware 规则退化为空转。缺失时显式失败。
const hasPluginBlock = strictBlocks.some((block) => block.plugins?.['@typescript-eslint'])
const hasProjectServiceBlock = strictBlocks.some(
    (block) => block.languageOptions?.parserOptions?.projectService,
)
if (!hasPluginBlock || !hasProjectServiceBlock) {
    throw new Error(
        '[eslint.config] 未能从 eslint-config-cmyr/vue/strict 取到 type-aware 配置骨架'
        + '（@typescript-eslint plugin 或 projectService）。请核对依赖版本后更新骨架提取逻辑，或直接切换 vue/strict。',
    )
}

export default defineConfig([
    {
        ignores: [
            'docs/.vitepress/dist/**',
            'docs/.vitepress/cache/**',
            'docs/.vitepress/data/**',
            '**/dist/**',
            '**/.nuxt/**',
            '**/.output/**',
            'coverage/**',
            'playwright-report/**',
            'test-results/**',
        ],
    },
    cmyr,
    ...strictBlocks,
    {
        // 实现层与文档站：要求显式类型边界（显式返回类型、禁止 any 逃逸）
        files: TYPE_AWARE_FILES,
        rules: {
            '@typescript-eslint/explicit-module-boundary-types': 'error',
            '@typescript-eslint/explicit-function-return-type': 'error',
            '@typescript-eslint/no-explicit-any': 'error',
            // unsafe 族：禁止 any 值在调用 / 赋值 / 成员访问 / 返回处静默流转
            '@typescript-eslint/no-unsafe-argument': 'error',
            '@typescript-eslint/no-unsafe-assignment': 'error',
            '@typescript-eslint/no-unsafe-call': 'error',
            '@typescript-eslint/no-unsafe-member-access': 'error',
            '@typescript-eslint/no-unsafe-return': 'error',
        },
    },
    {
        // 测试文件：用例回调密集，豁免显式返回类型要求（其余规则仍适用）
        files: ['**/*.test.ts'],
        rules: {
            '@typescript-eslint/explicit-function-return-type': 'off',
        },
    },
])
