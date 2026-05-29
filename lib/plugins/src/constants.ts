export const PluginFlags = {
    Enabled: 1 << 0,
    ReloadRequired: 1 << 1,
    Errored: 1 << 2,
    EnabledLate: 1 << 3,
}

export const PersistentPluginFlags = PluginFlags.Enabled

export const PluginStatus = {
    PreIniting: 1 << 0,
    PreInited: 1 << 1,
    Initing: 1 << 2,
    Inited: 1 << 3,
    Starting: 1 << 4,
    Started: 1 << 5,
    Stopping: 1 << 6,
}

export const PluginsStorageDirectory = 'tacet/plugins/storage'
