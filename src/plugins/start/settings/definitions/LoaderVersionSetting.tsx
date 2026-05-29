import TableRowAssetIcon from '@tacet-mod/components/TableRowAssetIcon'
import { getBridgeInfo } from '@tacet-mod/modules/native'
import { Setting } from '../constants'
import { CopyableSetting } from './shared'
import type { SettingsItem } from '@tacet-mod/discord/modules/settings'

const bridgeInfo = getBridgeInfo()

const LoaderVersionSetting: SettingsItem = CopyableSetting(
    {
        parent: Setting.Tacet,
        IconComponent: () => <TableRowAssetIcon name="SendMessageIcon" />,
        useTitle: () => 'Loader',
        usePredicate: () => Boolean(bridgeInfo),
    },
    () => `${bridgeInfo!.name} (${bridgeInfo!.version})`,
)

export default LoaderVersionSetting
