import { TypedEventEmitter } from '@tacet-mod/discord/common/utils'
import {
    callBridgeMethod,
    callBridgeMethodSync,
} from '@tacet-mod/modules/native'
import { getErrorStack } from '@tacet-mod/utils/error'
import { sleepReject } from '@tacet-mod/utils/promise'
import { pUnscopedApi as uapi } from '../apis'
import {
    PluginFlags as Flag,
    PersistentPluginFlags,
    PluginStatus as Status,
} from '../constants'
import {
    addPluginApiDecorator,
    decoratePluginApi,
    pApis,
    pDecoratorsInit,
    pDecoratorsPreInit,
    pDecoratorsStart,
} from './decorators'
import {
    computePendingNodes,
    pLeafOrSingleNodes,
    pListOrdered,
    pPending,
} from './dependency-graph'
import type {
    InitPluginApi,
    Plugin,
    PluginApi,
    PluginApiExtensionsOptions,
    PluginCleanup,
    PluginDependency,
    PluginManifest,
    PluginOptions,
    PreInitPluginApi,
} from '../types'

export type AnyPlugin = Plugin<any, any>

const MaxWaitTime = 5000

const PluginApiLevel = {
    None: 0,
    PreInit: 1,
    Init: 2,
    Start: 3,
} as const

export const InternalPluginFlags = {
    Internal: 1 << 0,
    Essential: 1 << 1,
    API: 1 << 2,
}

export interface InternalPluginMeta {
    handleError: (e: unknown) => Promise<void>
    promises: Promise<void>[]
    cleanups: PluginCleanup[]
    iflags: number
    apiLevel: number
    dependents: AnyPlugin[]
    dependencies?: AnyPlugin[]
    options: PluginOptions<any>
    flags: number
}

export const pUnscopedApi = uapi
export const pEmitter = new TypedEventEmitter<{
    register: [AnyPlugin, PluginOptions<any>, update?: true]
    disabled: [AnyPlugin]
    enabled: [AnyPlugin]
    preInited: [AnyPlugin]
    inited: [AnyPlugin]
    started: [AnyPlugin]
    stopped: [AnyPlugin]
    errored: [AnyPlugin, unknown]
    flagUpdate: [AnyPlugin]
}>()

export const pList = new Map<PluginManifest['id'], AnyPlugin>()
const pMetadata = new WeakMap<AnyPlugin, InternalPluginMeta>()

const { flags: PersistedFlags }: PersistedPluginStates = callBridgeMethodSync(
    'revenge.plugins.states.read',
    [],
) ?? {
    flags: {},
}

pEmitter.on('flagUpdate', plugin => {
    PersistedFlags[plugin.manifest.id] = plugin.flags & PersistentPluginFlags
    callBridgeMethod('revenge.plugins.states.write', [PersistedFlags])
})

export function registerPlugin<O extends PluginApiExtensionsOptions>(
    manifest: PluginManifest,
    options: PluginOptions<O>,
    defflags: number,
    iflags: number,
) {
    if (pList.has(manifest.id))
        throw new Error(`Plugin with ID "${manifest.id}" already registered`)

    const plugin = {
        errors: [],
        manifest,
        lifecycles: {
            preInit: options.preInit,
            init: options.init,
            start: options.start,
            stop: options.stop,
        },
        SettingsComponent: options.SettingsComponent,
        status: 0,
        disable: () => disablePlugin(plugin),
        stop: () => stopPlugin(plugin),
        api: undefined,
        set flags(flags: number) {
            if (meta.flags === flags) return
            meta.flags = flags
            pEmitter.emit('flagUpdate', this)
        },
        get flags() {
            return meta.flags
        },
    }

    const meta: InternalPluginMeta = {
        cleanups: [],
        promises: [],
        iflags,
        apiLevel: PluginApiLevel.None,
        dependents: [],
        handleError: e => handlePluginError(e, plugin),
        options,
        flags: PersistedFlags[manifest.id] ?? defflags,
    }

    pMetadata.set(plugin, meta)
    pList.set(manifest.id, plugin)

    if (iflags & InternalPluginFlags.API) {
        pLeafOrSingleNodes.add(plugin)
        pApis.add(plugin)
    }
    else if (isPluginEnabled(plugin)) pPending.add(plugin)

    pEmitter.emit('register', plugin, options)

    return { id: manifest.id } satisfies PluginDependency
}

