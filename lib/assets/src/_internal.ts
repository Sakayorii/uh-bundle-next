import type { Asset, CustomAsset } from './types'

export const aCustoms = new Set<CustomAsset>()
export const aOverrides = new WeakMap<Asset, Asset>()
