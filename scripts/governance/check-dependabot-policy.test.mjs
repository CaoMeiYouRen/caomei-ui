import { describe, expect, it } from 'vitest'
import {
    ALLOWED_UPDATE_TYPES,
    checkDependabot,
    checkMergify,
    checkMergifyJobSync,
    checkRepo,
    extractAllowBlock,
    extractWorkflowJobNames,
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

const TEST_WORKFLOW = `name: Test

on:
  pull_request:

jobs:
  quality:
    name: Quality
    runs-on: ubuntu-latest
    steps:
      - name: Lint (ESLint)
        run: pnpm lint:check

  test-build:
    name: Test & Build
    runs-on: ubuntu-latest
    steps:
      - name: Build library
        run: pnpm build

  visual:
    name: Visual
    runs-on: ubuntu-latest
    steps:
      - name: Visual regression baseline
        run: pnpm test:visual
`

const MERGIFY_WITH_CHECKS = `pull_request_rules:
  - name: automatic merge
    conditions:
      - base = master
      - author = dependabot[bot]
      - check-success = Quality
      - check-success = Test & Build
      - check-success = Visual
    actions:
      merge:
        method: rebase
`

describe('extractWorkflowJobNames', () => {
    it('只取 jobs 下的 name，忽略 steps 的 name', () => {
        expect(extractWorkflowJobNames(TEST_WORKFLOW)).toEqual(['Quality', 'Test & Build', 'Visual'])
    })

    it('缺少 jobs 段时返回空数组', () => {
        expect(extractWorkflowJobNames('name: NoJobs\n')).toEqual([])
    })
})

describe('checkMergifyJobSync', () => {
    it('条件与 Test 工作流 job 集合一致时通过', () => {
        expect(checkMergifyJobSync(MERGIFY_WITH_CHECKS, TEST_WORKFLOW)).toEqual([])
    })

    it('Test 新增 job 未进入条件时失败', () => {
        const mergify = MERGIFY_WITH_CHECKS.replace('      - check-success = Visual\n', '')
        expect(checkMergifyJobSync(mergify, TEST_WORKFLOW)).toEqual([
            'Test 工作流的 job「Visual」未进入自动合并条件（条件须与 Test CI 项目一致）',
        ])
    })

    it('条件引用了不存在的 job 时失败', () => {
        const workflow = TEST_WORKFLOW.replace('    name: Visual', '    name: Visual Regression')
        expect(checkMergifyJobSync(MERGIFY_WITH_CHECKS, workflow)).toEqual([
            'check-success = Visual 在 Test 工作流中不存在（job 改名后未同步？）',
            'Test 工作流的 job「Visual Regression」未进入自动合并条件（条件须与 Test CI 项目一致）',
        ])
    })

    it('未解析到任何 job 时失败（守卫失效）', () => {
        expect(checkMergifyJobSync(MERGIFY_WITH_CHECKS, 'name: Empty\n')).toEqual([
            '未从 Test 工作流解析到任何 job name（守卫失效，需人工确认）',
        ])
    })
})

describe('checkMergifyJobSync：fail-closed 边界', () => {
    const workflowWithoutName = `${TEST_WORKFLOW}
  e2e:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm test:e2e
`

    it('未声明 name 的 job 以 job id 参与对账', () => {
        expect(extractWorkflowJobNames(workflowWithoutName)).toEqual(['Quality', 'Test & Build', 'Visual', 'e2e'])
        expect(checkMergifyJobSync(MERGIFY_WITH_CHECKS, workflowWithoutName)).toEqual([
            'Test 工作流的 job「e2e」未进入自动合并条件（条件须与 Test CI 项目一致）',
        ])
    })

    it('多条 dependabot 规则全部对账，不只看第一条', () => {
        const twoRules = `${MERGIFY_WITH_CHECKS}  - name: second rule
    conditions:
      - author = dependabot[bot]
      - check-success = Quality
    actions:
      merge:
        method: rebase
`
        const problems = checkMergifyJobSync(twoRules, TEST_WORKFLOW)
        expect(problems).toEqual([
            '第 2 条 dependabot 合并规则：Test 工作流的 job「Test & Build」未进入自动合并条件（条件须与 Test CI 项目一致）',
            '第 2 条 dependabot 合并规则：Test 工作流的 job「Visual」未进入自动合并条件（条件须与 Test CI 项目一致）',
        ])
    })

    it('条件行尾注释不参与 check 名', () => {
        const withComment = MERGIFY_WITH_CHECKS.replace(
            '      - check-success = Visual',
            '      - check-success = Visual # 视觉回归门禁',
        )
        expect(checkMergifyJobSync(withComment, TEST_WORKFLOW)).toEqual([])
    })
})

describe('extractWorkflowJobNames：结构变体', () => {
    it('引号键与键行尾注释都被识别', () => {
        const workflow = `jobs:
  "quality":
    name: Quality
  test-build: # 构建与单测
    name: Test & Build
  visual:
    name: Visual # 视觉回归
`
        expect(extractWorkflowJobNames(workflow)).toEqual(['Quality', 'Test & Build', 'Visual'])
    })
})
