import type { If } from '@tacet-mod/utils/types'

export namespace Metro {
    export type DependencyMap = Array<ModuleID>

    export type FactoryFn = (
        global: object,
        require: RequireFn,
        metroImportDefault: RequireFn,
        metroImportAll: RequireFn,
        moduleObject: Module,
        exports: ModuleExports,
        dependencyMap: DependencyMap,
    ) => void

    export type RegisterSegmentFn = (
        segmentId: number,
        moduleDefiner: (moduleId: ModuleID) => void,
        moduleIds?: ReadonlyArray<ModuleID> | null,
    ) => void

    export type ModuleID = number

    export interface ModuleDefinition<Initialized = boolean> {
        dependencyMap: If<Initialized, undefined, DependencyMap>
        error?: any
        factory: If<Initialized, undefined, FactoryFn>
        hasError: boolean
        importedAll: ModuleExports
        importedDefault: ModuleExports
        isInitialized: boolean
        publicModule: Module
    }

    export type Module = {
        id?: ModuleID
        exports: ModuleExports
    }

    export type ModuleList = Map<ModuleID, ModuleDefinition>

    export type RequireFn = (id: ModuleID) => ModuleExports

    export type DefineFn = (
        factory: FactoryFn,
        moduleId: ModuleID,
        dependencyMap: DependencyMap,
    ) => void

    export type ClearFn = () => ModuleList

    export interface Require extends RequireFn {
        importDefault: RequireFn
        importAll: RequireFn
    }

    export type ModuleExports = any
}

export namespace TacetMetro {
    export type Module = {
        id: Metro.ModuleID
        exports: Metro.ModuleExports
    }

    export type ModuleDefinition<Initialized = boolean> = {
        flags: number
        module?: Module
        factory: If<Initialized, undefined, () => void>
        importedDefault?: Metro.ModuleExports
        importedAll?: Metro.ModuleExports
        error?: If<Initialized, undefined, any>
    }

    export type ModuleList = Map<Metro.ModuleID, ModuleDefinition>
}

export type MaybeDefaultExportMatched<T> = T | { default: T }
