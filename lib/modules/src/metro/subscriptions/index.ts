import { sInitialize, sInitializeAny, sRequire, sRequireAny } from './_internal'
import type { Metro } from '../../types'

export type ModuleFirstRequiredCallback = (id: Metro.ModuleID) => void
export type ModuleInitializedCallback = (
    id: Metro.ModuleID,
    exports: Metro.ModuleExports,
) => void

export function onAnyModuleInitialized(callback: ModuleInitializedCallback) {
    sInitializeAny.add(callback)
    return () => {
        sInitializeAny.delete(callback)
    }
}

export function onModuleInitialized(
    id: Metro.ModuleID,
    callback: ModuleInitializedCallback,
) {
    let set = sInitialize.get(id)
    if (!set) sInitialize.set(id, (set = new Set()))

    set.add(callback)
    return () => {
        set.delete(callback)
    }
}

export function onAnyModuleFirstRequired(
    callback: ModuleFirstRequiredCallback,
) {
    sRequireAny.add(callback)
    return () => {
        sRequireAny.delete(callback)
    }
}

export function onModuleFirstRequired(
    id: Metro.ModuleID,
    callback: ModuleFirstRequiredCallback,
) {
    let set = sRequire.get(id)
    if (!set) sRequire.set(id, (set = new Set()))

    set.add(callback)
    return () => {
        set.delete(callback)
    }
}
