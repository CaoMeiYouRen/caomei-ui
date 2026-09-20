/**
 * Node ESM loader：把 `.css` 请求解析为空模块。
 *
 * 用途：构建产物按 `css.inject` 携带逐模块 CSS import（供打包器消费），
 * 而裸 Node 无法加载 `.css`；产物冒烟只校验 JS 导出面，故在冒烟进程中
 * 把 CSS 请求短路为空模块（不改变产物本身，也不替代打包器侧验证）。
 *
 * 用法：`node --import ./scripts/release/register-css-stub.mjs <script>`
 */

/** 需要短路为空的样式扩展名。 */
const CSS_EXTENSIONS = ['.css']

/**
 * `resolve` hook：命中样式扩展名时返回空数据模块。
 *
 * @param {string} specifier 被请求的模块标识
 * @param {unknown} context 解析上下文
 * @param {(specifier: string, context: unknown) => unknown} nextResolve 默认解析
 */
export async function resolve(specifier, context, nextResolve) {
    if (CSS_EXTENSIONS.some((ext) => specifier.endsWith(ext))) {
        return {
            url: 'data:text/javascript,',
            format: 'module',
            shortCircuit: true,
        }
    }
    return nextResolve(specifier, context)
}
