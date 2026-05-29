import { lookupModule } from '@tacet-mod/modules/finders'
import {
    withDependencies,
    withName,
    withProps,
} from '@tacet-mod/modules/finders/filters'
import { proxify } from '@tacet-mod/utils/proxy'
import type { Metro } from '@tacet-mod/modules/types'
import type { DiscordModules } from '../types'

export { AppStartPerformance } from '../preinit'
export * as flux from './flux'
export * as utils from './utils'

const { loose, relative } = withDependencies

export const [Logger, LoggerModuleId] = lookupModule(
    withName<typeof DiscordModules.Logger>('Logger'),
) as [typeof DiscordModules.Logger, Metro.ModuleID]

export const [Tokens, TokensModuleId] = lookupModule(withProps('RawColor')) as [
    any,
    Metro.ModuleID,
]

export let ConstantsModuleId: Metro.ModuleID | undefined
export let Constants: DiscordModules.Constants = proxify(
    () => {
        const [module, id] = lookupModule(
            withProps<DiscordModules.Constants>('ME')
                .and(
                    withDependencies(
                        loose([
                            null,
                            relative.withDependencies(
                                loose([relative(2, true)]),
                                1,
                            ),
                        ]),
                    ),
                )
                .keyAs('tacet.discord.common.Constants'),
        )

        if (module) {
            ConstantsModuleId = id
            return (Constants = module)
        }
    },
    { hint: {} },
)!

export { ImportTrackerModuleId } from '../patches/import-tracker'
