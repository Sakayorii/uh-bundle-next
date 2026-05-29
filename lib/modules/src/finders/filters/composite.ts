import { FilterFlag } from './constants'
import { createFilterGenerator } from './utils'
import type { Metro } from '@tacet-mod/modules/types'
import type {
    Filter,
    FilterBase,
    FilterGenerator,
    FilterInfoOf,
    MergeFilterInfo,
    UnionFilterInfo,
} from '.'

const compositeHandler = <G extends (a: FilterBase, b: FilterBase) => any>(
    sameHandler: G,
    dynamicHandler: G,
) =>
    ((a, b) =>
        a.flags === b.flags
            ? sameHandler(a, b)
            : a.flags === FilterFlag.RequiresExports
              ? dynamicHandler(a, b)
              : dynamicHandler(b, a)) as G

const compositeArrayHandler = <
    G extends (args: [a: FilterBase, b: FilterBase]) => any,
>(
    sameHandler: G,
    dynamicHandler: G,
) =>
    (([a, b]) =>
        a.flags === b.flags
            ? sameHandler([a, b])
            : a.flags === FilterFlag.RequiresExports
              ? dynamicHandler([a, b])
              : dynamicHandler([b, a])) as G

export type And = FilterGenerator<
    <F1 extends FilterBase, F2 extends FilterBase>(
        f1: F1,
        f2: F2,
    ) => Filter<MergeFilterInfo<FilterInfoOf<F1>, FilterInfoOf<F2>>>
>

const andKeyGenerator = ([a, b]: Parameters<And>) =>
    `tacet.and(${a.key},${b.key})`

const andScopesGenerator = ([a, b]: Parameters<And>) => a.scopes | b.scopes

const sameFlagsAnd = createFilterGenerator(
    ([a, b], id, exports) => a(id, exports) && b(id, exports),
    andKeyGenerator,
    ([a]) => a.flags,
    andScopesGenerator,
) as And

const andFallbackCache = new WeakMap<FilterBase, Set<Metro.ModuleID>>()

const dynamicFlagsAnd = createFilterGenerator(
    ([filter, fallbackFilter], id, exports) => {
        if (exports) {
            if (filter(id, exports)) {
                const cache = andFallbackCache.get(fallbackFilter)
                return (
                    // biome-ignore lint/complexity/useOptionalChain: Hot path should be optimized
                    (cache && cache.has(id)) || fallbackFilter(id, exports)
                )
            }

            return false
        }

        const result = fallbackFilter(id)
        if (result) {
            let set = andFallbackCache.get(fallbackFilter)
            if (!set) andFallbackCache.set(fallbackFilter, (set = new Set()))
            set.add(id)
        }
        return result
    },
    andKeyGenerator,
    FilterFlag.Dynamic,
    andScopesGenerator,
) as And

export const and = Object.assign(
    compositeHandler(sameFlagsAnd, dynamicFlagsAnd),
    {
        keyFor: compositeArrayHandler(
            sameFlagsAnd.keyFor,
            dynamicFlagsAnd.keyFor,
        ),
        flagsFor: compositeArrayHandler(
            sameFlagsAnd.flagsFor,
            dynamicFlagsAnd.flagsFor,
        ),
        defaultScopesFor: compositeArrayHandler(
            sameFlagsAnd.defaultScopesFor,
            dynamicFlagsAnd.defaultScopesFor,
        ),
    },
) satisfies And

export type Or = FilterGenerator<
    <F1 extends FilterBase, F2 extends FilterBase>(
        f1: F1,
        f2: F2,
    ) => Filter<UnionFilterInfo<FilterInfoOf<F1>, FilterInfoOf<F2>>>
>

const orKeyGenerator = ([a, b]: Parameters<Or>) =>
    `tacet.or(${a.key},${b.key})`

const orScopesGenerator = ([a, b]: Parameters<Or>) => a.scopes | b.scopes

const sameFlagOr = createFilterGenerator(
    ([a, b], id, exports) => a(id, exports) || b(id, exports),
    orKeyGenerator,
    ([a]) => a.flags,
    orScopesGenerator,
) as Or

const dynamicFlagOr = createFilterGenerator(
    ([filter, fallbackFilter], id, exports) => {
        if (exports) return filter(id, exports) || fallbackFilter(id, exports)
        return fallbackFilter(id)
    },
    orKeyGenerator,
    FilterFlag.Dynamic,
    orScopesGenerator,
) as Or

export const or = Object.assign(
    compositeHandler<Or>(sameFlagOr, dynamicFlagOr),
    {
        keyFor: compositeArrayHandler(sameFlagOr.keyFor, dynamicFlagOr.keyFor),
        flagsFor: compositeArrayHandler(
            sameFlagOr.flagsFor,
            dynamicFlagOr.flagsFor,
        ),
        defaultScopesFor: compositeArrayHandler(
            sameFlagOr.defaultScopesFor,
            dynamicFlagOr.defaultScopesFor,
        ),
    },
) satisfies Or
