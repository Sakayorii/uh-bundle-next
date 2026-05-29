import { lookupModule } from '@tacet-mod/modules/finders'
import {
    withDependencies,
    withProps,
} from '@tacet-mod/modules/finders/filters'
import {
    ReactJSXRuntimeModuleId,
    ReactModuleId,
    ReactNativeModuleId,
} from '@tacet-mod/react'
import { proxify } from '@tacet-mod/utils/proxy'
import type { DiscordModules } from '../../types'

const { loose, relative } = withDependencies

export type SettingListRenderer =
    DiscordModules.Modules.Settings.SettingListRenderer

export let SettingListRenderer: SettingListRenderer = proxify(
    () => {
        const [module] = lookupModule(
            withProps<SettingListRenderer>('SettingsList')
                .and(
                    withDependencies(
                        loose([
                            ReactModuleId,
                            ReactNativeModuleId,
                            relative(1),
                            relative(2),
                            null,
                            ReactJSXRuntimeModuleId,
                        ]),
                    ),
                )
                .keyAs(
                    'tacet.discord.modules.settings.renderer.SettingListRenderer',
                ),
        )

        if (module) return (SettingListRenderer = module)
    },
    {
        hint: {},
    },
)!
