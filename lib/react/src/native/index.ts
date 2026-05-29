import { sAfterRunApplication, sBeforeRunApplication } from './_internal'
import type { RunApplicationCallback } from '@tacet-mod/react/types'

export function onRunApplication(callback: RunApplicationCallback) {
    sBeforeRunApplication.add(callback)
    return () => {
        sBeforeRunApplication.delete(callback)
    }
}

export function onRunApplicationFinished(callback: RunApplicationCallback) {
    sAfterRunApplication.add(callback)
    return () => {
        sAfterRunApplication.delete(callback)
    }
}
