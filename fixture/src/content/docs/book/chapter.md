---
title: Make illegal states unrepresentable
description: A chapter page, for checking prose, code, asides and quotations.
---

A refined type is an ordinary type with a predicate attached. `Subject` is a
`String`, but only one that is non-empty and at most 40 characters.

```bynk
---
Who we are greeting: non-empty, at most 40 characters.
---
type Subject = String where NonEmpty && MaxLength(40)

fn greeting(subject: Subject) -> String {
  "Hello, \(subject)!"
}
```

:::note
There is no unchecked way in. A value enters a refined type through `.of` or
as a literal the compiler can check.
:::

:::caution
`.of` always returns a `Result`.
:::

> Check once, where the value arrives, and trust it everywhere after.

| Predicate | Holds when |
|---|---|
| `NonEmpty` | length ≥ 1 |
| `MaxLength(n)` | length ≤ n |

See the [refined-type reference](/reference/refined-types/).
