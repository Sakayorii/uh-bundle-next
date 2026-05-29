import type {
    AbstractNewable,
    AfterHook,
    BeforeHook,
    Callable,
    FiniteDomain,
    InsteadHook,
    UnknownFunction,
} from './types'

export interface FunctionProxyState<
    T extends UnknownFunction = UnknownFunction,
> {
    readonly proxy: T
    readonly target: T
}

export interface PatchedFunctionProxyState<
    Key extends PropertyKey = PropertyKey,
    Value extends UnknownFunction = UnknownFunction,
> extends FunctionProxyState<Value> {
    readonly parent: Record<Key, Value>
    readonly key: Key
    before: HookNode<BeforeHook<Value>> | undefined
    instead: InsteadHookNode<Value> | undefined
    after: HookNode<AfterHook<Value>> | undefined
}

export interface HookNode<Hook extends UnknownFunction = UnknownFunction> {
    unpatched: boolean
    hook: Hook | undefined
    priority: number
    prev: HookNode<Hook> | undefined
    next: HookNode<Hook> | undefined
}

export interface InsteadHookNode<T extends UnknownFunction = UnknownFunction>
    extends HookNode<InsteadHook<T>>,
        FunctionProxyState<T> {
    hook: InsteadHook<T> | undefined
    priority: number
    prev: InsteadHookNode<T> | undefined
    next: InsteadHookNode<T> | undefined
}

function applyHooks<T>(hookNode: HookNode<(arg: T) => T> | undefined, arg: T) {
    while (hookNode) {
        const { next, hook } = hookNode
        arg = hook!(arg)
        hookNode = next
    }
    return arg
}

export const patchedFunctionProxyHandler = {
    apply<T extends Callable>(
        state: PatchedFunctionProxyState<PropertyKey, T>,
        receiver: ThisParameterType<T>,
        args: Parameters<T>,
    ) {
        args = applyHooks(state.before, args)

        const { instead } = state
        let result: ReturnType<T>

        if (instead === undefined)
            result = Reflect.apply(state.target, receiver, args)
        else
            result = Reflect.apply(
                instead.hook!,
                receiver,
                [
                    args,
                    instead.next === undefined
                        ? state.target
                        : instead.next.proxy,
                ],
            )

        result = applyHooks(state.after, result)

        return result
    },
    construct<T extends AbstractNewable<never, object>>(
        state: PatchedFunctionProxyState<PropertyKey, T>,
        args: ConstructorParameters<T>,
        ctor: AbstractNewable,
    ) {
        args = applyHooks(state.before, args)

        const { instead } = state
        let result: InstanceType<T>

        if (instead === undefined)
            result = Reflect.construct(state.target, args, ctor)
        else
            result = Reflect.construct(
                instead.hook!,
                [
                    args,
                    instead.next === undefined
                        ? state.target
                        : instead.next.proxy,
                ],
                ctor,
            )

        result = applyHooks(state.after, result)

        return result
    },
    defineProperty: (state, key, descriptor) =>
        Reflect.defineProperty(state.target, key, descriptor),
    deleteProperty: (state, key) => Reflect.deleteProperty(state.target, key),
    get: (state, key, receiver: unknown) =>
        Reflect.get(state.target, key, receiver),
    getOwnPropertyDescriptor: (state, key) =>
        Reflect.getOwnPropertyDescriptor(state.target, key),
    getPrototypeOf: state => Reflect.getPrototypeOf(state.target),
    has: (state, key) => Reflect.has(state.target, key),
    isExtensible: state => Reflect.isExtensible(state.target),
    ownKeys: state => Reflect.ownKeys(state.target),
    preventExtensions: state => Reflect.preventExtensions(state.target),
    set: (state, key, value: unknown, receiver: unknown) =>
        Reflect.set(state.target, key, value, receiver),
    setPrototypeOf: (state, prototype) =>
        Reflect.setPrototypeOf(state.target, prototype),
} as const satisfies Required<ProxyHandler<FunctionProxyState>>

interface PatchedFunctionProxyStateMap extends WeakMap<UnknownFunction, any> {
    readonly delete: (key: UnknownFunction) => boolean
    readonly get: <K extends UnknownFunction>(
        key: K,
    ) => PatchedFunctionProxyState<PropertyKey, K> | undefined
    readonly has: (key: UnknownFunction) => boolean
    readonly set: <K extends UnknownFunction>(
        key: K,
        value: PatchedFunctionProxyState<PropertyKey, K>,
    ) => this
}

export const patchedFunctionProxyStates: PatchedFunctionProxyStateMap =
    new WeakMap<UnknownFunction>()

export function createPatchedFunctionProxy<
    Key extends PropertyKey,
    Value extends UnknownFunction,
>(
    target: Value,
    parent: Record<Key, Value>,
    key: FiniteDomain<Key>,
    before: HookNode<BeforeHook<Value>> | undefined,
    instead: InsteadHookNode<Value> | undefined,
    after: HookNode<AfterHook<Value>> | undefined,
): PatchedFunctionProxyState<Key, Value> {
    // biome-ignore lint/complexity/useArrowFunction: We need a function that has a constructor
    const state = function () {}
    const proxy: Value = new Proxy(state, patchedFunctionProxyHandler) as any

    state.proxy = proxy
    state.target = target
    state.parent = parent
    state.key = key
    state.before = before
    state.instead = instead
    state.after = after

    patchedFunctionProxyStates.set(proxy, state)
    parent[key] = proxy

    return state
}

export function unproxy(state: PatchedFunctionProxyState) {
    const { parent, key, proxy } = state
    if (parent[key] === proxy) {
        parent[key] = state.target
        patchedFunctionProxyStates.delete(proxy)
    }
}
