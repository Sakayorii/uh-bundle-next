import type { RouteNames, Setting } from './constants'

declare module '@tacet-mod/externals/react-navigation' {
    interface ReactNavigationParamList extends TacetSettingsParamList {}
}

type TacetSettingsParamList = {
    [K in (typeof RouteNames)[keyof typeof RouteNames]]: object
} & {
    [K in (typeof RouteNames)[(typeof Setting)['TacetPlugins']]]: {
        sort?: string
        filter?: string[]
        matchAll?: boolean
        reverse?: boolean
    }
}
