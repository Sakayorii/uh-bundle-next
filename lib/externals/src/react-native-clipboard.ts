import { lookupModule } from '@tacet-mod/modules/finders'
import {
    withDependencies,
    withProps,
} from '@tacet-mod/modules/finders/filters'
import { ReactModuleId, ReactNativeModuleId } from '@tacet-mod/react'
import { destructure, proxify } from '@tacet-mod/utils/proxy'

const { relative } = withDependencies

let ClipboardModule: typeof import('@react-native-clipboard/clipboard') =
    proxify(
        () => {
            const [module] = lookupModule(
                withProps<typeof ClipboardModule>('useClipboard').and(
                    withDependencies([
                        relative.withDependencies(
                            [ReactModuleId, relative(2, true)],
                            1,
                        ),
                        relative.withDependencies(
                            [ReactNativeModuleId, relative(3, true)],
                            2,
                        ),
                    ]),
                ),
            )

            if (module) {
                Clipboard = module.default
                useClipboard = module.useClipboard
                return (ClipboardModule = module)
            }
        },
        {
            hint: {},
        },
    )!

export let { default: Clipboard, useClipboard } = destructure(ClipboardModule, {
    default: {
        hint: {},
    },
    useClipboard: {
        hint: () => {},
    },
})
