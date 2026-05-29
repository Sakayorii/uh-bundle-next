import { sImportedPath } from '../../../patches/import-tracker'
import type { ModuleFinishedImportingCallback } from '../../../patches/import-tracker'

export function onModuleFinishedImporting(
    callback: ModuleFinishedImportingCallback,
) {
    sImportedPath.add(callback)
    return () => {
        sImportedPath.delete(callback)
    }
}
