import TableRowAssetIcon from '@tacet-mod/components/TableRowAssetIcon'
import { FullVersion } from '~/constants'
import TacetIcon from '~assets/TacetIcon'
import { RouteNames, Setting } from '../constants'
import defer * as TacetSettingScreen from '../screens/TacetSettingScreen'
import type { SettingsItem } from '@tacet-mod/discord/modules/settings'

const TacetSetting: SettingsItem = {
    parent: null,
    type: 'route',
    IconComponent: () => <TableRowAssetIcon id={TacetIcon} />,
    useTitle: () => 'Tacet (beta)',
    useTrailing: () => FullVersion,
    screen: {
        route: RouteNames[Setting.Tacet],
        getComponent: () => TacetSettingScreen.default,
    },
}

export default TacetSetting
