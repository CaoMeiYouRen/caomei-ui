/** 注册 `.css` 短路 loader（供 `node --import` 使用），见 `css-stub-loader.mjs`。 */
import { register } from 'node:module'

register('./css-stub-loader.mjs', import.meta.url)
