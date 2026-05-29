import {
    onSettingsModulesLoaded,
    refreshSettingsNavigator,
    refreshSettingsOverviewScreen,
} from '@tacet-mod/discord/modules/settings'
import { InternalPluginFlags, registerPlugin } from '@tacet-mod/plugins/_'
import { PluginFlags } from '@tacet-mod/plugins/constants'
import pluginSettings from '../settings'
import * as dt from './devtools'
import defer * as rdt from './react-devtools'
import defer * as utils from './utils'
import type { PluginApi } from '@tacet-mod/plugins/types'

interface Storage {
    devTools: DevToolsSettings
    reactDevTools: DevToolsSettings
}

interface DevToolsSettings {
    address: string
    autoConnect: boolean
}

const defaultStorage: Storage = {
    devTools: {
        address: 'localhost:7864',
        autoConnect: false,
    },
    reactDevTools: {
        address: 'localhost:8097',
        autoConnect: false,
    },
}

registerPlugin<{ storage: Storage }>(
    {
        id: 'tacet.developer-kit',
        name: 'Developer Kit',
        description: 'Tools assisting Tacet developers.',
        author: 'Tacet',
        icon: 'WrenchIcon',
        dependencies: [pluginSettings],
    },
    {
        storage: {
            load: true,
            default: defaultStorage,
        },
        async start(api_) {
            api = api_

            onSettingsModulesLoaded(utils.register)

            if (api_.plugin.flags & PluginFlags.EnabledLate) {
                refreshSettingsOverviewScreen()
                refreshSettingsNavigator()
            }

            const settings = await api.storage.get()

            dt.DTContext.addr = settings.devTools.address
            rdt.RDTContext.addr = settings.reactDevTools.address

            if (settings.devTools.autoConnect) dt.connect()
            if (settings.reactDevTools.autoConnect) rdt.connect()
        },
        stop({ cleanup }) {
            cleanup(refreshSettingsOverviewScreen, refreshSettingsNavigator)
        },
    },
    PluginFlags.Enabled,
    InternalPluginFlags.Internal,
)

export let api: PluginApi<{ storage: Storage }>
