import { noop } from '@tacet-mod/utils/callback'
import { sLoaded } from '../../start'
import { sConfig, sRefresher, sSections, sSubscriptions } from './_internal'
import type { DiscordModules } from '../../types'

export type SettingsItem = DiscordModules.Modules.Settings.SettingsItem
export type SettingsSection = DiscordModules.Modules.Settings.SettingsSection

export type SettingsModulesLoadedSubscription = () => void

export function isSettingsModulesLoaded() {
    return sLoaded
}

export function onSettingsModulesLoaded(
    subcription: SettingsModulesLoadedSubscription,
) {
    if (isSettingsModulesLoaded()) {
        subcription()
        return noop
    }

    sSubscriptions.add(subcription)
    return () => {
        sSubscriptions.delete(subcription)
    }
}

export function registerSettingsSection(key: string, section: SettingsSection) {
    sSections[key] = section
    return () => {
        delete sSections[key]
    }
}

export function registerSettingsItem(key: string, item: SettingsItem) {
    sConfig[key] = item
    return () => {
        delete sConfig[key]
    }
}

export function registerSettingsItems(record: Record<string, SettingsItem>) {
    Object.assign(sConfig, record)
    return () => {
        for (const key of Object.keys(record)) delete sConfig[key]
    }
}

export function addSettingsItemToSection(key: string, item: string) {
    const section = sSections[key]
    if (!section) throw new Error(`Section "${key}" does not exist`)

    const newLength = section.settings.push(item)
    return () => {
        delete section.settings[newLength - 1]
    }
}

export function refreshSettingsOverviewScreen() {
    sRefresher.overviewScreen = true
    sRefresher.callOverviewScreen()
}

export function refreshSettingsNavigator() {
    sRefresher.navigator = true
    sRefresher.callNavigator()
}
