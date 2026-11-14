/**
 * `ResizeObserver` 测试替身。
 *
 * `happy-dom` 无布局引擎（`scrollWidth` / `clientWidth` 恒为 0），溢出检测只能由几何读数桩驱动：
 * 用例先在元素上覆写两项读数，再主动触发观察者回调，等价于真实浏览器里的容器 resize。
 *
 * 只暴露**首个**实例的触发入口——面板打开后 Reka 的 Popper 也会创建 `ResizeObserver`，
 * 取末位会拿到与溢出检测无关的实例。
 */
export class ResizeObserverStub {
    static instances: ResizeObserverStub[] = []

    callback: ResizeObserverCallback

    /** 已登记的被观察元素；用例不依赖真实布局，仅保留方法语义 */
    readonly targets = new Set<Element>()

    constructor(callback: ResizeObserverCallback) {
        this.callback = callback
        ResizeObserverStub.instances.push(this)
    }

    observe(target: Element): void {
        this.targets.add(target)
    }

    unobserve(target: Element): void {
        this.targets.delete(target)
    }

    disconnect(): void {
        this.targets.clear()
    }

    trigger(): void {
        this.callback([], this as unknown as ResizeObserver)
    }
}

/** 清空实例登记；在 `beforeEach` 调用 */
export function resetResizeObserverStub(): void {
    ResizeObserverStub.instances = []
}

/** 触发组件在挂载期创建的观察者（首个实例） */
export function triggerMeasurement(): void {
    const observer = ResizeObserverStub.instances.at(0)
    if (!observer) {
        throw new Error('未创建 ResizeObserver')
    }
    observer.trigger()
}

/** 覆写元素的几何读数：溢出判据只看这两项 */
export function setElementMetrics(element: Element, scrollWidth: number, clientWidth: number): void {
    Object.defineProperty(element, 'scrollWidth', { configurable: true, value: scrollWidth })
    Object.defineProperty(element, 'clientWidth', { configurable: true, value: clientWidth })
}
