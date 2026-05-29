import { getCurrentStack } from '@tacet-mod/utils/error'
import { proxify } from '@tacet-mod/utils/proxy'
import { cacheFilterNotFound, getFilterMatches } from '../caches'
import { mInitialized, mList, mUninitialized } from '../metro/patches'
import { metroRequire } from '../metro/runtime'
import {
    getInitializedModuleExports,
    isModuleInitialized,
} from '../metro/utils'
import {
    exportsFromFilterResultFlag,
    FilterResultFlagToHumanReadable,
    runFilter,
} from './_internal'
import { FilterScopes } from './filters'
import type { If, Not } from '@tacet-mod/utils/types'
import type { MaybeDefaultExportMatched, Metro } from '../types'
import type {
    FilterResultFlag,
    RunFilterReturnExportsOptions,
} from './_internal'
import type { Filter, FilterResult } from './filters'

export type LookupModulesOptions<
    ReturnNamespace extends boolean = boolean,
    Initialize extends boolean = boolean,
> = RunFilterReturnExportsOptions<ReturnNamespace> & {
    cached?: boolean
} & If<
        Not<Initialize>,
        {
            initialize: false
        },
        { initialize?: true }
    >

export type LookupModulesResult<
    F extends Filter,
    O extends LookupModulesOptions,
> = [exports: LookupFilterResult<F, O>, id: Metro.ModuleID]

type LookupFilterResult<F extends Filter, O extends LookupModulesOptions> =
    O extends LookupModulesOptions<any, false>
        ? InitializedLookupFilterResult<F, O> | undefined
        : InitializedLookupFilterResult<F, O>

type InitializedLookupFilterResult<
    F extends Filter,
    O extends LookupModulesOptions,
> =
    O extends RunFilterReturnExportsOptions<true>
        ? MaybeDefaultExportMatched<FilterResult<F>>
        : FilterResult<F>

export const NotFoundResult: readonly [] = Object.freeze([])

export type LookupNotFoundResult = typeof NotFoundResult

export function lookupModules<F extends Filter>(
    filter: F,
): Generator<LookupModulesResult<F, object>, undefined>

export function lookupModules<
    F extends Filter,
    const O extends LookupModulesOptions,
>(filter: F, options: O): Generator<LookupModulesResult<F, O>, undefined>

export function* lookupModules(filter: Filter, options?: LookupModulesOptions) {
    let notFound = true
    let cached: Set<Metro.ModuleID> | undefined

    const scopes = filter.scopes
    const includeAll = scopes & FilterScopes.All
    const includeInit = includeAll || scopes & FilterScopes.Initialized
    const includeUninit = includeAll || scopes & FilterScopes.Uninitialized

    if (options?.cached ?? true) {
        const notInit = !(options?.initialize ?? true)

        const reg = getFilterMatches(filter.key)
        if (reg === null) return

        if (reg) {
            cached = new Set()

            for (const sId of Object.keys(reg)) {
                const flag = reg[sId as unknown as keyof typeof reg]
                const id = Number(sId)
                let exports: Metro.ModuleExports | undefined

                if (includeInit && isModuleInitialized(id))
                    exports = getInitializedModuleExports(id)
                else if (includeUninit) {
                    if (notInit) {
                        yield [undefined, id]
                        continue
                    }
                    exports = metroRequire(id)
                } else continue

                cached.add(id)

                if (__BUILD_FLAG_DEBUG_MODULE_LOOKUPS__)
                    DEBUG_logLookupMatched(filter.key, flag, id, true)

                yield [exportsFromFilterResultFlag(flag, exports, options), id]
            }
        }
    }

    if (includeAll) {
        for (const id of mList.keys()) {
            // biome-ignore lint/complexity/useOptionalChain: Hot path should be optimized
            if (cached && cached.has(id)) continue

            const flag = runFilter(
                filter,
                id,
                getInitializedModuleExports(id),
                options,
            )

            if (flag) {
                notFound = false

                if (__BUILD_FLAG_DEBUG_MODULE_LOOKUPS__)
                    DEBUG_logLookupMatched(filter.key, flag, id)

                yield [
                    exportsFromFilterResultFlag(
                        flag,
                        getInitializedModuleExports(id),
                        options,
                    ),
                    id,
                ]
            }
        }
    } else {
        if (includeInit)
            for (const id of mInitialized) {
                // biome-ignore lint/complexity/useOptionalChain: Hot path should be optimized
                if (cached && cached.has(id)) continue

                const exports = getInitializedModuleExports(id)
                const flag = runFilter(filter, id, exports, options)
                if (flag) {
                    notFound = false

                    if (__BUILD_FLAG_DEBUG_MODULE_LOOKUPS__)
                        DEBUG_logLookupMatched(filter.key, flag, id)

                    yield [
                        exportsFromFilterResultFlag(flag, exports, options),
                        id,
                    ]
                }
            }

        if (includeUninit)
            for (const id of mUninitialized) {
                // biome-ignore lint/complexity/useOptionalChain: Hot path should be optimized
                if (cached && cached.has(id)) continue

                const flag = runFilter(filter, id, undefined, options)
                if (flag) {
                    notFound = false

                    if (__BUILD_FLAG_DEBUG_MODULE_LOOKUPS__)
                        DEBUG_logLookupMatched(filter.key, flag, id)

                    yield [
                        exportsFromFilterResultFlag(
                            flag,
                            getInitializedModuleExports(id),
                            options,
                        ),
                        id,
                    ]
                }
            }
    }

    if (notFound && includeAll) cacheFilterNotFound(filter.key)
    if (__BUILD_FLAG_DEBUG_MODULE_LOOKUPS__ && notFound)
        DEBUG_warnLookupNoMatch(filter.key)
}

