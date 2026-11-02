import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { checkReferencesIndexed, checkSkillMetadata } from './check-governance.mjs'

const tempDirs = []

function tempSkillsDir() {
    const dir = mkdtempSync(join(tmpdir(), 'caomei-ai-check-'))
    tempDirs.push(dir)
    return dir
}

function writeSkill(skillsDir, name, frontmatter, body = '') {
    const dir = join(skillsDir, name)
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'SKILL.md'), `---\n${frontmatter}\n---\n\n${body}\n`, 'utf8')
    return dir
}

function writeReference(skillsDir, name, relPath) {
    const file = join(skillsDir, name, 'references', relPath)
    mkdirSync(join(file, '..'), { recursive: true })
    writeFileSync(file, '# reference\n', 'utf8')
}

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

describe('checkSkillMetadata', () => {
    it('块形式与行内形式的 metadata.internal 均通过', () => {
        const skillsDir = tempSkillsDir()
        writeSkill(skillsDir, 'block', 'name: block\ndescription: 块形式\nmetadata:\n  internal: false')
        writeSkill(skillsDir, 'inline', 'name: inline\ndescription: 行内形式\nmetadata: { internal: true }')

        expect(checkSkillMetadata(skillsDir)).toEqual([])
    })

    it('缺少 metadata.internal 时失败', () => {
        const skillsDir = tempSkillsDir()
        writeSkill(skillsDir, 'no-internal', 'name: no-internal\ndescription: 缺字段\nmetadata:\n  owner: x')

        expect(checkSkillMetadata(skillsDir)).toEqual(['skill no-internal: 缺少 frontmatter metadata.internal'])
    })

    it('行内字符串或更深层嵌套不算 metadata.internal', () => {
        const skillsDir = tempSkillsDir()
        writeSkill(skillsDir, 'string-only', 'name: s\ndescription: d\nmetadata: { note: "internal: true" }')
        writeSkill(skillsDir, 'deep', 'name: d\ndescription: d\nmetadata:\n  foo:\n    internal: true')

        expect(checkSkillMetadata(skillsDir)).toEqual([
            'skill deep: 缺少 frontmatter metadata.internal',
            'skill string-only: 缺少 frontmatter metadata.internal',
        ])
    })

    it('引号键与 CRLF 可识别', () => {
        const skillsDir = tempSkillsDir()
        writeSkill(skillsDir, 'quoted', 'name: q\ndescription: d\nmetadata:\n  "internal": false')
        const dir = join(skillsDir, 'crlf')
        mkdirSync(dir, { recursive: true })
        writeFileSync(join(dir, 'SKILL.md'), '---\r\nname: c\r\ndescription: d\r\nmetadata:\r\n  internal: false\r\n---\r\n', 'utf8')

        expect(checkSkillMetadata(skillsDir)).toEqual([])
    })

    it('下一个顶层键截断父键作用域', () => {
        const skillsDir = tempSkillsDir()
        writeSkill(skillsDir, 'truncated', 'name: t\ndescription: d\nmetadata:\n  owner: x\ninternal: false')

        expect(checkSkillMetadata(skillsDir)).toEqual(['skill truncated: 缺少 frontmatter metadata.internal'])
    })

    it('缺 frontmatter / 未闭合 frontmatter 时失败', () => {
        const skillsDir = tempSkillsDir()
        const noFrontmatter = join(skillsDir, 'plain')
        mkdirSync(noFrontmatter, { recursive: true })
        writeFileSync(join(noFrontmatter, 'SKILL.md'), '# 无 frontmatter\n', 'utf8')
        const unclosed = join(skillsDir, 'unclosed')
        mkdirSync(unclosed, { recursive: true })
        writeFileSync(join(unclosed, 'SKILL.md'), '---\nname: u\ndescription: d\nmetadata:\n  internal: false\n', 'utf8')

        expect(checkSkillMetadata(skillsDir)).toEqual([
            'skill plain: 缺少 frontmatter name',
            'skill plain: 缺少 frontmatter description',
            'skill plain: 缺少 frontmatter metadata.internal',
            'skill unclosed: 缺少 frontmatter name',
            'skill unclosed: 缺少 frontmatter description',
            'skill unclosed: 缺少 frontmatter metadata.internal',
        ])
    })

    it('缺少 name / description 时失败', () => {
        const skillsDir = tempSkillsDir()
        writeSkill(skillsDir, 'empty', 'metadata:\n  internal: false')

        expect(checkSkillMetadata(skillsDir)).toEqual([
            'skill empty: 缺少 frontmatter name',
            'skill empty: 缺少 frontmatter description',
        ])
    })

    it('目录缺 SKILL.md 时失败', () => {
        const skillsDir = tempSkillsDir()
        mkdirSync(join(skillsDir, 'broken'), { recursive: true })

        expect(checkSkillMetadata(skillsDir)).toEqual(['skill broken: 缺少 SKILL.md'])
    })
})

describe('checkReferencesIndexed', () => {
    it('被 SKILL.md 引用的 references 通过（含子目录）', () => {
        const skillsDir = tempSkillsDir()
        writeSkill(skillsDir, 'good', 'name: good\ndescription: d\nmetadata:\n  internal: false', '见 [a.md](./references/a.md) 与 [b.md](./references/sub/b.md)')
        writeReference(skillsDir, 'good', 'a.md')
        writeReference(skillsDir, 'good', 'sub/b.md')

        expect(checkReferencesIndexed(skillsDir)).toEqual([])
    })

    it('孤儿 references 失败', () => {
        const skillsDir = tempSkillsDir()
        writeSkill(skillsDir, 'orphan', 'name: orphan\ndescription: d\nmetadata:\n  internal: false', '无引用')
        writeReference(skillsDir, 'orphan', 'orphan.md')

        expect(checkReferencesIndexed(skillsDir)).toEqual([
            'skill orphan: references/orphan.md 未在 SKILL.md 中索引（需写 references/orphan.md）',
        ])
    })

    it('同名 references 只索引其中一个时，另一个仍报错', () => {
        const skillsDir = tempSkillsDir()
        writeSkill(skillsDir, 'dup', 'name: dup\ndescription: d\nmetadata:\n  internal: false', '见 [a.md](./references/a.md)')
        writeReference(skillsDir, 'dup', 'a.md')
        writeReference(skillsDir, 'dup', 'sub/a.md')

        expect(checkReferencesIndexed(skillsDir)).toEqual([
            'skill dup: references/sub/a.md 未在 SKILL.md 中索引（需写 references/sub/a.md）',
        ])
    })

    it('references 是文件时给出错误而不是崩溃', () => {
        const skillsDir = tempSkillsDir()
        writeSkill(skillsDir, 'file-ref', 'name: file-ref\ndescription: d\nmetadata:\n  internal: false')
        writeFileSync(join(skillsDir, 'file-ref', 'references'), 'not a dir', 'utf8')

        expect(checkReferencesIndexed(skillsDir)).toEqual(['skill file-ref: references 必须是目录'])
    })

    it('无 references 目录时跳过', () => {
        const skillsDir = tempSkillsDir()
        writeSkill(skillsDir, 'plain', 'name: plain\ndescription: d\nmetadata:\n  internal: false')

        expect(checkReferencesIndexed(skillsDir)).toEqual([])
    })
})
