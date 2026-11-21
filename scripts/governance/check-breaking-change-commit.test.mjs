import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, describe, expect, it } from 'vitest'
import {
    checkMessage,
    formatErrors,
    isValidReviewDate,
    ISSUE_CODES,
    main,
} from './check-breaking-change-commit.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const scriptPath = join(here, 'check-breaking-change-commit.mjs')
const hookPath = join(here, '..', '..', '.husky', 'commit-msg')
const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

function createMessageFile(content) {
    const dir = mkdtempSync(join(tmpdir(), 'breaking-review-'))
    tempDirs.push(dir)
    const file = join(dir, 'COMMIT_EDITMSG')
    writeFileSync(file, content)
    return file
}

function reviewLine(overrides = {}) {
    const {
        reviewer = 'CaoMeiYouRen',
        date = '2026-11-21',
        conclusion = 'approved',
        hash = '',
    } = overrides
    return `Breaking-Review: ${reviewer} ${date} ${conclusion}${hash ? ` @${hash}` : ''}`
}

function breakingMessage({ header = 'feat(core)!: 调整公开契约', review = reviewLine(), note = '移除旧导出，改用新入口。', body = '正文说明。' } = {}) {
    return [
        header,
        '',
        body,
        '',
        review,
        `BREAKING CHANGE: ${note}`,
    ].join('\n')
}

function expectCode(message, code) {
    const { errors } = checkMessage(message)
    expect(errors.map((error) => error.code)).toContain(code)
}

describe('isValidReviewDate', () => {
    it('接受真实日期并拒绝不存在的日期', () => {
        expect(isValidReviewDate('2026', '11', '21')).toBe(true)
        expect(isValidReviewDate('2024', '02', '29')).toBe(true)
        expect(isValidReviewDate('2026', '02', '29')).toBe(false)
        expect(isValidReviewDate('2026', '13', '01')).toBe(false)
        expect(isValidReviewDate('2026', '00', '10')).toBe(false)
    })
})

