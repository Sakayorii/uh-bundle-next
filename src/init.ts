import '@tacet-mod/react/init'
import '@tacet-mod/storage/init'

import { onRunApplication } from '@tacet-mod/react/native'
import { onError } from '~index'

const unsub = onRunApplication(() => {
    unsub()

    try {
        // @as-require
        import('./start')
    } catch (e) {
        onError(e)
    }
})

// @as-require
import '~/plugins/init'
// @as-require
import '@tacet-mod/plugins/init'
