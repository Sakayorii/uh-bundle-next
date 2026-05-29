import * as PluginApiReact_ from '@tacet-mod/react'
import * as PluginApiReactJsxRuntime from '@tacet-mod/react/jsx-runtime'
import * as PluginApiReactNative from '@tacet-mod/react/native'
import { spreadDescriptors } from '.'

export type PluginApiReact = typeof PluginApiReact_ & {
    jsxRuntime: typeof PluginApiReactJsxRuntime
    native: typeof PluginApiReactNative
}

export const react: PluginApiReact = spreadDescriptors(PluginApiReact_, {
    jsxRuntime: PluginApiReactJsxRuntime,
    native: PluginApiReactNative,
})
