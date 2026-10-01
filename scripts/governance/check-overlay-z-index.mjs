#!/usr/bin/env node

/**
 * check-overlay-z-index：浮层层级档位语义守卫。
 *
 * 背景（用户缺陷报告，2026-09-30）：Select / MultiSelect / AutoComplete 的面板取
 * `--caomei-z-overlay`（1000），低于 `.caomei-dialog__content` 的 `--caomei-z-modal`（1001）——
 * 面板经 portal 挂到 `body`、与模态内容同处根层叠上下文，Reka 又把面板的计算 `z-index`
 * 复制到 popper 包裹层，故面板被模态卡片盖住（`check:design` 的 `z-index` 预算只拦「数字字面量」，
 * 不判「档位语义」，故该缺陷逃逸）。
 *
 * 检查项：
 * 1. 档位表自证（T1）：`src/styles/theme.css` 的 `--caomei-z-*` 数值必须满足
 *    `overlay < modal < dropdown < tooltip < toast`，且全部在册（防把浮层档位调到模态之下）；
 * 2. 遮罩专用（T2）：`--caomei-z-overlay` 只允许用于 `__overlay` 选择器（遮罩）；
 * 3. 模态内容在册（T3）：`--caomei-z-modal` 只允许用于登记的模态内容选择器；
 * 4. 浮层面板高于模态（T4）：`dropdown` / `tooltip` / `toast` 档位的数值必须大于 `modal`；
 * 5. 浮层覆盖钩子（T5）：浮层档位必须以 `var(--caomei-<comp>-z-index, var(--caomei-z-<档位>))`
 *    形式声明，且钩子名须与所在组件目录一致（防拼写漂移导致静默回退到默认档位）；
 * 6. 静态变体不得继承浮层档位（T6）：浮层档位规则的选择器若是纯类选择器，而同一组件模板中
 *    存在该类的 `--<修饰符>` 变体（如 `ColorPicker` 的 `--inline`），则报错——`z-index` 对
 *    flex item 同样生效，静态形态被抬到模态之上即视觉缺陷（`ColorPicker` 的原始形态）；
 * 7. 抗静默收窄（T7）：受检文件 / 规则 / 浮层声明条目数不得低于下界；预留档位（`sticky` /
 *    `tooltip`）须在册（有消费点时自动移出预留面）；
 * 8. E2E 面板清单联动（T10）：`src` 中声明锚定浮层档位的组件集合，必须与 E2E 受检清单
 *    （`test/e2e/fixtures/overlay-panels.json`）逐一对应——新增 portal 浮层组件而未补 E2E
 *    清单（或反之）即报错；非面板消费点（`toast` 视口 / `image` 预览灯箱）以显式名单排除并受
 *    反向校验。
 *
 * 用法：
 *   node scripts/governance/check-overlay-z-index.mjs            # 有错误 exit 1
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'
import { collectEntries, collectRuleEntries, declarationsOf } from './check-design.mjs'

const REPO_ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..')
const COMPONENTS = join(REPO_ROOT, 'src', 'components')
const THEME_FILE = join(REPO_ROOT, 'src', 'styles', 'theme.css')
const PANEL_CASES_FILE = join(REPO_ROOT, 'test', 'e2e', 'fixtures', 'overlay-panels.json')

/** 档位自证顺序（严格递增）；`raise` / `pinned*` 为局部层叠 token，不参与浮层顺序。 */
export const FLOATING_TIER_ORDER = ['overlay', 'modal', 'dropdown', 'tooltip', 'toast']

/** 全部在册的浮层 token（缺一即视为档位表被删项）。 */
export const KNOWN_TIERS = [...FLOATING_TIER_ORDER]

/** 允许声明 `--caomei-z-modal` 的模态内容选择器（精确匹配 `rule.selector.trim()`）。 */
export const MODAL_CONTENT_SELECTORS = new Set([
    '.caomei-dialog__content',
    '.caomei-confirm-dialog__content',
    '.caomei-drawer__content',
])

/** 允许声明 `--caomei-z-overlay` 的选择器形态：`.<namespace>__overlay`。 */
export const MASK_SELECTOR_RE = /^\.caomei-[a-z0-9-]+__overlay$/

/**
 * 覆盖钩子名与组件目录名不一致的例外（键为仓库相对路径，值为钩子名 + 理由）。
 * `image` 的预览遮罩按形态命名（`--caomei-image-preview-z-index`），不随目录名。
 */
