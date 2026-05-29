import { getCurrentStack } from '@tacet-mod/utils/error'
import { cacheFilterResultForId } from '../caches'
import { mInitialized } from '../metro/patches'
import { metroRequire } from '../metro/runtime'
import { isModuleExportBad } from '../metro/utils'
import { FilterFlag } from './filters'
import type { If } from '@tacet-mod/utils/types'
import type { Metro } from '../types'
import type { Filter } from './filters'

export interface RunFilterOptions {
    skipDefault?: boolean
    initialize?: boolean
}

export type RunFilterReturnExportsOptions<
    ReturnNamespace extends boolean = boolean,
> = RunFilterOptions &
    If<
        ReturnNamespace,
        {
            returnNamespace: true
        },
        {
            returnNamespace?: false
        }
    >

export const FilterResultFlags = {
    Found: 1,
    Default: 2,
    Namespace: 3,
}

export type FilterResultFlag =
    (typeof FilterResultFlags)[keyof typeof FilterResultFlags]

export const FilterResultFlagToHumanReadable: Record<FilterResultFlag, string> =
    {
        [FilterResultFlags.Default]: '\u001b[94mdefault\u001b[0m',
        [FilterResultFlags.Namespace]: '\u001b[35mnamespace\u001b[0m',
        [FilterResultFlags.Found]: '\u001b[96mexportsless\u001b[0m',
    }

export function runFilter(
    filter: Filter<{ Result: any; RequiresExports: false; Scopes: any[] }>,
    id: Metro.ModuleID,
): FilterResultFlag | undefined

export function runFilter(
    filter: Filter,
    id: Metro.ModuleID,
    exports: Metro.ModuleExports,
    options?: RunFilterOptions,
): FilterResultFlag | undefined

export function runFilter(
    filter: Filter,
    id: Metro.ModuleID,
    exports?: Metro.ModuleExports,
    options?: RunFilterOptions,
): FilterResultFlag | undefined {
    if (exports === undefined) {
        if (filter.flags & FilterFlag.RequiresExports) return

        if (filter(id)) {
            if (options?.initialize ?? true) {
                const module = metroRequire(id)
                if (mInitialized.has(id)) {
                    if (__BUILD_FLAG_DEBUG_MODULE_LOOKUPS__) {
                        const flag = runFilter(filter, id, module, options)
                        if (!flag) DEBUG_warnPartialFilterMatch(id, filter.key)
                        return flag
                    } else return runFilter(filter, id, module, options)
                } else return
            }

            return FilterResultFlags.Found
        }

        return
    }

    if (filter(id, exports))
        return cacheFilterResultForId(
            filter.key,
            id,
            FilterResultFlags.Namespace,
        )

    if (options?.skipDefault) return

    const { default: defaultExport } = exports
    if (!isModuleExportBad(defaultExport) && filter(id, defaultExport))
        return cacheFilterResultForId(filter.key, id, FilterResultFlags.Default)
}

export function exportsFromFilterResultFlag(
    flag: FilterResultFlag,
    exports: Metro.ModuleExports,
    options?: RunFilterReturnExportsOptions,
) {
    if (flag === FilterResultFlags.Default && !options?.returnNamespace)
        return exports.default
    return exports
}

function DEBUG_warnPartialFilterMatch(id: Metro.ModuleID, key: string) {
    nativeLoggingHook(
        `\u001b[33m${key} matched module ${id} partially.\n${getCurrentStack()}\u001b[0m`,
        2,
    )
}
