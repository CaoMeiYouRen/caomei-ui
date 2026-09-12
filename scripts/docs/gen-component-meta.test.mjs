import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { findComponentEntry } from './gen-component-meta.mjs'

describe('findComponentEntry', () => {
    const tempDirs = []

    function makeComponentDir(files) {
        const dir = mkdtempSync(join(tmpdir(), 'caomei-meta-'))
        tempDirs.push(dir)
        for (const file of files) {
            writeFileSync(join(dir, file), '', 'utf8')
        }
        return dir
    }

    afterEach(() => {
        while (tempDirs.length > 0) {
            rmSync(tempDirs.pop(), { recursive: true, force: true })
        }
    })

    it('优先返回与目录同名的 .vue 文件', () => {
        const dir = makeComponentDir(['switch.vue'])
        expect(findComponentEntry(dir, 'switch')).toBe(join(dir, 'switch.vue'))
    })

    it('无同名文件时回退到目录内唯一的 .vue 文件', () => {
        const dir = makeComponentDir(['Button.vue'])
        expect(findComponentEntry(dir, 'button')).toBe(join(dir, 'Button.vue'))
    })

    it('目录不存在时返回 undefined', () => {
        expect(findComponentEntry(join(tmpdir(), 'caomei-meta-not-exist'), 'button')).toBeUndefined()
    })

    it('存在多个 .vue 且无同名文件时返回 undefined', () => {
        const dir = makeComponentDir(['A.vue', 'B.vue'])
        expect(findComponentEntry(dir, 'button')).toBeUndefined()
    })
})
