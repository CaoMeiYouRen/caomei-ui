import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { ENTRY_FILES, RULES, collectAssetFiles, resolveTargetRoot, scanAssets, scanContent } from './check-audit-protocol.mjs'

/** 自工作目录向上定位仓库根（以 `.github/skills` 为锚点）。 */
function resolveRepoRoot() {
    let dir = process.cwd()
    while (!existsSync(join(dir, '.github/skills'))) {
        const parent = dirname(dir)
        if (parent === dir) {
            throw new Error('未能定位仓库根目录')
        }
        dir = parent
    }
    return dir
}

const PROJECT_ROOT = resolveRepoRoot()
const SCRIPT_PATH = join(PROJECT_ROOT, 'scripts/governance/check-audit-protocol.mjs')

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

/** 构造最小仓库夹具，返回仓库根目录。 */
function createFixture(files) {
    const dir = mkdtempSync(join(tmpdir(), 'check-audit-protocol-'))
    tempDirs.push(dir)
    for (const [relativePath, content] of Object.entries(files)) {
        const file = join(dir, relativePath)
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, content)
    }
    return dir
}

const reviewRounds = RULES.find((rule) => rule.id === 'review-rounds')
const auditDuration = RULES.find((rule) => rule.id === 'audit-duration')

/**
 * 重述形态矩阵：覆盖「数字 ↔ 单位」两种顺序、中文与英文、分隔符与序数形态。
 * 语料来源为仓库全历史中实际出现过的写法（见 git log -p 对 .github 与 ai-collaboration 的检索）
 * 与对齐审查逐轮点名的形态。新增语料形态时须同步扩充本矩阵，否则覆盖声明会再次失真。
 */
const ROUND_RESTATEMENT_FORMS = [
    '单条目默认最多 2 轮',
    '单条目审计默认预算 3 轮',
    '轮次上限为 2 轮',
    '单条目最多两轮',
    '第二轮只复查修复点',
    'max 2 rounds per item',
    '3 rounds per item',
    'round two starts here',
    'round 3 starts here',
    'Round 2+ 只复查修复点 diff',
    '同一原子条目连续 3 轮未 Pass',
    '第 4 轮及以后须显式声明新增预算',
    '第 2+ 轮只复查修复点 diff',
    '第 3-4 轮须显式声明',
]

const DURATION_RESTATEMENT_FORMS = [
    '时间盒：≤ 10 分钟',
    '时间盒不超过 20 分钟',
    '| quick | 文档措辞 | ≤ 5 分钟 |',
    'quick 档 5 分钟',
    'timebox: 20 minutes',
]

describe('check-audit-protocol 规则判定', () => {
    it.each(ROUND_RESTATEMENT_FORMS)('轮次规则命中重述形态：%s', (line) => {
        expect(reviewRounds.test(line)).toBe(true)
    })

    it('轮次规则不误报无数量语义的表述', () => {
        expect(reviewRounds.test('对多轮 review 必须说明新增与关闭项')).toBe(false)
        expect(reviewRounds.test('阶段收口 / 发布前须执行一轮并留痕')).toBe(false)
        expect(reviewRounds.test('首轮点击即选中该行')).toBe(false)
        expect(reviewRounds.test('轮次范围与冻结条件见 §3.4')).toBe(false)
    })

    it.each(DURATION_RESTATEMENT_FORMS)('时长规则命中重述形态：%s', (line) => {
        expect(auditDuration.test(line)).toBe(true)
    })

    it('时长规则不误报无数值的链接引用', () => {
        expect(auditDuration.test('时间盒计算依据见 AI 协作规范 §3.1')).toBe(false)
        expect(auditDuration.test('按 evidence-template 追加轮次章节')).toBe(false)
    })
})

describe('scanContent', () => {
    it('同一行命中多条规则时逐条记录，并给出真实行号', () => {
        const hits = scanContent(['# 标题', '单条目最多 2 轮，时间盒 ≤ 5 分钟'].join('\n'))
        expect(hits.map((hit) => hit.ruleId)).toEqual(['review-rounds', 'audit-duration'])
        expect(hits.every((hit) => hit.line === 2)).toBe(true)
        expect(hits[0].hint).toContain('§3.4')
    })

    it('围栏代码块内仅轮次标题模板豁免，其余照常判定', () => {
        const content = ['```md', '## Round 1（第 1 轮）', '时间盒 ≤ 5 分钟', '```', '轮次上限见 §3.4'].join('\n')
        const hits = scanContent(content)
        expect(hits).toHaveLength(1)
        expect(hits[0]).toMatchObject({ line: 3, ruleId: 'audit-duration' })
    })

    it('合规的链接引用写法零命中', () => {
        const content = [
            '- 轮次上限以 AI 协作规范 §3.4 为唯一权威，本技能不重述数值',
            '- 时间盒由调用方声明（见 AI 协作规范 §3.1）',
        ].join('\n')
        expect(scanContent(content)).toEqual([])
    })
})

