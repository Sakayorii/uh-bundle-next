import { InternalPluginFlags, registerPlugin } from '@tacet-mod/plugins/_'
import {
    PluginFlags,
    PluginsStorageDirectory,
} from '@tacet-mod/plugins/constants'
import * as storage from '@tacet-mod/storage'
import { getStorage } from '@tacet-mod/storage'
import { defineLazyProperty } from '@tacet-mod/utils/object'
import type { AnyPlugin } from '@tacet-mod/plugins/_'
import type { InitPluginApi, Plugin } from '@tacet-mod/plugins/types'
import type { StorageOptions } from '@tacet-mod/storage'
import type { AnyObject } from '@tacet-mod/utils/types'

const storageOptions = new WeakMap<AnyPlugin, StorageOptions>()

registerPlugin(
    {
        id: 'tacet.api.storage',
        name: 'Storage API',
        description: '@tacet-mod/storage API for plugins.',
        author: 'Sakayori Studio',
        icon: 'PollsIcon',
    },
    {
        preInit({ decorate, unscoped }) {
            unscoped.storage = storage

            decorate((plugin, { storage }) => {
                if (storage) storageOptions.set(plugin, storage)
            })
        },
        init({ decorate }) {
            const makePluginStorage = (plugin: Plugin, opts?: StorageOptions) =>
                getStorage(getStoragePathForPlugin(plugin), {
                    ...opts,
                    directory: 'documents',
                })

            decorate(plugin => {
                const opts = storageOptions.get(plugin)

                if (opts?.load)
                    plugin.api.storage = makePluginStorage(plugin, opts)
                else
                    defineLazyProperty(plugin.api, 'storage', () =>
                        makePluginStorage(plugin, opts),
                    )
            })
        },
    },
    PluginFlags.Enabled,
    // biome-ignore format: Don't format this
    InternalPluginFlags.Internal |
    InternalPluginFlags.Essential |
    InternalPluginFlags.API,
)

function getStoragePathForPlugin(plugin: AnyPlugin) {
    return `${PluginsStorageDirectory}/${plugin.manifest.id}.json`
}

export async function deleteStorageForPlugin(plugin: AnyPlugin) {
    const api = plugin.api as InitPluginApi<{ storage: AnyObject }> | undefined
    const storage = api?.storage ?? getStorage(getStoragePathForPlugin(plugin))
    console.log(api?.storage, storage, getStoragePathForPlugin(plugin))
    if (await storage.exists()) await storage.delete()
}