describe('checkMessage', () => {
    it('接受头部 ! + 记录 + BREAKING CHANGE 的合法消息', () => {
        const result = checkMessage(breakingMessage())
        expect(result.errors).toEqual([])
        expect(result.isBreaking).toBe(true)
        expect(result.review).toMatchObject({
            reviewer: 'CaoMeiYouRen',
            date: '2026-11-21',
            conclusion: 'approved',
            hash: null,
        })
    })

    it('接受 footer-only 破坏性提交与 approved-with-migration', () => {
        const message = breakingMessage({
            header: 'refactor(core): 调整公开契约',
            review: reviewLine({ conclusion: 'approved-with-migration' }),
            note: '旧 API 改为新 API，迁移路径见 docs/guide/upgrade.md。',
        })
        expect(checkMessage(message).errors).toEqual([])
    })

    it('接受可选的短哈希后缀', () => {
        const result = checkMessage(breakingMessage({ review: reviewLine({ hash: 'a1b2c3d4' }) }))
        expect(result.errors).toEqual([])
        expect(result.review?.hash).toBe('a1b2c3d4')
    })

    it('接受非破坏性提交且不要求记录', () => {
        expect(checkMessage('fix(core): 修复边界问题\n\n- 补充空值判断').errors).toEqual([])
    })

    it('拒绝破坏性提交缺少记录', () => {
        expectCode(breakingMessage({ review: '' }), ISSUE_CODES.missingReview)
    })

    it('拒绝同一提交出现多条记录', () => {
        const message = [
            'feat(core)!: 调整公开契约',
            '',
            reviewLine(),
            reviewLine({ conclusion: 'approved-with-migration' }),
            'BREAKING CHANGE: 移除旧导出。',
        ].join('\n')
        expectCode(message, ISSUE_CODES.duplicateReview)
    })

    it('拒绝格式不合法的记录', () => {
        expectCode(breakingMessage({ review: 'Breaking-Review: CaoMeiYouRen 2026-11-21' }), ISSUE_CODES.malformedReview)
        expectCode(breakingMessage({ review: 'Breaking-Review: Cao Mei 2026-11-21 approved' }), ISSUE_CODES.malformedReview)
        expectCode(breakingMessage({ review: reviewLine({ reviewer: '@CaoMeiYouRen' }) }), ISSUE_CODES.malformedReview)
        expectCode(breakingMessage({ review: reviewLine({ reviewer: 'owner' }) }), ISSUE_CODES.invalidReviewer)
        expectCode(breakingMessage({ review: reviewLine({ reviewer: 'TODO' }) }), ISSUE_CODES.invalidReviewer)
        expectCode(breakingMessage({ review: reviewLine({ reviewer: '<CaoMeiYouRen>' }) }), ISSUE_CODES.invalidReviewer)
        expectCode(breakingMessage({ review: reviewLine({ conclusion: 'deferred' }) }), ISSUE_CODES.malformedReview)
        expectCode(breakingMessage({ review: reviewLine({ hash: 'abc' }) }), ISSUE_CODES.malformedReview)
        expectCode(breakingMessage({ review: reviewLine({ hash: 'A1B2C3D4' }) }), ISSUE_CODES.malformedReview)
    })

    it('识别 parser 可抽取的 breaking note 形态', () => {
        const notes = [
            'breaking change: lower',
            'Breaking Change: title',
            '  BREAKING CHANGE: indented',
            '* BREAKING CHANGE: star',
            '| BREAKING CHANGE: pipe',
            'BREAKING CHANGE  no colon',
        ]
        for (const note of notes) {
            const message = `feat(core): 调整公开契约\n\n${note}`
            expect(checkMessage(message).isBreaking).toBe(true)
            expectCode(message, ISSUE_CODES.missingReview)
        }
    })

    it('接受以 URL 开头的多行 note', () => {
        const message = [
            'feat(core)!: 调整公开契约',
            '',
            reviewLine(),
            'BREAKING CHANGE:',
            'https://example.com/migration',
        ].join('\n')
        expect(checkMessage(message).errors).toEqual([])
    })

    it('拒绝后接引用型 footer 的空 note', () => {
        for (const line of ['Refs: #1', 'Fixes: #1', 'Closes #1', 'Signed-off-by: CaoMeiYouRen']) {
            const message = [
                'feat(core)!: 调整公开契约',
                '',
                reviewLine(),
                'BREAKING CHANGE:',
                line,
            ].join('\n')
            expectCode(message, ISSUE_CODES.emptyBreakingNote)
        }
    })

    it('接受以 Fixes / Refs 开头的英文续行', () => {
        for (const line of [
            'Fixes the migration incompatibility.',
            'Refs the docs.',
            'Closes the gap.',
            'Fixes: the migration incompatibility.',
            'Refs: the new docs.',
            'Closes: the gap.',
        ]) {
            const message = [
                'feat(core)!: 调整公开契约',
                '',
                reviewLine(),
                'BREAKING CHANGE:',
                line,
            ].join('\n')
            expect(checkMessage(message).errors).toEqual([])
        }
    })

    it('拒绝下一条为带前缀 note 的空 note', () => {
        for (const line of ['* BREAKING CHANGE: 第二条说明。', '  BREAKING CHANGE: 第二条说明。']) {
            const message = [
                'feat(core)!: 调整公开契约',
                '',
                reviewLine(),
                'BREAKING CHANGE:',
                line,
            ].join('\n')
            expectCode(message, ISSUE_CODES.emptyBreakingNote)
        }
    })

    it('拒绝未与正文空行分隔且前一行是 URL 的记录', () => {
        const message = [
            'feat(core)!: 调整公开契约',
            '',
            '正文说明。',
            'https://example.com',
            reviewLine(),
            'BREAKING CHANGE: 移除旧导出。',
        ].join('\n')
        expectCode(message, ISSUE_CODES.reviewNotInFooter)
    })

    it('接受 parser 可抽取形态的 note 与合法记录', () => {
        for (const note of ['breaking change: lower', '* BREAKING CHANGE: star', '  BREAKING CHANGE: indented']) {
            const message = [
                'feat(core)!: 调整公开契约',
                '',
                reviewLine(),
                note,
            ].join('\n')
            expect(checkMessage(message).errors).toEqual([])
        }
    })

    it('拒绝第二条为空的 BREAKING CHANGE note', () => {
        const message = [
            'feat(core)!: 调整公开契约',
            '',
            reviewLine(),
            'BREAKING CHANGE: 第一条说明。',
            '',
            'BREAKING CHANGE:',
        ].join('\n')
        expectCode(message, ISSUE_CODES.emptyBreakingNote)
    })

    it('拒绝不存在的日历日期', () => {
        expectCode(breakingMessage({ review: reviewLine({ date: '2026-02-30' }) }), ISSUE_CODES.invalidDate)
    })

    it('拒绝头部 ! 但没有 BREAKING CHANGE footer', () => {
        const message = ['feat(core)!: 调整公开契约', '', reviewLine()].join('\n')
        expectCode(message, ISSUE_CODES.missingBreakingFooter)
    })

    it('拒绝记录位于 BREAKING CHANGE 之后', () => {
        const message = [
            'feat(core)!: 调整公开契约',
            '',
            'BREAKING CHANGE: 移除旧导出。',
            reviewLine(),
        ].join('\n')
        expectCode(message, ISSUE_CODES.misplacedReview)
    })

    it('拒绝未与正文以空行分隔的记录', () => {
        const message = [
            'feat(core)!: 调整公开契约',
            '',
            '正文说明。',
            reviewLine(),
            'BREAKING CHANGE: 移除旧导出。',
        ].join('\n')
        expectCode(message, ISSUE_CODES.reviewNotInFooter)
    })

    it('拒绝连字符形式 BREAKING-CHANGE', () => {
        const message = [
            'feat(core)!: 调整公开契约',
            '',
            reviewLine(),
            'BREAKING-CHANGE: 移除旧导出。',
        ].join('\n')
        expectCode(message, ISSUE_CODES.hyphenBreaking)
    })

    it('拒绝空的 BREAKING CHANGE 说明', () => {
        const message = [
            'feat(core)!: 调整公开契约',
            '',
            reviewLine(),
            'BREAKING CHANGE:',
        ].join('\n')
        expectCode(message, ISSUE_CODES.emptyBreakingNote)
    })

    it('拒绝非破坏性提交夹带记录', () => {
        const message = ['fix(core): 修复边界问题', '', reviewLine()].join('\n')
        expectCode(message, ISSUE_CODES.strayReview)
    })

    it('兼容 CRLF 换行', () => {
        const message = breakingMessage().replace(/\n/g, '\r\n')
        expect(checkMessage(message).errors).toEqual([])
    })
})

