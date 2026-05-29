import { lookupModule } from '@tacet-mod/modules/finders'
import {
    withDependencies,
    withProps,
} from '@tacet-mod/modules/finders/filters'
import { ImportTrackerModuleId } from '../patches/import-tracker'
import type { Metro } from '@tacet-mod/modules/types'
import type { DiscordModules } from '../types'

const { relative } = withDependencies

export const [Dispatcher, DispatcherModuleId] = lookupModule(
    withProps<DiscordModules.Flux.Dispatcher>('_interceptors').and(
        withDependencies([
            relative(1),
            null,
            null,
            null,
            null,
            ImportTrackerModuleId,
        ]),
    ),
) as [DiscordModules.Flux.Dispatcher, Metro.ModuleID]
