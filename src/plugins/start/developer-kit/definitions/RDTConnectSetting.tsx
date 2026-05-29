import TableRowAssetIcon from '@tacet-mod/components/TableRowAssetIcon'
import { Setting } from '../constants'
import { connect, RDTContext, useIsConnected } from '../react-devtools'
import type { SettingsItem } from '@tacet-mod/discord/modules/settings'

const RDTConnectSetting: SettingsItem = {
    parent: Setting.TacetDeveloper,
    IconComponent: () => <TableRowAssetIcon name="LinkIcon" />,
    useTitle: () => 'Connect to React DevTools',
    useDescription: () => `Version: ${globalThis.__REACT_DEVTOOLS__?.version}`,
    usePredicate: () => !useIsConnected() && RDTContext.active,
    onPress: connect,
    type: 'pressable',
}

export default RDTConnectSetting
