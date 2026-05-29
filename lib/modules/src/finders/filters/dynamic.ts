import { getCurrentStack } from '@tacet-mod/utils/error'
import {
    getInitializedModuleExports,
    getModuleDependencies,
} from '../../metro/utils'
import { runFilter } from '../_internal'
import { FilterFlag, FilterScopes } from './constants'
import { createFilterGenerator } from './utils'
import type { Metro } from '../../types'
import type { Filter, FilterGenerator } from './utils'

export interface ComparableDependencyMap
    extends Array<
        | Metro.ModuleID
        | number
        | null
        | undefined
        | ComparableDependencyMap
        | Filter
    > {
    l?: boolean
    r?: number
}

const withDependencies_ = createFilterGenerator<Parameters<WithDependencies>>(
    ([deps], id) => depCompare(getModuleDependencies(id)!, deps, id, id),
    deps => `tacet.deps(${depGenFilterKey(deps)})`,
    FilterFlag.Dynamic,
    FilterScopes.Uninitialized | FilterScopes.Initialized,
) as WithDependencies

export const withDependencies = __DEV__
    ? (((deps: ComparableDependencyMap) => {
          for (let i = 0; i < deps.length; i++) {
              if (deps[i] === undefined)
                  DEBUG_warnBadWithDependenciesFilter(deps, i)
          }

          return withDependencies_(deps)
      }) as WithDependencies)
    : withDependencies_

withDependencies.loose = loose
withDependencies.relative = relative

type WithDependencies = FilterGenerator<
    <T>(deps: ComparableDependencyMap) => Filter<{
        Result: T
        RequiresExports: false
        Scopes: [
            typeof FilterScopes.Uninitialized,
            typeof FilterScopes.Initialized,
        ]
    }>
> & {
    loose: typeof loose
    relative: typeof relative
}

function loose(deps: ComparableDependencyMap) {
    deps.l = true
    return deps
}

const RelativeSignBit = 1 << 30
const RelativeBit = 1 << 29
const RelativeRootBit = 1 << 28
const RelativeBitMask = ~(RelativeSignBit | RelativeBit | RelativeRootBit)

function relative(magnitude: Metro.ModuleID, root?: boolean) {
    magnitude =
        (magnitude < 0 ? -magnitude | RelativeSignBit : magnitude) | RelativeBit
    if (root) magnitude |= RelativeRootBit
    return magnitude
}

relative.withDependencies = (
    deps: ComparableDependencyMap,
    magnitude: Metro.ModuleID,
    root?: boolean,
) => {
    deps.r = relative(magnitude, root)
    return deps
}

function DEBUG_warnBadWithDependenciesFilter(
    deps: ComparableDependencyMap,
    index: number,
) {
    nativeLoggingHook(
        `\u001b[33mBad withDependencies filter, undefined ID at index ${index} (if intentional, set to null): [${depGenFilterKey(deps)}]\n${getCurrentStack()}\u001b[0m`,
        2,
    )
}

function depCompare(
    a: Metro.ModuleID[],
    b: ComparableDependencyMap,
    root: Metro.ModuleID,
    parent: Metro.ModuleID,
): boolean {
    const lenA = a.length
    const lenB = b.length
    if (b.l ? lenA < lenB : lenA !== lenB) return false

    for (let i = 0; i < lenB; i++) {
        const compare = b[i]

        if (__DEV__ && compare === undefined)
            DEBUG_warnBadWithDependenciesFilter(b, i)

        if (compare == null) continue

        const id = a[i]

        switch (typeof compare) {
            case 'function': {
                const filter = compare
                if (!runFilter(filter, id, getInitializedModuleExports(id)))
                    return false

                continue
            }
            case 'object': {
                const nested = compare as ComparableDependencyMap

                if (nested.r && !depShallowCompare(nested.r, id, root, parent))
                    return false

                if (depCompare(getModuleDependencies(id)!, nested, root, id))
                    continue

                return false
            }
            default: {
                if (depShallowCompare(compare as number, id, root, parent))
                    continue
                return false
            }
        }
    }

    return true
}

function depShallowCompare(
    compare: number,
    id: Metro.ModuleID,
    root: Metro.ModuleID,
    parent: Metro.ModuleID,
) {
    if (compare & RelativeBit)
        compare =
            (compare & RelativeRootBit ? root : parent) +
            depGetRelMagnitude(compare)

    return compare === id
}

function depGetRelMagnitude(dep: number) {
    const sign = dep & RelativeSignBit
    dep = dep & RelativeBitMask
    if (sign) dep = -dep
    return dep
}

function depGenFilterKey(deps: ComparableDependencyMap): string {
    let key = ''

    for (let i = 0; i < deps.length; i++) {
        const dep = deps[i]

        if (dep == null) {
            key += ','
            continue
        }

        switch (typeof dep) {
            case 'function': {
                const filter = dep as any
                key += `${filter.key},`
                break
            }
            case 'object': {
                const nested = dep as ComparableDependencyMap
                if (nested.l) key += '#'
                if (nested.r) key += `${depGenRelativeKeyPart(nested.r)}:`

                key += `[${depGenFilterKey(nested)}],`
                break
            }
            default: {
                const numDep = dep as number
                if (numDep & RelativeBit)
                    key += `${depGenRelativeKeyPart(numDep)},`
                else key += `${numDep},`
                break
            }
        }
    }

    return key.substring(0, key.length - 1)
}

function depGenRelativeKeyPart(dep: number) {
    const magnitude = depGetRelMagnitude(dep)
    const prefix = dep & RelativeRootBit ? '~' : '^'
    return `${prefix}${magnitude}`
}
