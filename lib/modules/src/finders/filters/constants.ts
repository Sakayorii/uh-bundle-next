export const FilterFlag = {
    Dynamic: 0,
    RequiresExports: 1,
} as const

export type FilterFlag = number

export const FilterScopes = {
    All: 1,
    Uninitialized: 2,
    Initialized: 4,
} as const

export type FilterScope = (typeof FilterScopes)[keyof typeof FilterScopes]

export type FilterScopeValue = number

export interface FilterInfo {
    Result: any
    RequiresExports: boolean
    Scopes: FilterScope[]
}

export interface DefaultFilterInfo extends FilterInfo {
    Result: any
    RequiresExports: boolean
    Scopes: FilterScope[]
}
