import { lookupModules, waitForModules } from '@tacet-mod/modules/finders'
import {
    withDependencies,
    withName,
    withProps,
} from '@tacet-mod/modules/finders/filters'
import {
    mInitializingId,
    mUninitialized,
} from '@tacet-mod/modules/metro/patches'
import { getModuleDependencies } from '@tacet-mod/modules/metro/utils'
import { proxify } from '@tacet-mod/utils/proxy'
import { aOverrides } from './_internal'
import { cache, cacheAsset, Uncached } from './caches'
import type { Metro } from '@tacet-mod/modules/types'
import type { ReactNative } from '@tacet-mod/react/types'
import type { Asset, PackagerAsset } from './types'

const { relative } = withDependencies

const withAssetSourceResolver = withDependencies([
    withName('_classCallCheck'),
    withName('_createClass'),
    relative(1),
    relative(2),
    null,
    null,
])

const cachedOnly = { cached: true }

const unsubAR = waitForModules(
    withProps<ReactNative.AssetsRegistry>('registerAsset'),
    (exports, id) => {
        AssetsRegistryModuleId = id
        AssetsRegistry = exports as ReactNative.AssetsRegistry

        if (getModuleDependencies(id)!.length) {
            unsubAR()

            if (cache === Uncached) {
                const metroRequire = __r

                const firstAssetModuleId = id - 1
                for (const mId of mUninitialized) {
                    if (mId < firstAssetModuleId) continue

                    const deps = getModuleDependencies(mId)!
                    if (deps.length === 1 && deps[0] === id) metroRequire(mId)
                }
            }

            return
        }

        const orig = exports.registerAsset
        exports.registerAsset = (asset: Asset) => {
            const result = orig(asset as PackagerAsset)

            if ((asset as PackagerAsset).__packager_asset) {
                asset.moduleId = mInitializingId
                cacheAsset(asset, mInitializingId!)
            }

            return (asset.id = result)
        }
    },
    cachedOnly,
)

export let AssetsRegistryModuleId: Metro.ModuleID | undefined
export let AssetsRegistry: ReactNative.AssetsRegistry = proxify(() => {
    for (const [, id] of lookupModules(withDependencies([[]]), {
        initialize: false,
    })) {
        const deps = getModuleDependencies(id)!
        if (deps.length !== 1) continue

        if (withAssetSourceResolver(deps[0] + 1)) {
            const module = __r(id)
            if (module?.registerAsset) return (AssetsRegistry = module)
        }
    }

    throw new Error('assets-registry not found')
})

const unsubRAS = waitForModules(
    withName<{
        addCustomSourceTransformer: (
            transformer: (arg: { asset: Asset }) => PackagerAsset,
        ) => void
    }>('resolveAssetSource'),
    rAS => {
        unsubRAS()

        // @ts-expect-error
        rAS.addCustomSourceTransformer(({ asset }) => {
            if (!(asset as PackagerAsset).__packager_asset) return asset
        })

        // @ts-expect-error
        rAS.addCustomSourceTransformer(({ asset }) => aOverrides.get(asset))
    },
    cachedOnly,
)

if (cache === Uncached) {
    AssetsRegistry.getAssetByID(0)
}
