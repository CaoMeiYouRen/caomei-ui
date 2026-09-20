#!/usr/bin/env node

/**
 * check-i18n-old-dirs 测试
 */
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { checkOldI18nDirs, isLocaleDir, checkDirContent } from './check-i18n-old-dirs.mjs'

describe('check-i18n-old-dirs', () => {
    const testDir = join(import.meta.dirname, '__test_i18n_old_dirs__')

    beforeEach(() => {
        // 清理测试目录
        if (existsSync(testDir)) {
            rmSync(testDir, { recursive: true })
        }
        mkdirSync(testDir, { recursive: true })
    })

    afterEach(() => {
        // 清理测试目录
        if (existsSync(testDir)) {
            rmSync(testDir, { recursive: true })
        }
    })

    describe('isLocaleDir', () => {
        it('应识别有效的 locale 代码', () => {
            expect(isLocaleDir('zh-CN')).toBe(true)
            expect(isLocaleDir('en-US')).toBe(true)
            expect(isLocaleDir('ja-JP')).toBe(true)
            expect(isLocaleDir('ko-KR')).toBe(true)
            expect(isLocaleDir('zh')).toBe(true)
            expect(isLocaleDir('en')).toBe(true)
        })

        it('应排除非 locale 目录', () => {
            expect(isLocaleDir('i18n')).toBe(false)
            expect(isLocaleDir('.vitepress')).toBe(false)
            expect(isLocaleDir('examples')).toBe(false)
            expect(isLocaleDir('components')).toBe(false)
            expect(isLocaleDir('design')).toBe(false)
            expect(isLocaleDir('guide')).toBe(false)
            expect(isLocaleDir('plan')).toBe(false)
            expect(isLocaleDir('standards')).toBe(false)
        })

        it('应排除非 locale 格式的目录', () => {
            // abc 符合 [a-z]{2,3} 模式，是有效的 locale 代码
            expect(isLocaleDir('abc')).toBe(true)
            expect(isLocaleDir('AB')).toBe(false) // 大写字母不符合
            expect(isLocaleDir('test-dir')).toBe(false) // 包含非字母字符
        })
    })

    describe('checkDirContent', () => {
        it('应检测空目录', () => {
            const emptyDir = join(testDir, 'empty')
            mkdirSync(emptyDir)
            const result = checkDirContent(emptyDir)
            expect(result.hasContent).toBe(false)
            expect(result.mdCount).toBe(0)
            expect(result.subDirCount).toBe(0)
        })

        it('应检测包含 .md 文件的目录', () => {
            const mdDir = join(testDir, 'with-md')
            mkdirSync(mdDir)
            writeFileSync(join(mdDir, 'test.md'), '# Test')
            const result = checkDirContent(mdDir)
            expect(result.hasContent).toBe(true)
            expect(result.mdCount).toBe(1)
        })

        it('应检测包含子目录的目录', () => {
            const subDir = join(testDir, 'with-subdir')
            mkdirSync(subDir)
            mkdirSync(join(subDir, 'subdir'))
            const result = checkDirContent(subDir)
            expect(result.hasContent).toBe(true)
            expect(result.subDirCount).toBe(1)
        })
    })

    describe('checkOldI18nDirs', () => {
        it('无旧目录时应返回空结果', () => {
            const result = checkOldI18nDirs(testDir)
            expect(result.errors).toHaveLength(0)
            expect(result.warnings).toHaveLength(0)
        })

        it('有空旧目录时应返回警告', () => {
            const zhDir = join(testDir, 'zh-CN')
            mkdirSync(zhDir)
            const result = checkOldI18nDirs(testDir)
            expect(result.errors).toHaveLength(0)
            expect(result.warnings).toHaveLength(1)
            expect(result.warnings[0]).toContain('docs/zh-CN/')
        })

        it('有内容的旧目录时应返回错误', () => {
            const zhDir = join(testDir, 'zh-CN')
            mkdirSync(zhDir)
            writeFileSync(join(zhDir, 'index.md'), '# 中文首页')
            const result = checkOldI18nDirs(testDir)
            expect(result.errors).toHaveLength(1)
            expect(result.errors[0]).toContain('docs/zh-CN/')
            expect(result.errors[0]).toContain('1 个 .md 文件')
        })

        it('应排除 i18n 目录', () => {
            const i18nDir = join(testDir, 'i18n')
            mkdirSync(i18nDir)
            mkdirSync(join(i18nDir, 'zh-CN'))
            writeFileSync(join(i18nDir, 'zh-CN', 'index.md'), '# 中文首页')
            const result = checkOldI18nDirs(testDir)
            expect(result.errors).toHaveLength(0)
            expect(result.warnings).toHaveLength(0)
        })

        it('应排除非 locale 目录', () => {
            const componentsDir = join(testDir, 'components')
            mkdirSync(componentsDir)
            writeFileSync(join(componentsDir, 'button.md'), '# Button')
            const result = checkOldI18nDirs(testDir)
            expect(result.errors).toHaveLength(0)
            expect(result.warnings).toHaveLength(0)
        })

        it('应同时检测多个旧目录', () => {
            const zhDir = join(testDir, 'zh-CN')
            const enDir = join(testDir, 'en')
            mkdirSync(zhDir)
            mkdirSync(enDir)
            writeFileSync(join(zhDir, 'index.md'), '# 中文')
            // en 目录为空
            const result = checkOldI18nDirs(testDir)
            expect(result.errors).toHaveLength(1)
            expect(result.errors[0]).toContain('zh-CN')
            expect(result.warnings).toHaveLength(1)
            expect(result.warnings[0]).toContain('en')
        })
    })
})
