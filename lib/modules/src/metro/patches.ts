import { callBridgeMethodSync } from '@tacet-mod/modules/native'
import { getErrorStack } from '@tacet-mod/utils/error'
import { FullVersion } from '~constants'
import { cache, cacheBlacklistedModule, Uncached } from '../caches'
import {
    global,
    metroImportAll,
    metroImportDefault,
    metroRequire,
} from './runtime'
import { executeRequireSubscriptions } from './subscriptions/_internal'
import type { Metro, TacetMetro } from '../types'

export let mInitializingId: Metro.ModuleID | undefined
export const mUninitialized = new Set<Metro.ModuleID>()
export const mInitialized = new Set<Metro.ModuleID>()

export const mDeps = new Map<Metro.ModuleID, Metro.DependencyMap>()

export const mList: TacetMetro.ModuleList = new Map()

export const mSegmentDefiners: Array<
    ((moduleId: Metro.ModuleID) => void) | undefined
> = []
export const mModuleIdToSegmentId = new Map<Metro.ModuleID, number>()

const registerSegment: Metro.RegisterSegmentFn = (
    segmentId,
    moduleDefiner,
    moduleIds,
) => {
    mSegmentDefiners[segmentId] = moduleDefiner
    if (moduleIds) {
        for (const id of moduleIds) {
            if (!mList.has(id) && !mModuleIdToSegmentId.has(id)) {
                mModuleIdToSegmentId.set(id, segmentId)
            }
        }
    }
}

export function loadModuleFromSegment(
    moduleId: Metro.ModuleID,
): TacetMetro.ModuleDefinition | undefined {
    const segmentId = mModuleIdToSegmentId.get(moduleId) ?? 0
    const definer = mSegmentDefiners[segmentId]
    if (!definer) return undefined

    definer(moduleId)
    mModuleIdToSegmentId.delete(moduleId)

    return mList.get(moduleId)
}

const metroDefine = (
    factory: Metro.FactoryFn,
    id: Metro.ModuleID,
    dependencyMap: Metro.DependencyMap,
) => {
    mDeps.set(id, dependencyMap!)
    mUninitialized.add(id)

    const def: TacetMetro.ModuleDefinition = {
        flags: 0,
        module: undefined,
        factory: () => {
            handleFactoryCall(factory, def.module!)
        },
        importedDefault: undefined,
        importedAll: undefined,
        error: undefined,
    }

    mList.set(id, def)
}

const defineKey = `${__METRO_GLOBAL_PREFIX__}__d` as const

globalThis[defineKey] = function define(origFactory, id, deps) {
    metroRequire.importDefault = metroImportDefault
    metroRequire.importAll = metroImportAll

    globalThis[defineKey] = metroDefine
    metroDefine(origFactory, id, deps)
}

globalThis.__registerSegment = registerSegment

function handleFactoryCall(
    factory: Metro.FactoryFn,
    moduleObject: Metro.Module,
) {
    const prevId = mInitializingId
    mInitializingId = moduleObject.id!

    executeRequireSubscriptions(mInitializingId)

    try {
        factory(
            global,
            metroRequire,
            metroImportDefault,
            metroImportAll,
            moduleObject,
            moduleObject.exports,
            mDeps.get(mInitializingId)!,
        )

        const { exports } = moduleObject

        if (mUninitialized.has(mInitializingId)) {
            switch (typeof exports) {
                case 'function':
                    mInitialized.add(mInitializingId)
                    break

                // biome-ignore lint/suspicious/noFallthroughSwitchClause: Intentional
                case 'object': {
                    if (Object.keys(exports).length) {
                        mInitialized.add(mInitializingId)
                        break
                    }
                }

                default:
                    cacheBlacklistedModule(mInitializingId)
            }
        }
    } catch (e) {
        const msg = `Module ${mInitializingId} failed to initialize:\n\n${getErrorStack(e)}`

        if (__DEV__) {
            callBridgeMethodSync('revenge.alertError', [msg, FullVersion])
        } else {
            moduleObject.exports = {}
            cacheBlacklistedModule(mInitializingId)
            nativeLoggingHook(msg, 2)
        }
    } finally {
        mUninitialized.delete(mInitializingId)
        mInitializingId = prevId
    }
}

if (cache !== Uncached)
    for (const id of cache.blacklist) mUninitialized.delete(id)
