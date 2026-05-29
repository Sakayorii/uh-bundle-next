import { InternalPluginFlags, registerPlugin } from '@tacet-mod/plugins/_'
import { PluginFlags } from '@tacet-mod/plugins/constants'
import defer * as UtilsCallback from '@tacet-mod/utils/callback'
import defer * as UtilsDiscord from '@tacet-mod/utils/discord'
import defer * as UtilsError from '@tacet-mod/utils/error'
import defer * as UtilsObject from '@tacet-mod/utils/object'
import defer * as UtilsPromise from '@tacet-mod/utils/promise'
import defer * as UtilsProxy from '@tacet-mod/utils/proxy'
import defer * as UtilsReact from '@tacet-mod/utils/react'
import defer * as UtilsTree from '@tacet-mod/utils/tree'

registerPlugin(
    {
        id: 'tacet.api.utils',
        name: 'Utils API',
        description: '@tacet-mod/utils API for plugins.',
        author: 'Sakayori Studio',
        icon: 'PollsIcon',
    },
    {
        preInit({ unscoped }) {
            unscoped.utils = {
                callback: UtilsCallback,
                error: UtilsError,
                object: UtilsObject,
                promise: UtilsPromise,
                proxy: UtilsProxy,
                tree: UtilsTree,
                react: UtilsReact,
            }
        },
        init({ unscoped: { utils } }) {
            utils.discord = UtilsDiscord
        },
    },
    PluginFlags.Enabled,
    // biome-ignore format: Don't format this
    InternalPluginFlags.Internal |
    InternalPluginFlags.Essential |
    InternalPluginFlags.API,
)
