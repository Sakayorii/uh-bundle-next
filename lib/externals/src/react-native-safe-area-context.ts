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

const { relative, loose } = withDependencies

export let ReactNativeSafeAreaContext: typeof import('react-native-safe-area-context') =
    proxify(
        () => {
            const [module] = lookupModule(
                withProps<typeof ReactNativeSafeAreaContext>(
                    'SafeAreaProvider',
                ).and(
                    withDependencies(
                        loose([
                            relative.withDependencies(
                                [
                                    null,
                                    null,
                                    ReactModuleId,
                                    ReactNativeModuleId,
                                    ReactJSXRuntimeModuleId,
                                    relative.withDependencies([relative(1)], 1),
                                ],
                                1,
                            ),
                        ]),
                    ),
                ),
            )

            if (module) {
                return (ReactNativeSafeAreaContext = module)
            }
        },
        {
            hint: {},
        },
    )!
