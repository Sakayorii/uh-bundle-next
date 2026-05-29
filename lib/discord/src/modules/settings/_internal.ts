import { noop } from '@tacet-mod/utils/callback'
import type {
    SettingsItem,
    SettingsModulesLoadedSubscription,
    SettingsSection,
} from '.'

export const sSections: Record<string, SettingsSection> = {}
export const sConfig: Record<string, SettingsItem> = {}

export const sSubscriptions = new Set<SettingsModulesLoadedSubscription>()

export const sRefresher = {
    navigator: false,
    overviewScreen: false,
    callNavigator: noop,
    callOverviewScreen: noop,
}