export const HOOK_NAME_EXCEPTIONS = new Map([
    ['src/components/image/image.vue', '--caomei-image-preview-z-index'],
])

/** 无消费点的预留档位（有消费点时必须移出本表，否则 T7 判「预留档位已有消费点」）。 */
export const RESERVED_TIERS = new Set(['sticky', 'tooltip'])

/**
 * 声明浮层档位但**不是锚定浮层面板**的组件（不参与 E2E 面板清单联动，T10）。
 * `toast` 为命令式视口（非锚定面板）、`image` 为预览灯箱（覆盖整个视口）；
 * 两者档位同样 ≥ 模态内容，但不由 Dialog 内的触发器开合。受反向校验：条目不再声明浮层档位即报错。
 */
export const NON_PANEL_FLOATING_COMPONENTS = new Set(['toast', 'image'])

/** 受检面下界：防扫描器 / 入口静默收窄后「零违规」变成空真。 */
export const MIN_COMPONENT_FILES = 60
export const MIN_COMPONENT_RULES = 600
export const MIN_FLOATING_DECLARATIONS = 7

/** 浮层档位（须高于模态内容）。 */
const FLOATING_TIERS = new Set(['dropdown', 'tooltip', 'toast'])

const rel = (file) => file.replace(/\\/g, '/').replace(`${REPO_ROOT.replace(/\\/g, '/')}/`, '')

/**
 * 解析 `src/styles/theme.css` 的浮层档位表。
 *
 * @param {string} css theme.css 文本
 * @returns {Map<string, number>} 档位名 → 数值（同名取首次声明）
 */
export function parseZIndexTiers(css) {
    const tiers = new Map()
    for (const match of css.matchAll(/--caomei-z-([a-z0-9-]+)\s*:\s*(\d+)\s*;/g)) {
        if (!tiers.has(match[1])) {
            tiers.set(match[1], Number(match[2]))
        }
    }
    return tiers
}

/**
 * 取出文本中第一个配平的 `var(...)` 表达式。
 *
 * @param {string} text 声明值（可含 `+ 1` 等偏移）
 * @returns {string | null} 配平的 `var(...)` 文本；无则 `null`
 */
export function extractBalancedVar(text) {
    const start = text.indexOf('var(')
    if (start === -1) {
        return null
    }
    let depth = 0
    for (let i = start; i < text.length; i += 1) {
        if (text[i] === '(') {
            depth += 1
        } else if (text[i] === ')') {
            depth -= 1
            if (depth === 0) {
                return text.slice(start, i + 1)
            }
        }
    }
    return null
}

/**
 * 解析 `z-index` 声明的形态。
 *
 * 支持三种写法：`var(--caomei-z-<档位>)`、`var(--caomei-<comp>-z-index, var(--caomei-z-<档位>))`，
 * 以及以 `calc(...)` 包裹的同一形态（如 Image 预览内容 `calc(... + 1)`）。
 *
 * @param {string} value 声明值
 * @returns {{ kind: 'plain' | 'hook', tier: string, hook: string | null, offset: boolean } | null}
 * 无法识别时返回 `null`（如数字字面量、关键字——由 `check:design` 的 G4 兜底）
 */
export function parseZIndexValue(value) {
    let text = value.replace(/!important$/i, '').trim()
    let offset = false
    if (text.startsWith('calc(') && text.endsWith(')')) {
        text = text.slice('calc('.length, -1).trim()
        offset = true
    }
    const varText = extractBalancedVar(text)
    if (!varText) {
        return null
    }
    const hookMatch = varText.match(/^var\(\s*(--caomei-[a-z0-9-]+-z-index)\s*,\s*var\(\s*--caomei-z-([a-z0-9-]+)\s*\)\s*\)$/)
    if (hookMatch) {
        return { kind: 'hook', tier: hookMatch[2], hook: hookMatch[1], offset }
    }
    const plainMatch = varText.match(/^var\(\s*--caomei-z-([a-z0-9-]+)\s*\)$/)
    if (plainMatch) {
        return { kind: 'plain', tier: plainMatch[1], hook: null, offset }
    }
    return null
}

/**
 * T1：档位表顺序自证。
 *
 * @param {Map<string, number>} tiers 档位表
 * @returns {string[]} 问题列表
 */
