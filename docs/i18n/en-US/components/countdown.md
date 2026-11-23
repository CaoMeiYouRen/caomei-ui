# Countdown

A countdown towards a deadline: refreshes every second, accepts a custom format template, fires `finish` when the target is reached and then stops. The font size is inherited from the parent and can be raised with `--caomei-countdown-font-size`; it is a pure display component that never rewrites the target and keeps no cross-page state.

## Basic usage

<demo
    vue="../examples/countdown/basic.vue"
    ssg="true"
/>

```vue
<CaomeiCountdown :target="deadline" label="Time remaining" @finish="onFinish" />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `target` | `number \| Date \| string \| null` | `null` | Target time (timestamp / `Date` / a string parseable by `Date`); an invalid value renders zeros, starts no timer and is not treated as reached |
| `format` | `string` | `HH:mm:ss` | Format template supporting `DD` / `HH` / `mm` / `ss` / `SSS`; unknown fragments are kept as-is |
| `autoStart` | `boolean` | `true` | Whether to start automatically; while `false`, an already expired target does not fire `finish` (the reached state is still rendered) |
| `interval` | `number` | `1000` | Refresh interval in milliseconds; non-finite or non-positive values fall back to 1000. Use `SSS` and a smaller value for millisecond display |
| `finishText` | `string` | — | Text shown after the target is reached; zeros are rendered when omitted, and it is not substituted for an invalid `target` |
| `label` | `string` | — | Accessible name of the timer (`role="timer"` may be named) |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `finish` | — | Fires once when the countdown enters the reached state; the same target is not notified twice, and switching `target` so it is reached again (including switching back to an already reached target) notifies again |

## Format template

- `DD` days, `HH` hours, `mm` minutes, `ss` seconds and `SSS` milliseconds; each is zero-padded.
- When the template **contains `DD`**, `HH` is the hour within the day (0–23); **without `DD`**, `HH` is cumulative hours and may exceed 24 (for example `26:01:01`).
- With less than one second left the second-level segments (`DD` / `HH` / `mm` / `ss`) are floored to 0 but the **reached state has not begun**: no `data-finished`, no `finish`, and the actual arrival can lag by up to one `interval`; with `SSS` in the template that segment keeps the millisecond remainder.

## Reaching zero and clock rollback

- Once reached, the timer stops and freezes: `data-finished` is set, `finish` fires only once, and a system clock rollback neither resumes the timer nor notifies again.
- A rollback before the target is reached keeps the countdown live (`remaining = target - now`), so the remaining time can grow; arrival still notifies only once.
- Changing `target` re-evaluates, and switching back to an already reached target counts as a new arrival and notifies again. To pause, set `autoStart` to `false` or make `target` invalid.

## Server-side rendering

- The component never touches `window` / `document`; pass `target` as an ISO string to render the first frame on the server.
- The first frame uses the server clock and is recomputed with the local clock during hydration; when the two differ by 1 second or more, that text node logs one hydration mismatch. For strict equality, render the countdown after mount or compute `target` on the client.

## Style customization

| Variable | Default | Description |
| --- | --- | --- |
| `--caomei-countdown-font-size` | inherited | Font size of the time region |
| `--caomei-countdown-color` | inherited | Color of the time region |
| `--caomei-countdown-finished-color` | `--caomei-color-text-muted` | Color after the target is reached (applies with `data-finished`) |

## Accessibility

- The time region is `role="timer"` (implicit `aria-live="off"`), so it does not announce every second; name it with `label` or explain it in surrounding text when context is needed.
- An empty `label` emits no empty `aria-label`; the component adds no landmark.
- An empty `finishText` falls back to the zero value rendered by the format and never renders blank; pass a readable message such as "Finished" when the reached state needs a conclusion.

<ComponentApi name="countdown" />
