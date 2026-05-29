import { lookupModule, lookupModules } from '@tacet-mod/modules/finders'
import {
    withDependencies,
    withoutProps,
    withProps,
} from '@tacet-mod/modules/finders/filters'
import {
    ReactJSXRuntimeModuleId,
    ReactModuleId,
    ReactNativeModuleId,
} from '@tacet-mod/react'
import { proxify } from '@tacet-mod/utils/proxy'
import { ImportTrackerModuleId } from './common'
import { DispatcherModuleId } from './common/flux'
import type { DiscordModules } from './types'

const { relative, loose } = withDependencies

export let ActionSheetActionCreators: DiscordModules.Actions.ActionSheetActionCreators =
    proxify(
        () => {
            const [module] = lookupModule(
                withProps<DiscordModules.Actions.ActionSheetActionCreators>(
                    'hideActionSheet',
                    'openLazy',
                ).and(
                    withDependencies(
                        loose([
                            null,
                            ReactModuleId,
                            ReactJSXRuntimeModuleId,
                            DispatcherModuleId,
                            relative(1),
                            relative(2),
                        ]),
                    ),
                ),
            )

            if (module) return (ActionSheetActionCreators = module)
        },
        {
            hint: {},
        },
    )!

export let AlertActionCreators: DiscordModules.Actions.AlertActionCreators =
    proxify(
        () => {
            const [module] = lookupModule(
                withProps<DiscordModules.Actions.AlertActionCreators>(
                    'openAlert',
                ).and(
                    withDependencies([
                        null,
                        [relative(1), relative(2)],
                        [ReactNativeModuleId, ImportTrackerModuleId],
                        ImportTrackerModuleId,
                    ]),
                ),
            )

            if (module) return (AlertActionCreators = module)
        },
        {
            hint: {},
        },
    )!

export let ToastActionCreators: DiscordModules.Actions.ToastActionCreators =
    proxify(() => {
        const generator = lookupModules(
            withProps<DiscordModules.Actions.ToastActionCreators>('open')
                .and(withoutProps('init'))
                .and(
                    withDependencies([
                        DispatcherModuleId,
                        ImportTrackerModuleId,
                    ]),
                ),
        )

        for (const [module] of generator)
            if (module.open.length === 1) return (ToastActionCreators = module)
    })!
