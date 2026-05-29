import { getAssetByName } from '@tacet-mod/assets'
import { TokensModuleId } from '@tacet-mod/discord/common'
import { lookupModule } from '@tacet-mod/modules/finders'
import {
    createFilterGenerator,
    withDependencies,
} from '@tacet-mod/modules/finders/filters'
import {
    ReactJSXRuntimeModuleId,
    ReactModuleId,
    ReactNativeModuleId,
} from '@tacet-mod/react'
import {
    FilterFlag,
    FilterScopes,
} from '../../modules/src/finders/filters/constants'
import type {
    Filter,
    FilterGenerator,
} from '@tacet-mod/modules/finders/filters'
import type { FC } from 'react'

const IconComponentFilter = [
    ReactModuleId,
    ReactJSXRuntimeModuleId,
    TokensModuleId,
    null,
    null,
    2,
]

const MultiIconComponentFilterBase = [
    ReactModuleId,
    ReactNativeModuleId,
    ReactJSXRuntimeModuleId,
    TokensModuleId,
    null,
]

export type WithGeneratedIconComponent = FilterGenerator<
    <N extends string>(
        name: N,
        ...assets: string[]
    ) => Filter<{
        Result: { [K in N]: FC<any> }
        RequiresExports: boolean
        Scopes: [
            typeof FilterScopes.Uninitialized,
            typeof FilterScopes.Initialized,
        ]
    }>
>

export const withGeneratedIconComponent = createFilterGenerator<
    Parameters<WithGeneratedIconComponent>
>(
    (names, id, exports) => {
        if (typeof exports === 'object') {
            if (typeof exports[names[0]] === 'function')
                return Object.keys(exports).length === 1
        } else {
            let filter = IconComponentFilter

            if (names.length > 1) {
                const mids = []

                for (let i = 1; i < names.length; i++) {
                    const name = names[i]
                    const mid = getAssetByName(name)?.moduleId
                    if (!mid) return false

                    mids.push(mid)
                }

                filter = [...MultiIconComponentFilterBase, ...mids, 2]
            } else {
                const [name] = names

                const mid = getAssetByName(name)?.moduleId
                if (!mid) return false

                IconComponentFilter[4] = mid
            }

            return withDependencies(filter)(id, exports)
        }

        return false
    },
    names => `tacet.utils.discord.generatedIconComponent(${names.join(',')})`,
    FilterFlag.Dynamic,
    FilterScopes.Uninitialized | FilterScopes.Initialized,
) as WithGeneratedIconComponent

export function lookupGeneratedIconComponent<N extends string>(
    ...names: [N, ...string[]]
) {
    for (const name of names) {
        let badFind = false
        if (__DEV__) {
            if (!getAssetByName(name)) {
                badFind = true
                warnUnregisteredAsset(name)
            }
        } else if (!getAssetByName(name)) return
        if (__DEV__ && badFind) return
    }

    const [module] = lookupModule(withGeneratedIconComponent(...names))

    return module?.[names[0]] as FC<any> | undefined
}

function warnUnregisteredAsset(name: string) {
    nativeLoggingHook(
        `\u001b[31mAsset "${name}" is not registered. Cannot get module ID to filter by.\u001b[0m`,
        2,
    )
}
