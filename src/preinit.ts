import '@tacet-mod/modules/metro/patches'
import '@tacet-mod/utils/patches/proxy'

import {
    onModuleFirstRequired,
    onModuleInitialized,
} from '@tacet-mod/modules/metro/subscriptions'
import { onError } from '~index'

const IndexModuleId = 0

onModuleFirstRequired(IndexModuleId, function onIndexRequired() {
    try {
        if (__BUILD_FLAG_LOG_PROMISE_REJECTIONS__)
            // @as-require
            import('./patches/log-promise-rejections')

        if (__DEV__)
            nativeLoggingHook(`\u001b[31m--- PREINIT STAGE ---\u001b[0m`, 1)

        // @as-require
        import('@tacet-mod/react/preinit')
        // @as-require
        import('@tacet-mod/assets/preinit')
        // @as-require
        import('@tacet-mod/discord/preinit')

        onModuleInitialized(IndexModuleId, function onIndexInitialized() {
            if (__DEV__)
                nativeLoggingHook(`\u001b[31m--- INIT STAGE ---\u001b[0m`, 1)

            try {
                // @as-require
                import('./init')
            } catch (e) {
                onError(e)
            }
        })

        // @as-require
        import('~/plugins/preinit')
        // @as-require
        import('@tacet-mod/plugins/preinit')
    } catch (e) {
        onError(e)
    }
})