describe('formatErrors', () => {
    it('按行输出错误码与说明', () => {
        expect(formatErrors([{ code: 'x', message: '说明' }])).toBe('[x] 说明')
    })
})

describe('CLI', () => {
    it('合法消息 exit 0', () => {
        const file = createMessageFile(breakingMessage())
        const result = spawnSync(process.execPath, [scriptPath, file], { encoding: 'utf8' })
        expect(result.status).toBe(0)
        expect(result.stderr).toBe('')
    })

    it('违规消息 exit 1 并输出失败码', () => {
        const file = createMessageFile(breakingMessage({ review: '' }))
        const result = spawnSync(process.execPath, [scriptPath, file], { encoding: 'utf8' })
        expect(result.status).toBe(1)
        expect(result.stderr).toContain(ISSUE_CODES.missingReview)
    })

    it('缺少消息文件参数 exit 1', () => {
        const result = spawnSync(process.execPath, [scriptPath], { encoding: 'utf8' })
        expect(result.status).toBe(1)
        expect(result.stderr).toContain('用法')
    })

    it('main 返回对应退出码', () => {
        expect(main([createMessageFile(breakingMessage())])).toBe(0)
        expect(main([createMessageFile(breakingMessage({ review: '' }))])).toBe(1)
    })
})

describe('commit-msg hook', () => {
    it('先跑 commitlint 并保留失败码，再调用破坏性提交守卫', () => {
        const hook = readFileSync(hookPath, 'utf8')
        expect(hook).toContain('check-breaking-change-commit.mjs "$1"')
        expect(hook).toContain('|| exit $?')
        expect(hook.indexOf('commitlint')).toBeLessThan(hook.indexOf('check-breaking-change-commit.mjs'))
    })
})