export function findTierOrderIssues(tiers) {
    const issues = []
    for (const tier of KNOWN_TIERS) {
        if (!tiers.has(tier)) {
            issues.push(`[tier-missing] --caomei-z-${tier} 未在 theme.css 声明（档位表被删项）`)
        }
    }
    for (let i = 1; i < FLOATING_TIER_ORDER.length; i += 1) {
        const lower = FLOATING_TIER_ORDER[i - 1]
        const upper = FLOATING_TIER_ORDER[i]
        const lowerValue = tiers.get(lower)
        const upperValue = tiers.get(upper)
        if (lowerValue === undefined || upperValue === undefined) {
            continue
        }
        if (!(lowerValue < upperValue)) {
            issues.push(`[tier-order] --caomei-z-${lower}（${lowerValue}）必须小于 --caomei-z-${upper}（${upperValue}）`)
        }
    }
    return issues
}

/** 收集组件样式中所有 `z-index` 声明（含文件 / 选择器 / 形态）。 */
export function collectZIndexDeclarations(entries) {
    const declarations = []
    for (const rule of collectRuleEntries(entries)) {
        for (const decl of declarationsOf(rule.body)) {
            if (decl.property !== 'z-index') {
                continue
            }
            declarations.push({
                file: rule.file,
                selector: rule.selector.trim(),
                value: decl.value,
                parsed: parseZIndexValue(decl.value),
            })
        }
    }
    return declarations
}

/**
 * T2 / T3：档位与选择器语义匹配。
 *
 * @param {Array<{ file: string, selector: string, value: string, parsed: ReturnType<typeof parseZIndexValue> }>} declarations
 * @returns {string[]} 问题列表
 */
export function findTierSelectorIssues(declarations) {
    const issues = []
    for (const decl of declarations) {
        if (!decl.parsed) {
            continue
        }
        if (decl.parsed.tier === 'overlay' && !MASK_SELECTOR_RE.test(decl.selector)) {
            issues.push(`[overlay-misuse] ${decl.file}: ${decl.selector} 使用了遮罩档位 --caomei-z-overlay（只允许用于 .caomei-<ns>__overlay 遮罩；浮层面板必须取 --caomei-z-dropdown 及以上）`)
        }
        if (decl.parsed.tier === 'modal' && !MODAL_CONTENT_SELECTORS.has(decl.selector)) {
            issues.push(`[modal-misuse] ${decl.file}: ${decl.selector} 使用了模态内容档位 --caomei-z-modal（只允许用于 ${[...MODAL_CONTENT_SELECTORS].join(' / ')}）`)
        }
    }
    return issues
}

/**
 * T4 / T5：浮层档位必须高于模态内容，且必须带与组件目录一致的覆盖钩子。
 *
 * @param {Array<{ file: string, selector: string, value: string, parsed: ReturnType<typeof parseZIndexValue> }>} declarations
 * @param {Map<string, number>} tiers 档位表
 * @returns {string[]} 问题列表
 */
export function findFloatingTierIssues(declarations, tiers) {
    const issues = []
    const modalValue = tiers.get('modal')
    for (const decl of declarations) {
        if (!decl.parsed || !FLOATING_TIERS.has(decl.parsed.tier)) {
            continue
        }
        const tierValue = tiers.get(decl.parsed.tier)
        if (modalValue !== undefined && tierValue !== undefined && !(tierValue > modalValue)) {
            issues.push(`[tier-below-modal] ${decl.file}: ${decl.selector} 的档位 --caomei-z-${decl.parsed.tier}（${tierValue}）必须高于模态内容 --caomei-z-modal（${modalValue}）`)
        }
        if (decl.parsed.kind !== 'hook') {
            issues.push(`[hook-missing] ${decl.file}: ${decl.selector} 的浮层档位缺少覆盖钩子（应写 var(--caomei-<comp>-z-index, var(--caomei-z-${decl.parsed.tier}))）`)
            continue
        }
        const expected = HOOK_NAME_EXCEPTIONS.get(decl.file)
        if (expected) {
            if (decl.parsed.hook !== expected) {
                issues.push(`[hook-name] ${decl.file}: ${decl.selector} 的钩子应为 ${expected}，实为 ${decl.parsed.hook}`)
            }
            continue
        }
        const dir = decl.file.split('/')[2]
        const expectedHook = `--caomei-${dir}-z-index`
        if (decl.parsed.hook !== expectedHook) {
            issues.push(`[hook-name] ${decl.file}: ${decl.selector} 的钩子名应与组件目录一致（期望 ${expectedHook}，实为 ${decl.parsed.hook}；目录名与形态名不一致时须登记 HOOK_NAME_EXCEPTIONS）`)
        }
    }
    return issues
}

