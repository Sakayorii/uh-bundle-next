import { NotFoundResult } from '@tacet-mod/modules/finders'
import { onModuleInitialized } from '@tacet-mod/modules/metro/subscriptions'
import { getInitializedModuleExports } from '@tacet-mod/modules/metro/utils'
import { noop } from '@tacet-mod/utils/callback'
import { mImportedPaths } from '../../patches/import-tracker'
import { onModuleFinishedImporting } from './metro/subscriptions'
import type {
    GetModulesCallback,
    GetModulesUnsubscribeFunction,
    LookupNotFoundResult,
    WaitForModulesCallback,
    WaitForModulesUnsubscribeFunction,
} from '@tacet-mod/modules/finders'
import type { Metro } from '@tacet-mod/modules/types'

export function lookupModuleWithImportedPath<T = any>(
    path: string,
): [exports: T, id: Metro.ModuleID] | LookupNotFoundResult {
    const id = mImportedPaths.get(path)
    return id === undefined
        ? NotFoundResult
        : [getInitializedModuleExports(id), id]
}

export function waitForModuleWithImportedPath<T = any>(
    path: string,
    callback: WaitForModulesCallback<T>,
): WaitForModulesUnsubscribeFunction {
    const unsub = onModuleFinishedImporting((id, cmpPath) => {
        if (path === cmpPath) {
            unsub()
            onModuleInitialized(id, (id, exports) => {
                callback(exports, id)
            })
        }
    })

    return unsub
}

export function getModuleWithImportedPath<T>(
    path: string,
    callback: GetModulesCallback<T>,
): GetModulesUnsubscribeFunction {
    const [exports, id] = lookupModuleWithImportedPath(path)
    if (id !== undefined) {
        callback(exports, id)
        return noop
    }

    const unsub = waitForModuleWithImportedPath(path, (exports, id) => {
        unsub()
        callback(exports, id)
    })

    return unsub
}
