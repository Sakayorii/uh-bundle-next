import TableRowAssetIcon from '@tacet-mod/components/TableRowAssetIcon'
import { BundleUpdaterManager } from '@tacet-mod/discord/native'
import { Setting } from '../constants'
import type { SettingsItem } from '@tacet-mod/discord/modules/settings'

const ReloadSetting: SettingsItem = {
    parent: Setting.Tacet,
    IconComponent: () => <TableRowAssetIcon name="RetryIcon" />,
    useTitle: () => 'Reload App',
    onPress: () => {
        BundleUpdaterManager.reload()
    },
    type: 'pressable',
}

export default ReloadSetting
