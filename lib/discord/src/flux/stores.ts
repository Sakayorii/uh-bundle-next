import {
    lookupModule,
    lookupModules,
    waitForModules,
} from '@tacet-mod/modules/finders'
import {
    createFilterGenerator,
    withDependencies,
    withName,
} from '@tacet-mod/modules/finders/filters'
import { getModuleDependencies } from '@tacet-mod/modules/metro/utils'
import { asap, noop } from '@tacet-mod/utils/callback'
import {
    cache,
    cacheFilterResultForId,
    Uncached,
} from '../../../modules/src/caches'
import { FilterResultFlags } from '../../../modules/src/finders/_internal'
import {
    FilterFlag,
    FilterScopes,
} from '../../../modules/src/finders/filters/constants'
import type {
    Filter,
    FilterGenerator,
} from '@tacet-mod/modules/finders/filters'
import type { DiscordModules } from '../types'

const _stores: Record<string, DiscordModules.Flux.Store> = {}

export const Stores = new Proxy(_stores, {
    ownKeys: target => Reflect.ownKeys(target),
    get: (target, prop: string) =>
        target[prop] ?? lookupModule(withStoreName(prop))[0],
})

export function getStore<T>(
    name: string,
    callback: (store: DiscordModules.Flux.Store<T>) => void,
) {
    const store = _stores[name]
    if (store) {
        callback(store as DiscordModules.Flux.Store<T>)
        return noop
    }

    return waitForModules(withStoreName<T>(name), callback, { cached: true })
}

const withLeadingFluxStoreDeps = withDependencies(
    withDependencies.loose([
        withName('_classCallCheck'),
        withName('_createClass'),
        withName('_possibleConstructorReturn'),
        withName('bound getPrototypeOf'),
        withName('_inherits'),
    ]),
)

export type WithStore = FilterGenerator<
    <T>() => Filter<{
        Result: DiscordModules.Flux.Store<T>
        RequiresExports: boolean
        Scopes: [
            typeof FilterScopes.Uninitialized,
            typeof FilterScopes.Initialized,
        ]
    }>
>

export const withStore = createFilterGenerator(
    (_, id, exports) => {
        if (exports) return Boolean(exports._dispatchToken)
        else {
            if (!withLeadingFluxStoreDeps(id)) return false
            const deps = getModuleDependencies(id)!
            return deps[deps.length - 1] === 2
        }
    },
    () => 'tacet.discord.store',
    FilterFlag.Dynamic,
    FilterScopes.Uninitialized | FilterScopes.Initialized,
) as WithStore

export type WithStoreName = FilterGenerator<
    <T>(name: string) => Filter<{
        Result: DiscordModules.Flux.Store<T>
        RequiresExports: true
        Scopes: [
            typeof FilterScopes.Uninitialized,
            typeof FilterScopes.Initialized,
        ]
    }>
>

export const withStoreName = createFilterGenerator(
    ([name], _, exports) =>
        exports.getName?.length === 0 && exports.getName() === name,
    ([name]) => `tacet.discord.storeName(${name})`,
    FilterFlag.RequiresExports,
    FilterScopes.Uninitialized | FilterScopes.Initialized,
) as WithStoreName

waitForModules(withStore(), (store, id) => {
    const name = store.getName()
    cacheFilterResultForId(
        withStoreName.keyFor([name]),
        id,
        FilterResultFlags.Default,
    )
    Stores[name] = store
})

if (cache === Uncached)
    asap(() => {
        const lookup = lookupModules(withStore())

        while (lookup.next().done);
    })
