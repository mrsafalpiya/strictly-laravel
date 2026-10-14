# laravel-data + typescript-transformer for data shapes, stable Wayfinder for routes, not Wayfinder `next`

Every shape that crosses a Type Boundary is a spatie/laravel-data class turned into TypeScript by spatie/typescript-transformer v3, and routes come from stable Wayfinder (the one the Base Kit ships). Wayfinder `next` is Laravel's official direction and infers types with no annotations, but in a contract-tested evaluation it got only 15 of 39 shapes right (decimals as numbers, paginator `data` as `Record<string, unknown>`, nested rules as literal `"tasks.*.title"` keys, occasionally invalid TS), whereas explicit Data classes let `tsc` catch every breakage scenario with fixable gaps only. The cost is that the Overlay must carry fixes for known typescript-transformer / laravel-data / Wayfinder bugs; revisit when Wayfinder `next` reaches a tagged v1.

Evidence: `docs/research/evaluations/01-wayfinder-next.md` and `docs/research/evaluations/02-laravel-data-ts.md`.
