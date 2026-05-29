import { Platform } from 'react-native'
import { aCustoms, aOverrides } from './_internal'
import { cache } from './caches'
import { AssetsRegistry } from './preinit'
import type {
    Asset,
    AssetId,
    CustomAsset,
    PackagerAsset,
    RegisterableAsset,
} from './types'

export {
    AssetsRegistry,
    AssetsRegistryModuleId,
} from './preinit'

const metroRequire = __r

let _preferredType: Asset['type'] = Platform.OS === 'ios' ? 'png' : 'svg'
export function setPreferredAssetType(type: Asset['type']) {
    _preferredType = type
}

export function* getAssets(): Generator<Asset> {
    yield* getPackagerAssets()
    yield* getCustomAssets()
}

export function* getCustomAssets(): Generator<CustomAsset> {
    for (const asset of aCustoms) yield asset
}

export function* getPackagerAssets(): Generator<PackagerAsset> {
    for (const reg of Object.values(cache.data))
        for (const moduleId of Object.values(reg))
            yield AssetsRegistry.getAssetByID(metroRequire(moduleId))
}

export function getAssetByName(
    name: string,
    type?: Asset['type'],
): Asset | undefined {
    const id = getAssetIdByName(name, type)
    if (id !== undefined) return AssetsRegistry.getAssetByID(id)
}

export function getAssetsByName(
    name: string,
): Record<Asset['type'], Asset> | undefined {
    const reg = cache.data[name]
    if (!reg) return

    return Object.entries(reg).reduce(
        (acc, [type, mid]) => {
            acc[type as Asset['type']] = AssetsRegistry.getAssetByID(
                metroRequire(mid),
            )!
            return acc
        },
        {} as Record<Asset['type'], Asset>,
    )
}

export function getAssetIdByName(
    name: string,
    type?: Asset['type'],
): AssetId | undefined {
    const reg = cache.data[name]
    if (!reg) return

    if (type !== undefined) {
        const mid = reg[type]
        return mid && metroRequire(mid)
    }

    let mid = reg[_preferredType]
    mid ??= Object.values(reg)[0]

    return mid && metroRequire(mid)
}

export function registerAsset(asset: RegisterableAsset): AssetId {
    if (cache.data[asset.name]?.[asset.type] !== undefined)
        throw new Error(
            `Asset with name ${asset.name} and type ${asset.type} already exists!`,
        )

    aCustoms.add(asset as CustomAsset)

    // @ts-expect-error
    return AssetsRegistry.registerAsset(asset)
}

export function addAssetOverride(asset: Asset, override: Asset) {
    aOverrides.set(asset, override)
}

export function removeAssetOverride(asset: Asset) {
    return aOverrides.delete(asset)
}
