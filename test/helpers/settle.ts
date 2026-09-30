import { vi } from 'vitest'

/**
 * 交互后等待状态收敛：轮询执行断言直到通过；超时才失败（不降低判别力）。
 *
 * 背景（并行负载 flaky 类根因）：Reka UI 的浮层挂载、roving focus 与双向 `emit` 由
 * 微任务与定时器混合驱动。CPU 高负载时「交互后立即断言」或「只补固定 tick 数」会读到
 * 更新前状态（曾以「每轮全量约 1 例失败、用例每次不同」的形态出现）。
 *
 * 用法：把交互后的 `expect(...)` 放进回调即可——
 * `await expectSettled(() => { expect(x).toBe(y) })`。
 *
 * 默认上限 **5s**：Vitest 的 `vi.waitFor` 默认只等 1s，在并行负载下偏紧
 * （实测同一用例隔离通过、全量并行时 1s 不够）。整体用例超时见 `vitest.config.ts` 的
 * `testTimeout`。
 */
export async function expectSettled(assertion: () => void, timeout = 5000): Promise<void> {
    await vi.waitFor(assertion, { timeout })
}
