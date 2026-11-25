import type { QRCodeLevel } from './types'

/**
 * 二维码内核（可选 peer `qrcode`）的加载与最小接口。
 *
 * 与图表 / 富文本编辑器同口径：本模块**不静态引用** `qrcode` 的类型或运行时值，
 * 未安装时不阻断包根构建与类型解析；加载失败由组件降级为提示文案。
 */

/** 编码参数（仅包装层实际使用的字段） */
export interface QRCodeRenderOptions {
    width: number
    margin: number
    errorCorrectionLevel: QRCodeLevel
    color: {
        dark: string
        light: string
    }
}

export interface QRCodeModule {
    /** 把文本编码为 PNG data URL */
    toDataURL: (text: string, options: QRCodeRenderOptions) => Promise<string>
}

/**
 * 按需加载二维码编码器。
 *
 * @throws 可选 peer `qrcode` 未安装或加载 / 编码失败时抛出，由包装组件降级为提示。
 */
export async function loadQRCode(): Promise<QRCodeModule> {
    const module = await import('qrcode')
    const candidate = module as unknown as { toDataURL?: unknown, default?: { toDataURL?: unknown } }
    const toDataURL = typeof candidate.toDataURL === 'function'
        ? candidate.toDataURL
        : candidate.default?.toDataURL
    if (typeof toDataURL !== 'function') {
        throw new TypeError('[CaomeiQRCode] qrcode 内核缺少 toDataURL 导出')
    }
    return { toDataURL: toDataURL as QRCodeModule['toDataURL'] }
}
