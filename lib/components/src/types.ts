export interface PluginApiComponents {
    FormSwitch: typeof import('@tacet-mod/components/FormSwitch').default
    Page: typeof import('@tacet-mod/components/Page').default
    SearchInput: typeof import('@tacet-mod/components/SearchInput').default
    TableRowAssetIcon: typeof import('@tacet-mod/components/TableRowAssetIcon').default
}

declare module '@tacet-mod/plugins/types' {
    export interface UnscopedInitPluginApi {
        components: PluginApiComponents
    }
}
