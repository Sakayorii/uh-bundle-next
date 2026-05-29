import TableRowAssetIcon from '@tacet-mod/components/TableRowAssetIcon'
import { RouteNames, Setting } from '../constants'
import defer * as AssetBrowserSettingScreen from '../screens/AssetBrowserSettingScreen'
import type { SettingsItem } from '@tacet-mod/discord/modules/settings'

const AssetBrowserSetting: SettingsItem = {
    parent: Setting.TacetDeveloper,
    type: 'route',
    IconComponent: () => <TableRowAssetIcon name="ImageIcon" />,
    useTitle: () => 'Asset Browser',
    screen: {
        route: RouteNames[Setting.AssetBrowser],
        getComponent: () => AssetBrowserSettingScreen.default,
    },
}

export default AssetBrowserSetting
