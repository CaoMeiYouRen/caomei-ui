import { defineConfig } from 'eslint/config'
import cmyr from 'eslint-config-cmyr/vue/strict'

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
            // 独立 Nuxt 演示 fixture（自带 node_modules），与根 tsconfig 的 exclude 对齐
            'playground/nuxt/**',
        ],
    },
    cmyr,
    {
        // 字符串「空值即回退」是既有语义（空字符串须落到 locale 文案），
        // 对原始类型放行 `||`；其余场景仍要求 `??`。
        files: ['**/*.{ts,tsx,mts,cts,vue}'],
        rules: {
            '@typescript-eslint/prefer-nullish-coalescing': ['error', {
                ignorePrimitives: { string: true },
            }],
            // `_` 前缀约定：有意保留但不使用的绑定（如解构排除字段）
            '@typescript-eslint/no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_',
            }],
        },
    },
    {
        // 实现层与文档站：显式类型族在严格预设中为 warn / off，此处统一升为 error
        files: ['src/**/*.{ts,vue}', 'docs/**/*.{ts,vue}'],
        rules: {
            '@typescript-eslint/explicit-module-boundary-types': 'error',
            '@typescript-eslint/explicit-function-return-type': 'error',
            '@typescript-eslint/no-explicit-any': 'error',
        },
    },
    {
        // 测试文件：用例回调密集，豁免显式返回类型要求；
        // 断言链普遍使用统一的可选链写法（如 `el?.textContent?.trim()`），
        // 其中末段在类型上可证非空，属已接受的确定性折衷，故一并豁免冗余条件判断。
        files: ['**/*.test.ts'],
        rules: {
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-unnecessary-condition': 'off',
        },
    },
])
