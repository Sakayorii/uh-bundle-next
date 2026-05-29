import { InternalPluginFlags, registerPlugin } from '@tacet-mod/plugins/_'
import { PluginFlags } from '@tacet-mod/plugins/constants'
import { defineLazyProperty } from '@tacet-mod/utils/object'

registerPlugin(
    {
        id: 'tacet.api.discord',
        name: 'Discord API',
        description: '@tacet-mod/discord API for plugins.',
        author: 'Sakayori Studio',
        icon: 'PollsIcon',
    },
    {
        init({
            decorate,
            unscoped: {
                discord: {
                    common: { Logger },
                },
            },
        }) {
            decorate(plugin => {
                defineLazyProperty(
                    plugin.api,
                    'logger',
                    () =>
                        new Logger(`Tacet > Plugins (${plugin.manifest.id})`),
                )
            })
        },
    },
    PluginFlags.Enabled,
    // biome-ignore format: Don't format this
    InternalPluginFlags.Internal |
    InternalPluginFlags.Essential |
    InternalPluginFlags.API,
)
