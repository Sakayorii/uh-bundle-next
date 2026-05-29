import type { FunctionComponent } from 'react'
import type { PluginApiDiscord } from './apis/discord'
import type { PluginApiExternals } from './apis/externals'
import type { PluginApiModules } from './apis/modules'
import type { PluginApiPlugins } from './apis/plugins'
import type { PluginApiReact } from './apis/react'
import type { PluginFlags, PluginStatus } from './constants'

// biome-ignore lint/suspicious/noEmptyInterface: To be extended by actual extensions
export interface PluginApiExtensionsOptions {}

export interface UnscopedPreInitPluginApi<
    // biome-ignore lint/correctness/noUnusedVariables: This is for plugin API extensions
    O extends PluginApiExtensionsOptions = PluginApiExtensionsOptions,
> {
    modules: PluginApiModules
    patcher: typeof import('@tacet-mod/patcher')
    plugins: PluginApiPlugins
    react: PluginApiReact
    assets: typeof import('@tacet-mod/assets')
    externals: PluginApiExternals
    components: typeof import('@tacet-mod/components')
    discord: PluginApiDiscord
}

export interface UnscopedInitPluginApi<
    O extends PluginApiExtensionsOptions = PluginApiExtensionsOptions,
> extends UnscopedPreInitPluginApi<O> {}

export interface UnscopedPluginApi<
    O extends PluginApiExtensionsOptions = PluginApiExtensionsOptions,
> extends UnscopedInitPluginApi<O> {}

export type PluginCleanup = () => any
export type PluginCleanupApi = (...fns: PluginCleanup[]) => void

export type PluginDecorateApi<
    O extends PluginApiExtensionsOptions = PluginApiExtensionsOptions,
    S extends
        keyof PluginApiInLifecycleMap<O> = keyof PluginApiInLifecycleMap<O>,
> = (decorator: PluginApiDecorator<O, S>) => void

export type PluginApiDecorator<
    O extends PluginApiExtensionsOptions = PluginApiExtensionsOptions,
    S extends
        keyof PluginApiInLifecycleMap<O> = keyof PluginApiInLifecycleMap<O>,
> = (plugin: Plugin<O, S>, options: O) => void

export interface PreInitPluginApi<
    O extends PluginApiExtensionsOptions = PluginApiExtensionsOptions,
> {
    decorate: PluginDecorateApi<O, 'PreInit'>
    unscoped: UnscopedPreInitPluginApi
    cleanup: PluginCleanupApi
    plugin: Plugin<O, 'PreInit'>
}

export interface InitPluginApi<
    O extends PluginApiExtensionsOptions = PluginApiExtensionsOptions,
> extends PreInitPluginApi<O> {
    decorate: PluginDecorateApi<O, 'Init'>
    unscoped: UnscopedInitPluginApi
    plugin: Plugin<O, 'Init'>
}

export interface PluginApi<
    O extends PluginApiExtensionsOptions = PluginApiExtensionsOptions,
> extends InitPluginApi<O> {
    decorate: PluginDecorateApi<O, 'Start'>
    unscoped: UnscopedPluginApi
    plugin: Plugin<O, 'Start'>
}

export interface PluginManifest {
    id: string
    name: string
    author: string
    description: string
    icon?: string
    dependencies?: PluginDependency[]
}

export interface PluginDependency {
    id: string
}

export interface PluginOptions<
    O extends PluginApiExtensionsOptions = PluginApiExtensionsOptions,
> extends PluginLifecycles<O> {
    SettingsComponent?: PluginSettingsComponent<O>
}

export interface PluginLifecycles<
    O extends PluginApiExtensionsOptions = PluginApiExtensionsOptions,
> {
    preInit?: (this: Plugin<O, 'PreInit'>, api: PreInitPluginApi<O>) => any
    init?: (this: Plugin<O, 'Init'>, api: InitPluginApi<O>) => any
    start?: (this: Plugin<O, 'Start'>, api: PluginApi<O>) => any
    stop?: (this: Plugin<O, 'Start'>, api: PluginApi<O>) => any
}

export interface Plugin<
    O extends PluginApiExtensionsOptions = PluginApiExtensionsOptions,
    S extends
        keyof PluginApiInLifecycleMap<O> = keyof PluginApiInLifecycleMap<O>,
> {
    manifest: PluginManifest
    lifecycles: PluginLifecycles<O>

    flags: number
    status: number
    errors: unknown[]

    SettingsComponent?: PluginSettingsComponent<O>

    disable(this: Plugin<O, S>): Promise<void>
    stop(this: Plugin<O, S>): Promise<void>

    api: PluginApiInLifecycleMap<O>[S]
}

export type PluginApiInLifecycleMap<
    O extends PluginApiExtensionsOptions = PluginApiExtensionsOptions,
> = {
    Register: undefined
    PreInit: PreInitPluginApi<O>
    Init: InitPluginApi<O>
    Start: PluginApi<O>
}

export interface PluginSettingsComponent<
    O extends PluginApiExtensionsOptions = PluginApiExtensionsOptions,
> extends FunctionComponent<{ api: PluginApi<O> }> {}
