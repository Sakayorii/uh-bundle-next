import { ToastActionCreators } from '@tacet-mod/discord/actions'
import { Clipboard } from '@tacet-mod/externals/react-native-clipboard'
import { lookupGeneratedIconComponent } from '@tacet-mod/utils/discord'
import type { SettingsItem } from '@tacet-mod/discord/modules/settings'

const CopyIcon = lookupGeneratedIconComponent('CopyIcon')

export const CopyableSetting = (
    item: Omit<SettingsItem, 'type' | 'onClick'>,
    description: () => string,
): SettingsItem => ({
    ...item,
    useDescription: item.useDescription ?? (() => description()),
    type: 'pressable',
    onPress() {
        Clipboard.setString(description())
        ToastActionCreators.open({
            key: 'TACET_SETTING_COPIED',
            content: 'Copied to clipboard',
            IconComponent: CopyIcon,
        })
    },
})
