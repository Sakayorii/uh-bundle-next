declare global {
    const __DEV__: boolean
    const __BUILD_DISCORD_SERVER_URL__: string
    const __BUILD_SOURCE_REPOSITORY_URL__: string
    const __BUILD_LICENSE_URL__: string
    const __BUILD_COMMIT__: string
    const __BUILD_BRANCH__: string
    const __BUILD_VERSION__: string

    const __BUILD_FLAG_LOG_PROMISE_REJECTIONS__: boolean
    const __BUILD_FLAG_DEBUG_MODULE_LOOKUPS__: boolean
    const __BUILD_FLAG_DEBUG_LAZY_VALUES__: boolean
    const __BUILD_FLAG_DEBUG_MODULE_WAITS__: boolean

    export interface ImportMeta {
        glob<T = any>(
            pattern: ImportMetaGlobPattern,
            options?: ImportMetaGlobOptions,
        ): Record<string, () => Promise<T>>
        glob<T = any>(
            pattern: ImportMetaGlobPattern,
            options: Extract<ImportMetaGlobOptions, { eager: true }>,
        ): Record<string, T>
    }
}

interface ImportMetaGlobOptions {
    eager?: boolean
    import?: string
    query?: string | Record<string, string>
}

type ImportMetaGlobPattern = string | string[]

export {}
