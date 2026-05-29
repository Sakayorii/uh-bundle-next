import TableRowAssetIcon from '@tacet-mod/components/TableRowAssetIcon'
import { Setting } from '../constants'
import { CopyableSetting } from './shared'
import type { SettingsItem } from '@tacet-mod/discord/modules/settings'

const ossReleaseVersion =
    // @ts-expect-error
    HermesInternal.getRuntimeProperties()['OSS Release Version']

const ReactNativeVersionSetting: SettingsItem = CopyableSetting(
    {
        parent: Setting.Tacet,
        IconComponent: () => <TableRowAssetIcon name="ScienceIcon" />,
        useTitle: () => 'React Native',
    },
    () => ossReleaseVersion.slice(7),
)

export default ReactNativeVersionSetting
