import { lookupModule } from '@tacet-mod/modules/finders'
import {
    withDependencies,
    withName,
    withProps,
} from '@tacet-mod/modules/finders/filters'
import { ReactJSXRuntimeModuleId, ReactModuleId } from '@tacet-mod/react'
import { proxify } from '@tacet-mod/utils/proxy'

const { loose, relative } = withDependencies

export let ReactNavigationNative: typeof import('@react-navigation/native') =
    proxify(
        () => {
            const [module] = lookupModule(
                withProps<typeof ReactNavigationNative>('useLinkTo').and(
                    withDependencies(
                        loose([
                            [],
                            loose([
                                [
                                    withName('_createClass'),
                                    withName('_classCallCheck'),
                                ],
                            ]),
                        ]),
                    ),
                ),
            )

            if (module) return (ReactNavigationNative = module)
        },
        {
            hint: {},
        },
    )!

export let ReactNavigationStack: typeof import('@react-navigation/stack') =
    proxify(
        () => {
            const firstDep = relative.withDependencies(
                loose([[[]], ReactModuleId, ReactJSXRuntimeModuleId]),
                1,
            )

            const [module] = lookupModule(
                withProps<typeof ReactNavigationStack>('StackView')
                    .and(withDependencies(loose([firstDep, null, relative(2)])))
                    .keyAs(
                        'tacet.externals.ReactNavigation.ReactNavigationStack',
                    ),
            )

            if (module) return (ReactNavigationStack = module)
        },
        {
            hint: {},
        },
    )!

export interface ReactNavigationParamList {
    [Page: string]: any
}

declare global {
    namespace ReactNavigation {
        interface RootParamList extends ReactNavigationParamList {}
    }
}
