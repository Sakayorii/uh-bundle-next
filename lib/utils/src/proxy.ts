import { asap } from './callback'
import { getCurrentStack } from './error'
import { pTargets } from './patches/proxy'

export function isProxy(obj: object) {
    return pTargets.has(obj)
}

export function isProxified(obj: object) {
    return pMetadata.has(obj)
}

export function getProxyTarget(obj: object) {
    return pTargets.get(obj)
}

const pMetadata = new WeakMap<
    object,
    {
        factory: () => unknown
        bind: boolean
        cacheable: boolean
        cache?: unknown
    }
>()

const _handler = {
    ...Object.fromEntries(
        Object.getOwnPropertyNames(Reflect).map(k => [
            k,
            (hint: object, ...args: any[]) =>
                // @ts-expect-error
                Reflect[k](unproxifyFromHint(hint), ...args),
        ]),
    ),
    get: (hint, p, recv) => {
        const target = unproxifyFromHint(hint)
        const val = Reflect.get(target!, p, recv)

        if (pMetadata.get(hint)?.bind && typeof val === 'function')
            return new Proxy(val, {
                apply: (fn, thisArg, args) =>
                    Reflect.apply(
                        fn,
                        thisArg === recv ? target : thisArg,
                        args,
                    ),
            })

        return val
    },
    getOwnPropertyDescriptor: (hint, p) => {
        const d = Reflect.getOwnPropertyDescriptor(unproxifyFromHint(hint)!, p)
        if (d && !Reflect.getOwnPropertyDescriptor(hint, p))
            Object.defineProperty(hint, p, d)
        return d
    },
} as ProxyHandler<object>

export interface ProxifyOptions {
    hint?: object
    cache?: boolean
    bindMethods?: boolean
}

export function proxify<T>(signal: () => T, options?: ProxifyOptions): T {
    // biome-ignore lint/complexity/useArrowFunction: We need a function with a constructor
    const hint = options?.hint ?? function () {}

    pMetadata.set(hint, {
        factory: signal,
        bind: options?.bindMethods ?? false,
        cacheable: options?.cache ?? false,
    })

    if (__BUILD_FLAG_DEBUG_LAZY_VALUES__)
        asap(() => {
            if (unproxifyFromHint(hint) == null)
                DEBUG_warnNullishProxifiedValue()
        })

    return new Proxy(hint, _handler) as T
}

export function unproxify<T extends object>(proxified: T): T {
    const hint = getProxyTarget(proxified)
    if (!hint) return proxified
    return unproxifyFromHint(hint)
}

function unproxifyFromHint(hint: object) {
    const meta = pMetadata.get(hint)!
    if (meta.cacheable)
        return meta.cache ?? ((meta.cache = meta.factory()) as any)
    return meta.factory() as any
}

export type DestructureOptions<T extends object> = {
    [K in keyof T]?: ProxifyOptions
}

export type DestructureResult<T extends object> = {
    [K in keyof T]: T[K]
}

export function destructure<T extends object, O extends DestructureOptions<T>>(
    proxified: T,
    options?: O,
): DestructureResult<T> {
    return new Proxy({} as T, {
        get: (_, p, r) =>
            proxify(
                () => {
                    const v = Reflect.get(unproxify(proxified), p, r)

                    if (v == null)
                        throw new TypeError(
                            `Cannot destructure and proxify ${v} (reading '${String(p)}')`,
                        )
                    if (typeof v === 'function' || typeof v === 'object')
                        return v
                    throw new TypeError(
                        `Cannot destructure and proxify a primitive (reading '${String(p)}')`,
                    )
                },
                options?.[p as keyof T],
            ),
    }) as DestructureResult<T>
}

function DEBUG_warnNullishProxifiedValue() {
    nativeLoggingHook(
        `\u001b[33mProxified value is nullish! The signal is may be invalid.\n${getCurrentStack()}\u001b[0m`,
        3,
    )
}