/**
 * T8：引用了档位 token 但形态未被识别的 `z-index` 声明（fail-closed）。
 *
 * 反例：`var(--caomei-z-overlay, 9999)` / `var(--caomei-z-dropdown, 1050)`——带字面量回退的写法
 * 会解析失败，若不显式报错就会**静默绕过** T2 / T4 / T5 / T6（`check:design` 的 G4 只拦纯数字值、
 * token 存在性检查对带 fallback 的引用放行）。故凡值中引用 `--caomei-z-*` 而形态未识别，一律报错。
 *
 * @param {Array<{ file: string, selector: string, value: string, parsed: ReturnType<typeof parseZIndexValue> }>} declarations
 * @returns {string[]} 问题列表
 */
export function findUnparsedTierIssues(declarations) {
    const issues = []
    for (const decl of declarations) {
        if (decl.parsed || !/--caomei-z-[a-z0-9-]+/.test(decl.value)) {
            continue
        }
        issues.push(`[unparsed-tier-form] ${decl.file}: ${decl.selector} 的 z-index 引用了档位 token 但形态未识别（${decl.value}）；请改用 var(--caomei-z-<档位>) 或 var(--caomei-<comp>-z-index, var(--caomei-z-<档位>)) 形态`)
    }
    return issues
}

/**
 * T9：允许名单反向校验（防清单腐烂）。
 *
 * 三类在册清单都必须与产物一致：`HOOK_NAME_EXCEPTIONS` 的例外条目必须在产物中命中期望钩子；
 * `MODAL_CONTENT_SELECTORS` 的模态内容选择器必须真的被 `--caomei-z-modal` 使用。
 * （`RESERVED_TIERS` 的反向校验在 `findScopeIssues` 的「已消费即报错」分支。）
 *
 * @param {Array<{ file: string, selector: string, value: string, parsed: ReturnType<typeof parseZIndexValue> }>} declarations
 * @returns {string[]} 问题列表
 */
export function findAllowlistIssues(declarations) {
    const issues = []
    for (const [file, hook] of HOOK_NAME_EXCEPTIONS) {
        const hit = declarations.some((decl) => decl.file === file && decl.parsed?.kind === 'hook' && decl.parsed.hook === hook)
        if (!hit) {
            issues.push(`[stale-exception] HOOK_NAME_EXCEPTIONS 的 ${file} → ${hook} 未在产物中命中（例外清单腐烂，请同步）`)
        }
    }
    for (const selector of MODAL_CONTENT_SELECTORS) {
        const hit = declarations.some((decl) => decl.selector === selector && decl.parsed?.tier === 'modal')
        if (!hit) {
            issues.push(`[stale-modal-selector] MODAL_CONTENT_SELECTORS 的 ${selector} 未被 --caomei-z-modal 使用（清单腐烂，请同步）`)
        }
    }
    return issues
}

/**
 * T6：静态变体不得继承浮层档位。
 *
 * 规则面：浮层档位声明 + 选择器为**纯类选择器** + 同组件模板存在该类的 `--<修饰符>` 变体。
 * 此时静态形态会拿到浮层档位（`z-index` 对 flex item 同样生效）。
 * `:not(...)` 只在**确实排除了该变体类**时放行（无关的 `:not()` 不构成排除）。
 *
 * @param {Array<{ file: string, selector: string, value: string, parsed: ReturnType<typeof parseZIndexValue> }>} declarations
 * @param {Map<string, string>} templateByFile 仓库相对路径 → 模板文本
 * @returns {string[]} 问题列表
 */
export function findStaticVariantIssues(declarations, templateByFile) {
    const issues = []
    for (const decl of declarations) {
        if (!decl.parsed || !FLOATING_TIERS.has(decl.parsed.tier)) {
            continue
        }
        const template = templateByFile.get(decl.file)
        if (!template) {
            continue
        }
        for (const match of decl.selector.matchAll(/\.(caomei-[a-z0-9_-]+)/g)) {
            const className = match[1]
            if (!template.includes(`${className}--`) || excludesClass(decl.selector, className)) {
                continue
            }
            issues.push(`[static-variant] ${decl.file}: ${decl.selector} 的类 ${className} 存在静态变体（模板含 ${className}--*），档位会被非 portal 形态继承；请用 :not(.${className}--<变体>) 限定或把档位声明限定到 portal 专属类`)
        }
    }
    return issues
}

/**
 * 选择器的 `:not(...)` 是否确实排除了指定类。
 *
 * @param {string} selector 选择器
 * @param {string} className 类名（不含 `.`）
 * @returns {boolean} 存在排除该类的 `:not()`
 */