export function lookupModule<F extends Filter>(
    filter: F,
): LookupModulesResult<F, object> | LookupNotFoundResult

export function lookupModule<
    F extends Filter,
    const O extends LookupModulesOptions,
>(filter: F, options: O): LookupModulesResult<F, O> | LookupNotFoundResult

export function lookupModule(filter: Filter, options?: LookupModulesOptions) {
    const scopes = filter.scopes
    const includeAll = scopes & FilterScopes.All
    const includeInit = includeAll || scopes & FilterScopes.Initialized
    const includeUninit = includeAll || scopes & FilterScopes.Uninitialized

    if (options?.cached ?? true) {
        const notInit = !(options?.initialize ?? true)

        const reg = getFilterMatches(filter.key)
        if (reg === null) return NotFoundResult

        if (reg)
            for (const sId of Object.keys(reg)) {
                const flag = reg[sId as unknown as keyof typeof reg]
                const id = Number(sId)
                let exports: Metro.ModuleExports | undefined

                if (includeInit && isModuleInitialized(id))
                    exports = getInitializedModuleExports(id)
                else if (includeUninit) {
                    if (notInit) return [undefined, id]
                    exports = metroRequire(id)
                } else continue

                if (__BUILD_FLAG_DEBUG_MODULE_LOOKUPS__)
                    DEBUG_logLookupMatched(filter.key, flag, id, true)

                return [exportsFromFilterResultFlag(flag, exports, options), id]
            }
    }

    if (includeAll) {
        for (const id of mList.keys()) {
            const flag = runFilter(
                filter,
                id,
                getInitializedModuleExports(id),
                options,
            )

            if (flag) {
                if (__BUILD_FLAG_DEBUG_MODULE_LOOKUPS__)
                    DEBUG_logLookupMatched(filter.key, flag, id)

                return [
                    exportsFromFilterResultFlag(
                        flag,
                        getInitializedModuleExports(id),
                        options,
                    ),
                    id,
                ]
            }
        }
    } else {
        if (includeInit)
            for (const id of mInitialized) {
                const exports = getInitializedModuleExports(id)
                const flag = runFilter(filter, id, exports, options)
                if (flag) {
                    if (__BUILD_FLAG_DEBUG_MODULE_LOOKUPS__)
                        DEBUG_logLookupMatched(filter.key, flag, id)

                    return [
                        exportsFromFilterResultFlag(flag, exports, options),
                        id,
                    ]
                }
            }

        if (includeUninit)
            for (const id of mUninitialized) {
                const flag = runFilter(filter, id, undefined, options)
                if (flag) {
                    if (__BUILD_FLAG_DEBUG_MODULE_LOOKUPS__)
                        DEBUG_logLookupMatched(filter.key, flag, id)

                    return [
                        exportsFromFilterResultFlag(
                            flag,
                            getInitializedModuleExports(id),
                            options,
                        ),
                        id,
                    ]
                }
            }
    }

    if (includeAll) cacheFilterNotFound(filter.key)
    if (__BUILD_FLAG_DEBUG_MODULE_LOOKUPS__) DEBUG_warnLookupNoMatch(filter.key)

    return NotFoundResult
}

const __DEBUG_TRACER_IGNORE_LIST__ = __BUILD_FLAG_DEBUG_MODULE_LOOKUPS__
    ? proxify(
          () => [
              require('./get').getModules,
              isModuleInitialized(0) &&
                  require('@tacet-mod/utils/discord')
                      .lookupGeneratedIconComponent,
          ],
          { hint: [] },
      )
    : []

function DEBUG_logLookupMatched(
    key: string,
    flag: FilterResultFlag,
    id: Metro.ModuleID,
    cached?: boolean,
) {
    nativeLoggingHook(
        `\u001b[32mSuccessful lookup: \u001b[33m${key}\u001b[0m (matched ${id}, ${FilterResultFlagToHumanReadable[flag]}${cached ? ', \u001b[92mcached\u001b[0m' : ''})`,
        1,
    )
}

function DEBUG_warnLookupNoMatch(key: string) {
    const stack = getCurrentStack()
    for (const func of __DEBUG_TRACER_IGNORE_LIST__)
        if (stack.includes(func.name)) return

    nativeLoggingHook(`\u001b[31mFailed lookup: ${key}\n${stack}\u001b[0m`, 2)
}
