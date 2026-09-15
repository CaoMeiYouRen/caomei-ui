import { colorToString, parseColor } from 'reka-ui'

/**
 * 归一为 6 位十六进制颜色（`#rrggbb`），并剥离 alpha 通道。
 *
 * Reka 的 color primitive 支持 `#rrggbbaa`；本库 ColorPicker 不承诺透明度，
 * 故统一剥离 alpha，避免同一 prop 下 `hex` 透传、`rgb` / `hsb` 却静默丢弃的不一致。
 *
 * @param value 颜色字符串
 * @param fallback 解析失败时的回退颜色
 */
export function toHex6(value: string, fallback = '#ff0000'): string {
    for (const candidate of [value, fallback]) {
        if (!candidate) {
            continue
        }
        try {
            return colorToString(parseColor(candidate), 'hex').slice(0, 7)
        } catch {
            // 尝试下一个候选
        }
    }
    return '#ff0000'
}
