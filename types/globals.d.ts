import type { Metro } from '@tacet-mod/modules/types'
import type {
    ImageProps,
    ScrollViewProps,
    TextProps,
    ViewProps,
} from 'react-native'

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            RCTView: ViewProps
            RCTImage: ImageProps
            RCTScrollView: ScrollViewProps
            RCTText: TextProps
        }
    }
}

declare global {
    const HermesInternal: HermesInternalObject

    function setTimeout(
        cb: (...args: unknown[]) => unknown,
        timeout?: number,
    ): number
    function gc(): void

    interface HermesInternalObject {
        getRuntimeProperties(): Record<string, string>
        // biome-ignore lint/complexity/noBannedTypes: You can pass any function here
        getFunctionLocation(fn: Function): {
            fileName: string
            lineNumber: number
            columnNumber: number
            segmentID: number
            virtualOffset: number
            isNative: boolean
        }
    }
}

declare global {
    interface Promise<T> {
        _h: 0 | 1 | 2
        _j: any
    }

    type HermesPromiseRejectionHandler = (
        promise: Promise<any>,
        error: any,
    ) => void

    interface PromiseConstructor {
        _m: HermesPromiseRejectionHandler
    }
}

declare global {
    var __REACT_DEVTOOLS_GLOBAL_HOOK__: unknown | undefined
    var __REACT_DEVTOOLS__:
        | {
              version: number
              exports: {
                  connectToDevTools(opts: {
                      host?: string
                      port?: number
                      websocket?: WebSocket
                  }): void
              }
          }
        | undefined
}

declare global {
    var __METRO_GLOBAL_PREFIX__: ''

    var __d: Metro.DefineFn
    var __r: Metro.RequireFn & {
        importDefault: Metro.ImportDefaultFn
        importAll: Metro.ImportAllFn
    }
    var __c: Metro.ClearFn
    var __registerSegment: Metro.RegisterSegmentFn
}

declare global {
    var nativeModuleProxy: Record<string, unknown>
    var __turboModuleProxy: ((name: string) => unknown) | undefined
    function nativeLoggingHook(str: string, level: number): void
    function alert(message: unknown): void
    function queueMicrotask(cb: () => void): void

    var nativePerformanceNow: typeof performance.now
    var performance: {
        now(): number
    }
}
