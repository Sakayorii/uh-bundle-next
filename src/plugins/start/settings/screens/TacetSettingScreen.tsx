import { SettingListRenderer } from '@tacet-mod/discord/modules/settings/renderer'
import { Setting } from '../constants'

export default function TacetSettingScreen() {
    return (
        <SettingListRenderer.SettingsList
            node={{
                type: 'list',
                sections: [
                    {
                        label: 'Tacet',
                        settings: [
                            Setting.TacetVersion,
                            Setting.LoaderVersion,
                            Setting.TacetDiscord,
                            Setting.TacetSourceRepository,
                            Setting.TacetLicense,
                        ],
                    },
                    {
                        label: 'Versions',
                        settings: [
                            Setting.ReactVersion,
                            Setting.ReactNativeVersion,
                            Setting.HermesVersion,
                        ],
                    },
                    {
                        label: 'Actions',
                        settings: [Setting.Reload],
                    },
                ],
            }}
        />
    )
}
