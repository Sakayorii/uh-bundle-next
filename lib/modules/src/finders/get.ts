import { onModuleInitialized } from '@tacet-mod/modules/metro/subscriptions'
import { isModuleInitialized } from '@tacet-mod/modules/metro/utils'
import { asap, noop } from '@tacet-mod/utils/callback'
import { FilterScopes } from './filters'
import { lookupModule, lookupModules } from './lookup'
import { waitForModules } from './wait'
import type { Metro } from '../types'
import type { Filter, FilterResult } from './filters'
import type { LookupModulesOptions } from './lookup'
import type { WaitForModulesOptions, WaitForModulesResult } from './wait'

export type GetModulesOptions<ReturnNamespace extends boolean = boolean> =
    WaitForModulesOptions<ReturnNamespace> &
        LookupModulesOptions<ReturnNamespace, true> & {
            max?: number
        }

export type GetModulesResult<
    F extends Filter,
    O extends GetModulesOptions,
> = WaitForModulesResult<F, O>

export type GetModulesCallback<T> = (exports: T, id: Metro.ModuleID) => any

export type GetModulesUnsubscribeFunction = () => void

export function getModules<F extends Filter>(
    filter: F,
    callback: GetModulesCallback<FilterResult<F>>,
): GetModulesUnsubscribeFunction

export function getModules<F extends Filter, const O extends GetModulesOptions>(
    filter: F,
    callback: GetModulesCallback<GetModulesResult<F, O>>,
    options: O,
): GetModulesUnsubscribeFunction

export function getModules(
    filter: Filter,
    callback: GetModulesCallback<any>,
    options?: GetModulesOptions,
) {
    let max = options?.max ?? 1

    const lookupFilter = filter.scope(FilterScopes.Initialized)

    function handleModule(
        exports: Metro.ModuleExports | undefined,
        id: Metro.ModuleID,
    ) {
        if (isModuleInitialized(id)) {
            asap(() => {
                callback(exports, id)
            })
        } else {
            onModuleInitialized(id, (_, exports) => {
                callback(exports, id)
            })
        }
    }

    if (max === 1) {
        const [exports, id] = lookupModule(lookupFilter, options!)
        if (id !== undefined) {
            handleModule(exports, id)
            return noop
        }
    } else
        for (const [exports, id] of lookupModules(lookupFilter, options!)) {
            handleModule(exports, id)
            if (!--max) return noop
        }

    const unsub = waitForModules(
        filter,
        (exports, id) => {
            if (!--max) unsub()
            callback(exports, id)
        },
        options!,
    )

    return unsub
}
