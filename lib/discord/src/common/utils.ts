import { lookupModule } from '@tacet-mod/modules/finders'
import {
    withDependencies,
    withName,
} from '@tacet-mod/modules/finders/filters'
import { proxify } from '@tacet-mod/utils/proxy'
import { ImportTrackerModuleId } from '../patches/import-tracker'
import type { DiscordModules } from '../types'

export let TypedEventEmitter: typeof DiscordModules.Utils.TypedEventEmitter =
    proxify(() => {
        const [module] = lookupModule(
            withName<typeof DiscordModules.Utils.TypedEventEmitter>(
                'TypedEventEmitter',
            ).and(
                withDependencies([
                    withName('_classCallCheck'),
                    withName('_createClass'),
                    [],
                    ImportTrackerModuleId,
                ]),
            ),
        )

        if (module) return (TypedEventEmitter = module)
    })!
