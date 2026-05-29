import TableRowAssetIcon from '@tacet-mod/components/TableRowAssetIcon'
import { version } from 'react'
import { Setting } from '../constants'
import { CopyableSetting } from './shared'
import type { SettingsItem } from '@tacet-mod/discord/modules/settings'

const ReactVersionSetting: SettingsItem = CopyableSetting(
    {
        parent: Setting.Tacet,
        IconComponent: () => <TableRowAssetIcon name="ScienceIcon" />,
        useTitle: () => 'React',
    },
    () => version,
)

export default ReactVersionSetting
