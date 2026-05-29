import {
    registerSettingsItems,
    registerSettingsSection,
} from '@tacet-mod/discord/modules/settings'
import { Setting } from './constants'
import HermesVersionSetting from './definitions/HermesVersionSetting'
import LoaderVersionSetting from './definitions/LoaderVersionSetting'
import ReactNativeVersionSetting from './definitions/ReactNativeVersionSetting'
import ReactVersionSetting from './definitions/ReactVersionSetting'
import ReloadSetting from './definitions/ReloadSetting'
import TacetDiscordSetting from './definitions/TacetDiscordSetting'
import TacetLicenseSetting from './definitions/TacetLicenseSetting'
import TacetPluginsSetting from './definitions/TacetPluginsSetting'
import TacetSetting from './definitions/TacetSetting'
import TacetSourceRepositorySetting from './definitions/TacetSourceRepositorySetting'
import TacetVersionSetting from './definitions/TacetVersionSetting'

registerSettingsItems({
    [Setting.Tacet]: TacetSetting,
    [Setting.TacetPlugins]: TacetPluginsSetting,
    [Setting.TacetSourceRepository]: TacetSourceRepositorySetting,
    [Setting.TacetLicense]: TacetLicenseSetting,
    [Setting.TacetDiscord]: TacetDiscordSetting,
    [Setting.Reload]: ReloadSetting,
    [Setting.TacetVersion]: TacetVersionSetting,
    [Setting.ReactVersion]: ReactVersionSetting,
    [Setting.ReactNativeVersion]: ReactNativeVersionSetting,
    [Setting.HermesVersion]: HermesVersionSetting,
    [Setting.LoaderVersion]: LoaderVersionSetting,
})

registerSettingsSection('TACET', {
    label: 'Tacet',
    settings: [Setting.Tacet, Setting.TacetPlugins],
})
