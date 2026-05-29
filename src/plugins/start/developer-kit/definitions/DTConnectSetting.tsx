import TableRowAssetIcon from '@tacet-mod/components/TableRowAssetIcon'
import { DevToolsClient } from '@revenge-mod/devtools-client'
import { Setting } from '../constants'
import { connect, useIsConnected } from '../devtools'
import type { SettingsItem } from '@tacet-mod/discord/modules/settings'

const DTConnectSetting: SettingsItem = {
    parent: Setting.TacetDeveloper,
    IconComponent: () => <TableRowAssetIcon name="LinkIcon" />,
    useTitle: () => 'Connect to DevTools',
    useDescription: () => `Version: ${DevToolsClient.version}`,
    usePredicate: () => !useIsConnected(),
    onPress: connect,
    type: 'pressable',
}

export default DTConnectSetting
