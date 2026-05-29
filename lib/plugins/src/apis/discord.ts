import defer * as DiscordActions from '@tacet-mod/discord/actions'
import defer * as DiscordCommon from '@tacet-mod/discord/common'
import defer * as DiscordDesign from '@tacet-mod/discord/design'
import defer * as DiscordFlux from '@tacet-mod/discord/flux'
import defer * as DiscordModulesMainTabsV2 from '@tacet-mod/discord/modules/main_tabs_v2'
import defer * as DiscordNative from '@tacet-mod/discord/native'
import defer * as DiscordUtilsFinders from '@tacet-mod/discord/utils/modules/finders'
import defer * as DiscordUtilsMetroSubscriptions from '@tacet-mod/discord/utils/modules/metro/subscriptions'
import { defineLazyProperties } from '@tacet-mod/utils/object'
import { guardIndexInitialized } from '.'

export interface PluginApiDiscord {
    actions: PluginApiDiscord.Actions
    common: PluginApiDiscord.Common
    design: PluginApiDiscord.Design
    flux: PluginApiDiscord.Flux
    modules: PluginApiDiscord.Modules
    native: PluginApiDiscord.Native
    utils: PluginApiDiscord.Utils
}

export namespace PluginApiDiscord {
    export type Actions = typeof import('@tacet-mod/discord/actions')
    export type Common = typeof import('@tacet-mod/discord/common')
    export type Design = typeof import('@tacet-mod/discord/design')
    export type Flux = typeof import('@tacet-mod/discord/flux')
    export type Native = typeof import('@tacet-mod/discord/native')

    export interface Utils {
        finders: typeof import('@tacet-mod/discord/utils/modules/finders')
        metro: {
            subscriptions: typeof import('@tacet-mod/discord/utils/modules/metro/subscriptions')
        }
    }

    export interface Modules {
        mainTabsV2: typeof import('@tacet-mod/discord/modules/main_tabs_v2')
        settings: typeof import('@tacet-mod/discord/modules/settings') &
            typeof import('@tacet-mod/discord/modules/settings/renderer')
    }
}

export const discord = defineLazyProperties(
    {
        modules: defineLazyProperties({} as PluginApiDiscord.Modules, {
            mainTabsV2: () => {
                return DiscordModulesMainTabsV2
            },
            settings: () => ({
                ...require('@tacet-mod/discord/modules/settings'),
                ...require('@tacet-mod/discord/modules/settings/renderer'),
            }),
        }),
        utils: defineLazyProperties({} as PluginApiDiscord.Utils, {
            finders: () => {
                return DiscordUtilsFinders
            },
            metro: () => ({
                subscriptions: DiscordUtilsMetroSubscriptions,
            }),
        }),
    } as PluginApiDiscord,
    {
        actions: () => {
            return DiscordActions
        },
        common: () => {
            guardIndexInitialized('Discord.common')
            return DiscordCommon
        },
        flux: () => {
            return DiscordFlux
        },
        design: () => {
            return DiscordDesign
        },
        native: () => {
            return DiscordNative
        },
    },
)
