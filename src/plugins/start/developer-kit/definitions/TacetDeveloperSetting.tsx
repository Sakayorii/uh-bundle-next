import TableRowAssetIcon from '@tacet-mod/components/TableRowAssetIcon'
import { RouteNames, Setting } from '../constants'
import defer * as TacetDeveloperSettingScreen from '../screens/TacetDeveloperSettingScreen'
import type { SettingsItem } from '@tacet-mod/discord/modules/settings'

const TacetDeveloperSetting: SettingsItem = {
    parent: null,
    type: 'route',
    IconComponent: () => <TableRowAssetIcon name="WrenchIcon" />,
    useTitle: () => 'Developer',
    screen: {
        route: RouteNames[Setting.TacetDeveloper],
        getComponent: () => TacetDeveloperSettingScreen.default,
    },
}

export default TacetDeveloperSetting
