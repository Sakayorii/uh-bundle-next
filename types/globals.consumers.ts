import type {
    PluginApiExtensionsOptions,
    PluginManifest,
    PluginOptions,
} from '@tacet-mod/plugins/types'

declare global {
    export function plugin<O extends PluginApiExtensionsOptions>(
        manifest: PluginManifest,
        options: PluginOptions<O>,
    ): void
}

export * from './globals'