export function getPluginDependencies(plugin: AnyPlugin): AnyPlugin[] {
    const meta = getInternalPluginMeta(plugin)!
    if (meta.dependencies) return meta.dependencies

    const { dependencies, id } = plugin.manifest
    const deps: AnyPlugin[] = []

    if (dependencies?.length)
        for (const { id: depId } of dependencies) {
            const dep = pList.get(depId)

            if (dep) {
                if (isPluginEnabled(dep)) deps.push(dep)
                else
                    throw new Error(
                        `Plugin "${id}" depends on disabled plugin "${depId}"`,
                    )
            } else {
                throw new Error(
                    `Plugin "${id}" depends on unregistered plugin "${depId}"`,
                )
            }
        }

    return (meta.dependencies = deps)
}

export function isPluginEnabled({ flags }: AnyPlugin): boolean {
    return Boolean(flags & Flag.Enabled)
}

export function isPluginEssential({ iflags }: InternalPluginMeta): boolean {
    return Boolean(iflags & InternalPluginFlags.Essential)
}

export function isPluginInternal({ iflags }: InternalPluginMeta): boolean {
    return Boolean(iflags & InternalPluginFlags.Internal)
}

export function isPluginErrored(plugin: AnyPlugin) {
    return Boolean(plugin.flags & Flag.Errored)
}

function guardPluginEnabled(plugin: AnyPlugin) {
    if (!isPluginEnabled(plugin))
        throw new Error(`Plugin "${plugin.manifest.id}" is not enabled`)
}

async function handlePluginError(e: unknown, plugin: AnyPlugin) {
    plugin.errors.push(e)
    plugin.flags |= Flag.Errored

    nativeLoggingHook(
        `\u001b[31mPlugin "${plugin.manifest.id}" encountered an error: ${getErrorStack(e)}\u001b[0m`,
        2,
    )

    plugin.api?.logger?.error('Plugin encountered an error', e)
    pEmitter.emit('errored', plugin, e)

    if (!isPluginEssential(getInternalPluginMeta(plugin)!))
        await plugin.disable()
}

function tryPreparePluginPreInit(plugin: AnyPlugin) {
    const meta = getInternalPluginMeta(plugin)!
    if (meta.apiLevel >= PluginApiLevel.PreInit) return

    plugin.errors = []
    plugin.flags &= ~Flag.Errored

    plugin.api = {
        cleanup: (...items) => {
            meta.cleanups.push(...items)
        },
        plugin,
        unscoped: pUnscopedApi,
        decorate: decorator => {
            addPluginApiDecorator(pDecoratorsPreInit, plugin, decorator)
        },
    } satisfies PreInitPluginApi

    decoratePluginApi(pDecoratorsPreInit, plugin, meta)
    meta.apiLevel = PluginApiLevel.PreInit
}

function tryPreparePluginInit(plugin: AnyPlugin) {
    const meta = getInternalPluginMeta(plugin)!
    if (meta.apiLevel >= PluginApiLevel.Init) return

    const api = plugin.api as InitPluginApi

    api.decorate = decorator => {
        addPluginApiDecorator(pDecoratorsInit, plugin, decorator)
    }

    decoratePluginApi(pDecoratorsInit, plugin, meta)
    meta.apiLevel = PluginApiLevel.Init
}