describe('collectAssetFiles', () => {
    it('收入口文件、agent 定义与 skill 下的 markdown', () => {
        const repoRoot = createFixture({
            'AGENTS.md': '# agents',
            'CLAUDE.md': '# claude',
            '.github/copilot-instructions.md': '# copilot',
            '.github/agents/reviewer.agent.md': '# agent',
            '.github/agents/notes.md': '# 非 agent 定义',
            '.github/skills/demo/SKILL.md': '# skill',
            '.github/skills/demo/references/checklist.md': '# checklist',
            '.github/skills/demo/agents/agent.yaml': 'name: demo',
            'docs/standards/ai-collaboration.md': '# 权威规范',
        })
        const files = collectAssetFiles(repoRoot).map((file) => file.slice(repoRoot.length + 1))
        expect(files).toEqual([
            '.github/agents/reviewer.agent.md',
            '.github/copilot-instructions.md',
            '.github/skills/demo/SKILL.md',
            '.github/skills/demo/references/checklist.md',
            'AGENTS.md',
            'CLAUDE.md',
        ])
        expect(ENTRY_FILES).toContain('AGENTS.md')
    })
})

describe('scanAssets', () => {
    it('命中 AI 资产中的数值重述，且不扫描 docs/ 下的权威规范', () => {
        const repoRoot = createFixture({
            'AGENTS.md': ['# agents', '单条目默认最多 2 轮'].join('\n'),
            '.github/agents/reviewer.agent.md': ['# agent', '时间盒 ≤ 5 分钟'].join('\n'),
            '.github/skills/demo/SKILL.md': '# skill',
            'docs/standards/ai-collaboration.md': ['# 规范', '单条目审计默认预算 3 轮', '时间盒 ≤ 10 分钟'].join('\n'),
        })
        const results = scanAssets(repoRoot)
        expect(results.map((result) => result.file)).toEqual(['.github/agents/reviewer.agent.md', 'AGENTS.md'])
        expect(results[0].hits[0]).toMatchObject({ line: 2, ruleId: 'audit-duration' })
        expect(results[1].hits[0]).toMatchObject({ line: 2, ruleId: 'review-rounds' })
    })
})

describe('resolveTargetRoot', () => {
    it('未传参时回退到默认根目录', () => {
        expect(resolveTargetRoot(undefined, '/repo')).toEqual({ root: '/repo', error: null })
    })

    it('未知参数与非法目录按错误返回，不静默放行', () => {
        expect(resolveTargetRoot('--verbose')).toMatchObject({ root: null })
        expect(resolveTargetRoot('--verbose').error).toContain('不支持的参数')
        expect(resolveTargetRoot(join(tmpdir(), 'missing-root-xyz')).error).toContain('不是仓库根')
    })

    it('含 .github/ 的目录被接受', () => {
        const repoRoot = createFixture({ '.github/agents/reviewer.agent.md': '# agent' })
        expect(resolveTargetRoot(repoRoot, '/repo')).toEqual({ root: repoRoot, error: null })
    })
})

describe('CLI 退出码', () => {
    it('非法目标目录、未知参数与空扫描均按失败退出', () => {
        const missing = spawnSync(process.execPath, [SCRIPT_PATH, join(tmpdir(), 'missing-root-xyz')], { encoding: 'utf8' })
        expect(missing.status).toBe(1)
        expect(missing.stderr).toContain('不是仓库根')
        const unknownFlag = spawnSync(process.execPath, [SCRIPT_PATH, '--verbose'], { encoding: 'utf8' })
        expect(unknownFlag.status).toBe(1)
        expect(unknownFlag.stderr).toContain('不支持的参数')
        const emptyRepo = createFixture({ '.github/agents/agent.yaml': 'name: demo' })
        const empty = spawnSync(process.execPath, [SCRIPT_PATH, emptyRepo], { encoding: 'utf8' })
        expect(empty.status).toBe(1)
        expect(empty.stderr).toContain('拒绝以空扫描通过')
    })

    it('存在违规时 exit 1，并在 stderr 报出规则与修复方向', () => {
        const repoRoot = createFixture({
            '.github/skills/demo/SKILL.md': ['# demo', '单条目默认最多 2 轮'].join('\n'),
        })
        const result = spawnSync(process.execPath, [SCRIPT_PATH, repoRoot], { encoding: 'utf8' })
        expect(result.status).toBe(1)
        expect(result.stderr).toContain('review-rounds')
        expect(result.stderr).toContain('§3.4')
        expect(result.stderr).toContain('review-rounds 1 处')
    })

    it('无违规时 exit 0 并打印通过信息', () => {
        const repoRoot = createFixture({
            '.github/skills/demo/SKILL.md': '# demo\n- 轮次上限见 AI 协作规范 §3.4',
        })
        const result = spawnSync(process.execPath, [SCRIPT_PATH, repoRoot], { encoding: 'utf8' })
        expect(result.status).toBe(0)
        expect(result.stdout).toContain('0 处命中')
    })
})

describe('仓库不变量', () => {
    it('受检范围未被静默收窄', () => {
        const files = collectAssetFiles(PROJECT_ROOT)
        expect(files.length).toBeGreaterThanOrEqual(30)
        for (const entry of ENTRY_FILES) {
            expect(files.some((file) => file.endsWith(entry))).toBe(true)
        }
    })

    it('当前仓库 AI 资产未重述审计协议数值', () => {
        expect(scanAssets(PROJECT_ROOT)).toEqual([])
    })
})
