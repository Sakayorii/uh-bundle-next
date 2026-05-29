import TableRowAssetIcon from '@tacet-mod/components/TableRowAssetIcon'
import { RouteNames, Setting } from '../constants'
import defer * as TestErrorBoundarySettingScreen from '../screens/TestErrorBoundarySettingScreen'
import type { SettingsItem } from '@tacet-mod/discord/modules/settings'

const TestErrorBoundarySetting: SettingsItem = {
    parent: Setting.TacetDeveloper,
    type: 'route',
    variant: 'danger',
    IconComponent: () => (
        <TableRowAssetIcon name="ScreenXIcon" variant="danger" />
    ),
    useTitle: () => 'Test ErrorBoundary',
    screen: {
        route: RouteNames[Setting.TestErrorBoundary],
        getComponent: () => TestErrorBoundarySettingScreen.default,
    },
}

export default TestErrorBoundarySetting
