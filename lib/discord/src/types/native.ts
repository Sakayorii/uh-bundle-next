export namespace DiscordNativeModules {
    export interface CacheModule {
        getItem: (key: string) => Promise<string | null>
        removeItem: (key: string) => void
        setItem: (key: string, value: string) => void
        refresh: (exclude: string[]) => Promise<Record<string, string>>
        clear: () => void
    }

    export interface FileModule {
        fileExists: (path: string) => Promise<boolean>
        readAsset: (
            nameOrUri: string,
            encoding: 'base64' | 'utf8',
        ) => Promise<string>
        getSize: (uri: string) => Promise<boolean>
        readFile(path: string, encoding: 'base64' | 'utf8'): Promise<string>
        saveFileToGallery?(
            uri: string,
            fileName: string,
            fileType: 'PNG' | 'JPEG',
        ): Promise<string>
        writeFile(
            storageDir: 'cache' | 'documents',
            path: string,
            data: string,
            encoding: 'base64' | 'utf8',
        ): Promise<string>
        removeFile(
            storageDir: 'cache' | 'documents',
            path: string,
        ): Promise<boolean>
        clearFolder(
            storageDir: 'cache' | 'documents',
            path: string,
        ): Promise<boolean>
        getConstants(): {
            DocumentsDirPath: string
            CacheDirPath: string
        }
    }

    export interface ClientInfoModule {
        getConstants(): {
            SentryAlphaBetaDsn: string
            SentryStaffDsn: string
            SentryDsn: string
            DeviceVendorID: string
            Manifest: string
            Build: string
            Version: string
            ReleaseChannel: string
            OTABuild: string
            Identifier: string
        }
    }

    export interface BundleUpdaterManager {
        reload(): void
    }

    export interface DeviceModule {
        getScreenSize(): { width: number; height: number }
        getConstants(): {
            maxCpuFreq: string
            deviceBrand: string
            isGestureNavigationEnabled: boolean
            deviceManufacturer: string
            ramSize: string
            smallestScreenWidth: number
            systemVersion: string
            isTaskBarEnabled: boolean
            deviceProduct: string
            deviceModel: string
            device: string
            socName: string
        }
    }

    export interface ThemeModule {
        updateSaturation(saturation: number): void
        updateTheme(theme: 'dark' | 'light'): void
    }
}
