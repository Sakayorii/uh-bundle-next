import { fPatches, fPatchesAll } from '../patches/flux'
import type { DiscordModules } from '../types'

export type FluxEventDispatchPatch<T extends object = object> = (
    payload: DiscordModules.Flux.DispatcherPayload & T,
) => (DiscordModules.Flux.DispatcherPayload & T) | undefined | void

export function onAnyFluxEventDispatched(patch: FluxEventDispatchPatch) {
    fPatchesAll.add(patch)

    return () => {
        fPatchesAll.delete(patch)
    }
}

export function onFluxEventDispatched<T extends object = object>(
    type: DiscordModules.Flux.DispatcherPayload['type'],
    patch: FluxEventDispatchPatch<T>,
) {
    let set = fPatches.get(type)
    if (!set) fPatches.set(type, (set = new Set<FluxEventDispatchPatch>()))

    set.add(patch)

    return () => {
        set.delete(patch)
    }
}
