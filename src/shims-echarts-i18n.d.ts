/**
 * `echarts/i18n/*` 语言包是**副作用注册**的纯 JS 模块（导入即注册对应语言），其 `exports`
 * 映射未提供类型入口，故在 `moduleResolution: Bundler` 下无法解析出类型。
 *
 * 此处只声明「模块可解析」，不含任何运行时内容：它对未安装 `echarts`（可选 peer）的下游没有影响，
 * 也不会让包根在缺 peer 时被静态引用（引用点是 `chart-locale.ts` 中的动态 `import()`）。
 */
declare module 'echarts/i18n/langJA'
declare module 'echarts/i18n/langKO'
declare module 'echarts/i18n/langES'
declare module 'echarts/i18n/langFR'
declare module 'echarts/i18n/langDE'
declare module 'echarts/i18n/langRU'
declare module 'echarts/i18n/langPT-br'
