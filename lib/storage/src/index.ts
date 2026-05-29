import { FileModule } from '@tacet-mod/discord/native'
import { getErrorStack } from '@tacet-mod/utils/error'
import { cloneDeep, mergeDeep } from '@tacet-mod/utils/object'
import type { AnyObject, DeepPartial, If } from '@tacet-mod/utils/types'

export type StorageSubscription<T extends AnyObject = AnyObject> = (
    update: DeepPartial<T>,
    mode: (typeof StorageUpdateMode)[keyof typeof StorageUpdateMode],
) => void

export const StorageUpdateMode = {
    Merge: 0,
    Replace: 1,
    Load: 2,
} as const

export function Storage<T extends AnyObject>(
    this: Storage<T>,
    path: string,
    options?: StorageOptions<T>,
) {
    const { CacheDirPath, DocumentsDirPath } = FileModule.getConstants()

    const directory = options?.directory ?? 'documents'
    const dirPath = directory === 'cache' ? CacheDirPath : DocumentsDirPath
    const fullPath = `${dirPath}/${path}`

    const subscriptions = new Set<StorageSubscription<T>>()

    this.loaded = false

    this.exists = () => FileModule.fileExists(fullPath)
    this.delete = async function () {
        await FileModule.removeFile(directory, path)
        const success = !(await this.exists())
        if (this.loaded && success) await this.get()
        return success
    }

    this.subscribe = callback => {
        subscriptions.add(callback)
        return () => subscriptions.delete(callback)
    }

    async function write(storage: Storage<T>) {
        try {
            const contents = JSON.stringify(storage.cache)
            await FileModule.writeFile(directory, path, contents, 'utf8')
        } catch (e) {
            nativeLoggingHook(
                `Failed to write storage (<${directory}>/${path}): ${getErrorStack(e)}`,
                2,
            )
        }
    }

    this.get = async function () {
        if (!(await this.exists())) {
            this.cache = cloneDeep(options?.default ?? {})
            await write(this)
            this.loaded = true
            return this.cache
        }

        const contents = await FileModule.readFile(fullPath, 'utf8')
        if (contents) {
            this.loaded = true
            try {
                const cache = (this.cache = JSON.parse(contents))
                for (const sub of subscriptions)
                    sub(cache, StorageUpdateMode.Load)
                return cache
            } catch (e) {
                nativeLoggingHook(
                    `Failed to parse storage (<${directory}>/${path}): ${getErrorStack(e)}`,
                    2,
                )
            }
        }
    }

    this.set = async function (value: any, replace?: boolean) {
        if (!this.cache) await this.get()
        if (replace) this.cache = value as T
        else mergeDeep(this.cache as T, value as DeepPartial<T>)

        await write(this)

        for (const sub of subscriptions)
            sub(
                value,
                replace ? StorageUpdateMode.Replace : StorageUpdateMode.Merge,
            )
    }

    if (options?.load) this.get()
}

Storage.prototype.use = () => {
    throw new Error('Storage#use can only be called after the init stage!')
}

export function getStorage<T extends AnyObject = AnyObject>(
    path: string,
    options?: StorageOptions<T>,
): Storage<T> {
    const storage: Storage<T> = Object.create(Storage.prototype)
    Storage.call(storage, path, options)

    return storage
}

export interface StorageOptions<T extends AnyObject = AnyObject> {
    directory?: StorageDirectory
    default?: T
    load?: boolean
}

export type UseStorageFilter<T extends AnyObject = AnyObject> = (
    ...params: Parameters<StorageSubscription<T>>
) => any

export interface Storage<T extends AnyObject> {
    loaded: boolean
    cache?: T | AnyObject
    use(filter?: UseStorageFilter<T>): T | undefined
    subscribe(callback: StorageSubscription<T>): () => void
    get(): Promise<T>
    set(value: DeepPartial<T>): Promise<void>
    set<Replace extends boolean>(
        value: If<Replace, T, DeepPartial<T>>,
        replace: Replace,
    ): Promise<void>
    exists(): Promise<boolean>
    delete(): Promise<boolean>
}

export type StorageDirectory = 'cache' | 'documents'
