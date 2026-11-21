---
title: Refined-type API
description: A reference page, for checking the header marks Reference.
---

```bynk
type Age = Int where InRange(0, 150)
Age.of(value)   // Result[Age, ValidationError]
```
