import { ImportTrackerModuleId } from '@tacet-mod/discord/common'
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

export let FlashList: typeof import('@shopify/flash-list') = proxify(
    () => {
        const [module] = lookupModule(
            withProps<typeof FlashList>('FlashList').and(
                withDependencies([
                    ReactModuleId,
                    ReactNativeModuleId,
                    ReactJSXRuntimeModuleId,
                    null,
                    null,
                    null,
                    ImportTrackerModuleId,
                    null,
                ]),
            ),
        )

        if (module) return (FlashList = module)
    },
    {
        hint: {},
    },
)!
