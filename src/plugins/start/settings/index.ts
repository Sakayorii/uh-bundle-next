import { sRefresher, sSections } from '@tacet-mod/discord/_/modules/settings'
import { onSettingsModulesLoaded } from '@tacet-mod/discord/modules/settings'
import { waitForModuleWithImportedPath } from '@tacet-mod/discord/utils/modules/finders'
import { waitForModules } from '@tacet-mod/modules/finders'
import { withName } from '@tacet-mod/modules/finders/filters'
import { instead } from '@tacet-mod/patcher'
import { InternalPluginFlags, registerPlugin } from '@tacet-mod/plugins/_'
import { PluginFlags } from '@tacet-mod/plugins/constants'
import { React } from '@tacet-mod/react'
import { asap, noop } from '@tacet-mod/utils/callback'
import { getCurrentStack } from '@tacet-mod/utils/error'
import { useReRender } from '@tacet-mod/utils/react'
import { useEffect } from 'react'
import type { FC } from 'react'

let DEBUG_patchedNavigator = false

const pluginSettings = registerPlugin(
    {
        id: 'tacet.settings',
        name: 'Settings',
        description: 'Settings UI for Tacet.',
        author: 'Tacet',
        icon: 'SettingsIcon',
    },
    {
        start() {
            // @as-require
            import('./plugins')

            onSettingsModulesLoaded(() => {
                // @as-require
                import('./register')

                asap(() => {
                    if (__DEV__ && !DEBUG_patchedNavigator)
                        DEBUG_warnUnpatchedNavigator()
                })
            })

            waitForModuleWithImportedPath(
                'modules/user_settings/native/core/SettingsNavigator.tsx',
                exports => {
                    patchSettingsNavigator(exports)
                },
            )

            const unsubSOS = waitForModules(
                withName('SettingsOverviewScreen'),
                exports => {
                    unsubSOS()
                    patchSettingsOverviewScreen(exports)
                },
                {
                    cached: true,
                    returnNamespace: true,
                },
            )
        },
    },
    PluginFlags.Enabled,
    InternalPluginFlags.Internal | InternalPluginFlags.Essential,
)

function patchSettingsNavigator(exports: any) {
    instead(exports.default, 'type', (args, orig) => {
        const reRender = useReRender()
        useEffect(() => {
            sRefresher.callNavigator = reRender

            return () => {
                sRefresher.navigator = false
                sRefresher.callNavigator = noop
            }
        }, [reRender])

        const unpatchMemo = instead(React, 'useMemo', (args, orig) => {
            if (!args[1]?.length && sRefresher.navigator) {
                args[1] = undefined
                sRefresher.navigator = false
            }

            return Reflect.apply(orig, React, args)
        })

        const el = Reflect.apply(orig, undefined, args)
        unpatchMemo()
        return el
    })

    DEBUG_patchedNavigator = true
}

let sectionsInst: object | undefined

function patchSettingsOverviewScreen(exports: any) {
    instead(
        exports as {
            default: FC
        },
        'default',
        (args, orig) => {
            const reRender = useReRender()
            useEffect(() => {
                sRefresher.callOverviewScreen = reRender

                return () => {
                    sRefresher.overviewScreen = false
                    sRefresher.callOverviewScreen = noop
                }
            }, [reRender])

            const unpatchMemo = instead(React, 'useMemo', (args, orig) => {
                if (sRefresher.overviewScreen) args[1] = undefined

                const node = Reflect.apply(orig, React, args)
                const sections = node.sections

                if (sectionsInst !== sections) {
                    for (const section of Object.values(sSections))
                        if (section.index)
                            sections.splice(section.index, 0, section)
                        else sections.unshift(section)

                    sectionsInst = sections
                }

                if (sRefresher.overviewScreen) {
                    node.sections = sectionsInst = [...sections]
                    sRefresher.overviewScreen = false
                }

                return node
            })

            const el = Reflect.apply(orig, undefined, args)
            unpatchMemo()
            return el
        },
    )
}

export default pluginSettings

function DEBUG_warnUnpatchedNavigator() {
    nativeLoggingHook(
        `\u001b[31mSettingsNavigator was not patched\n${getCurrentStack()}\u001b[0m`,
        2,
    )
}
