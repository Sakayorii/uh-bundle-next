export const Setting = {
    Tacet: 'Tacet',
    TacetPlugins: 'TacetPlugins',

    TacetDiscord: 'TacetDiscord',
    TacetSourceRepository: 'TacetSourceRepository',
    TacetLicense: 'TacetLicense',
    Reload: 'Reload',

    TacetVersion: 'TacetVersion',
    ReactVersion: 'ReactVersion',
    ReactNativeVersion: 'ReactNativeVersion',
    HermesVersion: 'HermesVersion',
    LoaderVersion: 'LoaderVersion',
} as const

export const RouteNames = {
    [Setting.Tacet]: 'Tacet',
    [Setting.TacetPlugins]: 'Tacet Plugins',
} as const
