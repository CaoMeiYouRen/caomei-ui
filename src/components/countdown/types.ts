/**
 * 倒计时目标时间：毫秒时间戳、`Date` 或可被 `Date` 解析的字符串
 * @en Countdown target: a millisecond timestamp, a `Date`, or a string parseable by `Date`
 */
export type CountdownTarget = number | Date | string | null | undefined

export interface CountdownProps {
    /**
     * 目标时间；无效值渲染零值、不启动计时、不视为到点（不触发 `finish`）。
     * 到点后停表并冻结显示，系统时间回拨不会恢复计时、也不会二次触发 `finish`；更换 target 后重新评估；切回已到点的目标（含中途置为无效后再恢复）视为新的到点并再通知一次
     * @en Target time; an invalid value renders zeros, starts no timer and is not treated as reached (no `finish`).
     * Once reached, the timer stops and the display freezes: a system clock rollback neither resumes it nor fires `finish` again. Changing `target` re-evaluates, and switching back to an already reached target (including after a temporary invalid value) counts as a new arrival and notifies again
     */
    target?: CountdownTarget
    /**
     * 格式模板，支持 `DD` / `HH` / `mm` / `ss` / `SSS`；默认 `HH:mm:ss`
     * @en Format template supporting `DD` / `HH` / `mm` / `ss` / `SSS`; `HH:mm:ss` by default
     */
    format?: string
    /**
     * 是否自动开始，默认 `true`；关掉后仍需传入合法 `target` 才有时长。为 `false` 时即使 `target` 已过期也不触发 `finish`（仍渲染到点态），开启后或更换 `target` 才评估
     * @en Whether to start automatically, `true` by default; a valid `target` is still required. While `false`, an already expired `target` does not fire `finish` (the reached state is still rendered); enabling it or changing `target` triggers evaluation
     */
    autoStart?: boolean
    /**
     * 刷新间隔（毫秒），默认 `1000`；非有限值或 ≤0 时回退 1000。需要毫秒展示时传 `SSS` 并调小该值
     * @en Refresh interval in milliseconds, `1000` by default; non-finite or non-positive values fall back to 1000. Use `SSS` and a smaller value for millisecond display
     */
    interval?: number
    /**
     * 到点后显示的文案；缺省按格式渲染零值。仅在「到点」状态生效，无效 `target` 时不替换
     * @en Text shown after the target is reached; zeros are rendered when omitted. Applies only in the reached state, not for an invalid `target`
     */
    finishText?: string
    /**
     * 时间区的可访问名；`role="timer"` 允许命名，不传时由使用方以外层文本说明
     * @en Accessible name of the timer; `role="timer"` may be named, and consumers should otherwise label it in surrounding text
     */
    label?: string
}
