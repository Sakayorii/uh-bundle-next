import TableRowAssetIcon from '@tacet-mod/components/TableRowAssetIcon'
import { Setting } from '../constants'
import { disconnect, useIsConnected } from '../react-devtools'
import type { SettingsItem } from '@tacet-mod/discord/modules/settings'

const RDTDisconnectSetting: SettingsItem = {
    parent: Setting.TacetDeveloper,
    IconComponent: () => <TableRowAssetIcon name="DenyIcon" variant="danger" />,
    variant: 'danger',
    useTitle: () => 'Disconnect from React DevTools',
    usePredicate: useIsConnected,
    onPress: disconnect,
    type: 'pressable',
}

export default RDTDisconnectSetting