export function excludesClass(selector, className) {
    for (const match of selector.matchAll(/:not\(([^)]*)\)/g)) {
        if (match[1].includes(className)) {
            return true
        }
    }
    return false
}

/** 提取 `.vue` 的模板文本（非 `.vue` 返回空串）。 */
export function extractTemplateText(file, text) {
    if (!file.endsWith('.vue')) {
        return ''
    }
    const match = text.match(/<template>([\s\S]*)<\/template>/)
    return match ? match[1] : ''
}

/**
 * T7：受检面与预留档位。
 *
 * @param {{ files: number, rules: number, floatingDeclarations: number, consumedTiers: Set<string> }} counts
 * @returns {string[]} 问题列表
 */
export function findScopeIssues(counts) {
    const issues = []
    if (counts.files < MIN_COMPONENT_FILES) {
        issues.push(`[scan-scope-narrowed] 受检组件文件 ${counts.files} < 下界 ${MIN_COMPONENT_FILES}`)
    }
    if (counts.rules < MIN_COMPONENT_RULES) {
        issues.push(`[scan-scope-narrowed] 受检样式规则 ${counts.rules} < 下界 ${MIN_COMPONENT_RULES}`)
    }
    if (counts.floatingDeclarations < MIN_FLOATING_DECLARATIONS) {
        issues.push(`[scan-scope-narrowed] 浮层档位声明 ${counts.floatingDeclarations} < 下界 ${MIN_FLOATING_DECLARATIONS}`)
    }
    for (const tier of RESERVED_TIERS) {
        if (counts.consumedTiers.has(tier)) {
            issues.push(`[reserved-tier-consumed] --caomei-z-${tier} 已登记为预留档位但出现消费点，请同步 RESERVED_TIERS 与设计规范 §2.5`)
        }
    }
    return issues
}

/**
 * T10：从 `z-index` 声明中提取「锚定浮层面板」的组件目录集合。
 *
 * 口径：浮层档位（`dropdown` / `tooltip` / `toast`）+ 覆盖钩子形态（`kind === 'hook'`），
 * 排除 `NON_PANEL_FLOATING_COMPONENTS`（命令式视口 / 灯箱，非锚定面板）。
 *
 * @param {Array<{ file: string, selector: string, value: string, parsed: ReturnType<typeof parseZIndexValue> }>} declarations
 * @param {Set<string>} [nonPanelComponents]
 * @returns {Set<string>} 组件目录名集合（如 `select` / `dropdown-menu`）
 */
export function collectAnchoredPanelComponents(declarations, nonPanelComponents = NON_PANEL_FLOATING_COMPONENTS) {
    const dirs = new Set()
    for (const decl of declarations) {
        if (!decl.parsed || !FLOATING_TIERS.has(decl.parsed.tier) || decl.parsed.kind !== 'hook') {
            continue
        }
        const dir = decl.file.split('/')[2]
        if (!dir || nonPanelComponents.has(dir)) {
            continue
        }
        dirs.add(dir)
    }
    return dirs
}

/**
 * 读取 E2E 面板清单（`test/e2e/fixtures/overlay-panels.json`）的 case 名（即组件目录名）。
 *
 * @param {string} [filepath]
 * @returns {string[]}
 */
export function readPanelCaseNames(filepath = PANEL_CASES_FILE) {
    const parsed = JSON.parse(readFileSync(filepath, 'utf8'))
    return Array.isArray(parsed?.cases) ? parsed.cases.map((item) => item.name) : []
}

/**
 * T10：声明层锚定面板集合 ↔ E2E 面板清单的双向对账（含非面板例外名单的反向校验）。
 *
 * @param {Array<{ file: string, selector: string, value: string, parsed: ReturnType<typeof parseZIndexValue> }>} declarations
 * @param {string[]} panelCaseNames E2E 清单的 case 名
 * @param {Set<string>} [nonPanelComponents]
 * @returns {string[]} 问题列表
 */
