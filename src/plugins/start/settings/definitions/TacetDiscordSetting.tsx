import TableRowAssetIcon from '@tacet-mod/components/TableRowAssetIcon'
import { Linking } from 'react-native'
import { Setting } from '../constants'
import type { SettingsItem } from '@tacet-mod/discord/modules/settings'

const TacetDiscordSetting: SettingsItem = {
    parent: Setting.Tacet,
    IconComponent: () => <TableRowAssetIcon name="Discord" />,
    useTitle: () => 'Discord Server',
    useDescription: () => __BUILD_DISCORD_SERVER_URL__,
    onPress: () => {
        Linking.openURL(__BUILD_DISCORD_SERVER_URL__)
    },
    type: 'pressable',
}

export default TacetDiscordSetting
