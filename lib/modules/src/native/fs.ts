import {
    callBridgeMethod,
    callBridgeMethodSync,
} from '@tacet-mod/modules/native'

export function readFile(path: string) {
    return callBridgeMethod('revenge.fs.read', [path])
}

export function writeFile(path: string, data: string) {
    return callBridgeMethod('revenge.fs.write', [path, data])
}

export function exists(path: string) {
    return callBridgeMethod('revenge.fs.exists', [path])
}

export function rm(path: string) {
    return callBridgeMethod('revenge.fs.delete', [path])
}

export function existsSync(path: string) {
    return callBridgeMethodSync('revenge.fs.exists', [path])
}

export function readFileSync(path: string) {
    return callBridgeMethodSync('revenge.fs.read', [path])
}

export function writeFileSync(path: string, data: string) {
    return callBridgeMethodSync('revenge.fs.write', [path, data])
}

export function rmSync(path: string) {
    return callBridgeMethodSync('revenge.fs.exists', [path])
}

export function deleteFileSync(path: string) {
    return callBridgeMethodSync('revenge.fs.delete', [path])
}

export function getConstants() {
    return callBridgeMethodSync('revenge.fs.getConstants', [])
}

declare module '@tacet-mod/modules/native' {
    export interface Methods {
        'revenge.fs.getConstants': [
            [],
            {
                data: string
                files: string
                cache: string
            },
        ]
        'revenge.fs.read': [[path: string], string]
        'revenge.fs.write': [[path: string, data: string], void]
        'revenge.fs.exists': [[path: string], boolean]
        'revenge.fs.delete': [[path: string], boolean]
    }
}
