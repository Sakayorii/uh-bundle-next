import TableRowAssetIcon from '@tacet-mod/components/TableRowAssetIcon'
import { isPluginEnabled, pEmitter, pList } from '@tacet-mod/plugins/_'
import { useReRender } from '@tacet-mod/utils/react'
import { useEffect } from 'react'
import { RouteNames, Setting } from '../constants'
import defer * as TacetPluginsSettingScreen from '../screens/TacetPluginsSettingScreen'
import type { SettingsItem } from '@tacet-mod/discord/modules/settings'

const TacetPluginsSetting: SettingsItem = {
    parent: null,
    type: 'route',
    IconComponent: () => <TableRowAssetIcon name="PuzzlePieceIcon" />,
    useTitle: () => 'Plugins',
    useTrailing: () => `${useEnabledPluginCount()} enabled`,
    screen: {
        route: RouteNames[Setting.TacetPlugins],
        getComponent: () => TacetPluginsSettingScreen.default,
    },
}

let enabledCount = 0

for (const plugin of pList.values()) if (isPluginEnabled(plugin)) enabledCount++

pEmitter.on('disabled', () => {
    enabledCount--
})

pEmitter.on('enabled', () => {
    enabledCount++
})

function useEnabledPluginCount() {
    const reRender = useReRender()

    useEffect(() => {
        pEmitter.on('disabled', reRender)
        pEmitter.on('enabled', reRender)

        return () => {
            pEmitter.off('disabled', reRender)
            pEmitter.off('enabled', reRender)
        }
    }, [reRender])

    return enabledCount
}

export default TacetPluginsSetting
