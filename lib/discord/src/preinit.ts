import { lookupModule } from '@tacet-mod/modules/finders'
import {
    withDependencies,
    withName,
    withProps,
} from '@tacet-mod/modules/finders/filters'
import type { Metro } from '@tacet-mod/modules/types'
import type { DiscordModules } from './types'

const [, _asyncToGeneratorModuleId] = lookupModule(
    withName('_asyncToGenerator'),
)
const [, _classCallCheckModuleId] = lookupModule(withName('_classCallCheck'))
const [, _createClassModuleId] = lookupModule(withName('_createClass'))

export const [AppStartPerformance] = lookupModule(
    withProps<DiscordModules.AppStartPerformance>('markAndLog').and(
        withDependencies([
            _asyncToGeneratorModuleId,
            _classCallCheckModuleId,
            _createClassModuleId,
            2,
        ]),
    ),
) as [DiscordModules.AppStartPerformance, Metro.ModuleID]

AppStartPerformance.mark('👊', 'Pre-init')

import './patches/import-tracker'
import './patches/flux'
