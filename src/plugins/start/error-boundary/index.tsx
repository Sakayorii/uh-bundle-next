import { waitForModules } from '@tacet-mod/modules/finders'
import { withName } from '@tacet-mod/modules/finders/filters'
import { instead } from '@tacet-mod/patcher'
import { InternalPluginFlags, registerPlugin } from '@tacet-mod/plugins/_'
import { PluginFlags } from '@tacet-mod/plugins/constants'
import ErrorBoundaryScreen from './components/ErrorBoundaryScreen'
import type { Component, ReactNode } from 'react'

registerPlugin(
    {
        id: 'tacet.error-boundary',
        name: 'Error Boundary',
        description: 'Shows debug information on rendering crashes.',
        author: 'Sakayori Studio',
        icon: 'ScreenXIcon',
    },
    {
        start({ cleanup }) {
            const unsubEB = waitForModules(
                withName<typeof DiscordErrorBoundary>('ErrorBoundary'),
                exports => {
                    unsubEB()

                    instead(
                        exports.prototype,
                        'render',
                        function (this: DiscordErrorBoundary) {
                            if (this.state.error)
                                return (
                                    <ErrorBoundaryScreen
                                        error={this.state.error}
                                        reload={this.handleReload.bind(this)}
                                        rerender={() => {
                                            this.setState({
                                                error: null,
                                                info: null,
                                            })
                                        }}
                                    />
                                )

                            return this.props.children
                        },
                    )
                },
                {
                    cached: true,
                },
            )

            cleanup(unsubEB)
        },
    },
    PluginFlags.Enabled,
    InternalPluginFlags.Internal | InternalPluginFlags.Essential,
)

declare class DiscordErrorBoundary extends Component<
    { children: ReactNode },
    {
        error: (Error & { componentStack?: string }) | unknown | null
        info: { componentStack?: string } | null
    }
> {
    render(this: DiscordErrorBoundary): ReactNode
    discordErrorsSet: boolean
    handleReload(): void
}
