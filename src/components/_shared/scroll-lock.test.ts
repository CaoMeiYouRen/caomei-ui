import { afterEach, describe, expect, it, vi } from 'vitest'
import { lockScroll } from './scroll-lock'

afterEach(() => {
    document.documentElement.style.overflow = ''
    document.body.style.paddingRight = ''
    vi.restoreAllMocks()
})

describe('lockScroll', () => {
    it('持锁时隐藏根滚动，释放后还原原值', () => {
        document.documentElement.style.overflow = 'scroll'
        document.body.style.paddingRight = '4px'

        const release = lockScroll()
        try {
            expect(document.documentElement.style.overflow).toBe('hidden')
            expect(document.body.style.paddingRight, '无布局 / overlay scrollbar 环境不叠加补偿').toBe('4px')
        } finally {
            release()
        }
        expect(document.documentElement.style.overflow).toBe('scroll')
        expect(document.body.style.paddingRight).toBe('4px')
    })

    it('嵌套持锁按引用计数：先关者不提前解除，全部释放后统一还原', () => {
        const first = lockScroll()
        const second = lockScroll()
        try {
            expect(document.documentElement.style.overflow).toBe('hidden')

            first()
            expect(document.documentElement.style.overflow, '仍有持锁方时保持锁定').toBe('hidden')
        } finally {
            second()
            first()
        }
        expect(document.documentElement.style.overflow).toBe('')
    })

    it('重复释放同一句柄是幂等的', () => {
        const release = lockScroll()
        try {
            release()
            release()
        } finally {
            release()
        }
        expect(document.documentElement.style.overflow).toBe('')
    })
})

describe('lockScroll 滚动条补偿', () => {
    it('经典滚动条环境：补 body padding，且宽度在隐藏滚动条之前测量', () => {
        /*
          用「隐藏后 clientWidth 才变宽」模拟真实浏览器：`overflow: hidden` 生效后滚动条消失，
          `innerWidth - clientWidth` 会变成 0。若实现先隐藏再测宽，本用例会读到 0 而拿不到补偿。
        */
        vi.spyOn(document.documentElement, 'clientWidth', 'get').mockImplementation(
            () => (document.documentElement.style.overflow === 'hidden' ? 1280 : 1265),
        )
        vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1280)
        document.body.style.paddingRight = '4px'

        const release = lockScroll()
        try {
            expect(document.documentElement.style.overflow).toBe('hidden')
            expect(document.body.style.paddingRight, '基础 4px + 滚动条 15px').toBe('19px')
        } finally {
            release()
        }
        expect(document.body.style.paddingRight).toBe('4px')
    })
})
