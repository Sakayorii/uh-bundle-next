import type { DiscordModules } from '.'

declare module '@tacet-mod/plugins/types' {
    export interface InitPluginApi {
        logger: DiscordModules.Logger
    }
}
