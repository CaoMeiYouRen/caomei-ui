import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'
import {
    createConfirmStore,
    provideConfirmStore,
    useConfirm,
    type ConfirmApi,
} from './use-confirm'

describe('createConfirmStore', () => {
    it('open 返回待决 Promise，settle(true) 解析为 true 并清空请求', async () => {
        const store = createConfirmStore()
        const result = store.open({ title: '删除文件' })

        expect(store.request.value).toMatchObject({ title: '删除文件', id: 1 })

        store.settle(true)

        await expect(result).resolves.toBe(true)
        expect(store.request.value).toBeNull()
    })

    it('settle(false) 解析为 false', async () => {
        const store = createConfirmStore()
        const result = store.open({ title: '删除文件' })

        store.settle(false)

        await expect(result).resolves.toBe(false)
    })

    it('confirm 字符串简写规范化为 title', async () => {
        const store = createConfirmStore()
        const result = store.confirm('确定退出？')

        expect(store.request.value).toMatchObject({ title: '确定退出？' })

        store.settle(true)
        await expect(result).resolves.toBe(true)
    })

    it('confirm 对象透传全部选项', () => {
        const store = createConfirmStore()
        void store.confirm({
            title: '删除',
            description: '不可恢复',
            confirmLabel: '删除',
            cancelLabel: '保留',
            tone: 'danger',
        })

        expect(store.request.value).toMatchObject({
            title: '删除',
            description: '不可恢复',
            confirmLabel: '删除',
            cancelLabel: '保留',
            tone: 'danger',
        })
    })

    it('cancel 以 false 结算并清空请求', async () => {
        const store = createConfirmStore()
        const result = store.open({ title: '删除' })

        store.cancel()

        await expect(result).resolves.toBe(false)
        expect(store.request.value).toBeNull()
    })

    it('待决期间再次 open 会以 false 结算旧请求并替换为新请求', async () => {
        const store = createConfirmStore()
        const first = store.open({ title: '第一个' })
        const second = store.open({ title: '第二个' })

        await expect(first).resolves.toBe(false)
        expect(store.request.value).toMatchObject({ title: '第二个', id: 2 })

        store.settle(true)
        await expect(second).resolves.toBe(true)
    })

    it('无待决请求时 settle / cancel 无副作用', () => {
        const store = createConfirmStore()

        expect(() => {
            store.settle(true)
            store.cancel()
        }).not.toThrow()
        expect(store.request.value).toBeNull()
    })

    it('settle 携带过期 id 时不结算当前请求', async () => {
        const store = createConfirmStore()
        const first = store.open({ title: '第一个' })
        const second = store.open({ title: '第二个' })

        await expect(first).resolves.toBe(false)

        // 旧请求 id 的迟到回调不应影响新请求
        store.settle(true, 1)
        expect(store.request.value).toMatchObject({ title: '第二个', id: 2 })

        store.settle(true, 2)
        await expect(second).resolves.toBe(true)
    })

    it('dispose 以 false 结算待决请求', async () => {
        const store = createConfirmStore()
        const result = store.open({ title: '卸载' })

        store.dispose()

        await expect(result).resolves.toBe(false)
        expect(store.request.value).toBeNull()
    })
})

describe('useConfirm', () => {
    it('在 CaomeiConfirmDialog 之外调用时抛出明确错误', () => {
        const orphan = defineComponent({
            render: () => null,
            setup() {
                useConfirm()
            },
        })

        expect(() => mount(orphan)).toThrow(/CaomeiConfirmDialog/)
    })

    it('通过 Provider 暴露 open / confirm / cancel', async () => {
        const store = createConfirmStore()
        let api: ConfirmApi | undefined

        const consumer = defineComponent({
            setup() {
                api = useConfirm()
                return () => null
            },
        })
        const parent = defineComponent({
            setup() {
                provideConfirmStore(store)
                return () => h(consumer)
            },
        })

        mount(parent)

        expect(api).toBeDefined()

        const opened = api?.open({ title: '打开' })
        expect(store.request.value?.title).toBe('打开')
        store.settle(true)
        await expect(opened).resolves.toBe(true)

        const confirmed = api?.confirm('确认')
        expect(store.request.value?.title).toBe('确认')
        api?.cancel()
        await expect(confirmed).resolves.toBe(false)
    })
})
