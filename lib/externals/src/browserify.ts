import { lookupModule } from '@tacet-mod/modules/finders'
import {
    withDependencies,
    withProps,
} from '@tacet-mod/modules/finders/filters'
import { proxify } from '@tacet-mod/utils/proxy'

const { loose, relative } = withDependencies

export let nodeUtil: typeof import('node:util') = proxify(
    () => {
        const [module] = lookupModule(
            withProps<typeof nodeUtil>('inspect').and(
                withDependencies([
                    loose([relative(2, true), relative(4, true)]),
                    [],
                    [],
                ]),
            ),
        )

        if (module) return (nodeUtil = module)
    },
    {
        hint: {},
    },
)!
