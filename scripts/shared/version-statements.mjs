/**
 * 「当前版本」声明句锚点登记表（弱守卫面）。
 *
 * 单一事实源：文档站版本守卫（`scripts/docs/check-site-version.mjs`）与发布流脚本
 * （`scripts/release/manual-release.mjs`）共用本表——前者据其断言声明句与 `package.json`
 * 一致，后者据其定位并同步版本句。抽出为**无重依赖**的共享模块，使发布脚本无需为此
 * 引入 vitepress。
 *
 * 为什么是弱守卫：这些文件按设计保留**历史版本**叙述（各版本做了什么），故不能对文件内所有
 * 版本字面量施加相等要求；此处只锚定「当前版本 / `latest` =」这一声明句式，句式被改写会在
 * `statement-missing` 上响亮失败（有意的防静默失效设计，代价是改措辞即红）。
 */
export const CURRENT_VERSION_STATEMENTS = [
    { file: 'README.md', pattern: /当前版本[：:]\s*`([^`\s]+)`/u, label: 'README「当前版本」句' },
    { file: 'README.md', pattern: /当前最新版本为\s*`([^`\s]+)`/u, label: 'README「当前最新版本」句' },
    {
        file: 'README.en-US.md',
        pattern: /Current version is\s*`([^`\s]+)`/u,
        label: 'README (en) "Current version" statement',
    },
    {
        // roadmap 写作 `latest` = 0.4.0（版本号本处未加反引号），故捕获「数字版本」而非反引号内容
        file: 'docs/plan/roadmap.md',
        pattern: /`latest`\s*=\s*`?([0-9]+\.[0-9]+(?:\.[0-9]+)?)`?/u,
        label: 'roadmap §1「latest =」当前版本句',
    },
]

/**
 * 版本句同步的受检文件（由登记表去重派生，避免平行维护）。
 *
 * @param {Array<{ file: string }>} statements 声明句登记表
 * @returns {string[]} 文件路径（保持登记表中的出现顺序）
 */
export function statementFiles(statements = CURRENT_VERSION_STATEMENTS) {
    return [...new Set(statements.map((entry) => entry.file))]
}
