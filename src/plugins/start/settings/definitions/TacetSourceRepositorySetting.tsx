import TableRowAssetIcon from '@tacet-mod/components/TableRowAssetIcon'
import { Linking } from 'react-native'
import { Setting } from '../constants'
import type { SettingsItem } from '@tacet-mod/discord/modules/settings'

const TacetSourceRepositorySetting: SettingsItem = {
    parent: Setting.Tacet,
    IconComponent: () => <TableRowAssetIcon name="PaperIcon" />,
    useTitle: () => 'Source Code',
    useDescription: () => __BUILD_SOURCE_REPOSITORY_URL__,
    onPress: () => {
        Linking.openURL(__BUILD_SOURCE_REPOSITORY_URL__)
    },
    type: 'pressable',
}

export default TacetSourceRepositorySetting
