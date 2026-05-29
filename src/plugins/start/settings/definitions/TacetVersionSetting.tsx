import TableRowAssetIcon from '@tacet-mod/components/TableRowAssetIcon'
import { BuildEnvironment, FullVersion } from '~/constants'
import TacetIcon from '~assets/TacetIcon'
import { Setting } from '../constants'
import { CopyableSetting } from './shared'
import type { SettingsItem } from '@tacet-mod/discord/modules/settings'

const TacetVersionSetting: SettingsItem = CopyableSetting(
    {
        parent: Setting.Tacet,
        IconComponent: () => <TableRowAssetIcon id={TacetIcon} />,
        useTitle: () => 'Tacet',
    },
    () => `${FullVersion} (${BuildEnvironment})`,
)

export default TacetVersionSetting
