import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createCommentVNode, defineComponent, h } from 'vue'
import { Passthrough } from './passthrough'

/**
 * 中间层：自身无 scoped 属性，只把子节点交给 `Passthrough`。
 *
 * 父级 scoped 属性在这里只能沿「组件根」链继承（`setScopeId` 沿 `subTree` 递归），
 * 因此可区分「元素根」与「Fragment 根」两种形态。
 */
function createMiddle(children: () => unknown) {
    return defineComponent({
        name: 'PassthroughMiddle',
        render: () => h(Passthrough, null, { default: children }),
    })
}

/** 带 scoped 属性的最外层组件 */
function createScopedParent(middle: ReturnType<typeof createMiddle>) {
    return defineComponent({
        name: 'PassthroughScopedParent',
        __scopeId: 'data-v-passthrough-scope',
        render: () => h(middle),
    })
}

describe('Passthrough', () => {
    it('只有一个可见子节点时直接交出该节点，父级 scoped 属性落到元素根', () => {
        const wrapper = mount(createScopedParent(createMiddle(() => h('button', { class: 'probe' }, '确定'))))

        expect((wrapper.element as Element).tagName).toBe('BUTTON')
        expect(wrapper.get('button.probe').attributes('data-v-passthrough-scope')).toBeDefined()
    })

    it('`v-if` 关闭分支产生的注释节点不阻止收敛', () => {
        const wrapper = mount(createScopedParent(createMiddle(() => [
            createCommentVNode('v-if', true),
            h('button', { class: 'probe' }, '确定'),
        ])))

        expect((wrapper.element as Element).tagName).toBe('BUTTON')
        expect(wrapper.get('button.probe').attributes('data-v-passthrough-scope')).toBeDefined()
    })

    it('多个可见子节点时保持 Fragment，父级 scoped 属性无处附着', () => {
        const wrapper = mount(createScopedParent(createMiddle(() => [
            h('button', { class: 'first' }, '一'),
            h('span', { class: 'second' }, '二'),
        ])))

        // 两个子节点都在，且都没有父级 scoped 属性（没有可承接的元素根）
        expect(wrapper.findAll('*')).toHaveLength(2)
        expect(wrapper.html()).toContain('一')
        expect(wrapper.html()).toContain('二')
        expect(wrapper.get('button.first').attributes('data-v-passthrough-scope')).toBeUndefined()
        expect(wrapper.get('span.second').attributes('data-v-passthrough-scope')).toBeUndefined()
    })

    it('没有子节点时不渲染任何元素', () => {
        const wrapper = mount(createScopedParent(createMiddle(() => [])))
        expect(wrapper.html()).toBe('')
    })
})
