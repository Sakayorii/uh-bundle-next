import { callBridgeMethod } from '@tacet-mod/modules/native'
import { getErrorStack } from '@tacet-mod/utils/error'
import { BuildEnvironment, FullVersion } from '~constants'
import type { Metro } from '@tacet-mod/modules/types'

// @ts-expect-error
globalThis.ErrorUtils = {
    reportError: onError,
    reportFatalError: onError,
}

Object.defineProperty(globalThis, '__registerSegment', {
    configurable: true,
    set(registerSegment: Metro.RegisterSegmentFn) {
        // @ts-expect-error
        // biome-ignore lint/performance/noDelete: Prevent infinite set loop
        delete globalThis.__registerSegment
        globalThis.__registerSegment = registerSegment

        // @as-require
        import('./preinit')
    },
})

export function onError(error: unknown) {
    const stack = getErrorStack(error)

    callBridgeMethod('revenge.alertError', [
        stack,
        `${FullVersion} (${BuildEnvironment})`,
    ])

    nativeLoggingHook(`\u001b[31m${stack}\u001b[0m`, 2)
}

declare module '@tacet-mod/modules/native' {
    export interface Methods {
        'revenge.alertError': [[error: string, version: string], void]
    }
}
