import type { AnyObject } from '@tacet-mod/utils/types'
import type { Storage, StorageOptions } from '.'

declare module '@tacet-mod/plugins/types' {
    export interface UnscopedPreInitPluginApi {
        storage: typeof import('.')
    }

    export interface PluginApiExtensionsOptions {
        storage?: AnyObject
    }

    export interface PluginOptions<O extends PluginApiExtensionsOptions> {
        storage?: Omit<StorageOptions<NonNullable<O['storage']>>, 'directory'>
    }

    export interface InitPluginApi<O extends PluginApiExtensionsOptions> {
        storage: Storage<NonNullable<O['storage']>>
    }
}
