import defer * as Browserify from '@tacet-mod/externals/browserify'
import defer * as ReactNativeClipboard from '@tacet-mod/externals/react-native-clipboard'
import defer * as ReactNativeSafeAreaContext from '@tacet-mod/externals/react-native-safe-area-context'
import defer * as ReactNavigation from '@tacet-mod/externals/react-navigation'
import defer * as Shopify from '@tacet-mod/externals/shopify'
import { defineLazyProperties } from '@tacet-mod/utils/object'

export interface PluginApiExternals {
    Browserify: typeof import('@tacet-mod/externals/browserify')
    ReactNativeClipboard: typeof import('@tacet-mod/externals/react-native-clipboard')
    ReactNativeSafeAreaContext: typeof import('@tacet-mod/externals/react-native-safe-area-context')
    ReactNavigation: typeof import('@tacet-mod/externals/react-navigation')
    Shopify: typeof import('@tacet-mod/externals/shopify')
}

export const externals: PluginApiExternals = defineLazyProperties(
    {} as PluginApiExternals,
    {
        Browserify: () => {
            return Browserify
        },
        ReactNativeClipboard: () => {
            return ReactNativeClipboard
        },
        ReactNativeSafeAreaContext: () => {
            return ReactNativeSafeAreaContext
        },
        ReactNavigation: () => {
            return ReactNavigation
        },
        Shopify: () => {
            return Shopify
        },
    },
)
