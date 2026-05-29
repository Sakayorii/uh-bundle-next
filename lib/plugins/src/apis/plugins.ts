import * as PluginsApiConstants from '@tacet-mod/plugins/constants'

export interface PluginApiPlugins {
    constants: typeof import('@tacet-mod/plugins/constants')
}

export const plugins: PluginApiPlugins = {
    constants: PluginsApiConstants,
}