function tryPreparePluginStart(plugin: AnyPlugin) {
    const meta = getInternalPluginMeta(plugin)!
    if (meta.apiLevel >= PluginApiLevel.Start) return

    const api = plugin.api as PluginApi

    api.decorate = decorator => {
        addPluginApiDecorator(pDecoratorsStart, plugin, decorator)
    }

    decoratePluginApi(pDecoratorsStart, plugin, meta)
    meta.apiLevel = PluginApiLevel.Start
}

export async function disablePlugin(plugin: AnyPlugin) {
    guardPluginEnabled(plugin)

    const meta = getInternalPluginMeta(plugin)!

    if (isPluginEssential(meta))
        throw new Error(
            `Plugin "${plugin.manifest.id}" is essential and cannot be disabled`,
        )

    const { dependents } = meta

    await Promise.all(
        dependents.map(dep => {
            if (dep.flags & Flag.Enabled) return disablePlugin(dep)
        }),
    )

    if (plugin.status && !(plugin.status & Status.Stopping))
        await stopPlugin(plugin)

    plugin.flags &= ~Flag.Enabled
    pEmitter.emit('disabled', plugin)
}

export async function enablePlugin(plugin: AnyPlugin) {
    if (isPluginEnabled(plugin))
        throw new Error(`Plugin "${plugin.manifest.id}" is already enabled`)

    await Promise.all(
        getPluginDependencies(plugin).map(dep => {
            if (!isPluginEnabled(dep)) return enablePlugin(dep)
        }),
    )

    plugin.flags |= Flag.Enabled
    pEmitter.emit('enabled', plugin)
}

export async function runPluginLate(plugin: AnyPlugin) {
    guardPluginEnabled(plugin)

    if (plugin.status & Status.Started)
        throw new Error(`Plugin "${plugin.manifest.id}" is already started`)

    pListOrdered.length = 0
    pPending.add(plugin)
    computePendingNodes()

    await Promise.all(
        pListOrdered
            .filter(plugin => !plugin.status)
            .map(async function runLate(plugin) {
                plugin.flags |= Flag.EnabledLate

                await preInitPlugin(plugin)
                await initPlugin(plugin)
                await startPlugin(plugin)
            }),
    )
}

export async function preInitPlugin(plugin: AnyPlugin) {
    guardPluginEnabled(plugin)

    const {
        manifest: { id },
    } = plugin

    if (plugin.status & (Status.PreIniting | Status.PreInited))
        throw new Error(
            `Plugin preInit lifecycle for "${id}" is already running`,
        )

    tryPreparePluginPreInit(plugin)

    const { lifecycles } = plugin
    const { promises, handleError } = getInternalPluginMeta(plugin)!

    try {
        if (!lifecycles.preInit) return

        plugin.status |= Status.PreIniting

        try {
            const prom = lifecycles.preInit.apply(plugin, [
                plugin.api as PreInitPluginApi,
            ])
            promises.push(prom)
            await prom
        } catch (e) {
            await handleError(e)
        } finally {
            plugin.status &= ~Status.PreIniting
        }
    } finally {
        if (!isPluginErrored(plugin)) {
            plugin.status |= Status.PreInited
            pEmitter.emit('preInited', plugin)
        }
    }
}

export async function initPlugin(plugin: AnyPlugin) {
    guardPluginEnabled(plugin)

    const {
        manifest: { id },
    } = plugin

    const meta = getInternalPluginMeta(plugin)!

    if (plugin.status & (Status.Initing | Status.Inited))
        throw new Error(`Plugin init lifecycle for "${id}" is already running`)

    tryPreparePluginPreInit(plugin)
    tryPreparePluginInit(plugin)

    const { lifecycles } = plugin
    const { promises, handleError } = meta

    try {
        if (!lifecycles.init) return

        plugin.status |= Status.Initing

        try {
            const prom = lifecycles.init.apply(plugin, [
                plugin.api as InitPluginApi,
            ])
            promises.push(prom)
            await prom
        } catch (e) {
            await handleError(e)
        } finally {
            plugin.status &= ~Status.Initing
        }
    } finally {
        if (!isPluginErrored(plugin)) {
            plugin.status |= Status.Inited
            pEmitter.emit('inited', plugin)
        }
    }
}

