const turboModuleProxy = globalThis.__turboModuleProxy

export function getNativeModule<T>(name: string): T | null {
    const module = turboModuleProxy?.(name) ?? nativeModuleProxy[name]

    if (module) return module as T

    throw new Error(`Unable to access native module: ${name}`)
}

const Bridge = getNativeModule<{
    getBBox(handle: number, options: object): object
}>('RNSVGRenderableModule')!

const BridgePromise = getNativeModule<{
    readAsDataURL(map: object): Promise<any>
}>('FileReaderModule')!

function makePayload(name: string, args: any[]): object {
    return {
        revenge: {
            method: name,
            args: args,
        },
    }
}

export async function callBridgeMethod<N extends MethodName>(
    name: N,
    args: MethodArgs<N>,
): Promise<MethodResult<N>> {
    try {
        const result = await BridgePromise.readAsDataURL(
            makePayload(name, args),
        )

        if ('error' in result) throw result.error
        if ('result' in result) return result.result as MethodResult<N>

        throw 'The module did not return a valid result. The native hook must have failed.'
    } catch (error) {
        throw new Error(`Call failed: ${error}`)
    }
}

export function callBridgeMethodSync<N extends MethodName>(
    name: N,
    args: MethodArgs<N>,
): MethodResult<N> {
    try {
        const result = Bridge.getBBox(0, makePayload(name, args))

        if ('error' in result) throw result.error
        if ('result' in result) return result.result as MethodResult<N>

        throw 'The module did not return a valid result. The native hook must have failed.'
    } catch (error) {
        throw new Error(`Call failed: ${error}`)
    }
}

export function getBridgeInfo(): BridgeInfo | null {
    try {
        return callBridgeMethodSync('revenge.info', [])
    } catch (e) {
        nativeLoggingHook(
            `\u001b[31mFailed to get native bridge info: ${e}\u001b[0m`,
            2,
        )
        return null
    }
}

export interface BridgeInfo {
    name: string
    version: number
}

export type MethodName = Extract<keyof Methods, string>
export type MethodArgs<T extends MethodName> = Methods[T][0]
export type MethodResult<T extends MethodName> = Methods[T][1]

export interface Methods {
    'revenge.info': [[], BridgeInfo]
}
