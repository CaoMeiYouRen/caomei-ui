import { describe, expect, it } from 'vitest'
import {
    ALLOWED_UPDATE_TYPES,
    checkDependabot,
    checkMergify,
    checkRepo,
    extractAllowBlock,
    MERGIFY_FILE_EXCLUSIONS,
    REPO_ROOT,
    splitEcosystems,
    splitMergeRules,
} from './check-dependabot-policy.mjs'

const DEPENDABOT_OK = `version: 2
updates:
  - package-ecosystem: npm
    directory: /
    allow:
      - dependency-type: "all"
        update-types:
          - "version-update:semver-patch"
          - "version-update:semver-minor"
  - package-ecosystem: github-actions
    directory: /
    allow:
      - dependency-type: "all"
        update-types:
          - "version-update:semver-patch"
          - "version-update:semver-minor"
`

const MERGIFY_OK = `pull_request_rules:
  - name: automatic merge
    conditions:
      - base = master
      - author = dependabot[bot]
      - -files~=^release\\.config\\.js$
      - -files~=^\\.github/workflows/release\\.yml$
    actions:
      merge:
        method: rebase
`

describe('splitEcosystems', () => {
    it('按 package-ecosystem 切块并保留块内文本', () => {
        const blocks = splitEcosystems(DEPENDABOT_OK)
        expect(blocks.map((block) => block.ecosystem)).toEqual(['npm', 'github-actions'])
        expect(blocks[0].body).toContain('version-update:semver-patch')
        expect(blocks[1].body).not.toContain('package-ecosystem: npm')
    })
})

describe('extractAllowBlock', () => {
    it('只取 allow 子树，不吞掉同级 ignore 段', () => {
        const body = `    allow:
      - dependency-type: "all"
        update-types:
          - "version-update:semver-patch"
    ignore:
      - dependency-name: "*"
        update-types:
          - "version-update:semver-major"
`
        const allowBlock = extractAllowBlock(body)
        expect(allowBlock).toContain('semver-patch')
        expect(allowBlock).not.toContain('semver-major')
    })
})

describe('checkDependabot', () => {
    it('每个 ecosystem 都限制到 patch / minor 时通过', () => {
        expect(checkDependabot(DEPENDABOT_OK)).toEqual([])
    })

    it('缺少 allow 时失败', () => {
        const text = `version: 2
updates:
  - package-ecosystem: npm
    directory: /
  - package-ecosystem: github-actions
    directory: /
`
        const problems = checkDependabot(text)
        expect(problems.length).toBeGreaterThanOrEqual(2)
        expect(problems.join('\n')).toContain('缺少 allow')
    })

    it('allow 里放行 major 时失败（失败路径：大版本必须转人工）', () => {
        const text = DEPENDABOT_OK.replace(
            '        update-types:\n          - "version-update:semver-patch"',
            '        update-types:\n          - "version-update:semver-patch"\n          - "version-update:semver-major"',
        )
        expect(checkDependabot(text).join('\n')).toContain('大版本须转人工')
    })

    it('allow 被注释掉时按缺失处理（注释停用不算生效）', () => {
        const text = DEPENDABOT_OK.replace(/^ {4}allow:/gm, '    # allow:')
        expect(checkDependabot(text).join('\n')).toContain('缺少 allow')
    })

    it('allow + ignore major 的双重保险写法通过（更严格不应被误判）', () => {
        const text = DEPENDABOT_OK.replace(
            '  - package-ecosystem: npm\n',
            '  - package-ecosystem: npm\n    ignore:\n      - dependency-name: "*"\n        update-types:\n          - "version-update:semver-major"\n',
        )
        expect(checkDependabot(text)).toEqual([])
    })

    it('allow 存在但缺 update-types 时失败', () => {
        const text = `version: 2
updates:
  - package-ecosystem: npm
    allow:
      - dependency-type: "all"
  - package-ecosystem: github-actions
    allow:
      - dependency-type: "all"
`
        expect(checkDependabot(text).join('\n')).toContain('缺少 update-types')
    })

    it('ecosystem 条目低于下界时失败（受检面收窄防护）', () => {
        const text = `version: 2
updates:
  - package-ecosystem: npm
    allow:
      - dependency-type: "all"
        update-types:
          - "version-update:semver-patch"
          - "version-update:semver-minor"
`
        expect(checkDependabot(text).join('\n')).toContain('低于下界')
    })

    it('只放行 patch 而缺 minor 时失败', () => {
        const text = DEPENDABOT_OK.replace(ALLOWED_UPDATE_TYPES[1], '')
        expect(checkDependabot(text).join('\n')).toContain('缺少')
    })
})

describe('checkMergify', () => {
    it('发布链路配置已排除时通过', () => {
        expect(checkMergify(MERGIFY_OK)).toEqual([])
    })

    it('没有任何 dependabot 合并规则时失败（策略失效需人工确认）', () => {
        const problems = checkMergify('pull_request_rules: []\n')
        expect(problems.join('\n')).toContain('未找到 dependabot 自动合并规则')
    })

    it('缺排除条件时失败', () => {
        const text = `${MERGIFY_OK.replace(/^ {6}- -files.*$/gm, '').trimEnd()}\n`
        const problems = checkMergify(text)
        expect(problems).toHaveLength(MERGIFY_FILE_EXCLUSIONS.length)
        expect(problems.join('\n')).toContain('release')
    })

    it('条件被注释停用时失败（注释不算生效）', () => {
        const text = MERGIFY_OK.replace(/^ {6}- -files/gm, '      # - -files')
        expect(checkMergify(text).length).toBe(MERGIFY_FILE_EXCLUSIONS.length)
    })

    it('新增一条无排除条件的 dependabot 合并规则时失败', () => {
        const text = `${MERGIFY_OK}  - name: extra merge
    conditions:
      - author = dependabot[bot]
    actions:
      merge:
        method: squash
`
        const problems = checkMergify(text)
        expect(problems.join('\n')).toContain('第 2 条')
    })
})

describe('splitMergeRules', () => {
    it('只返回带 merge 动作的规则块', () => {
        const text = `${MERGIFY_OK}  - name: review only
    conditions:
      - author = someone
    actions:
      review:
        type: REQUEST_REVIEWS
`
        const blocks = splitMergeRules(text)
        expect(blocks).toHaveLength(1)
        expect(blocks[0]).toContain('automatic merge')
    })
})

describe('checkRepo', () => {
    it('真实仓库配置通过（集成用例，防止守卫与配置脱节）', () => {
        expect(checkRepo(REPO_ROOT)).toEqual([])
    })
})
