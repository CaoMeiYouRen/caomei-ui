import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * 可选 peer 的**构建外置**契约。
 *
 * 声明面（`peerDependencies` / `optional` / devDependency）与「惰性动态加载路径」已由
 * `optional-peer-imports.test.ts` 自动派生覆盖；本文件只补它未覆盖的一处：可选 peer 必须
 * 出现在 tsdown 的 `external`，否则会被打进产物，消费方即使安装了 peer 也会用上内联副本。
 *
 * 「未安装时消费方能否构建」不在单测面内——那由 `pnpm check:optional-peer` 的消费方 fixture
 * 实测（字面量动态 import 会被打包器在模块图中解析，未安装即构建期报错）。
 */
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

describe('可选 peer 构建外置', () => {
    it('qrcode 列入 tsdown external 且加载器使用字面量说明符', () => {
        const tsdown = readFileSync(join(ROOT, 'tsdown.config.ts'), 'utf8')
        const loader = readFileSync(join(ROOT, 'src/components/qrcode/qrcode-loader.ts'), 'utf8')

        expect(tsdown, '需列入构建 external，避免内联进产物').toContain('\'qrcode\'')
        expect(loader, '加载器应以静态可分析的字面量说明符引入 peer').toContain('import(\'qrcode\')')
    })
})
