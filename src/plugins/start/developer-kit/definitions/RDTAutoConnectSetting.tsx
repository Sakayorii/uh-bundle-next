import TableRowAssetIcon from '@tacet-mod/components/TableRowAssetIcon'
import { api } from '..'
import { Setting } from '../constants'
import { RDTContext } from '../react-devtools'
import type { SettingsItem } from '@tacet-mod/discord/modules/settings'

const RDTAutoConnectSetting: SettingsItem = {
    parent: Setting.TacetDeveloper,
    IconComponent: () => <TableRowAssetIcon name="LinkIcon" />,
    useTitle: () => 'Auto-connect to React DevTools',
    useDescription: () =>
        'Automatically connect to React DevTools during startup.',
    usePredicate: () => RDTContext.active,
    useValue: () =>
        api.storage.use(s => s.reactDevTools?.autoConnect !== undefined)!
            .reactDevTools.autoConnect,
    onValueChange: v => {
        api.storage.set({ reactDevTools: { autoConnect: v } })
    },
    type: 'toggle',
}

export default RDTAutoConnectSetting
