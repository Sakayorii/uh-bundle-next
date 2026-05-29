import { getNativeModule } from '@tacet-mod/modules/native'
import { proxify } from '@tacet-mod/utils/proxy'
import type { DiscordNativeModules } from './types/native'

export let CacheModule: DiscordNativeModules.CacheModule = proxify(() => {
    const module = getNativeModule<typeof CacheModule>('NativeCacheModule')

    if (module) return (CacheModule = module)
})!

export let FileModule: DiscordNativeModules.FileModule = proxify(() => {
    const module = getNativeModule<typeof FileModule>('NativeFileModule')

    if (module) return (FileModule = module)
})!

export let ClientInfoModule: DiscordNativeModules.ClientInfoModule = proxify(
    () => {
        const module = getNativeModule<typeof ClientInfoModule>(
            'NativeClientInfoModule',
        )

        if (module) return (ClientInfoModule = module)
    },
)!

export let DeviceModule: DiscordNativeModules.DeviceModule = proxify(() => {
    const module = getNativeModule<typeof DeviceModule>('NativeDeviceModule')

    if (module) return (DeviceModule = module)
})!

export let ThemeModule: DiscordNativeModules.ThemeModule = proxify(() => {
    const module = getNativeModule<typeof ThemeModule>('NativeThemeModule')

    if (module) return (ThemeModule = module)
})!

export let BundleUpdaterManager: DiscordNativeModules.BundleUpdaterManager =
    proxify(() => {
        const module = getNativeModule<typeof BundleUpdaterManager>(
            'BundleUpdaterManager',
        )

        if (module) return (BundleUpdaterManager = module)
    })!
