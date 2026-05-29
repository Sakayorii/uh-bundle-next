import { isProxy } from '@tacet-mod/utils/proxy'
import { mDeps, mList } from './patches'
import { Initialized } from './runtime'
import type { Metro } from '../types'

export function getModuleDependencies(
    id: Metro.ModuleID,
): Metro.DependencyMap | undefined {
    return mDeps.get(id)
}

export function isModuleInitialized(id: Metro.ModuleID): number | undefined {
    return mList.get(id)?.flags! & Initialized
}

export function getInitializedModuleExports(
    id: Metro.ModuleID,
): Metro.ModuleExports | undefined {
    return mList.get(id)?.module?.exports
}

export function isModuleExportBad(
    exp: Metro.ModuleExports[PropertyKey],
): boolean {
    return (
        exp == null ||
        isProxy(exp) ||
        (typeof exp === 'object' && '\u0001' in exp)
    )
}
