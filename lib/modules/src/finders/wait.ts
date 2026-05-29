import { noop } from '@tacet-mod/utils/callback'
import { getFilterMatches } from '../caches'
import { mInitialized } from '../metro/patches'
import {
    onAnyModuleInitialized,
    onModuleInitialized,
} from '../metro/subscriptions'
import {
    exportsFromFilterResultFlag,
    FilterResultFlagToHumanReadable,
    runFilter,
} from './_internal'
import { FilterScopes } from './filters'
import type { MaybeDefaultExportMatched, Metro } from '../types'
import type {
    FilterResultFlag,
    RunFilterReturnExportsOptions,
} from './_internal'
import type { Filter, FilterResult } from './filters'

export type WaitForModulesUnsubscribeFunction = () => void

export type WaitForModulesCallback<T> = (exports: T, id: Metro.ModuleID) => any

export type WaitForModulesOptions<ReturnNamespace extends boolean = boolean> =
    RunFilterReturnExportsOptions<ReturnNamespace> & {
        cached?: boolean
    }

export type WaitForModulesResult<
    F extends Filter,
    O extends WaitForModulesOptions,
> = O extends RunFilterReturnExportsOptions<true>
    ? MaybeDefaultExportMatched<FilterResult<F>>
    : FilterResult<F>

export function waitForModules<F extends Filter>(
    filter: F,
    callback: WaitForModulesCallback<WaitForModulesResult<F, object>>,
): WaitForModulesUnsubscribeFunction

export function waitForModules<
    F extends Filter,
    O extends WaitForModulesOptions,
>(
    filter: F,
    callback: WaitForModulesCallback<WaitForModulesResult<F, O>>,
    options: O,
): WaitForModulesUnsubscribeFunction

export function waitForModules(
    filter: Filter,
    callback: WaitForModulesCallback<any>,
    options?: WaitForModulesOptions,
): WaitForModulesUnsubscribeFunction {
    if (options?.cached) {
        const reg = getFilterMatches(filter.key)
        if (reg === null) return noop

        if (reg) {
            if (__BUILD_FLAG_DEBUG_MODULE_WAITS__)
                nativeLoggingHook(
                    `\u001b[32mUsing cached results for wait: \u001b[33m${filter.key}\u001b[0m`,
                    1,
                )

            const runCachedCallback = (
                id: Metro.ModuleID,
                exports: Metro.ModuleExports,
            ) => {
                const flag = reg[id]

                if (__BUILD_FLAG_DEBUG_MODULE_WAITS__)
                    DEBUG_logWaitMatched(filter.key, id, flag, true)

                callback(
                    exportsFromFilterResultFlag(flag, exports, options),
                    id,
                )
            }

            const cleanups: Array<() => void> = []

            for (const sId of Object.keys(reg)) {
                const id = Number(sId)
                if (mInitialized.has(id)) continue

                cleanups.push(onModuleInitialized(id, runCachedCallback))
            }

            return () => {
                for (const cleanup of cleanups) cleanup()
            }
        }
    }

    if (__BUILD_FLAG_DEBUG_MODULE_WAITS__)
        nativeLoggingHook(
            `\u001b[94mWaiting for module matching: \u001b[93m${filter.key}\u001b[0m`,
            1,
        )

    return onAnyModuleInitialized(
        filter.scopes & FilterScopes.All
            ? (id, exports) => {
                  const flag = runFilter(filter, id, exports, options)
                  if (flag) {
                      if (__BUILD_FLAG_DEBUG_MODULE_WAITS__)
                          DEBUG_logWaitMatched(filter.key, id, flag)

                      callback(
                          exportsFromFilterResultFlag(flag, exports, options),
                          id,
                      )
                  }
              }
            : (id, exports) => {
                  if (mInitialized.has(id)) {
                      const flag = runFilter(filter, id, exports, options)
                      if (flag) {
                          if (__BUILD_FLAG_DEBUG_MODULE_WAITS__)
                              DEBUG_logWaitMatched(filter.key, id, flag)

                          callback(
                              exportsFromFilterResultFlag(
                                  flag,
                                  exports,
                                  options,
                              ),
                              id,
                          )
                      }
                  }
              },
    )
}

function DEBUG_logWaitMatched(
    key: string,
    id: Metro.ModuleID,
    flag: FilterResultFlag,
    cached?: boolean,
) {
    nativeLoggingHook(
        `\u001b[32mWait matched: \u001b[33m${key}\u001b[0m (matched ${id}, ${FilterResultFlagToHumanReadable[flag]}${cached ? ', \u001b[92mcached\u001b[0m' : ''})`,
        1,
    )
}
