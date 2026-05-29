import { getCurrentStack } from './error'
import type { AnyObject } from './types'

export function isObject(val: any): val is AnyObject {
    return typeof val === 'object' && val !== null && !Array.isArray(val)
}

export function cloneDeep<T>(source: T, cache = new WeakMap()): T {
    if (source === null || typeof source !== 'object') return source

    if (cache.has(source)) return cache.get(source)

    const isArray = Array.isArray(source)
    const clone = (isArray ? [] : {}) as T
    cache.set(source, clone)

    if (isArray) {
        const sourceArray = source as any[]
        const cloneArray = clone as any[]
        for (let i = 0; i < sourceArray.length; i++)
            cloneArray[i] = cloneDeep(sourceArray[i], cache)
    } else {
        const sourceObj = source as AnyObject
        const cloneObj = clone as AnyObject

        const keys = Object.keys(sourceObj)
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            cloneObj[key] = cloneDeep(sourceObj[key], cache)
        }
    }

    return clone
}

export function mergeDeep(target: AnyObject, source: AnyObject) {
    if (isObject(target) && isObject(source))
        for (const [key, value] of Object.entries(source))
            if (isObject(value)) {
                if (!target[key]) Object.assign(target, { [key]: {} })
                mergeDeep(target[key], value)
            } else Object.assign(target, { [key]: value })

    return target
}

export function defineLazyProperty<T extends object, K extends keyof T>(
    target: T,
    property: K,
    loader: () => T[K],
) {
    return Object.defineProperty(
        target,
        property,
        lazyPropDesc<T, K>(property, loader),
    )
}

export function defineLazyProperties<T extends object>(
    target: T,
    loaders: Partial<Record<keyof T, () => T[keyof T]>>,
) {
    const descs: PropertyDescriptorMap = {}

    for (const [key, loader] of Object.entries(loaders) as Array<
        [keyof T, (typeof loaders)[keyof T]]
    >)
        descs[key] = lazyPropDesc<T, keyof typeof loaders>(key, loader!)

    return Object.defineProperties(target, descs)
}

function lazyPropDesc<T extends object, K extends keyof T>(
    key: K,
    loader: () => T[K],
): PropertyDescriptor {
    if (__BUILD_FLAG_DEBUG_LAZY_VALUES__) {
        const value = loader()
        if (value == null) DEBUG_warnNullishLazyValue(key)

        return {
            configurable: true,
            value,
        }
    }

    return {
        configurable: true,
        get(this: T) {
            delete this[key]
            return (this[key] = loader())
        },
    }
}

function DEBUG_warnNullishLazyValue(key: PropertyKey) {
    nativeLoggingHook(
        `\u001b[33mLazy property ${String(key)} is being initialized to a nullish value:\n${getCurrentStack()}\u001b[0m`,
        2,
    )
}
