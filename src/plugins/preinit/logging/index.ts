import { AppStartPerformance } from '@tacet-mod/discord/preinit'
import { InternalPluginFlags, registerPlugin } from '@tacet-mod/plugins/_'
import { PluginFlags } from '@tacet-mod/plugins/constants'
import { BuildEnvironment, FullVersion } from '~/constants'

if (__DEV__) {
    AppStartPerformance.mark('👊', 'Plugins register')

    const tsReg = performance.now()
    let tsPreInit: number
    let tsInit: number

    registerPlugin(
        {
            id: 'tacet.logging',
            name: 'Logging',
            description: 'Logs assisting Tacet developers.',
            author: 'Sakayori Studio',
            icon: 'PaperIcon',
        },
        {
            preInit() {
                tsPreInit = performance.now()
                AppStartPerformance.mark(
                    '👊',
                    'Plugins preInit',
                    tsPreInit - tsReg,
                )
            },
            init() {
                tsInit = performance.now()
                AppStartPerformance.mark(
                    '👊',
                    'Plugins init',
                    tsInit - tsPreInit,
                )
            },
            start({ logger }) {
                nativeLoggingHook(`\u001b[31m--- START STAGE ---\u001b[0m`, 1)

                AppStartPerformance.mark(
                    '👊',
                    'Plugins start',
                    performance.now() - tsInit,
                )
                logger.log(
                    `👊 Tacet. Discord, your rest. (${FullVersion} (${BuildEnvironment}))`,
                )
            },
        },
        PluginFlags.Enabled,
        InternalPluginFlags.Internal,
    )
}
