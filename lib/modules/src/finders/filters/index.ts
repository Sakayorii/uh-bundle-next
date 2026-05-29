import { FilterFlag, FilterScopes } from './constants'
import { createFilterGenerator } from './utils'
import type { Filter, FilterGenerator } from './utils'

export * from './constants'
export * from './utils'

type FilterRequiringExports<T> = Filter<{
    Result: T
    RequiresExports: true
    Scopes: [typeof FilterScopes.Initialized]
}>

export const withProps = createFilterGenerator<Parameters<WithProps>>(
    (props, _, exports) => {
        const type = typeof exports
        if (type === 'object' || type === 'function') {
            for (const prop of props) {
                if (prop in exports) continue
                return false
            }

            return true
        }

        return false
    },
    props => `tacet.props(${props.join(',')})`,
    FilterFlag.RequiresExports,
    FilterScopes.Initialized,
) as WithProps

export type WithProps = FilterGenerator<
    <T extends Record<string, any> = Record<string, any>>(
        prop: keyof T,
        ...props: Array<keyof T>
    ) => FilterRequiringExports<T>
>

export const withoutProps = createFilterGenerator<Parameters<WithoutProps>>(
    (props, _, exports) => {
        const type = typeof exports
        if (type === 'object' || type === 'function')
            for (const prop of props) if (prop in exports) return false

        return true
    },
    props => `tacet.withoutProps(${props.join(',')})`,
    FilterFlag.RequiresExports,
    FilterScopes.Initialized,
) as WithoutProps

export type WithoutProps = FilterGenerator<
    <T extends Record<string, any>>(
        prop: string,
        ...props: string[]
    ) => FilterRequiringExports<T>
>

export const withSingleProp = createFilterGenerator<Parameters<WithSingleProp>>(
    ([prop], _, exports) => {
        if (typeof exports === 'object' && prop in exports)
            return Object.keys(exports).length === 1

        return false
    },
    ([prop]) => `tacet.singleProp(${prop})`,
    FilterFlag.RequiresExports,
    FilterScopes.Initialized,
) as WithSingleProp

export type WithSingleProp = FilterGenerator<
    <T extends Record<string, any>>(prop: keyof T) => FilterRequiringExports<T>
>

export const withName = createFilterGenerator<Parameters<WithName>>(
    ([name], _, exports) => exports.name === name,
    ([name]) => `tacet.name(${name})`,
    FilterFlag.RequiresExports,
    FilterScopes.Initialized,
) as WithName

export type WithName = FilterGenerator<
    <T extends object = object>(name: string) => FilterRequiringExports<T>
>

export * from './composite'
export * from './dynamic'
