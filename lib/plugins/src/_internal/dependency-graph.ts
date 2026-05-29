import { getInternalPluginMeta, getPluginDependencies } from '../_internal'
import { pApis } from './decorators'
import type { AnyPlugin } from '../_internal'

export const pRootNodes = new Set<AnyPlugin>()
export const pLeafOrSingleNodes = new Set<AnyPlugin>()

const visited = new Set<AnyPlugin>()

export const pListOrdered: AnyPlugin[] = []
export const pPending = new Set<AnyPlugin>()

export function computePendingNodes() {
    for (const plugin of pPending) resolvePluginGraph(plugin)

    const apis: AnyPlugin[] = []

    for (const plugin of pLeafOrSingleNodes) {
        if (pApis.has(plugin)) apis.push(plugin)
        else pListOrdered.unshift(plugin)
    }

    for (const plugin of apis) pListOrdered.unshift(plugin)

    const stack = [...pRootNodes]
    while (stack.length) {
        const plugin = stack.shift()!

        if (visited.has(plugin)) {
            pListOrdered.push(plugin)
            continue
        }

        if (plugin.manifest.dependencies?.length) {
            for (const dep of getPluginDependencies(plugin))
                if (!pLeafOrSingleNodes.has(dep)) stack.push(dep)

            stack.push(plugin)
            visited.add(plugin)
        } else pListOrdered.push(plugin)
    }

    pPending.clear()
    pLeafOrSingleNodes.clear()
    pRootNodes.clear()
    visited.clear()
}

export function resolvePluginGraph(plugin: AnyPlugin) {
    const { manifest } = plugin

    if (manifest.dependencies?.length) {
        pRootNodes.add(plugin)

        for (const dep of getPluginDependencies(plugin)) {
            const depMeta = getInternalPluginMeta(dep)!
            depMeta.dependents.push(plugin)

            if (dep.manifest.dependencies?.length) pRootNodes.delete(dep)
        }
    } else pLeafOrSingleNodes.add(plugin)
}