export function findPanelCaseLinkIssues(declarations, panelCaseNames, nonPanelComponents = NON_PANEL_FLOATING_COMPONENTS) {
    const issues = []
    const anchored = collectAnchoredPanelComponents(declarations, nonPanelComponents)
    const cases = new Set(panelCaseNames)

    for (const dir of anchored) {
        if (!cases.has(dir)) {
            issues.push(`[panel-case-missing] 组件 ${dir} 声明了锚定浮层档位，但未登记于 E2E 面板清单（test/e2e/fixtures/overlay-panels.json）`)
        }
    }
    for (const name of cases) {
        if (!anchored.has(name)) {
            issues.push(`[panel-case-stale] E2E 面板清单条目 "${name}" 无对应的锚定浮层档位声明（清单腐烂，请同步）`)
        }
    }

    // 反向校验：非面板例外名单条目必须仍声明浮层档位
    // 口径：只要求该目录存在**任一**浮层档位声明（不限 `kind === 'hook'`）——例外名单的语义是
    // 「该组件仍有浮层档位消费点」，形态（钩子 / 纯档位）由 T4 / T5 另行判定。
    const floatingDirs = new Set(
        declarations
            .filter((decl) => decl.parsed && FLOATING_TIERS.has(decl.parsed.tier))
            .map((decl) => decl.file.split('/')[2]),
    )
    for (const dir of nonPanelComponents) {
        if (!floatingDirs.has(dir)) {
            issues.push(`[stale-non-panel] NON_PANEL_FLOATING_COMPONENTS 的 ${dir} 未声明浮层档位（例外名单腐烂，请同步）`)
        }
    }

    return issues
}

/**
 * 收集 `src/components/**` 的样式条目与 `z-index` 声明（供 `runChecks` 与单测共用）。
 *
 * @returns {{ entries: Array<{ file: string, text: string }>, declarations: ReturnType<typeof collectZIndexDeclarations> }}
 */
export function collectOverlayDeclarations() {
    const entries = collectEntries(COMPONENTS, (file) => file.endsWith('.vue'))
    return { entries, declarations: collectZIndexDeclarations(entries) }
}

/** 运行全部检查（供 CLI 与单测共用）。 */
export function runChecks() {
    const tiers = parseZIndexTiers(readFileSync(THEME_FILE, 'utf8'))
    const { entries, declarations } = collectOverlayDeclarations()
    const rules = collectRuleEntries(entries)
    const templateByFile = new Map(entries.map(({ file, text }) => [rel(file), extractTemplateText(file, text)]))
    const floatingDeclarations = declarations.filter((decl) => decl.parsed && FLOATING_TIERS.has(decl.parsed.tier))
    const consumedTiers = new Set(declarations.filter((decl) => decl.parsed).map((decl) => decl.parsed.tier))
    const counts = {
        files: entries.length,
        rules: rules.length,
        floatingDeclarations: floatingDeclarations.length,
        consumedTiers,
    }
    return {
        tiers,
        counts,
        tierOrderIssues: findTierOrderIssues(tiers),
        tierSelectorIssues: findTierSelectorIssues(declarations),
        floatingTierIssues: findFloatingTierIssues(declarations, tiers),
        staticVariantIssues: findStaticVariantIssues(declarations, templateByFile),
        unparsedTierIssues: findUnparsedTierIssues(declarations),
        allowlistIssues: findAllowlistIssues(declarations),
        scopeIssues: findScopeIssues(counts),
        panelCaseLinkIssues: findPanelCaseLinkIssues(declarations, readPanelCaseNames()),
    }
}

function main() {
    const result = runChecks()
    const problems = [
        ...result.tierOrderIssues,
        ...result.tierSelectorIssues,
        ...result.floatingTierIssues,
        ...result.staticVariantIssues,
        ...result.unparsedTierIssues,
        ...result.allowlistIssues,
        ...result.scopeIssues,
        ...result.panelCaseLinkIssues,
    ]
    if (problems.length > 0) {
        for (const problem of problems) {
            console.error(`[check-overlay-z-index] ${problem}`)
        }
        console.error(`[check-overlay-z-index] 失败：${problems.length} 处问题`)
        process.exitCode = 1
        return
    }
    const tierSummary = FLOATING_TIER_ORDER.map((tier) => `${tier} ${result.tiers.get(tier)}`).join(' < ')
    console.info(`[check-overlay-z-index] 通过：档位表有序（${tierSummary}）、遮罩档位专用、模态内容在册、浮层 ${result.counts.floatingDeclarations} 处均高于模态且带覆盖钩子、无静态变体继承、锚定面板与 E2E 清单 ${readPanelCaseNames().length} 项联动（受检 ${result.counts.files} 文件 / ${result.counts.rules} 规则 / 下界 ${MIN_COMPONENT_FILES}·${MIN_COMPONENT_RULES}）`)
}

if (isDirectExecution(import.meta.url)) {
    main()
}