export async function startPlugin(plugin: AnyPlugin) {
    guardPluginEnabled(plugin)

    const {
        manifest: { id },
    } = plugin

    if (plugin.status & (Status.Starting | Status.Started))
        throw new Error(`Plugin start lifecycle for "${id}" is already running`)

    tryPreparePluginPreInit(plugin)
    tryPreparePluginInit(plugin)
    tryPreparePluginStart(plugin)

    const { lifecycles } = plugin
    const { promises, handleError } = getInternalPluginMeta(plugin)!

    try {
        if (!lifecycles.start) return

        plugin.status |= Status.Starting

        try {
            const prom = lifecycles.start.apply(plugin, [
                plugin.api as PluginApi,
            ])
            promises.push(prom)
            await prom
        } catch (e) {
            await handleError(e)
        } finally {
            plugin.status &= ~Status.Starting
        }
    } finally {
        if (!isPluginErrored(plugin)) {
            plugin.status |= Status.Started
            pEmitter.emit('started', plugin)
        }
    }
}

export async function stopPlugin(plugin: AnyPlugin) {
    guardPluginEnabled(plugin)

    const {
        manifest: { id },
    } = plugin

    const meta = getInternalPluginMeta(plugin)!

    if (isPluginEssential(meta))
        throw new Error(`Plugin "${id}" is essential and cannot be stopped`)

    if (plugin.status & Status.Stopping)
        throw new Error(`Plugin "${id}" is already stopping`)

    const { lifecycles } = plugin
    const { promises, handleError } = meta

    if (plugin.status & (Status.PreIniting | Status.Initing | Status.Starting))
        await Promise.race([
            !isPluginErrored(plugin) && Promise.all(promises),
            sleepReject(
                MaxWaitTime,
                'Plugin lifecycles timed out, force stopping',
            ),
        ]).catch(e => {
            plugin.flags |= Flag.ReloadRequired
            return handlePluginError(e, plugin)
        })
    else if (
        !(plugin.status & (Status.PreInited | Status.Inited | Status.Started))
    )
        throw new Error(`Plugin "${id}" is not running`)

    plugin.status |= Status.Stopping

    try {
        if (lifecycles.stop)
            await Promise.race([
                lifecycles.stop.apply(plugin, [plugin.api as PluginApi]),
                sleepReject(
                    MaxWaitTime,
                    'Plugin stop lifecycle timed out, force stopping',
                ),
            ])
    } catch (e) {
        await handleError(e)
    } finally {
        await cleanupPlugin(plugin, meta)

        plugin.api = undefined
        meta.apiLevel = PluginApiLevel.None
        meta.promises.length = 0
        meta.cleanups.length = 0
        plugin.status = 0

        pEmitter.emit('stopped', plugin)
    }
}

async function cleanupPlugin(plugin: AnyPlugin, meta: InternalPluginMeta) {
    async function handleStopError(e: unknown) {
        plugin.flags |= Flag.ReloadRequired
        return handlePluginError(e, plugin)
    }

    const proms: Promise<any>[] = []

    for (const cleanup of meta.cleanups)
        try {
            proms.push(cleanup())
        } catch (e) {
            await handleStopError(e)
        }

    await Promise.all(proms)
}

export function getInternalPluginMeta(plugin: AnyPlugin): InternalPluginMeta {
    return pMetadata.get(plugin)!
}

declare module '@tacet-mod/modules/native' {
    interface Methods {
        'revenge.plugins.states.read': [[], PersistedPluginStates | null]
        'revenge.plugins.states.write': [[statuses: PersistedPluginFlags], void]
    }
}

interface PersistedPluginStates {
    flags: PersistedPluginFlags
}

interface PersistedPluginFlags {
    [id: PluginManifest['id']]: number
}
