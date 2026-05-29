import { waitForModules } from '@tacet-mod/modules/finders'
import { withProps } from '@tacet-mod/modules/finders/filters'
import { getModuleDependencies } from '@tacet-mod/modules/metro/utils'
import { instead } from '@tacet-mod/patcher'
import { InternalPluginFlags, registerPlugin } from '@tacet-mod/plugins/_'
import { PluginFlags } from '@tacet-mod/plugins/constants'
import { noop } from '@tacet-mod/utils/callback'
import { getCurrentStack } from '@tacet-mod/utils/error'

const cachedOnly = {
    cached: true,
}

const fakeSentryCarrier = new Proxy(
    {
        encodePolyfill: () => new Uint8Array(),
        decodePolyfill: () => '',
        version: '',
        _versions: [] as PropertyKey[],
    },
    {
        get: (target, prop) => {
            if (target._versions.includes(prop)) return target
            if (target[prop as keyof typeof target])
                return target[prop as keyof typeof target]
        },
        set: (target, prop, value) => {
            if (prop === 'version') {
                target._versions.push(value)
                return (target.version = value)
            } else return value
        },
    },
)

const getFakeCarrier = () => fakeSentryCarrier

registerPlugin(
    {
        id: 'tacet.no-track',
        name: 'No Track',
        description: 'Disables Discord and Sentry analytics.',
        author: 'Sakayori Studio',
        icon: 'AnalyticsIcon',
    },
    {
        preInit({ cleanup, plugin }) {
            if (plugin.flags & PluginFlags.EnabledLate)
                plugin.flags |= PluginFlags.ReloadRequired

            const unsubSU = waitForModules(
                withProps<{
                    profiledRootComponent<T>(x: T): T
                    addBreadcrumb(): void
                    setTags(): void
                    setUser(): void
                }>('profiledRootComponent'),
                SentryUtils => {
                    unsubSU()

                    instead(
                        SentryUtils,
                        'profiledRootComponent',
                        args => args[0],
                    )
                    instead(SentryUtils, 'addBreadcrumb', noop)
                    instead(SentryUtils, 'setTags', noop)
                    instead(SentryUtils, 'setUser', noop)
                },
                cachedOnly,
            )

            const unsubSIU = waitForModules(
                withProps('initSentry'),
                SentryInitUtils => {
                    unsubSIU()

                    instead(SentryInitUtils, 'initSentry', noop)
                },
                cachedOnly,
            )

            const unsubSentryInst = waitForModules(
                withProps('ReactNavigationInstrumentation'),
                exports => {
                    unsubSentryInst()

                    instead(
                        exports,
                        'ReactNavigationInstrumentation',
                        function () {
                            this.registerNavigationContainer = noop
                        },
                    )
                },
                cachedOnly,
            )

            if (
                Object.getOwnPropertyDescriptor(globalThis, '__SENTRY__')
                    ?.configurable
            )
                Object.defineProperty(globalThis, '__SENTRY__', {
                    configurable: false,
                    get: getFakeCarrier,
                    set: () => {
                        if (__DEV__) warnSetSentry(getCurrentStack())
                        return getFakeCarrier()
                    },
                })

            cleanup(unsubSU, unsubSIU, unsubSentryInst)
        },
        init({ cleanup }) {
            const unsubAU = waitForModules(
                withProps<{
                    trackNetworkAction: () => void
                    default: {
                        track: () => void
                        AnalyticsActionHandlers: Record<string, () => void>
                    }
                }>('trackNetworkAction'),
                AnalyticsUtils => {
                    unsubAU()

                    instead(AnalyticsUtils.default, 'track', noop)
                    instead(AnalyticsUtils, 'trackNetworkAction', noop)

                    const { AnalyticsActionHandlers: handlers } =
                        AnalyticsUtils.default

                    for (const key of Object.keys(handlers))
                        instead(handlers, key, noop)
                },
                cachedOnly,
            )

            cleanup(unsubAU)
        },
        start({
            cleanup,
            logger,
            unscoped: {
                discord: {
                    common: {
                        flux: { DispatcherModuleId },
                    },
                },
            },
        }) {
            const unsubTI = waitForModules(
                withProps<{
                    default: () => void
                    trackImpression: () => void
                }>('trackImpression'),
                useTrackImpression => {
                    unsubTI()

                    instead(useTrackImpression, 'trackImpression', noop)
                    instead(useTrackImpression, 'default', noop)
                },
                cachedOnly,
            )

            const unsubATAC = waitForModules(
                withProps('track'),
                (AnalyticsTrackingActionCreators, id) => {
                    if (getModuleDependencies(id)![0] === DispatcherModuleId) {
                        unsubATAC()

                        logger.info('Patching AnalyticsTrackActionCreators...')
                        instead(AnalyticsTrackingActionCreators, 'track', noop)
                    }
                },
            )

            const unsubHTTPUtils = waitForModules(
                withProps('HTTP', 'post'),
                HTTPUtils => {
                    unsubHTTPUtils()

                    logger.log('Patching HTTPUtils...')

                    instead(HTTPUtils.HTTP, 'post', (args, original) => {
                        const [{ url }] = args
                        if (url === '/science') return Promise.resolve()

                        return original.apply(this, args)
                    })
                },
            )

            cleanup(unsubTI, unsubATAC, unsubHTTPUtils)
        },
        stop({ plugin }) {
            plugin.flags |= PluginFlags.ReloadRequired
        },
    },
    PluginFlags.Enabled,
    InternalPluginFlags.Internal,
)

function warnSetSentry(stack: string) {
    nativeLoggingHook(
        `\u001b[33mNo Track: Attempt to set __SENTRY__\n${stack}\u001b[0m`,
        2,
    )
}
