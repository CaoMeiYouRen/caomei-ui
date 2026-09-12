import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'
import {
    createToastStore,
    provideToastStore,
    useToast,
    type ToastApi,
} from './use-toast'

describe('createToastStore', () => {
    it('字符串内容规范化为 title，并生成唯一 id', () => {
        const store = createToastStore()
        const first = store.add('第一条')
        const second = store.add('第二条')

        expect(first).not.toBe(second)
        expect(store.toasts.value.map((item) => item.title)).toEqual(['第一条', '第二条'])
    })

    it('add 指定的语气会覆盖内容自带语气', () => {
        const store = createToastStore()
        store.add({ title: '保存', tone: 'danger' }, 'success')

        expect(store.toasts.value[0].tone).toBe('success')
    })

    it('dismiss 按 id 移除，未知 id 无副作用', () => {
        const store = createToastStore()
        const id = store.add('保留')
        store.add('移除')

        store.dismiss(id)
        store.dismiss('missing')

        expect(store.toasts.value.map((item) => item.title)).toEqual(['移除'])
    })

    it('clear 清空全部提示', () => {
        const store = createToastStore()
        store.add('a')
        store.add('b')

        store.clear()

        expect(store.toasts.value).toHaveLength(0)
    })

    it('超出 max 时丢弃最早的，保留最新', () => {
        const store = createToastStore(2)
        store.add('1')
        store.add('2')
        store.add('3')

        expect(store.toasts.value.map((item) => item.title)).toEqual(['2', '3'])
    })

    it('max <= 0 时不限制条数', () => {
        const store = createToastStore(0)
        store.add('1')
        store.add('2')
        store.add('3')

        expect(store.toasts.value).toHaveLength(3)
    })

    it('setMax 调小时立即裁剪既有队列', () => {
        const store = createToastStore()
        store.add('1')
        store.add('2')
        store.add('3')

        store.setMax(2)

        expect(store.max.value).toBe(2)
        expect(store.toasts.value.map((item) => item.title)).toEqual(['2', '3'])
    })
})

describe('useToast', () => {
    it('在 CaomeiToastProvider 之外调用时抛出明确错误', () => {
        const orphan = defineComponent({
            render: () => null,
            setup() {
                useToast()
            },
        })

        expect(() => mount(orphan)).toThrow(/CaomeiToastProvider/)
    })

    it('快捷方法写入对应语气，dismiss 与 clear 生效', () => {
        const store = createToastStore()
        let api: ToastApi | undefined

        const consumer = defineComponent({
            setup() {
                api = useToast()
                return () => null
            },
        })
        const parent = defineComponent({
            setup() {
                provideToastStore(store)
                return () => h(consumer)
            },
        })

        mount(parent)

        expect(api).toBeDefined()
        api?.info('i')
        api?.success('s')
        api?.warning('w')
        api?.danger('d')
        api?.show('n')

        expect(store.toasts.value.map((item) => item.tone)).toEqual([
            'neutral',
            'success',
            'warning',
            'danger',
            undefined,
        ])

        const id = api?.show('待关闭')
        api?.dismiss(id as string)
        api?.clear()

        expect(store.toasts.value).toHaveLength(0)
    })
})
